# Profile reference

Every setting a profile can contain. A profile is one folder (default `profile/`, or whatever `PROFILE` points to):

```
<profile>/
  site.config.yaml   required
  roles/*.yaml       required, at least one
  content/           required (can be nearly empty)
  skills.yaml        optional
  public/            optional; served at the site root
```

`profile.example/` is a complete, working example of all of these.

- [site.config.yaml](#siteconfigyaml)
- [Page text overrides (`text:`)](#page-text-overrides-text)
- [roles/*.yaml](#rolesyaml)
- [skills.yaml](#skillsyaml)
- [Front matter: posts, projects, debug, TIL](#front-matter-posts-projects-debug-til)
- [Front matter: experience](#front-matter-experience)
- [Front matter: pages](#front-matter-pages)
- [public/](#public)
- [Environment variables](#environment-variables)

---

## site.config.yaml

| Key | Required | Default | What it does |
| --- | --- | --- | --- |
| `active_role` | **yes** | — | Id of the persona shown at the site root. Must match a file in `roles/`. |
| `roles_enabled` | no | `[]` | Personas that get their own URL `/r/<id>/` and appear in the persona switcher. |
| `all_view` | no | `true` | Build the unfiltered `/r/all/` view. `false` to disable, or an object `{ label, summary, accent, headline }` to customise it (defaults: "Everything", a generic summary, `#a78bfa`, your `tagline`). |
| `show_untagged` | no | `false` | Show entries that have no `roles:` in every persona. |
| `confidential_mode` | no | `mask` | `show` \| `mask` \| `hide`. See [writing-content.md](writing-content.md#confidential-employers-and-clients). |
| `name` | yes | — | Header, page titles, résumé, generated favicon initials. |
| `tagline` | no | — | Subtitle on About; headline of the "Everything" view. |
| `location` | no | — | Home page pill, About, résumé. |
| `avatar` | no | — | Path inside `public/`, e.g. `/me.jpg`. Home hero and About. |
| `email` | no | — | "Get in touch" / "Email me" buttons, About, résumé. Blank hides them. |
| `availability` | no | — | Status pill on the home page; fallback for "Currently" on About. |
| `links` | no | `[]` | List of `{ label, url }`. Footer, About, résumé; the first two also on the home page. |
| `career_start` | no | — | `YYYY-MM-DD`. Drives the "N+ years in software" stat. |
| `site_url` | no | — | Full origin for local builds, e.g. `https://you.github.io`. Overridden by `SITE` in CI. |
| `base_path` | no | `/` | URL path the site lives under, e.g. `/know-me`. Overridden by `BASE_PATH` in CI. Use `/` for a custom domain or Cloudflare/Netlify. |
| `text` | no | `{}` | Overrides for headings and blurbs. See below. |

## Page text overrides (`text:`)

Any heading or blurb the engine writes itself can be replaced. `{role}` becomes the persona's label and
`{name}` becomes your name. Unknown keys produce a build warning listing the valid ones.

```yaml
text:
  projects_title: Things I shipped
  home_cta_text: Always happy to talk about {role} work.
```

| Key | Default |
| --- | --- |
| `home_featured_title` | Best of my {role} work |
| `home_skills_title` | Skills, with receipts |
| `home_writing_title` | Writing & learnings |
| `home_journey_title` | Where I've been |
| `home_cta_title` | Let's talk *(the role's `cta` wins if set)* |
| `home_cta_text` | Happy to chat about roles, projects, or a tricky bug you're chasing. |
| `projects_title` / `projects_lead` | Things I built & shipped / Projects that show how I work as a {role}: … |
| `debug_title` / `debug_lead` | Bugs I hunted down / Real incidents and head-scratchers, … |
| `blog_title` / `blog_lead` | Articles & learnings / Longer articles plus short "Today I Learned" notes … |
| `skills_title` / `skills_lead` | What I work with / Every skill here is backed by real work. … |
| `journey_title` / `journey_lead` | The long road so far / Every role, what I owned there, … |
| `about_title` | Hi, I'm {name} *(only used if `pages/about.md` has no `title`)* |
| `not_found_title` / `not_found_lead` | Hmm. That page wandered off. / It may have moved, … *(first word is highlighted)* |

The full default strings are in `TEXT_DEFAULTS` in `src/lib/site.ts`.

## roles/*.yaml

One file per persona. The file name doesn't matter; the `id` does.

```yaml
id: qa                       # used in URLs (/r/qa/) and in content `roles:` / `featured:`
label: QA / SDET             # shown in the switcher, headings, résumé
accent: "#22c55e"            # the persona's colour across the site
headline: Quality engineer who automates the boring and hunts the flaky.   # home hero; first word highlighted
summary: >                   # home hero paragraph and résumé summary
  I design test strategies…
skills_highlight: [test-strategy, playwright, ci-cd]   # home "Skills" block, résumé "Core skills", outlined on /skills/
content_priority: [debug, project, post, til]          # order of sections on the home page and skill pages
hide_types: []               # content types to hide for this persona, e.g. [debug] removes the Debug Diary
resume_pdf: ""               # e.g. /resumes/qa.pdf in public/. Blank = "Print / Save as PDF" button
cta: Open to SDET and QA Lead roles   # home call-to-action heading and About "Currently"
```

| Key | Required | Default |
| --- | --- | --- |
| `id` | **yes** | — |
| `label`, `headline`, `summary` | yes (in practice) | — |
| `accent` | no | `#8b5cf6` |
| `skills_highlight` | no | `[]` |
| `content_priority` | no | `[project, debug, post, til]` |
| `hide_types` | no | `[]` |
| `resume_pdf`, `cta` | no | `""` |

**Adding a persona:** copy a role file, change `id`, `label`, the text and the colour, add the id to
`roles_enabled`, then tag content with `roles: [<id>]`.

## skills.yaml

Skills are collected automatically from item `tags` and `stack`, plus experience `skills`. This file only
adjusts them.

```yaml
skills:
  kubernetes:
    label: Kubernetes          # display name (default: nicest spelling found in content)
    category: Cloud & DevOps   # group on /skills/ (default: "Other")
    aliases: [k8s, eks]        # other names that count as this skill
  ci-cd: { label: CI/CD, category: Cloud & DevOps, aliases: [github-actions] }

not_skills: [career, timezones]   # tags that never become skills
```

How names are matched:
1. Every name is normalised: lower-case, anything that isn't a letter or digit becomes `-`
   (`GitHub Actions` → `github-actions`, `C++` → `cplusplus`, `C#` → `csharp`).
2. Aliases map to their skill (`EKS` → `eks` → `kubernetes`).
3. Names in `not_skills` are dropped.
4. The result is the URL: `/skills/kubernetes/`.

Categories appear on `/skills/` in the order they first occur in this file, with "Other" last.
The build warns when a role's `skills_highlight` names a skill that no content uses.

## Front matter: posts, projects, debug, TIL

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `title` | string | **yes** | |
| `type` | `post` \| `project` \| `debug` \| `til` | **yes** | Should match the folder. |
| `date` | date | **yes** | The date shown; when it happened. |
| `summary` | string | **yes** | Cards, meta description, chatbot. |
| `updated` | date | no | Adds "updated …". |
| `roles` | list of role ids / `all` | no | Unknown ids fail the build. Empty = hidden unless `show_untagged`. |
| `featured` | list of role ids | no | Pins to that persona's home page. |
| `tags` | list | no | Filters, related entries, skills. |
| `impact` | string | no | Highlighted result on cards and the entry page. |
| `draft` | bool | no | Hidden in `build`, shown in `dev`. |
| `visibility` | `public` \| `private` | no | `private` is never rendered. |
| `stack` | list | no | Tools used; shown on cards and "At a glance"; counts as skills. |
| `my_role`, `duration` | string | no | "At a glance" box. |
| `repo`, `demo` | URL | no | "Code" / "Live demo" buttons. |
| `company`, `company_alias`, `confidential` | string, string, bool | no | See confidential handling. |
| `cover` | string | no | Accepted but **not displayed yet** (reserved). |

## Front matter: experience

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `title` | string | **yes** | Job title. |
| `company` | string | **yes** | |
| `start` | date | **yes** | |
| `end` | date | no | Empty = current job ("Present"). |
| `location` | string | no | |
| `roles` | list | no | Default `[all]`. |
| `skills` | list | no | Linked to Skills pages. |
| `summary` | string | no | |
| `highlights` | list | no | Each item is a string (all personas) or `{ text, roles: [...] }`. |
| `company_alias`, `confidential` | | no | As above. |

The body (optional Markdown) is shown on the Journey page.

## Front matter: pages

`content/pages/about.md` takes just `title:`. The body is free Markdown.

## public/

Copied as-is to the site root: `public/me.jpg` → `<base>/me.jpg`. Typical contents:

- your photo (point `avatar:` at it)
- `resumes/*.pdf` (point a role's `resume_pdf:` at it)
- `favicon.svg`, which is optional; without it a favicon is generated from your initials and the default persona's colour

## Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `PROFILE` | `profile` | Folder to build, relative to the repo root (or absolute). |
| `SITE` | `site_url` | Full origin, e.g. `https://you.github.io`. Set by the GitHub workflow. |
| `BASE_PATH` | `base_path` | Path prefix, e.g. `/know-me`. Set by the GitHub workflow from the repo name. |
