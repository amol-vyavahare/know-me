// Plain-JS loader so astro.config.mjs, the remark plugin and pages share one source.
import fs from 'node:fs';
import path from 'node:path';
import { load as yamlLoad } from 'js-yaml';

const root = process.cwd();

export function loadSiteConfig() {
  const raw = yamlLoad(fs.readFileSync(path.join(root, 'site.config.yaml'), 'utf8')) ?? {};
  return {
    active_role: 'qa',
    roles_enabled: [],
    all_view: true,
    show_untagged: false,
    confidential_mode: 'mask',
    links: [],
    ...raw,
  };
}

export function loadRoles() {
  const dir = path.join(root, 'roles');
  const roles = {};
  for (const f of fs.readdirSync(dir)) {
    if (!/\.ya?ml$/.test(f)) continue;
    const r = yamlLoad(fs.readFileSync(path.join(dir, f), 'utf8'));
    if (!r?.id) throw new Error(`roles/${f} is missing an "id"`);
    roles[r.id] = {
      accent: '#8b5cf6',
      skills_highlight: [],
      content_priority: ['project', 'debug', 'post', 'til'],
      hide_types: [],
      resume_pdf: '',
      cta: '',
      ...r,
    };
  }
  return roles;
}

/** skills.yaml is optional — without it every tag/stack entry is its own skill. */
export function loadSkills() {
  const file = path.join(root, 'skills.yaml');
  if (!fs.existsSync(file)) return { skills: {}, not_skills: [] };
  const raw = yamlLoad(fs.readFileSync(file, 'utf8')) ?? {};
  return { skills: raw.skills ?? {}, not_skills: raw.not_skills ?? [] };
}

/** Replace the real company name with its alias (case-insensitive, whole phrase). */
export function maskText(text, company, alias) {
  if (!company || !text) return text;
  const esc = company.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(esc, 'gi'), alias || 'a confidential client');
}
