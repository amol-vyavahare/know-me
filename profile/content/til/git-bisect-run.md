---
# SAMPLE ENTRY
title: "git bisect run finds the breaking commit for you"
type: til
date: 2020-07-07
roles: [qa, devops]
tags: [git, debugging]
summary: "Give git bisect a script that exits non-zero on failure and it will binary-search 500 commits in minutes."
---

```bash
git bisect start HEAD v2.3.0
git bisect run npm test -- checkout.spec.ts
```

Exit code 125 tells bisect to skip a commit that can't be tested.
