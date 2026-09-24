# Troubleshooting

Start with `npm run build` locally, or open the failed run in GitHub's **Actions** tab. The build prints the file
and field at fault.

- [Build errors](#build-errors)
- [Build warnings](#build-warnings)
- [Something doesn't show up](#something-doesnt-show-up)
- [Deployment problems](#deployment-problems)
- [Local development](#local-development)

---

## Build errors

### `InvalidContentEntryDataError … data does not match collection schema`

A Markdown file's front matter is invalid. The lines under it name the field:

```
[InvalidContentEntryDataError] items → til/my-note data does not match collection schema.
  date: Expected type "date", received "object"
  roles.0: Unknown role. Use one of: backend, data, all
  Location: …\profile\content\til\my-note.md
```

| Message | Fix |
| --- | --- |
| `date: Expected type "date", received "object"` | `date:` is **missing** or not `YYYY-MM-DD`. |
| `roles.N: Unknown role. Use one of: …` | Typo in `roles:`/`featured:`, or a leftover `__ROLE__` from a template. Use an id from `profile/roles/`. |
| `type: Invalid option: expected one of "post"\|"project"\|"debug"\|"til"` | Fix the `type:` value. |
| `title` / `summary`: `Required` | Add the field. Both are mandatory for entries. |
| `company: Required` (experience) | Jobs need `company:`. |

YAML tip: quote values containing `:` or `#`, e.g. `title: "Kafka: the good parts"`.

### `No profile found at "…/"`

The profile folder is missing or `PROFILE` points to the wrong place. It needs at least
`site.config.yaml`. Copy `profile.example/` to `profile/`, or fix the `PROFILE` value.

### `…/site.config.yaml must set "active_role"`

Add `active_role: <id>` using the `id` of one of your `roles/*.yaml` files.

### `…/site.config.yaml refers to role "x" but …/roles/x.yaml does not exist`

`active_role` or `roles_enabled` names a role with no file. Rename the id, or add the role file.
(The check is on the role's `id:` field; the file name should match it for clarity.)

### `…/roles/<file> is missing an "id"`

Every role file needs `id:`.

## Build warnings

The build still succeeds; these are hints.

| Warning | Meaning |
| --- | --- |
| `[skills] …/roles/qa.yaml highlights "x", but no project, post, TIL, debug entry or job uses it yet` | Add content tagged `x`, or remove it from `skills_highlight`. |
| `[skills] … highlights "x", but skills.yaml lists it under not_skills` | Remove it from one of the two lists. |
| `[text] … sets unknown text "x"` | Typo in a `text:` key. The message lists valid keys. |

## Something doesn't show up

| Symptom | Likely cause |
| --- | --- |
| Entry missing everywhere on the live site | `draft: true`, `visibility: private`, or `confidential: true` with `confidential_mode: hide`. |
| Entry missing for one persona | Its `roles:` doesn't include that persona (or `all`); or the persona has that type in `hide_types`. |
| Entry with no `roles:` missing | Expected. Set `roles:` or `show_untagged: true`. |
| Not in "Start here" on the home page | Add the persona to `featured:`. Only 3 are shown, newest first. |
| Skill has two pages (e.g. `Docker` and `docker-buildkit`) | Different spellings. Add one as an alias of the other in `skills.yaml`. |
| A tag like `career` shows up as a skill | Add it to `not_skills` in `skills.yaml`. |
| Skill page says "Nothing … in the X view yet" | The skill only appears in content for other personas. Tag the entry with this role or view `/r/all/`. |
| Real company name visible | `confidential_mode` is `show`, or the entry lacks `confidential: true`. (It's always visible in the Markdown source.) |
| Image in an entry is broken | Use a relative path next to the Markdown (`./pic.png`), not `/pic.png`. See [writing-content.md](writing-content.md#images-and-files). |
| Avatar or PDF 404 | The file must be in `profile/public/`, referenced from its root (`/me.jpg`). |
| Old content still shown after editing YAML in `npm run dev` | Restart `npm run dev`; YAML files are read at startup. |

## Deployment problems

| Symptom | Fix |
| --- | --- |
| Actions run fails at "Deploy" / "Pages not enabled" | **Settings → Pages → Source: GitHub Actions**, then **Re-run jobs**. |
| Workflow didn't run | It runs on pushes to `main` only. Check your branch name (`git branch`). |
| Site loads without styles, or links 404 | Wrong base path. On GitHub Pages it's set from the repo name automatically. Elsewhere set `base_path: /` (or the correct sub-path) in `site.config.yaml`. |
| Private repo can't use Pages | Needs GitHub Pro, or deploy with Cloudflare Pages / Netlify ([setup-and-deploy.md](setup-and-deploy.md#option-b-cloudflare-pages-or-netlify-works-with-a-private-repo-free)). |
| `npm ci` fails in CI | `package-lock.json` is out of sync; run `npm install` locally and commit the lock file. |
| Wrong person's site deployed | Check `PROFILE:` in `.github/workflows/deploy.yml`. |

## Local development

| Symptom | Fix |
| --- | --- |
| `'astro' is not recognized` | Dependencies not installed: `npm ci`. |
| `npm warn install-scripts … esbuild` | npm blocked esbuild's post-install script. Builds work without it; approve it with `npm install-scripts approve esbuild` if you prefer. |
| Wrong Node version errors | Node 22.12+ is required (`node -v`). |
| `PROFILE=… npm run dev` doesn't work in PowerShell | Use `$env:PROFILE='profiles/jane'; npm run dev`. |
