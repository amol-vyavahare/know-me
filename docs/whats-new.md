# What's new

Recent changes in plain language, newest first. Each links to the guide with the details.

## September 2026

**Change a job per role.** A job can have a different title, company, dates, summary, description and skills for
each role. For example, the same job can read as "Senior SDET" for QA and "Platform Engineer" for DevOps. Add a
`per_role:` block to the job file.
→ [Tailoring guide](tailoring-for-roles.md#make-a-job-read-differently-for-one-role)

**Hide tabs per role.** A role can leave out the Journey, Resume or About me tab with `hide_sections:` in its
role file. Links to the hidden tab disappear too.
→ [Tailoring guide](tailoring-for-roles.md#hide-a-tab-for-one-role)

**Secret links for recruiters.** Give each recruiter a private link that shows only the role they're hiring for,
while you keep the full site with the role switcher for yourself. Off until you switch it on.
→ [Sharing guide](sharing.md)

**Home tab.** The menu now starts with **Home**, which does the same as clicking your name.

**"About" is now "About me".** Same page, same address (`/about/`).

**Per-role About me page.** Add `about-<role>.md` next to `about.md` to give one role its own About me page.
→ [Writing content](writing-content.md#the-about-me-page)

**More profile links.** Add as many links as you like (HackerRank, LeetCode, Medium…). The first two also appear
in the contact box on Home.
→ [Tailoring guide](tailoring-for-roles.md#add-a-profile-link-hackerrank-leetcode-medium-)

**Share sites don't say "Tailored for…".** The résumé on a share site no longer shows that label, so it doesn't hint
at other versions. Your full site still shows it.

**Menu on smaller screens.** With more tabs, the menu folds into **☰** on screens narrower than a typical laptop
(below 1100 pixels), not just on phones.

**Skills pages.** A **Skills** tab lists every skill; click one to see all the projects, debug stories, articles,
notes and jobs behind it. Names, groups and alternative spellings are set in `profile/skills.yaml`.
→ [Profile reference](profile-reference.md#skillsyaml)

**Everything personal in one folder.** All your settings, content and images live in `profile/`. A new person
copies `profile.example/` and edits only that folder.
→ [Setup guide](setup-and-deploy.md#2-create-your-profile)
