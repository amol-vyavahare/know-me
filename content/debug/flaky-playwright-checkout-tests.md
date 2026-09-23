---
# SAMPLE ENTRY — replace with your own story (keep the headings)
title: "Flaky checkout tests that only failed on CI at 11:59 PM"
type: debug
date: 2021-08-12
roles: [qa, devops]
featured: [qa]
tags: [flaky-tests, playwright, ci-cd, timezones]
summary: "1 in 15 CI runs failed on the checkout suite. The culprit was a date boundary between the CI runner (UTC) and the app server (IST)."
impact: "Flake rate 6.5% → 0.1%"
company: "Northwind Payments"
company_alias: "a fintech client"
confidential: true
---

## Symptom

At Northwind Payments the nightly checkout suite failed roughly once every 15 runs with
`expected "Delivery: Tomorrow" but got "Delivery: Today"`. Re-running always passed, so the
team had started ignoring it.

## Environment

- Playwright 1.14 on GitHub Actions runners (UTC)
- App server and database in `Asia/Kolkata`
- Test data created through the public API a few seconds before the UI assertion

## Investigation

I pulled 60 days of CI history and plotted failures by wall-clock time. Every single failure
started between **18:28 and 18:31 UTC** — that is 23:58–00:01 IST.

```bash
gh run list --workflow nightly.yml --limit 400 --json conclusion,createdAt \
  | jq -r '.[] | select(.conclusion=="failure") | .createdAt'
```

## Root cause

The test computed "tomorrow" on the runner (UTC), while the app computed it on the server (IST).
For three minutes a day the two disagreed about what day it was.

## Fix

- Freeze time in the browser with `page.clock` and inject the server date through a test-only header.
- Moved the nightly schedule away from the IST midnight boundary as a belt-and-braces fix.

## Lesson

"Flaky" is a label, not a root cause. Plot failures against time, runner, and shard before you retry.
