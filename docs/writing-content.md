# Writing content

Every page is a Markdown file in `profile/content/`. **Add or edit a file, commit, push, and the site rebuilds.**
You can do this entirely in the GitHub web editor; no local setup needed.

- [Content types](#content-types)
- [Creating an entry](#creating-an-entry)
- [Front matter essentials](#front-matter-essentials)
- [Choosing roles, featuring and tags](#choosing-roles-featuring-and-tags)
- [Experience (jobs)](#experience-jobs)
- [The About me page](#the-about-me-page)
- [Drafts and private entries](#drafts-and-private-entries)
- [Confidential employers and clients](#confidential-employers-and-clients)
- [Images and files](#images-and-files)
- [Writing tips](#writing-tips)

The complete list of fields is in [profile-reference.md](profile-reference.md#front-matter-posts-projects-debug-til).

---

## Content types

| Folder | `type:` | Shown in | Use it for |
| --- | --- | --- | --- |
| `profile/content/projects/` | `project` | Projects | Things you built, led or shipped |
| `profile/content/debug/` | `debug` | Debug Diary | Incidents written as symptom → investigation → root cause → fix → lesson |
| `profile/content/posts/` | `post` | Blog | Longer articles |
| `profile/content/til/` | `til` | Blog | Short "Today I Learned" notes |
| `profile/content/experience/` | — | Journey, Résumé | One file per job |
| `profile/content/pages/about.md` | — | About | Free-form About page |

The folder decides where a file is loaded from, and `type:` decides how it is shown. Keep them matching.
The file name becomes the URL: `profile/content/debug/flaky-login.md` → `/p/debug/flaky-login/`.
**Don't rename files after publishing.** Links, and the future chatbot's citations, would break.

## Creating an entry

**With the helper (local):**

```bash
npm run new -- debug "Flaky login test on Safari" 2019-04-02
npm run new -- project|post|til|experience "<title>" [YYYY-MM-DD]
```

It copies the matching file from `templates/`, fills in the title and date, sets `roles:` to your default
persona, and writes it into the active profile (respects `PROFILE`).

**By hand (e.g. on GitHub):** copy a file from `templates/` into the right folder. Replace `__ROLE__` with a
role id, because the build rejects it otherwise.

## Front matter essentials

```yaml
---
title: "Monthly report missing the last day of the month"
type: debug                  # project | debug | post | til
date: 2019-05-20             # when it happened; this is the date shown on the site
roles: [qa, product-owner]   # personas that show it (ids of files in profile/roles/), or [all]
featured: [qa]               # pin to the "Start here" block on that persona's home page
tags: [sql, boundary-testing]
summary: "One or two sentences. Shown on cards, in search previews and to the chatbot."
impact: "Recovered ~3% of reported revenue"   # optional highlighted result
---
```

Then write the body in Markdown. Use `##` headings. Items with two or more get an "On this page" menu.

**About dates:** `date:` is when the work or story happened, and it is the only date shown. Commit time is
ignored. If the repo is public its history is visible, so use real dates. `updated:` (optional) adds an
"updated …" note.

The build **validates every file**. A typo in `roles:`, a missing `date:` or a wrong `type:` fails the build
with the file and field named, so the live site never shows a broken page.

## Choosing roles, featuring and tags

- **`roles:`** decides which persona views show the entry. `[all]` shows it everywhere. An entry with no roles
  is hidden unless `show_untagged: true` in `site.config.yaml`.
- **`featured:`** pins the entry to the top of those personas' home pages (max 3 are shown; newest first).
  With nothing featured, the 3 newest entries are used.
- **`tags:`** power three things: the tag filter on list pages, the "Related" block under each entry, and the
  **Skills** pages. Use lowercase-with-hyphens (`api-testing`, `ci-cd`).
- **`stack:`** (projects) lists tools as you'd normally write them (`GitHub Actions`, `PostgreSQL`). They are shown
  on the card and also count as skills.
- To control how a skill is named or grouped, or to merge spellings (`k8s` → `kubernetes`), edit
  `profile/skills.yaml`. Tags that aren't skills (`career`) go under `not_skills:`.

## Experience (jobs)

One file per job in `profile/content/experience/` (name it `YYYY-short-title.md` to keep them ordered).

```yaml
---
title: "Senior SDET"            # job title
company: "Northwind Payments"
start: 2018-01-01
end: 2022-08-31                 # leave empty for your current job
location: "Remote"
roles: [all]                    # which personas show this job
skills: [api-testing, playwright, ci-cd]   # link to Skills pages
summary: "One line about the job."
highlights:
  - "A bullet shown for every persona."
  - text: "A bullet shown only on the QA view and QA résumé."
    roles: [qa]
---
Optional longer description in Markdown (shown on the Journey page).
```

Jobs feed the **Journey** timeline and the **Résumé**. Per-role `highlights` are how one career becomes several
tailored résumés. A persona can drop the Journey page with `hide_sections: [journey]` in its role file; its jobs
still appear on its résumé and home page. `draft` and `visibility` are **not** supported on jobs; use `roles:`
or `confidential` instead.

### Changing a job per persona

Any persona can see a job differently. Add `per_role:` with the fields to change. Anything left out keeps the
base value:

```yaml
per_role:
  devops:
    title: "Platform Engineer"
    summary: "Ran the CI platform for 40 engineers."
    skills: [kubernetes, terraform]
    start: 2019-03-01
    end:                       # blank = Present
    description: |             # Markdown; replaces the file's body on the DevOps Journey page
      Owned the self-hosted runners and the deploy pipeline.
```

Changeable fields: `title`, `company`, `company_alias`, `location`, `start`, `end`, `summary`, `skills`,
`description`. The change applies everywhere that persona sees the job: home page, Journey, Résumé, Skills pages
and its share site. A job marked `confidential` still shows `company_alias` in `mask` mode, so change that too
if needed. Recruiters may compare sites, so keep facts like dates consistent with your other résumés.

## The About me page

`profile/content/pages/about.md` is the **About me** tab. Its `title:` becomes the page heading, and the body is
free Markdown. Contact details beside it come from `site.config.yaml`.

To give one persona a different About me page, add `profile/content/pages/about-<role id>.md`
(e.g. `about-qa.md`) in the same format. It replaces `about.md` for that persona only.

## Drafts and private entries

| Field | Effect |
| --- | --- |
| `draft: true` | Hidden on the live site; visible in `npm run dev` |
| `visibility: private` | Never rendered anywhere and never in `content-index.json` (still in the repo!) |

## Confidential employers and clients

Add to any entry or job:

```yaml
company: "Northwind Payments"
company_alias: "A leading fintech"
confidential: true
```

Then pick the behaviour for the whole site with `confidential_mode` in `site.config.yaml`:

| Mode | Effect |
| --- | --- |
| `show` | Real company name everywhere |
| `mask` | Alias shown, and the real name is also replaced inside titles, summaries and body text |
| `hide` | Confidential entries are left out entirely |

> ⚠️ Masking only affects the **published site**. The Markdown in a public repo still contains the real name.
> If a name must never be public, write the alias in the source or keep the repo private.

## Images and files

**Images inside an entry:** put the image next to the Markdown file and use a relative path.
Astro optimises it and adds the correct base path.

```markdown
![Pipeline diagram](./pipeline.png)      <!-- profile/content/projects/pipeline.png -->
```

Don't use root paths like `/images/x.png` in Markdown. On GitHub Pages the site lives under `/<repo>/`, so
they would 404.

**Other files** (avatar, résumé PDFs, favicon) go in `profile/public/` and are referenced from settings, for example
`avatar: /me.jpg` or `resume_pdf: /resumes/qa.pdf` in a role file. Settings get the base path added automatically.

## Writing tips

- **Always fill `summary`.** It appears on cards and is what the future chatbot quotes.
- Use the template headings. Keep each `##` section focused and under ~400 words, because each one becomes a
  separate chunk in `/content-index.json`.
- Put a measurable result in `impact:`. It is the most-read line on a card.
- Tag consistently. Every tag spelling becomes a skill unless merged in `skills.yaml`, and the build warns when a
  persona highlights a skill that nothing uses.
