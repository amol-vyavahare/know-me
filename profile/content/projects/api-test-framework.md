---
# SAMPLE ENTRY
title: "Contract-first API test framework"
type: project
date: 2020-02-10
roles: [qa]
featured: [qa]
tags: [api-testing, test-strategy, ci-cd]
stack: [Python, pytest, OpenAPI, Docker, GitHub Actions]
my_role: "Lead SDET — design and build"
duration: "5 months"
summary: "Replaced 900 brittle UI tests with a layered API suite generated from OpenAPI contracts, running in under 6 minutes on every PR."
impact: "Regression time 3 h → 6 min"
---

## The problem

Every release needed a 3-hour UI regression run that failed for reasons unrelated to the change.
Developers stopped trusting red builds.

## What I built

- A pytest plugin that reads the OpenAPI spec and generates schema and negative tests.
- Hand-written scenario tests for the 20 money-moving flows.
- Ephemeral test environments via Docker Compose per PR.

## Results

| Metric | Before | After |
| --- | --- | --- |
| Regression duration | 3 h | 6 min |
| UI tests | 900 | 120 |
| Escaped defects / quarter | 11 | 3 |

## What I'd do differently

Get consumer teams to own their contract tests earlier — adoption lagged for two months.
