# know-me — career journal & role-tailored portfolio

A personal site for a software career: projects, debug stories, articles, TIL notes, a skills map and a
career timeline. The same content is re-arranged for each **persona** (for example QA, DevOps, Product Owner),
so every recruiter link shows the most relevant work first, with a résumé tailored to that role.

Built with [Astro](https://astro.build) as a fully static site. It deploys to GitHub Pages on every push.

**Everything personal lives in one folder, `profile/`.** The rest of the repo is a reusable engine.
To make this site yours, replace that folder and change nothing else.

---

## Quick start

Needs **Node 22.12+**.

```bash
npm ci                 # install dependencies
npm run dev            # http://localhost:4321/know-me/  (drafts are visible here)
npm run build          # production build into dist/ (fails on invalid content)
npm run preview        # serve dist/ locally
npm run new -- til "Something I learned"      # new entry from a template
```

**Setting it up for someone new?** Copy `profile.example/` to `profile/` (replace the existing one) and follow
[docs/setup-and-deploy.md](docs/setup-and-deploy.md).

## Documentation

| Guide | Read it when you want to… |
| --- | --- |
| [Setup & deploy](docs/setup-and-deploy.md) | start a new profile, run locally, publish (GitHub Pages, Cloudflare, Netlify), host several people |
| [Writing content](docs/writing-content.md) | add a project, debug story, article, TIL or job; drafts, dates, confidential employers |
| [Profile reference](docs/profile-reference.md) | look up every setting in `site.config.yaml`, `roles/*.yaml`, `skills.yaml` and front matter |
| [Maintaining the engine](docs/maintaining-the-engine.md) | change layouts or styles, add a page or content type, understand how the build works |
| [Troubleshooting](docs/troubleshooting.md) | fix a failed build or a page that doesn't show what you expect |

## What the site builds

| URL (under the base path, e.g. `/know-me/`) | Shows |
| --- | --- |
| `/` | Home for the **default persona** (`active_role`) |
| `/projects/` `/debug/` `/blog/` `/skills/` `/journey/` `/resume/` `/about/` | Section pages for the default persona |
| `/skills/<skill>/` | Everything that backs up one skill: projects, debug stories, articles, TILs, jobs |
| `/p/<type>/<slug>/` | One entry, e.g. `/p/debug/report-off-by-one-day/` |
| `/r/<role>/…` | Any page above for one specific persona. **Send these links to recruiters.** |
| `/r/all/…` | The unfiltered "Everything" view (if `all_view` is enabled) |
| `/content-index.json` | Machine-readable index of all public content, for a future chatbot |

## Repository layout

```
profile/            ← EVERYTHING personal. The only folder you normally edit.
  site.config.yaml    name, contact, links, default persona, page text
  skills.yaml         skill names, categories, aliases
  roles/              one YAML file per persona
  content/            projects/ debug/ posts/ til/ experience/ pages/
  public/             avatar, résumé PDFs, optional favicon.svg
profile.example/    ← neutral starter profile ("Alex Doe") to copy for a new person
templates/          ← front-matter templates used by `npm run new`
scripts/new.mjs     ← the `npm run new` helper
src/                ← the site engine (see docs/maintaining-the-engine.md)
.github/workflows/deploy.yml  ← GitHub Pages deployment
ideas/              ← personal notes, git-ignored
```

To build a different profile folder, set `PROFILE`:

```bash
PROFILE=profiles/jane npm run build             # Git Bash / macOS / Linux
$env:PROFILE='profiles/jane'; npm run build     # PowerShell
```
