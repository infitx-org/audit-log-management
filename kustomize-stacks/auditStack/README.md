## Overview

This is to deploy audit system along with a mojaloop deployment.

## Pre-requisites
- Install [kustomize](https://kubectl.docs.kubernetes.io/installation/kustomize/)
- Install [helm](https://helm.sh/docs/intro/install/)

## Deployment

- Install audit stack using the following command:
    ```bash
    kustomize build . --enable-helm --load-restrictor LoadRestrictionsNone | kubectl apply -f -
    ```
    To remove
    ```bash
    kustomize build . --enable-helm --load-restrictor LoadRestrictionsNone | kubectl delete -f -
    ```

- Configure host file to point to the ingress IP address
    ```bash
    127.0.0.1 console.minio.local grafana.local
    ```

- Access the audit system using the following URLs:
    - MinIO: http://console.minio.local
        - Access Key: console
        - Secret Key: console123
    - Grafana: http://grafana.local:3000
        - Username: admin
        - Password: admin

## Testing

- You can execute couple of transfers
- Observe the logs for s3-ingest pod
- Observe the ORC files generated in the minio bucket
- You can also observe the audit logs in the grafana explore
  - Select the `ClickHouse` datasource
  - Explore the data

