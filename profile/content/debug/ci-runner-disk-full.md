---
# SAMPLE ENTRY
title: "Builds dying with 'no space left on device' after a harmless Docker upgrade"
type: debug
date: 2022-11-03
roles: [devops, qa]
featured: [devops]
tags: [docker, ci-cd, linux, observability]
summary: "Self-hosted runners filled their disks within a day. BuildKit's cache had silently stopped being garbage-collected."
impact: "Zero disk-full failures in 6 months after the fix"
---

## Symptom

Around 30% of pipelines on our self-hosted runners failed mid-build with `no space left on device`.
Restarting a runner fixed it for about a day.

## Investigation

`df -h` showed `/var/lib/docker` at 100%. `docker system df` said the build cache was 140 GB even
though `docker builder prune` ran in a nightly cron.

```bash
docker buildx du --verbose | sort -k3 -h | tail
```

The prune job was pruning the **legacy** builder; after the upgrade, builds went through a new
`docker-container` BuildKit instance that the cron never touched.

## Root cause

Docker Engine upgrade switched the default builder. Our clean-up targeted the old one.

## Fix

- Added `gc` policy to `buildkitd.toml` (keep 20 GB, 48 h).
- Alert at 75% disk on every runner, not just the control node.

## Lesson

After upgrading a tool, re-verify every job that *cleans up after* that tool — they fail silently.
