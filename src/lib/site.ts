import { getCollection, type CollectionEntry } from 'astro:content';
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
  resume_pdf: string;
  cta: string;
}

/** A "view" = one persona rendered at one URL prefix. */
export interface View {
  role: Role;
  prefix: string; // '' for the default view, 'r/qa/' etc.
  isDefault: boolean;
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
  resume_pdf: '',
  cta: cfg.availability ?? '',
};

export function getRole(id: string): Role {
  if (id === 'all') return ALL_ROLE;
  const r = roles[id];
  if (!r) throw new Error(`${PROFILE_NAME}/site.config.yaml refers to role "${id}" but ${PROFILE_NAME}/roles/${id}.yaml does not exist`);
  return r as Role;
}

export const activeRole = getRole(cfg.active_role);

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

export function allViews(): View[] {
  return [
    { role: activeRole, prefix: '', isDefault: true },
    ...switchableRoles.map((role) => ({ role, prefix: `r/${role.id}/`, isDefault: false })),
  ];
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

export async function experienceFor(role: Role): Promise<Experience[]> {
  const list = await getCollection('experience', (e) => visible(e.data) && matchesRole(e.data.roles, role));
  return list.sort((a, b) => b.data.start.valueOf() - a.data.start.valueOf());
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
    for (const j of jobs) j.data.skills.forEach(note);
    // An alias may be the only spelling used — still count its skill
    for (const i of await publicItems()) for (const id of itemSkillIds(i)) if (!spelling.has(id)) spelling.set(id, id);
    for (const j of jobs) for (const id of jobSkillIds(j)) if (!spelling.has(id)) spelling.set(id, id);

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
