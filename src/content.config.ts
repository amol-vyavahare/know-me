import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { pathToFileURL } from 'node:url';
import { loadRoles, profilePath } from './lib/load-config.mjs';

/** Content folders live inside the active profile (see load-config.mjs). */
const contentDir = (sub = '') => pathToFileURL(profilePath('content', sub) + '/');

// Every `roles:` value must be a file in /roles or "all" — a typo fails the build.
const knownRoles = [...Object.keys(loadRoles()), 'all'];
const role = z.string().refine((r) => knownRoles.includes(r), {
  message: `Unknown role. Use one of: ${knownRoles.join(', ')}`,
});

/** Empty / null YAML values count as "not set" (so `end:` left blank = current job). */
const optDate = z.preprocess((v) => (v === null || v === '' ? undefined : v), z.coerce.date().optional());

const confidential = {
  company: z.string().optional(),
  company_alias: z.string().optional(),
  confidential: z.boolean().default(false),
};

/** Posts, projects, debug diaries and TILs share one schema. */
const items = defineCollection({
  loader: glob({ pattern: ['posts/**/*.md', 'projects/**/*.md', 'debug/**/*.md', 'til/**/*.md'], base: contentDir() }),
  schema: z.object({
    title: z.string(),
    type: z.enum(['post', 'project', 'debug', 'til']),
    date: z.coerce.date(),                       // hard-coded "posted" date — the only one shown
    updated: optDate,
    roles: z.array(role).default([]),
    tags: z.array(z.string()).default([]),
    summary: z.string(),
    featured: z.array(role).default([]),         // pin to top for these roles
    impact: z.string().optional(),               // e.g. "Build time 40 min → 12 min"
    draft: z.boolean().default(false),
    visibility: z.enum(['public', 'private']).default('public'),
    cover: z.string().optional(),
    // project-only (optional elsewhere)
    stack: z.array(z.string()).default([]),
    my_role: z.string().optional(),
    repo: z.string().optional(),
    demo: z.string().optional(),
    duration: z.string().optional(),
    ...confidential,
  }),
});

const highlight = z.union([
  z.string(),
  z.object({ text: z.string(), roles: z.array(role).default(['all']) }),
]);

/** One file per job — drives the Journey timeline and the Resume. */
const experience = defineCollection({
  loader: glob({ pattern: '*.md', base: contentDir('experience') }),
  schema: z.object({
    title: z.string(),                           // job title
    start: z.coerce.date(),
    end: optDate,                                // blank = present
    location: z.string().optional(),
    roles: z.array(role).default(['all']),
    skills: z.array(z.string()).default([]),
    summary: z.string().optional(),
    highlights: z.array(highlight).default([]),
    ...confidential,
    company: z.string(),
  }),
});

/** Free-form pages such as About. */
const pages = defineCollection({
  loader: glob({ pattern: '*.md', base: contentDir('pages') }),
  schema: z.object({ title: z.string() }),
});

export const collections = { items, experience, pages };
