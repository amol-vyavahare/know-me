---
# SAMPLE ENTRY
title: "Why I stopped chasing 100% UI automation"
type: post
date: 2018-09-14
roles: [qa, product-owner]
tags: [test-strategy, playwright, selenium]
summary: "After three years maintaining a 1,000-test Selenium suite, here is what I automate now, and what I deliberately leave to humans."
---

## The trap

Coverage targets reward the number of tests, not the confidence they give.

## What I automate now

- Contracts and business rules at the API layer.
- A thin set of UI "journeys" that prove the wiring works.
- Visual checks only on pages that change rarely.

## What I leave to people

Exploratory sessions on new features, with a charter and a time box. They find the bugs no script would.
