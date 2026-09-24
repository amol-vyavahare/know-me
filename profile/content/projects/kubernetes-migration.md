---
# SAMPLE ENTRY
title: "Migrating 14 services from VMs to Kubernetes"
type: project
date: 2024-03-18
roles: [devops]
tags: [kubernetes, terraform, aws]
stack: [EKS, Terraform, Helm, Argo CD]
my_role: "Platform engineer"
duration: "4 months"
summary: "Moved 14 services from hand-managed EC2 VMs to EKS with GitOps deployments, with zero customer-facing downtime."
impact: "Infra cost −32%, deploys 2/week → 20/week"
---

## Plan

Strangler approach: one low-risk service first, then batches of three, each behind a weighted DNS switch.

## Key decisions

- Terraform modules for cluster + per-service IAM roles.
- Argo CD for GitOps; every change is a PR.
- Readiness probes and PodDisruptionBudgets mandatory before cut-over.

## Outcome

No customer-facing incidents during migration; deploy frequency rose tenfold.
