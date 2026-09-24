# know-me — career journal & role-tailored portfolio

A static site for a software career: projects, debug stories, articles, TIL notes, a skills map and a
career timeline. The same content is re-arranged for each **persona** (for example QA, DevOps, Product Owner),
so every link you share shows the most relevant work first, along with a résumé tailored to that role.

Built with [Astro](https://astro.build). No server or database; it deploys to GitHub Pages on every push.

## Features

- **Personas:** one site, several tailored views (`/r/<role>/`), each with its own colour, headline, section order and résumé
- **Content types:** projects, a Debug Diary (symptom → root cause → lesson), articles and TIL notes
- **Skills pages:** every skill links to the work that proves it
- **Journey and résumé:** built from one file per job, with per-persona bullet points
- **Confidential clients:** show, mask or hide employer names across the whole site
- **Content validation:** a typo in front matter fails the build instead of breaking the live site
- **Reusable:** everything personal lives in one `profile/` folder

## Quick start

Needs **Node 22.12+**.

```bash
npm ci
npm run dev        # local preview; the URL is printed in the terminal
npm run build      # production build into dist/
```

## Make it your own

Copy `profile.example/` to `profile/`, edit the files inside, and publish.
Nothing outside that folder needs to change. The [setup guide](docs/setup-and-deploy.md) walks through it.

## Documentation

| Guide | Read it when you want to… |
| --- | --- |
| [Setup & deploy](docs/setup-and-deploy.md) | start a new profile, run locally, publish, share links, host several people |
| [Writing content](docs/writing-content.md) | add a project, debug story, article, TIL or job |
| [Profile reference](docs/profile-reference.md) | look up any setting or front-matter field |
| [Maintaining the engine](docs/maintaining-the-engine.md) | change layouts, styles or pages, or understand the build |
| [Troubleshooting](docs/troubleshooting.md) | fix a failed build or missing content |
