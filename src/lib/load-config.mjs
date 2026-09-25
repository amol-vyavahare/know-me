// Plain-JS loader so astro.config.mjs, the remark plugin, scripts and pages share one source.
//
// Everything personal lives in ONE profile folder:
//   profile/site.config.yaml  profile/skills.yaml  profile/roles/  profile/content/  profile/public/
// Pick another folder with the PROFILE env var:  PROFILE=profiles/jane npm run build
import fs from 'node:fs';
import path from 'node:path';
import { load as yamlLoad } from 'js-yaml';

const root = process.cwd();

/** Absolute path of the active profile folder. */
export const PROFILE_DIR = path.resolve(root, process.env.PROFILE || 'profile');
/** Same, as written in messages ("profile", "profiles/jane"). */
export const PROFILE_NAME = path.relative(root, PROFILE_DIR).replace(/\\/g, '/') || '.';

if (!fs.existsSync(path.join(PROFILE_DIR, 'site.config.yaml'))) {
  throw new Error(
    `No profile found at "${PROFILE_NAME}/" (looked for ${PROFILE_NAME}/site.config.yaml).\n` +
      `Copy profile.example/ to profile/, or point PROFILE at your profile folder.`,
  );
}

/** Path to a file inside the profile folder. */
export const profilePath = (...parts) => path.join(PROFILE_DIR, ...parts);

const readYaml = (file) => yamlLoad(fs.readFileSync(file, 'utf8')) ?? {};

export function loadSiteConfig() {
  const raw = readYaml(profilePath('site.config.yaml'));
  if (!raw.active_role) {
    throw new Error(`${PROFILE_NAME}/site.config.yaml must set "active_role" to the id of a file in ${PROFILE_NAME}/roles/`);
  }
  // all_view: true | false | { label, summary, accent }
  const all = raw.all_view ?? true;
  // share_links: secret per-role sites (see docs/sharing.md)
  const share = raw.share_links ?? {};
  return {
    roles_enabled: [],
    show_untagged: false,
    confidential_mode: 'mask',
    links: [],
    text: {},
    ...raw,
    all_view: all === false ? false : { ...(typeof all === 'object' ? all : {}) },
    share_links: { enabled: share.enabled === true, full_site: String(share.full_site ?? '').trim() },
  };
}

export function loadRoles() {
  const dir = profilePath('roles');
  if (!fs.existsSync(dir)) throw new Error(`${PROFILE_NAME}/roles/ is missing — add at least one role file`);
  const roles = {};
  for (const f of fs.readdirSync(dir)) {
    if (!/\.ya?ml$/.test(f)) continue;
    const r = readYaml(path.join(dir, f));
    if (!r?.id) throw new Error(`${PROFILE_NAME}/roles/${f} is missing an "id"`);
    roles[r.id] = {
      accent: '#8b5cf6',
      skills_highlight: [],
      content_priority: ['project', 'debug', 'post', 'til'],
      hide_types: [],
      hide_sections: [],
      resume_pdf: '',
      cta: '',
      ...r,
      link: String(r.link ?? '').trim(), // secret path of this role's share site
    };
  }
  return roles;
}

/** skills.yaml is optional — without it every tag/stack entry is its own skill. */
export function loadSkills() {
  const file = profilePath('skills.yaml');
  if (!fs.existsSync(file)) return { skills: {}, not_skills: [] };
  const raw = readYaml(file);
  return { skills: raw.skills ?? {}, not_skills: raw.not_skills ?? [] };
}

/** Replace the real company name with its alias (case-insensitive, whole phrase). */
export function maskText(text, company, alias) {
  if (!company || !text) return text;
  const esc = company.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(esc, 'gi'), alias || 'a confidential client');
}
