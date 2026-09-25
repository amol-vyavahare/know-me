# Setup & deploy

This guide takes a new person from an empty clone to a live site.

- [1. Requirements](#1-requirements)
- [2. Create your profile](#2-create-your-profile)
- [3. Run it locally](#3-run-it-locally)
- [4. Publish](#4-publish)
- [5. Links the site produces](#5-links-the-site-produces) (and [secret per-role links](sharing.md))
- [6. Several people in one repo](#6-several-people-in-one-repo)
- [7. Updating the engine later](#7-updating-the-engine-later)

---

## 1. Requirements

- **Node.js 22.12 or newer** (`node -v`). Only needed to preview locally; GitHub builds the site for you.
- **Git** and a GitHub account.
- No database, server or API keys. The output is plain HTML/CSS in `dist/`.

## 2. Create your profile

All personal data lives in one folder. The engine reads `profile/` unless `PROFILE` points somewhere else.

1. Replace the current profile with the starter:
   ```bash
   rm -rf profile            # or move it somewhere safe first
   cp -r profile.example profile
   ```
2. Edit, in this order:

   | File | What to change |
   | --- | --- |
   | `profile/site.config.yaml` | `name`, `tagline`, `location`, `email`, `links`, `career_start`, `site_url`, `base_path` |
   | `profile/roles/*.yaml` | One file per persona you want (rename or delete the samples). The **file's `id`** is how content refers to it. |
   | `profile/site.config.yaml` | `active_role` (the default persona) and `roles_enabled` (personas that get their own `/r/<id>/` URL) |
   | `profile/public/` | Put your photo here and set `avatar:` to its path, e.g. `/me.jpg` |
   | `profile/content/` | Delete the sample entries (they start with `# SAMPLE`) and add your own. See [writing-content.md](writing-content.md). |
   | `profile/skills.yaml` | Optional. Labels, categories and aliases for skills. See [profile-reference.md](profile-reference.md#skillsyaml). |

3. Build once to validate everything: `npm run build`. Mistakes (unknown role, missing date, …) stop the
   build with the file name and field. See [troubleshooting.md](troubleshooting.md).

Every setting is described in [profile-reference.md](profile-reference.md).

## 3. Run it locally

```bash
npm ci            # first time, or after package.json changes
npm run dev       # live-reloading dev server
```

Open the URL it prints, e.g. `http://localhost:4321/know-me/`. The path after the port is `base_path`.

- Drafts (`draft: true`) are shown in `dev` and hidden in `build`.
- Changes to **Markdown** reload automatically. Changes to **YAML files** (`site.config.yaml`, roles, skills)
  need a restart of `npm run dev`.
- `npm run build && npm run preview` shows exactly what will be published.

## 4. Publish

### Option A: GitHub Pages (built in)

The workflow `.github/workflows/deploy.yml` builds and deploys on every push to `main`.

1. Create a repo on GitHub (e.g. `know-me`). **Do not** add a README or licence; it must start empty.
2. Push:
   ```bash
   git remote add origin https://github.com/<username>/know-me.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Open the **Actions** tab. When the run is green the site is at `https://<username>.github.io/<repo>/`.
   If the first run failed because Pages wasn't enabled yet, click **Re-run jobs**.

The workflow sets the URL for you: `SITE` = `https://<owner>.github.io` and `BASE_PATH` = `/<repo name>`, so
the site works whatever the repo is called. `site_url` / `base_path` in the config are only used for local builds.

> **Private repos:** GitHub Pages only publishes from a **public** repo on the free plan
> (GitHub Pro or a paid plan is needed for a private one). If the code must stay private, use option B.
>
> **Public repos expose your Markdown.** `confidential_mode: mask` only changes the published pages.
> The raw files in `profile/content/` (including real company names) are readable by anyone.

### Option B: Cloudflare Pages or Netlify (works with a private repo, free)

1. Push the repo to GitHub (private is fine).
2. Cloudflare: **Workers & Pages → Create → Pages → Connect to Git**. Netlify: **Add new site → Import from Git**.
3. Build settings:

   | Setting | Value |
   | --- | --- |
   | Build command | `npm run build` |
   | Output directory | `dist` |
   | Environment variable | `NODE_VERSION` = `22` |
   | Environment variable (only if not `profile/`) | `PROFILE` = your folder |

4. These hosts serve the site at the root of the domain, so in `profile/site.config.yaml` set
   `base_path: /` and `site_url:` to the address they give you (e.g. `https://know-me.pages.dev`).
5. You can delete `.github/workflows/deploy.yml`, or keep it and leave GitHub Pages disabled.

### Custom domain

On any host, add the domain in its dashboard, then set `site_url` to it and `base_path: /`.
On GitHub Pages also set `BASE_PATH: /` in `deploy.yml`, because the workflow otherwise uses the repo name.

## 5. Links the site produces

All paths are under the base path (e.g. `https://<username>.github.io/know-me/`).

| Path | Shows |
| --- | --- |
| `/` | Home for the **default persona** (`active_role`) |
| `/projects/` `/debug/` `/blog/` `/skills/` `/journey/` `/resume/` `/about/` | Section pages for the default persona |
| `/skills/<skill>/` | Everything that backs up one skill: projects, debug stories, articles, TILs, jobs |
| `/p/<type>/<slug>/` | One entry, e.g. `/p/debug/report-off-by-one-day/` |
| `/r/<role>/…` | Any page above for one specific persona. **Share these when applying for that kind of role.** |
| `/r/<role>/resume/` | The résumé tailored to that persona, with Print / Save as PDF |
| `/r/all/…` | The unfiltered "Everything" view (if `all_view` is enabled) |
| `/content-index.json` | Machine-readable index of all public content, for a future chatbot |

To give recruiters a link that shows **only** one role, with no way to reach the others, turn on share links.
That moves the whole table above under a secret path. See [sharing.md](sharing.md).

## 6. Several people in one repo

Keep one folder per person and pick it with the `PROFILE` environment variable:

```
profiles/
  jane/   site.config.yaml  skills.yaml  roles/  content/  public/
  raj/    …
```

```bash
PROFILE=profiles/jane npm run dev            # Git Bash / macOS / Linux
$env:PROFILE='profiles/jane'; npm run dev    # PowerShell
PROFILE=profiles/jane npm run new -- post "Title"
```

On GitHub Actions set `PROFILE:` in `deploy.yml`. One workflow publishes one profile. For several sites, use one
repo per person, or copy the workflow per profile and deploy to separate hosts.

For privacy, a cleaner setup is **one repo per person** holding a copy of the engine plus their own `profile/`.

## 7. Updating the engine later

Because personal data is isolated in `profile/`, engine updates (everything outside it) can be copied or merged
in without touching anyone's content. After updating:

1. `npm ci`
2. `npm run build`. The schema is strict, so any new required field shows up as a clear build error.
3. Compare `profile.example/` with your profile for new optional settings.
