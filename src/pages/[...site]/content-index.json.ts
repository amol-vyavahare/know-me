/**
 * /content-index.json — every public section of every item, chunked by `##` heading.
 * This is the feed the future RAG chatbot will embed. Private, draft and hidden
 * confidential entries are never included; masked names stay masked.
 *
 * It lists every role, so it only exists on the full site: /content-index.json normally,
 * /<full_site>/content-index.json with share_links on, and never on a single-role share site.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import {
  cfg, publicItems, itemPath, u, safeText, displayCompany, highlightsFor, getRole, experienceFor, fullSite, activeRole, hasSection,
  type JobData,
} from '../../lib/site';

export const getStaticPaths: GetStaticPaths = () =>
  fullSite === null ? [] : [{ params: { site: fullSite.replace(/\/$/, '') || undefined } }];

function chunk(body: string) {
  const out: { heading: string; text: string }[] = [];
  let heading = 'Overview';
  let buf: string[] = [];
  const flush = () => { const t = buf.join('\n').trim(); if (t) out.push({ heading, text: t }); buf = []; };
  for (const line of body.split('\n')) {
    const m = /^##\s+(.+)/.exec(line);
    if (m) { flush(); heading = m[1].trim(); } else buf.push(line);
  }
  flush();
  return out;
}

export const GET: APIRoute = async ({ site }) => {
  const abs = (p: string) => new URL(u((fullSite ?? '') + p), site).toString();
  const records: Record<string, unknown>[] = [];

  for (const item of await publicItems()) {
    const d = item.data;
    const base = {
      url: abs(itemPath(item)), title: safeText(d.title, d), type: d.type, date: d.date.toISOString().slice(0, 10),
      roles: d.roles, tags: d.tags, company: displayCompany(d) ?? null, summary: safeText(d.summary, d),
    };
    chunk(item.body ?? '').forEach((c, n) =>
      records.push({ id: `${item.id}#${n}`, ...base, heading: c.heading, text: safeText(c.text, d) }));
  }

  const all = getRole('all');
  // The default persona may hide Journey; fall back to the Everything view's, else no link
  const journeyUrl = (id: string) =>
    hasSection(activeRole, 'journey') ? abs(`journey/#${id}`) : cfg.all_view ? abs(`r/all/journey/#${id}`) : null;
  for (const job of await experienceFor(all)) {
    const d = job.data;
    records.push({
      id: `experience/${job.id}`, url: journeyUrl(job.id), type: 'experience', title: d.title,
      company: displayCompany(d), date: d.start.toISOString().slice(0, 10),
      end: d.end ? d.end.toISOString().slice(0, 10) : null, roles: d.roles, tags: d.skills,
      heading: 'Role', text: [safeText(d.summary, d), ...highlightsFor(job, all), safeText((d as JobData).description ?? job.body, d)].filter(Boolean).join('\n'),
    });
  }

  const about = (await getCollection('pages')).find((p) => p.id === 'about');
  if (about) records.push({ id: 'about', url: hasSection(activeRole, 'about') ? abs('about/') : null, type: 'about', title: about.data.title, heading: 'About', text: about.body });

  return new Response(JSON.stringify({
    generated: new Date().toISOString(),
    person: { name: cfg.name, tagline: cfg.tagline, location: cfg.location, links: cfg.links },
    count: records.length,
    records,
  }, null, 2), { headers: { 'Content-Type': 'application/json' } });
};
