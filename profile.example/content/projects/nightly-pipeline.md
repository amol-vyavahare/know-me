---
# SAMPLE ENTRY — replace with your own
title: "Nightly sales pipeline on Airflow"
type: project
date: 2023-06-01
roles: [data]
featured: [data]
tags: [sql]
stack: [Python, Apache Airflow, PostgreSQL]
summary: "Moved 40 cron jobs into one Airflow DAG with retries, alerts and data checks."
impact: "Missed reports 6/month → 0"
---

## Problem

Forty cron jobs, no retries, and a report that was wrong about once a week.

## What I did

One DAG, idempotent tasks, and row-count and freshness checks before anything is published.
