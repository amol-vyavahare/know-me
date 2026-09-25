# Sharing role-specific sites with recruiters

When you apply for several kinds of role at once, each recruiter should see **only** the role they are hiring for.
Share links build one small, self-contained site per role at a secret path. You keep your full multi-role site
(with the role dropdown) at its own secret path.

```
yoursite/                   → neutral page: name, tagline, contact. No roles, no links to anything else.
yoursite/me-a1b2c3d4/       → your full site with the role dropdown (only you know this path)
yoursite/qa-e5f6g7h8/       → QA only        → put this on your QA résumé
yoursite/devops-i9j0k1l2/   → DevOps only    → put this on your DevOps résumé
```

- [What a recruiter can and can't see](#what-a-recruiter-can-and-cant-see)
- [Turn it on](#turn-it-on)
- [Hosting: the repo must be private](#hosting-the-repo-must-be-private)
- [Day-to-day use](#day-to-day-use)
- [Revoking or rotating a link](#revoking-or-rotating-a-link)
- [Keeping your writing role-neutral](#keeping-your-writing-role-neutral)
- [Turning it off](#turning-it-off)

---

## What a recruiter can and can't see

A role's share site contains:
- that role's home page, projects, debug stories, articles, TILs, skills, Journey and résumé
- only the entries and jobs tagged for that role (`roles: [<id>]` or `[all]`)

It does **not** contain:
- the role dropdown, the "Everything" view, or any `/r/<role>/` pages
- entries, skill pages or résumé bullets for other roles
- the "Relevant for: …" line on entries
- links to the full site, other share sites, or `/content-index.json`

Every page (including the full site) is marked `noindex, nofollow`, and `robots.txt` blocks crawlers, so none of it
shows up in search results. Pages send no referrer, so clicking an outside link (LinkedIn, GitHub) doesn't
reveal your secret path to that site. The root page and the 404 page never link to any secret path.

What it can't protect:
- **Your own writing.** If a post tagged for QA says "…moving between QA, DevOps and product roles", the QA site
  shows that sentence. See [below](#keeping-your-writing-role-neutral).
- **Links you share.** Anyone with a link can forward it.
- **A public repo.** If the repo is public, everything is readable on GitHub regardless of the site.

## Turn it on

1. In `profile/site.config.yaml`, uncomment and set:
   ```yaml
   share_links:
     enabled: true
     full_site: me-a1b2c3d4        # your full site's secret path
   ```
2. In each role you want to share (`profile/roles/*.yaml`), uncomment `link:`:
   ```yaml
   link: qa-e5f6g7h8
   ```
   Roles without `link:` get no share site. They still appear in your full site.
3. `npm run build`. The build checks the links:
   - only `a-z`, `0-9` and `-`
   - unique, and not a page name like `skills` or `resume`
   - a warning if a link is shorter than 10 characters, since short links are easy to guess

**Making a good link:** start with something readable, add random characters, e.g. `qa-e5f6g7h8`. To generate some:
```bash
node -e "console.log(require('crypto').randomBytes(6).toString('hex'))"
```

**Preview locally:** `npm run dev`. The root page shows a "Dev only: your sites" box with every link.
It never appears on the live site.

## Hosting: the repo must be private

With share links, the repo must be private. Otherwise anyone can open the Markdown and role files on GitHub.
Free GitHub Pages can't publish a private repo, so use **Cloudflare Pages** or **Netlify** (free, one site,
one-time setup). See [setup-and-deploy.md, option B](setup-and-deploy.md#option-b-cloudflare-pages-or-netlify-works-with-a-private-repo-free).

1. On GitHub: **Settings → General → Danger Zone → Change visibility → Private**.
2. Connect the repo to Cloudflare Pages or Netlify (build `npm run build`, output `dist`, `NODE_VERSION=22`).
3. In `profile/site.config.yaml` set `base_path: /` and `site_url:` to the address you get
   (e.g. `https://alex.pages.dev`).
4. Disable GitHub Pages (**Settings → Pages**) and delete or disable `.github/workflows/deploy.yml`.

Also consider removing your GitHub link from `links:` while job hunting. It leads to your GitHub profile and
anything public there.

## Day-to-day use

- **Put the role link on the matching résumé:** `https://yoursite/qa-e5f6g7h8/`. The résumé page of each share site
  (`/qa-e5f6g7h8/resume/`) prints its own link in the header, so a PDF you save from there is already correct.
- **Tag new content** with the roles it should appear in. It shows up in those share sites on the next push.
- **Your full site** is at `https://yoursite/me-a1b2c3d4/`. Bookmark it; nothing links to it.

## Revoking or rotating a link

Change the role's `link:` (or `full_site`) and push. The old URL stops working on the next deploy and everything
moves to the new one. Useful when an application closes, or if a link was shared further than you wanted.

For a separate link per company, create another role file, e.g. `roles/qa-acme.yaml` with `id: qa-acme`,
the same content as `qa.yaml` and its own `link:`. Tag the entries it should show with that id too.

## Keeping your writing role-neutral

The engine hides everything it generates. Your own text, though, is shown as written. Check these:

- **`profile/content/pages/about.md`**: the sample text mentions the persona switch and all three roles.
  Rewrite it neutrally, or add a per-role About page: `profile/content/pages/about-qa.md` replaces `about.md` on
  the QA views (same format: a `title:` plus Markdown).
- **Entries tagged for several roles**: their title, summary and body appear on each of those sites. For example,
  `posts/from-qa-to-product.md` is tagged for QA and mentions DevOps and product roles.
- **Job titles and highlights**: untagged `highlights` appear on every role's résumé. Use `roles:` on bullets
  that belong to one role.
- **Skill categories** in `skills.yaml` (e.g. "Cloud & DevOps") are shown as headings on each site's Skills page.
- **`tagline`** in `site.config.yaml` is shown on the root page for everyone.

A quick check after `npm run build`: search one share site for other roles' names.

```bash
grep -rl -E "DevOps|Product Owner" dist/qa-e5f6g7h8/
```

## Turning it off

Set `share_links.enabled: false` (or remove the block). The site goes back to one public multi-role site at the
root, and the `link:` values are ignored.
