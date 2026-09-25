import { getCollection, type CollectionEntry } from 'astro:content';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import { loadSiteConfig, loadRoles, loadSkills, maskText, PROFILE_NAME } from './load-config.mjs';

export const cfg = loadSiteConfig();
export const roles = loadRoles();

export type Item = CollectionEntry<'items'>;
export type Experience = CollectionEntry<'experience'>;
export type ItemType = Item['data']['type'];

export interface Role {
  id: string;
  label: string;
  accent: string;
  headline: string;
  summary: string;
  skills_highlight: string[];
  content_priority: ItemType[];
  hide_types: ItemType[];
  hide_sections: string[];
  resume_pdf: string;
  cta: string;
  link: string;
}

/**
 * A "view" = one persona rendered at one URL prefix.
 * A "site" = the views that share one persona switcher. Normally there is one site at the root;
 * with share_links on, there is your full site at a secret path plus one single-role site per `link:`.
 */
export interface View {
  role: Role;
  prefix: string; // URL prefix of this view: '' | 'r/qa/' | '<full_site>/r/qa/' | '<link>/'
  isDefault: boolean;
  site: string; // URL prefix of the site this view belongs to: '' | '<full_site>/' | '<link>/'
  focus: boolean; // a single-role share site: no switcher, no mention of other roles
}

/** The unfiltered /r/all/ view; label, summary and accent can be set via `all_view:` in site.config.yaml. */
const allCfg = cfg.all_view || {};
const ALL_ROLE: Role = {
  id: 'all',
  label: allCfg.label ?? 'Everything',
  accent: allCfg.accent ?? '#a78bfa',
  headline: allCfg.headline ?? cfg.tagline ?? '',
  summary: allCfg.summary ?? 'Every project, debug story and post, across every role.',
  skills_highlight: [...new Set(Object.values(roles).flatMap((r: any) => r.skills_highlight))].slice(0, 10) as string[],
  content_priority: ['project', 'debug', 'post', 'til'],
  hide_types: [],
  hide_sections: [],
  resume_pdf: '',
  cta: cfg.availability ?? '',
  link: '',
};

export function getRole(id: string): Role {
  if (id === 'all') return ALL_ROLE;
  const r = roles[id];
  if (!r) throw new Error(`${PROFILE_NAME}/site.config.yaml refers to role "${id}" but ${PROFILE_NAME}/roles/${id}.yaml does not exist`);
  return r as Role;
}

export const activeRole = getRole(cfg.active_role);

/** Sections a role can hide with `hide_sections:` (content sections are hidden with `hide_types:`). */
export const HIDEABLE_SECTIONS = ['journey', 'resume', 'about'];
for (const r of Object.values(roles) as Role[]) {
  for (const s of r.hide_sections) {
    if (!HIDEABLE_SECTIONS.includes(s)) {
      throw new Error(`${PROFILE_NAME}/roles/${r.id}.yaml: hide_sections can only contain ${HIDEABLE_SECTIONS.join(', ')} (got "${s}")`);
    }
  }
}

/** Does this role show a section page ('projects', 'debug', 'journey', …)? */
export function hasSection(role: Role, section: string): boolean {
  if (section === 'debug') return !role.hide_types.includes('debug');
  return !role.hide_sections.includes(section);
}

/** "Jane Doe" → "JD" — used by the header mark and the generated favicon. */
export const initials = String(cfg.name ?? '')
  .split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '•';

