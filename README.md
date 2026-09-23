# know-me — career journal & role-tailored portfolio

A personal site for my software journey: projects, debug stories, articles, TILs and a career timeline.
It rebuilds itself for whichever role I'm applying for (QA, DevOps, Product Owner).
Built with [Astro](https://astro.build) and published to GitHub Pages on every push.

| URL | Shows |
| --- | --- |
| `https://<username>.github.io/know-me/` | The **active role** from `site.config.yaml` |
| `/know-me/r/qa/` · `/know-me/r/devops/` · `/know-me/r/product-owner/` | Always that role — send these links to recruiters |
| `/know-me/r/all/` | Everything, unfiltered |
| `/know-me/<role path>/resume/` | A resume for that role, with Print / Save as PDF |
| `/know-me/content-index.json` | Machine-readable index of all public content (for the future chatbot) |

---

## 1. One-time setup

1. Create a **public** GitHub repo named `know-me` (any name works; the URL follows the repo name).
2. Push this folder to it:
   ```bash
   git init && git add . && git commit -m "Initial site"
   git branch -M main
   git remote add origin https://github.com/<username>/know-me.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Wait 1–2 minutes (the **Actions** tab shows progress). The site is at `https://<username>.github.io/know-me/`.
5. Edit `site.config.yaml`: your email, links, `career_start`, and `site_url`. Put a photo in `public/` and point `avatar:` at it.

Run it locally (optional, needs Node 22+):

```bash
npm install
npm run dev        # http://localhost:4321/know-me/  (drafts are visible here)
```

## 2. Writing content

Every page on the site is a Markdown file under `content/`. **Commit a file → it appears on the site.**

| Folder | Type | Use for |
| --- | --- | --- |
| `content/projects/` | `project` | Things you built or led |
| `content/debug/` | `debug` | Debug Diary: symptom → investigation → root cause → fix → lesson |
| `content/posts/` | `post` | Articles |
| `content/til/` | `til` | Short "Today I Learned" notes |
| `content/experience/` | — | One file per job (drives Journey + Resume) |
| `content/pages/about.md` | — | The About page |

Start from a template:

```bash
npm run new -- debug "Flaky login test on Safari" 2019-04-02
```

…or copy a file from `templates/` in the GitHub web editor. No local setup needed.

### Front matter that matters

```yaml
date: 2019-04-02          # the date shown on the site. You set it; commit time is ignored
roles: [qa, devops]       # which personas show this: qa | devops | product-owner | all
featured: [qa]            # pin to the top of the QA home page
summary: "…"              # shown on cards and used by the future chatbot
impact: "Flake rate 6% → 0.1%"
draft: true               # hidden on the live site, visible in `npm run dev`
visibility: private       # never rendered, never in content-index.json
```

A typo in `roles:` or a missing `date:` **fails the build**, so the live site never shows a broken page.
The Actions tab tells you which file and field to fix.

**About dates.** `date:` is the date the work or story happened. The site shows it as the posting date.
Your repo's commit history is public, so use real dates and don't invent past ones.

## 3. Tailoring for a job search

- **Switch the default persona:** change `active_role:` in `site.config.yaml` and push.
- **Edit a persona:** `roles/qa.yaml` etc. hold the headline, summary, highlighted skills, section order, accent colour, CTA and optional resume PDF.
- **Add a persona** (e.g. Backend): copy `roles/qa.yaml` to `roles/backend.yaml`, change `id: backend`, add it to `roles_enabled`, then tag content with `roles: [backend]`.
- **Per-role resume bullets:** in `content/experience/*.md`, a highlight with `roles: [devops]` only appears on the DevOps resume and timeline.
- **Hide debug stories for a role:** `hide_types: [debug]` in that role file.

## 4. Confidential employers and clients

Mark an entry `confidential: true` and give it `company` + `company_alias`. Then choose in `site.config.yaml`:

| `confidential_mode` | Effect |
| --- | --- |
| `show` | Real company name everywhere |
| `mask` | Alias shown, and the real name is replaced inside the article text too |
| `hide` | Confidential entries are left out of the site entirely |

> ⚠️ The Markdown source in a public repo still contains the real name. Masking only affects the published site.
> If a name must never be public, write the alias in the source, or keep the repo private (GitHub Pages
> from a private repo needs a paid plan).

## 5. Getting ready for the AI chatbot (Phase 3)

Every build writes `/content-index.json`: one record per `##` section with title, URL, date, roles, tags and text.
Private, draft and hidden-confidential items are excluded, and masked names stay masked.
A later GitHub Action can embed this file into a vector store and a small serverless API can answer
recruiter questions with links back to the source posts.

Tips that make the bot better later:
- Always fill `summary`.
- Use the heading templates; keep each section focused and under ~400 words.
- Don't rename files once published, because URLs are the bot's citations.

## Project layout

```
content/          ← your Markdown (the only folder you normally touch)
roles/            ← one YAML file per persona
site.config.yaml  ← active role, confidentiality, your details
public/           ← images, avatar, resume PDFs
templates/        ← starter files for each content type
src/              ← the site engine (layouts, pages, styles)
.github/workflows/deploy.yml
```

All entries under `content/` that start with `# SAMPLE` are examples. Replace or delete them.
