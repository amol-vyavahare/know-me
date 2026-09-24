---
# SAMPLE ENTRY — replace with your own
title: "EXPLAIN (ANALYZE, BUFFERS) shows where the time really goes"
type: til
date: 2023-09-04
roles: [backend, data]
tags: [postgres, sql]
summary: "BUFFERS shows how many pages came from cache versus disk, which is often the real reason a query is slow."
---

```sql
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM orders WHERE customer_id = 42;
```
