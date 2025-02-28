
# Helmfile-based Installation

This guide covers the steps to install Audit Log stack using **Helmfile**. Helmfile simplifies deploying and managing Helm charts, especially in complex environments with multiple services.

---

## Prerequisites

- **Kubernetes cluster** (local or cloud-based)
- **Helm** (v3+): [Install Helm](https://helm.sh/docs/intro/install/)
- **kubectl**: [Install kubectl](https://kubernetes.io/docs/tasks/tools/)
- **Helmfile**: Installation instructions below
- **helm-diff** plugin: [Install helm-diff](https://github.com/databus23/helm-diff?tab=readme-ov-file#using-helm-plugin-manager--23x)


## Deployment with Helmfile

Follow the below steps assume that you have a Kubernetes cluster up and running.

```bash
helmfile apply
```

## Uninstalling the Deployment
To remove the deployment, use:
```
helmfile destroy
```
