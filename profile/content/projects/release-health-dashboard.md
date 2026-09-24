---
# SAMPLE ENTRY
title: "Release health dashboard for product and engineering"
type: project
date: 2023-09-01
roles: [product-owner, devops]
featured: [product-owner]
tags: [metrics, stakeholder-management, observability]
stack: [Grafana, BigQuery, Jira API]
my_role: "Product owner — defined metrics, ran discovery with 4 teams"
duration: "6 weeks"
summary: "Gave leadership one page showing lead time, change-failure rate and open customer-facing bugs per release, replacing a weekly status meeting."
impact: "Weekly status meeting cancelled (saves ~12 person-hours/week)"
---

## Why

Release go/no-go decisions were made from gut feel in an hour-long meeting.

## Discovery

Interviewed engineering managers, support and sales. The shared question was
"is this release safer or riskier than the last one?"

## What shipped

- DORA metrics per team, plus open P1/P2 bugs tagged to the release.
- A traffic-light summary for execs, with drill-down for engineers.

## Result

Go/no-go now takes 10 minutes asynchronously.
