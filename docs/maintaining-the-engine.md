# Maintaining the engine

For whoever changes the code in `src/`. If you only write content or edit settings, you don't need this.

- [Mental model](#mental-model)
- [Repository layout](#repository-layout)
- [File map](#file-map)
- [How a build works](#how-a-build-works)
- [Common changes](#common-changes)
- [Rules to keep](#rules-to-keep)
- [Checking your change](#checking-your-change)
- [Dependencies](#dependencies)

---

## Mental model

1. **Engine vs profile.** `src/`, `templates/` and `scripts/` must contain no personal data. Everything about a
   person comes from the profile folder through `src/lib/load-config.mjs`. Anything a user might want to change
   belongs in the profile, via a config key, a `text:` override, or a file in `public/`.
2. **Views.** A *view* is one persona rendered at one URL prefix (`View` in `src/lib/site.ts`):
   - the default view: `active_role` at `/`
   - one view per `roles_enabled` id at `/r/<id>/`
   - the "Everything" view at `/r/all/` (unless `all_view: false`)

   **Every page is built once per view.** Views filter content by `roles:`, reorder home sections by
   `content_priority` and colour the site with the role's `accent`.
3. **One catch-all route.** `src/pages/[...path].astro` generates every HTML page for every view
   (home, sections, entries, skills) and hands off to a component in `src/views/`.
4. **Fully static.** No server, no client framework. The only client JS is small inline scripts
   (theme toggle, mobile menu, tag filter, persona menu).

## Repository layout

```
profile/            ← EVERYTHING personal (the active profile; or set PROFILE)
  site.config.yaml    name, contact, links, default persona, page text
  skills.yaml         skill names, categories, aliases
  roles/              one YAML file per persona
  content/            projects/ debug/ posts/ til/ experience/ pages/
  public/             avatar, résumé PDFs, optional favicon.svg
profile.example/    ← neutral starter profile ("Alex Doe") to copy for a new person
templates/          ← front-matter templates used by `npm run new`
scripts/new.mjs     ← the `npm run new` helper
src/                ← the site engine (see the file map below)
docs/               ← these guides
.github/workflows/deploy.yml  ← GitHub Pages deployment
```

## File map

| Path | Responsibility |
| --- | --- |
| `astro.config.mjs` | Site URL + base path (from `SITE`/`BASE_PATH` or config), `publicDir` = `<profile>/public`, Markdown plugins, code highlighting themes |
| `src/lib/load-config.mjs` | Resolves the profile (`PROFILE`), reads `site.config.yaml`, `roles/`, `skills.yaml`; `maskText`. Plain JS because `astro.config.mjs` and `scripts/new.mjs` import it too |
| `src/lib/site.ts` | The engine's core: config, roles & views, URL helpers (`u`, `viewUrl`, `itemUrl`, `skillUrl`), content queries (`publicItems`, `itemsFor`, `featuredFor`, `experienceFor`, `highlightsFor`), confidentiality (`displayCompany`, `safeText`), page text (`t`, `TEXT_DEFAULTS`), type metadata (`TYPE_META`), tag labels (`prettyTag`), skills (`skillId`, `skillCatalog`, `skillsFor`, `warnSkillProblems`) |
| `src/lib/remark-confidential.mjs` | Replaces confidential company names inside rendered Markdown in `mask` mode |
| `src/content.config.ts` | Content collections and their Zod schemas (`items`, `experience`, `pages`). Validates `roles:` against the profile's role ids |
| `src/pages/[...path].astro` | Generates all HTML pages for all views (`getStaticPaths`) and picks the view component |
| `src/pages/content-index.json.ts` | `/content-index.json`, public content chunked by `##` heading, for a future chatbot |
| `src/pages/icon.svg.ts` | Generated favicon (initials + default persona colour) |
| `src/pages/404.astro` | Not-found page |
| `src/layouts/Base.astro` | `<head>`, SEO tags, header nav, persona switcher, theme toggle, footer |
| `src/views/Home.astro` | Home: hero, stats, featured, skills, latest per type, jobs, CTA |
| `src/views/ListView.astro` | Projects / Debug Diary / Blog lists with tag filter |
| `src/views/ItemView.astro` | One entry: body, "At a glance", table of contents, tags, related |
| `src/views/Skills.astro`, `SkillView.astro` | Skills index and one skill's page |
| `src/views/Journey.astro`, `Resume.astro`, `About.astro` | Timeline, printable résumé, About |
| `src/components/` | `ItemCard` (grid card), `ItemRow` (list row), `TagFilter` (client-side tag filter) |
| `src/styles/global.css` | All styling. Colour tokens on `:root` (dark default), light theme via `[data-theme=light]` / `prefers-color-scheme`, print styles for the résumé |
| `templates/*.md` | Front matter scaffolds; `__ROLE__` is replaced by `npm run new` |
| `scripts/new.mjs` | `npm run new -- <type> "<title>" [date]` |
| `.github/workflows/deploy.yml` | Build + deploy to GitHub Pages |

## How a build works

1. `astro.config.mjs` imports `load-config.mjs`, which resolves `PROFILE` and fails fast if the folder or
   `active_role` is missing.
2. `content.config.ts` loads Markdown from `<profile>/content/**` and validates front matter. Any error stops the build.
3. `[...path].astro#getStaticPaths` loops over every view × (home, sections, entries, skills) and emits a path.
   It also calls `warnSkillProblems()`, which prints `[skills]` warnings.
4. Each page renders `Base.astro` plus one view component. Content is filtered for the view with `itemsFor(role)`.
5. Output goes to `dist/`. Around 60 pages per view for the current profile.

Visibility rules (in `site.ts`): an item is shown when it is not a draft (outside dev), not `visibility: private`,
not confidential under `hide`, matches the view's role (`matchesRole`) and its type isn't in `hide_types`.

## Common changes

### Change colours, fonts or spacing

Edit the tokens at the top of `src/styles/global.css`. Per-persona colour is `--accent`, set inline on `<html>`
from the role file. `--ink` is a darker accent for text on light backgrounds. Fonts are self-hosted via
`@fontsource-variable/*` and imported in `Base.astro`.

### Make a new piece of text configurable

Add a key to `TEXT_DEFAULTS` in `src/lib/site.ts`, then use `t('your_key', role)` in the view.
Document it in `docs/profile-reference.md` and the comment block in `profile.example/site.config.yaml`.

### Add a front matter field

1. Add it to the Zod schema in `src/content.config.ts` (use `.optional()` or `.default()` so existing files stay valid).
2. Render it in the relevant view (`ItemView.astro`, `ItemCard.astro`, …). Pass free text through
   `safeText(value, item.data)` so confidential masking applies.
3. Add it to `templates/` and `docs/profile-reference.md`.

### Add a new section page (like `/skills/`)

1. `src/pages/[...path].astro`: add the name to `sections`, to the `Page` type, to `titles`, and render your view.
2. Create `src/views/YourView.astro` (props: `view`).
3. `src/layouts/Base.astro`: add it to `nav`.
4. For per-page sub-routes (like `/skills/<id>/`), push extra paths in `getStaticPaths` for **every view**, so the
   persona switcher never links to a 404.

### Add a new content type (e.g. give TIL its own section)

1. `src/content.config.ts`: add the value to the `type` enum and its folder to the `items` glob pattern.
2. `src/lib/site.ts`: add it to `TYPE_META` (label, plural, section, icon) and to `ALL_ROLE.content_priority`.
3. `src/views/ListView.astro`: add an entry to `copy` (and `t()` keys for its title/lead).
4. `src/pages/[...path].astro`: add the section. `src/layouts/Base.astro`: add the nav item.
5. `src/views/Home.astro`: stats and section grouping. Posts and TILs are currently merged into "Writing".
6. `src/views/SkillView.astro`: add singular/plural to `nouns`.
7. `templates/<type>.md` and the `folders` map in `scripts/new.mjs`.
8. Docs: `writing-content.md`, `profile-reference.md`.

### Change skill matching

All of it is in the "Skills" section at the bottom of `src/lib/site.ts`: `skillSlug` (normalisation),
`skillId` (aliases, `not_skills`), `itemSkillIds` / `jobSkillIds` (which fields count), `skillCatalog`
(labels, categories). Pages: `Skills.astro`, `SkillView.astro`.

## Rules to keep

- **No personal data outside the profile.** Before committing, build `profile.example` and grep `dist/` for the
  real person's name (see below).
- **Links go through `u()` / `viewUrl()` / `itemUrl()` / `skillUrl()`.** Hard-coded `/…` links break under a base
  path like `/know-me/`.
- **Every page exists in every view.** If a page can be empty for a persona, render an empty state rather than
  skipping it.
- **Free text from confidential entries goes through `safeText()`**, and company names through `displayCompany()`.
- **Schema changes stay backward compatible** (optional or defaulted), so existing profiles keep building.
- **Dates are UTC** (`fmtDate`) so a hard-coded date never shifts by timezone.

## Checking your change

There is no automated test suite. The build is the check, because it validates all content. Before pushing:

```bash
npm run build                                  # your profile
PROFILE=profile.example npm run build          # the starter profile must build too
grep -ril "<real name>" dist || echo clean     # (after the example build) no personal data leaked into the engine
npm run build && npm run preview               # click through: home, a list, an entry, /skills/, résumé, a /r/<role>/ page
```

Check mobile width (≈390 px) and both light and dark themes when changing layout or CSS.

## Dependencies

| Package | Why |
| --- | --- |
| `astro` | Static site generator, content collections, Markdown, image optimisation |
| `@astrojs/markdown-remark` | Types for the remark plugin |
| `js-yaml` | Reads the profile YAML files |
| `@fontsource-variable/*` | Self-hosted Inter, Space Grotesk, JetBrains Mono |

Upgrade with `npm outdated` → `npm install <pkg>@latest` → run the checks above. Astro major upgrades may
change the content-collection or loader APIs used in `src/content.config.ts`; read its upgrade guide first.
