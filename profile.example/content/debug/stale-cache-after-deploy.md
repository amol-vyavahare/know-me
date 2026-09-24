---
# SAMPLE ENTRY — replace with your own
title: "Customers saw old prices after every deploy"
type: debug
date: 2022-05-18
roles: [backend]
tags: [caching, go]
summary: "Cache keys didn't include the schema version, so new code read old-shaped values for an hour."
impact: "Zero stale reads since"
---

## Symptom

For about an hour after each deploy, some product pages showed yesterday's prices.

## Investigation

Only keys written before the deploy were affected, and they expired exactly one hour later.

## Root cause

The cached struct changed shape but the key did not, so the new code decoded old values with defaults.

## Fix

Added a schema version to every cache key.

## Lesson

A cache key is part of your API. Version it like one.
