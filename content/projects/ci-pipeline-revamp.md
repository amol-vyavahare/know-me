---
# SAMPLE ENTRY
title: "CI pipeline revamp: 40-minute builds down to 12"
type: project
date: 2022-06-15
roles: [devops, qa]
featured: [devops]
tags: [ci-cd, docker, observability]
stack: [GitHub Actions, Docker BuildKit, Gradle, Grafana]
my_role: "Owner — analysis, rollout, dashboards"
duration: "3 months"
summary: "Profiled a monorepo pipeline, added caching, test sharding and change-based builds, and published pipeline metrics so regressions are visible."
impact: "Median build 40 min → 12 min"
---

## Context

A 30-engineer team was waiting 40 minutes for every PR build. Merges queued up in the afternoon.

## Approach

1. Instrumented every step and pushed timings to Grafana — found 60% of time in dependency download and one serial test job.
2. Added layered Docker and Gradle caches.
3. Split tests into 8 shards balanced by historic duration.
4. Built only changed modules on PRs; full build on `main`.

## Outcome

Median build dropped to 12 minutes, runner cost dropped 25%, and the dashboard now catches slow-downs within a day.
