---
# SAMPLE ENTRY — replace with your own
title: "Rewrote the order API in Go"
type: project
date: 2022-03-10
roles: [backend]
featured: [backend]
tags: [api-design, caching]
stack: [Go, PostgreSQL, Redis]
my_role: "Tech lead, 3 engineers"
duration: "4 months"
summary: "Replaced a slow monolith endpoint with a small Go service; p95 latency dropped from 900 ms to 80 ms."
impact: "p95 900 ms → 80 ms"
---

## Problem

The order endpoint timed out at peak traffic and nobody wanted to touch it.

## What I did

Split reads from writes, added a Redis read-through cache, and moved the service to Go behind the same contract.

## Result

p95 latency fell from 900 ms to 80 ms, and on-call pages for the endpoint went to zero.
