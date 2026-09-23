---
# SAMPLE ENTRY
title: "Monthly report missing the last day of the month"
type: debug
date: 2019-05-20
roles: [qa, product-owner]
tags: [sql, test-strategy, boundary-testing]
summary: "Finance noticed totals were slightly low every month. A BETWEEN on a timestamp column dropped everything after midnight on the last day."
impact: "Recovered ~3% of reported revenue"
---

## Symptom

Finance reported monthly totals were 2–4% below the payment gateway's numbers, every month.

## Investigation

Compared row counts per day between the report and the gateway export. Only the **last day of
each month** differed, and only transactions after 00:00:00.

## Root cause

```sql
WHERE created_at BETWEEN '2019-04-01' AND '2019-04-30'
```

`'2019-04-30'` means `2019-04-30 00:00:00`, so the whole final day was excluded.

## Fix

Switched to a half-open range: `created_at >= :start AND created_at < :next_month_start`, and added
boundary cases (first second, last second, leap day) to the regression suite.

## Lesson

Boundary value analysis is not just for input fields. Date ranges are boundaries too.
