# Audit Storage in Mojaloop Deployment

This repository contains research artifacts, proof-of-concepts (PoCs), and supporting materials related to audit log storage in a Mojaloop deployment.

## Objective
To establish a long-term, secure, immutable, and cost-effective storage solution for audit logs in Mojaloop.

## Overview
Various tools and technologies were evaluated to meet the above goal, and multiple PoCs were developed to validate their suitability.

## Selected Approach
After thorough evaluation, we chose an **S3-compatible object storage** solution combined with a **stateless ClickHouse** instance as the query engine. And the file format for the audit logs is **ORC** as it supports efficient compression and is optimized for write-heavy workloads.

Front-end tools such as **Grafana** and **Apache Superset** can be used to visualize data stored in ClickHouse.

## Resources
- [PoCs](./pocs) – Proof-of-concepts for audit storage in Mojaloop deployment
- [Docs](./docs) - Presentations and other documentation related to the project
- [Audit Stack in K8S](./kustomize-stacks/auditStack) – Kustomize stack for deploying the solution in a Kubernetes cluster
- [Audit Ingester](https://github.com/infitx-org/audit-ingester) - A python-based ingester which consumes audit logs from Kafka and stores them in the object storage as ORC files
