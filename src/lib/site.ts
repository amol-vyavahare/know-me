import { getCollection, type CollectionEntry } from 'astro:content';
import { loadSiteConfig, loadRoles, maskText } from './load-config.mjs';

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

const ALL_ROLE: Role = {
  id: 'all',
  label: 'Everything',
  accent: '#a78bfa',
  headline: cfg.tagline ?? '',
  summary: 'Every project, debug story and post across all the roles I have played.',
  skills_highlight: [...new Set(Object.values(roles).flatMap((r: any) => r.skills_highlight))].slice(0, 10) as string[],
  content_priority: ['project', 'debug', 'post', 'til'],
  hide_types: [],
  resume_pdf: '',
  cta: cfg.availability ?? '',
};

export function getRole(id: string): Role {
  if (id === 'all') return ALL_ROLE;
  const r = roles[id];
  if (!r) throw new Error(`site.config.yaml refers to role "${id}" but roles/${id}.yaml does not exist`);
  return r as Role;
}

export const activeRole = getRole(cfg.active_role);

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
/** 'api-testing' → 'API testing', 'ci-cd' → 'CI/CD'. Add your own to ACRONYMS. */
export const prettyTag = (t: string) =>
  ACRONYMS[t] ?? t.split('-').map((w, i) => ACRONYMS[w] ?? (i === 0 ? w[0].toUpperCase() + w.slice(1) : w)).join(' ');

export function yearsOfExperience() {
  if (!cfg.career_start) return undefined;
  const start = new Date(cfg.career_start);
  return Math.floor((Date.now() - start.valueOf()) / (365.25 * 24 * 3600 * 1000));
}
