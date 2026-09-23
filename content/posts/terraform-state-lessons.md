---
# SAMPLE ENTRY
title: "Five Terraform state mistakes I made so you don't have to"
type: post
date: 2021-01-30
roles: [devops]
tags: [terraform, aws]
summary: "Local state, one giant workspace, and a manual `terraform state rm` at 2 AM. Lessons from two years of running Terraform in a small team."
---

## 1. Local state "just for now"

It never is just for now. Remote state with locking from day one.

## 2. One state for everything

A typo in a DNS module should not be able to touch the database. Split by blast radius.

## 3. Editing state by hand under pressure

Write the `terraform state mv` commands in a PR, even at 2 AM.
