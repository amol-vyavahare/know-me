---
# SAMPLE ENTRY
title: "kubectl debug attaches a toolbox to a distroless pod"
type: til
date: 2023-02-14
roles: [devops]
tags: [kubernetes, debugging]
summary: "No shell in the image? An ephemeral debug container shares the pod's process namespace."
---

```bash
kubectl debug -it pod/api-7d9f --image=busybox --target=api
```
