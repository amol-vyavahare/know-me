# know-me

Static Astro site: a role-tailored career portfolio. Read `README.md` first; detailed guides are in `docs/`.

## Key rules

- **All personal data lives in the profile folder** (`profile/`, or `$PROFILE`). Never put names, content or
  personal defaults in `src/`, `templates/` or `scripts/`. User-facing wording goes through `t()` /
  `TEXT_DEFAULTS` in `src/lib/site.ts` so profiles can override it.
- **Every page is built once per view** (default persona, each `/r/<role>/`, and `/r/all/`). New pages and sub-routes
  must exist in every view (see `src/pages/[...path].astro`).
- **Build links with `u()`, `viewUrl()`, `itemUrl()` or `skillUrl()`.** Never hard-code `/…`, because the site runs under a base path.
- **Pass confidential free text through `safeText()`** and company names through `displayCompany()`.
- **Schema changes in `src/content.config.ts` must be optional or defaulted** so existing profiles keep building.

## Commands

```bash
npm run dev                          # dev server (drafts visible)
npm run build                        # validates all content; this is the test suite
PROFILE=profile.example npm run build   # the starter profile must also build
npm run new -- <project|debug|post|til|experience> "<title>" [YYYY-MM-DD]
```

## Where things are

`docs/maintaining-the-engine.md` has the file map and step-by-step recipes (new section, new content type,
new front matter field, new configurable text). `docs/profile-reference.md` lists every setting.
When you change behaviour, update the matching doc and `profile.example/`.