// ── Page text ───────────────────────────────────────────────
// Every heading/blurb the engine writes itself. Override any of them under
// `text:` in site.config.yaml. {role} → persona label, {name} → your name.
const TEXT_DEFAULTS = {
  home_featured_title: 'Best of my {role} work',
  home_skills_title: 'Skills, with receipts',
  home_writing_title: 'Writing & learnings',
  home_journey_title: "Where I've been",
  home_cta_title: 'Let’s talk',
  home_cta_text: 'Happy to chat about roles, projects, or a tricky bug you’re chasing.',
  projects_title: 'Things I built & shipped',
  projects_lead: 'Projects that show how I work as a {role}: the problem, my part, and what changed because of it.',
  debug_title: 'Bugs I hunted down',
  debug_lead: 'Real incidents and head-scratchers, written up as symptom → investigation → root cause → fix → lesson.',
  blog_title: 'Articles & learnings',
  blog_lead: 'Longer articles plus short “Today I Learned” notes from the day job.',
  skills_title: 'What I work with',
  skills_lead: 'Every skill here is backed by real work. Pick one to see the projects, debug stories, articles and TIL notes behind it.',
  journey_title: 'The long road so far',
  journey_lead: 'Every role, what I owned there, and what I wrote about along the way — shown through a {role} lens.',
  about_title: "Hi, I'm {name}",
  not_found_title: 'Hmm. That page wandered off.',
  not_found_lead: 'It may have moved, or the link had a typo. Classic off-by-one.',
};
export type TextKey = keyof typeof TEXT_DEFAULTS;

for (const k of Object.keys(cfg.text ?? {})) {
  if (!(k in TEXT_DEFAULTS)) console.warn(`[text] ${PROFILE_NAME}/site.config.yaml sets unknown text "${k}". Known: ${Object.keys(TEXT_DEFAULTS).join(', ')}`);
}

/** Page text for `key`, with the profile's override applied. */
export function t(key: TextKey, role?: Pick<Role, 'label'>): string {
  const raw = String(cfg.text?.[key] ?? TEXT_DEFAULTS[key]);
  return raw.replace(/\{role\}/g, role?.label ?? '').replace(/\{name\}/g, cfg.name ?? '');
}

/** Roles shown in the persona switcher. */
export const switchableRoles: Role[] = [
  ...cfg.roles_enabled.map(getRole),
  ...(cfg.all_view ? [ALL_ROLE] : []),
];

// ── Share links ─────────────────────────────────────────────
// share_links.enabled → the root becomes a neutral landing page, your full multi-role site
// moves to /<full_site>/ and every role with a `link:` gets its own single-role site at /<link>/.
export const sharing: boolean = cfg.share_links.enabled;
/** Roles that get their own single-role share site. */
export const shareRoles: Role[] = sharing ? (Object.values(roles) as Role[]).filter((r) => r.link) : [];
/** URL prefix of your full multi-role site, or null when it isn't built. */
export const fullSite: string | null = !sharing ? '' : cfg.share_links.full_site ? `${cfg.share_links.full_site}/` : null;

if (sharing) {
  const RESERVED = ['r', 'p', 'projects', 'debug', 'blog', 'skills', 'journey', 'resume', 'about', '_astro', '404'];
  const seen = new Map<string, string>();
  const check = (link: string, owner: string) => {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(link)) throw new Error(`${owner}: link "${link}" may only use a-z, 0-9 and -`);
    if (RESERVED.includes(link)) throw new Error(`${owner}: link "${link}" is a reserved page name`);
    if (seen.has(link)) throw new Error(`${owner}: link "${link}" is already used by ${seen.get(link)}`);
    if (link.length < 10) console.warn(`[share] ${owner}: link "${link}" is short and easy to guess; add random characters`);
    seen.set(link, owner);
  };
  if (cfg.share_links.full_site) check(cfg.share_links.full_site, `${PROFILE_NAME}/site.config.yaml share_links.full_site`);
  for (const r of shareRoles) check(r.link, `${PROFILE_NAME}/roles/${r.id}.yaml`);
  if (!shareRoles.length) console.warn(`[share] share_links is enabled but no role in ${PROFILE_NAME}/roles/ has a "link:"`);
}

/** The neutral page at the site root when sharing (also used for the 404 page). */
export const landingView: View = { role: activeRole, prefix: '', isDefault: true, site: '', focus: true };

