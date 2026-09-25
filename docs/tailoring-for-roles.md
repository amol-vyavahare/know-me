# Tailoring the site for each role

A plain-language guide for making each role (persona) look right, with no coding needed. Everything here
is done by editing text files in the `profile/` folder, either on GitHub in the browser (click a file, then the ✏️
pencil) or in any text editor.

- [Before you start: editing the files safely](#before-you-start-editing-the-files-safely)
- [A quick tour of the site](#a-quick-tour-of-the-site)
- [What can be different for each role](#what-can-be-different-for-each-role)
- [Recipes](#recipes)
- [Checklist before sending a link to a recruiter](#checklist-before-sending-a-link-to-a-recruiter)

---

## Before you start: editing the files safely

The settings files (`.yaml`) and the top of each Markdown file (between the `---` lines) use a format called YAML.
Four rules avoid almost every mistake:

1. **Indent with spaces, never tabs.** Lines that belong together start at the same column.
2. **Put quotes around text containing `:` or `#`**, e.g. `title: "Kafka: the good parts"`.
3. **Lists** look like `[qa, devops]` or one item per line starting with `- `.
4. **A line starting with `#` is a comment** and is ignored. To switch an example setting on, delete the `# `.

After saving, the site rebuilds by itself. If you made a mistake, the rebuild stops and the **live site stays
as it was**. On GitHub, open the **Actions** tab: a red ✗ means the rebuild failed, and the log names the file and
the line. [troubleshooting.md](troubleshooting.md) explains the common messages.

## A quick tour of the site

| Tab | What it shows |
| --- | --- |
| **Home** | Introduction, key numbers, "Start here" (up to 3 pinned pieces of work), highlighted skills, latest work, recent jobs, contact box. Clicking your name in the top-left does the same. |
| **Projects** | Things you built or led |
| **Debug Diary** | Problems you tracked down: symptom → cause → fix → lesson |
| **Blog** | Articles and short "Today I Learned" notes |
| **Skills** | Every skill, grouped. Click one to see all the work behind it. |
| **Journey** | Your jobs as a timeline, with what you wrote during each one |
| **Resume** | A printable résumé with a **Print / Save as PDF** button |
| **About me** | Your About page and contact details |

- On your **full site**, a coloured button at the top right (**View this site as…**) switches between roles.
  The whole site re-arranges itself for the chosen role.
- On a **share site** (the secret link you send a recruiter, see [sharing.md](sharing.md)) there is no role
  button. The recruiter only ever sees that one role.
- On phones and narrow windows, the tabs move into the **☰** menu.

## What can be different for each role

| What | How | Where |
| --- | --- | --- |
| Colour, headline, intro paragraph, contact-box heading | Edit the role file | `profile/roles/<role>.yaml` |
| Which projects, posts, TILs and debug stories appear | `roles:` at the top of each entry | each Markdown file |
| The 3 pieces of work pinned on Home | `featured:` on the entry | each Markdown file |
| Highlighted skills on Home and Résumé | `skills_highlight:` | role file |
| Order of sections on Home | `content_priority:` | role file |
| Hide the Debug Diary | `hide_types: [debug]` | role file |
| Hide the Journey, Resume or About me tab | `hide_sections:` | role file |
| Which jobs appear | `roles:` in the job file | `profile/content/experience/` |
| Résumé bullet points per role | `highlights:` with `roles:` | job file |
| A job's title, company, dates, summary, description, skills | `per_role:` | job file |
| The About me page | a separate `about-<role>.md` | `profile/content/pages/` |
| Your own résumé PDF instead of the printable page | `resume_pdf:` | role file |

The same for every role: your name, tagline, location, photo, email and profile links (`profile/site.config.yaml`).

## Recipes

Each recipe uses `qa` as the role id. Use your own: it's the `id:` at the top of the file in `profile/roles/`.

### Show a piece of work only for certain roles

At the top of the entry (between the `---` lines):

```yaml
roles: [qa, devops]      # or [all] for every role
```

### Pin work to the top of a role's Home page

```yaml
featured: [qa]
```

Up to three pinned entries are shown, newest first.

### Choose which skills a role highlights

In `profile/roles/qa.yaml`:

```yaml
skills_highlight: [test-strategy, playwright, api-testing, ci-cd]
```

These show on Home ("Skills, with receipts") and as "Core skills" on the résumé. Use the same spelling as your
tags. If a highlighted skill isn't used by any of your work yet, the rebuild prints a warning (it still succeeds).

### Hide a tab for one role

In the role file:

```yaml
hide_sections: [journey]          # any of: journey, resume, about
hide_types: [debug]               # hides the Debug Diary tab and all debug stories
```

The tab disappears for that role, along with every button or link that pointed to it. Switching to that role
from a hidden page takes you to its Home instead.

### Make a job read differently for one role

In the job's file (`profile/content/experience/…`), add a `per_role:` block with only the things that should
change. Everything else stays as it is:

```yaml
per_role:
  devops:
    title: "Platform Engineer"
    summary: "Ran the CI platform for 40 engineers."
    skills: [kubernetes, terraform]
    description: |
      Owned the self-hosted runners and the deploy pipeline.
```

You can also change `company`, `company_alias`, `location`, `start` and `end` (leave `end:` empty for "Present").
The change shows everywhere that role sees the job: Home, Journey, Résumé and Skills.

> Recruiters sometimes compare versions. Rewording a title or summary is normal; keep dates and employers truthful
> and consistent.

### Give each role different résumé bullet points

In the job file:

```yaml
highlights:
  - "Shown on every role's résumé."
  - text: "Shown only on the QA résumé and timeline."
    roles: [qa]
```

### Give a role its own About me page

Create `profile/content/pages/about-qa.md` (copy `about.md` and edit it). It replaces the normal About me page for
the QA role only. Useful when your general About page mentions your other roles.

### Change a heading or sentence the site writes for you

Headings like "Things I built & shipped" can be changed in `profile/site.config.yaml` under `text:`. The file
lists every heading you can change. Example:

```yaml
text:
  projects_title: Things I shipped
```

### Add a profile link (HackerRank, LeetCode, Medium, …)

In `profile/site.config.yaml`:

```yaml
links:
  - { label: GitHub,     url: https://github.com/your-username }
  - { label: LinkedIn,   url: https://www.linkedin.com/in/your-profile }
  - { label: HackerRank, url: https://www.hackerrank.com/profile/your-username }
```

Links appear in the footer, on About me, on the résumé and on the neutral landing page. **Order matters:** only the
first two also appear in the contact box on Home, so put your most important links first.

### Use your own résumé PDF

Put the file in `profile/public/resumes/` and point the role at it:

```yaml
resume_pdf: /resumes/qa.pdf
```

The Resume tab then shows a **Download PDF** button instead of **Print / Save as PDF**.

## Checklist before sending a link to a recruiter

1. Open the role's **share link** in a private/incognito window, so you see what they see.
2. Click through every tab. Nothing should mention the other roles you're applying for.
   The site itself never does; your own writing might. Check especially:
   - **About me**: use an `about-<role>.md` if the general one mentions other roles
   - **posts tagged for several roles**
   - **job summaries and bullets** without `roles:`
3. Open **Resume**, then **Print / Save as PDF**. The link printed at the top is that role's share link.
4. Check your contact details and links are current.
5. When an application ends, you can retire its link: see
   [sharing.md, revoking a link](sharing.md#revoking-or-rotating-a-link).