export function allViews(): View[] {
  const views: View[] = [];
  if (fullSite !== null) {
    views.push({ role: activeRole, prefix: fullSite, isDefault: true, site: fullSite, focus: false });
    for (const role of switchableRoles) {
      views.push({ role, prefix: `${fullSite}r/${role.id}/`, isDefault: false, site: fullSite, focus: false });
    }
  }
  for (const role of shareRoles) {
    views.push({ role, prefix: `${role.link}/`, isDefault: true, site: `${role.link}/`, focus: true });
  }
  return views;
}

// ── URLs ────────────────────────────────────────────────────
const BASE = import.meta.env.BASE_URL.replace(/\/?$/, '/');
/** Prefix a site-relative path with the base path (/know-me/). */
export function u(path = ''): string {
  if (/^https?:\/\//.test(path)) return path;
  return BASE + path.replace(/^\//, '');
}
export const viewUrl = (v: View, section = '') => u(v.prefix + (section ? `${section}/` : ''));
export const itemPath = (item: Item) => `p/${item.id}/`;
export const itemUrl = (item: Item, v?: View) => u((v?.prefix ?? '') + itemPath(item));

// ── Content ─────────────────────────────────────────────────
const isDev = import.meta.env.DEV;

function visible(d: { draft?: boolean; visibility?: string; confidential?: boolean }) {
  if (d.draft && !isDev) return false;
  if (d.visibility === 'private') return false;
  if (d.confidential && cfg.confidential_mode === 'hide') return false;
  return true;
}

/** Company name as it should be displayed, respecting confidential_mode. */
export function displayCompany(d: { company?: string; company_alias?: string; confidential?: boolean }) {
  if (!d.company) return undefined;
  if (!d.confidential || cfg.confidential_mode === 'show') return d.company;
  return d.company_alias || 'Confidential client';
}

/** Mask a free-text field (title, summary, highlight) of a confidential entry. */
export function safeText(text: string | undefined, d: { company?: string; company_alias?: string; confidential?: boolean }) {
  if (!text || !d.confidential || cfg.confidential_mode === 'show') return text ?? '';
  return maskText(text, d.company, d.company_alias);
}

const byDateDesc = (a: Item, b: Item) => b.data.date.valueOf() - a.data.date.valueOf();

export async function publicItems(): Promise<Item[]> {
  return (await getCollection('items', (e) => visible(e.data))).sort(byDateDesc);
}

export function matchesRole(roleIds: string[], role: Role) {
  if (role.id === 'all') return true;
  if (roleIds.length === 0) return cfg.show_untagged;
  return roleIds.includes(role.id) || roleIds.includes('all');
}

export async function itemsFor(role: Role, type?: ItemType | ItemType[]): Promise<Item[]> {
  const types = type ? ([] as ItemType[]).concat(type) : undefined;
  return (await publicItems()).filter(
    (i) =>
      matchesRole(i.data.roles, role) &&
      !role.hide_types.includes(i.data.type) &&
      (!types || types.includes(i.data.type)),
  );
}

export async function featuredFor(role: Role, limit = 3): Promise<Item[]> {
  const list = await itemsFor(role);
  const pinned = list.filter((i) => i.data.featured.includes(role.id) || (role.id === 'all' && i.data.featured.length));
  return (pinned.length ? pinned : list).slice(0, limit);
}

/** A job's fields as one persona sees them: its `per_role` entry merged over the base fields. */
export type JobData = Experience['data'] & { description?: string };
export function jobFor(exp: Experience, role: Role): Experience {
  const o = exp.data.per_role[role.id];
  return o ? { ...exp, data: { ...exp.data, ...o } } : exp;
}

/** Jobs shown to a persona, with that persona's per_role changes applied, newest first. */
export async function experienceFor(role: Role): Promise<Experience[]> {
  const list = await getCollection('experience', (e) => visible(e.data) && matchesRole(e.data.roles, role));
  return list.map((e) => jobFor(e, role)).sort((a, b) => b.data.start.valueOf() - a.data.start.valueOf());
}

let mdProcessor: ReturnType<typeof createMarkdownProcessor> | undefined;
/** Render a Markdown string (e.g. a per_role `description`) to HTML. */
export async function renderMarkdown(src: string): Promise<string> {
  mdProcessor ??= createMarkdownProcessor();
  return (await (await mdProcessor).render(src)).code;
}

export function highlightsFor(exp: Experience, role: Role): string[] {
  return exp.data.highlights
    .filter((h) => typeof h === 'string' || role.id === 'all' || h.roles.includes(role.id) || h.roles.includes('all'))
    .map((h) => safeText(typeof h === 'string' ? h : h.text, exp.data));
}

// ── Formatting ──────────────────────────────────────────────
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** "14 Sep 2018" or "Sep 2018" — always UTC so the hard-coded date never shifts. */
export const fmtDate = (d: Date, style: 'long' | 'short' = 'long') =>
  (style === 'long' ? `${d.getUTCDate()} ` : '') + `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;

export const readingMinutes = (body = '') => Math.max(1, Math.round(body.split(/\s+/).length / 220));

export const TYPE_META: Record<ItemType, { label: string; plural: string; section: string; icon: string }> = {
  project: { label: 'Project', plural: 'Projects', section: 'projects', icon: '◆' },
  debug: { label: 'Debug Diary', plural: 'Debug Diary', section: 'debug', icon: '⌁' },
  post: { label: 'Article', plural: 'Articles', section: 'blog', icon: '¶' },
  til: { label: 'TIL', plural: 'Today I Learned', section: 'blog', icon: '✦' },
};

const ACRONYMS: Record<string, string> = {
  'ci-cd': 'CI/CD', api: 'API', aws: 'AWS', gcp: 'GCP', sql: 'SQL', qa: 'QA', ui: 'UI', ux: 'UX', sre: 'SRE', k8s: 'K8s', dora: 'DORA',
};
/** 'api-testing' → 'API testing', 'ci-cd' → 'CI/CD'. Labels in skills.yaml win over ACRONYMS. */
export const prettyTag = (t: string) =>
  SKILL_DEFS.get(skillSlug(t))?.label ?? ACRONYMS[t] ?? t.split('-').map((w, i) => ACRONYMS[w] ?? (i === 0 ? w[0].toUpperCase() + w.slice(1) : w)).join(' ');

export function yearsOfExperience() {
  if (!cfg.career_start) return undefined;
  const start = new Date(cfg.career_start);
  return Math.floor((Date.now() - start.valueOf()) / (365.25 * 24 * 3600 * 1000));
}

// ── Skills ──────────────────────────────────────────────────
// One list merged from item `tags` + `stack` and experience `skills`,
// normalised through skills.yaml (labels, categories, aliases, not_skills).

interface SkillDef { label?: string; category?: string; aliases?: string[] }
export interface Skill { id: string; label: string; category: string; items: Item[]; jobs: Experience[] }

/** 'GitHub Actions' → 'github-actions', 'C++' → 'cplusplus', 'C#' → 'csharp' */
export const skillSlug = (s: string) =>
  String(s).toLowerCase().replace(/\+/g, 'plus').replace(/#/g, 'sharp').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const skillReg = loadSkills();
const SKILL_DEFS = new Map<string, SkillDef>();
const SKILL_ALIAS = new Map<string, string>();
for (const [key, def] of Object.entries(skillReg.skills as Record<string, SkillDef | null>)) {
  const id = skillSlug(key);
  SKILL_DEFS.set(id, def ?? {});
  for (const a of def?.aliases ?? []) SKILL_ALIAS.set(skillSlug(a), id);
}
const NOT_SKILLS = new Set((skillReg.not_skills as string[]).map(skillSlug));
const OTHER = 'Other';
/** Category order = order of first appearance in skills.yaml, "Other" last. */
export const skillCategories: string[] = [
  ...new Set([...SKILL_DEFS.values()].map((d) => d.category).filter(Boolean) as string[]),
  OTHER,
];

/** Canonical skill id for any spelling or alias; undefined if it is not a skill. */
export function skillId(raw: string): string | undefined {
  const s = skillSlug(raw);
  if (!s || NOT_SKILLS.has(s)) return undefined;
  const id = SKILL_ALIAS.get(s) ?? s;
  return NOT_SKILLS.has(id) ? undefined : id;
}

const uniqueSkills = (list: string[]) => [...new Set(list.map(skillId).filter(Boolean) as string[])];
export const itemSkillIds = (i: Item) => uniqueSkills([...i.data.tags, ...i.data.stack]);
export const jobSkillIds = (j: Experience) => uniqueSkills(j.data.skills);

export const skillPath = (id: string) => `skills/${id}/`;
export const skillUrl = (id: string, v?: View) => u((v?.prefix ?? '') + skillPath(id));

type SkillInfo = Pick<Skill, 'id' | 'label' | 'category'>;
let catalog: Promise<Map<string, SkillInfo>> | undefined;

/** Every skill used by any public content, in any role. */
export function skillCatalog(): Promise<Map<string, SkillInfo>> {
  if (catalog && !isDev) return catalog;
  return (catalog = (async () => {
    // Remember the nicest spelling seen in content ("BigQuery" beats "bigquery")
    const spelling = new Map<string, string>();
    const note = (raw: string) => {
      const id = skillId(raw);
      if (!id || skillSlug(raw) !== id) return; // aliases never name the skill
      const prev = spelling.get(id);
      if (!prev || (/[A-Z ]/.test(raw) && !/[A-Z ]/.test(prev))) spelling.set(id, raw);
    };
    const jobs = await getCollection('experience', (e) => visible(e.data));
    for (const i of await publicItems()) [...i.data.tags, ...i.data.stack].forEach(note);
    // Base skills plus every persona's per_role skills
    const jobSkillNames = (j: Experience) => [...j.data.skills, ...Object.values(j.data.per_role).flatMap((o) => o.skills ?? [])];
    for (const j of jobs) jobSkillNames(j).forEach(note);
    // An alias may be the only spelling used — still count its skill
    for (const i of await publicItems()) for (const id of itemSkillIds(i)) if (!spelling.has(id)) spelling.set(id, id);
    for (const j of jobs) for (const id of uniqueSkills(jobSkillNames(j))) if (!spelling.has(id)) spelling.set(id, id);

    const out = new Map<string, SkillInfo>();
    for (const [id, raw] of spelling) {
      const def = SKILL_DEFS.get(id);
      const label = def?.label ?? (/[A-Z ]/.test(raw) ? raw : prettyTag(id));
      out.set(id, { id, label, category: def?.category ?? OTHER });
    }
    return out;
  })());
}

/** Every skill with the items and jobs that back it up in this role (may be empty). */
export async function skillsFor(role: Role): Promise<Skill[]> {
  const [cat, items, jobs] = await Promise.all([skillCatalog(), itemsFor(role), experienceFor(role)]);
  return [...cat.values()]
    .map((s) => ({
      ...s,
      items: items.filter((i) => itemSkillIds(i).includes(s.id)),
      jobs: jobs.filter((j) => jobSkillIds(j).includes(s.id)),
    }))
    .sort((a, b) => b.items.length + b.jobs.length - (a.items.length + a.jobs.length) || a.label.localeCompare(b.label));
}

let warned = false;
/** Build-time hints for skills that would show up empty. */
export async function warnSkillProblems() {
  if (warned) return;
  warned = true;
  const cat = await skillCatalog();
  for (const r of Object.values(roles) as Role[]) {
    for (const h of r.skills_highlight) {
      const id = skillId(h);
      if (!id) console.warn(`[skills] ${PROFILE_NAME}/roles/${r.id}.yaml highlights "${h}", but skills.yaml lists it under not_skills`);
      else if (!cat.has(id)) console.warn(`[skills] ${PROFILE_NAME}/roles/${r.id}.yaml highlights "${h}", but no project, post, TIL, debug entry or job uses it yet`);
    }
  }
}
