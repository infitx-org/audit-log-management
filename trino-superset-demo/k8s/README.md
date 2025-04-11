## Deployment

- Install backend using the following command:
    ```bash
    kustomize build . --enable-helm --load-restrictor LoadRestrictionsNone | kubectl apply -f -
    ```
    To remove
    ```bash
    kustomize build . --enable-helm --load-restrictor LoadRestrictionsNone | kubectl delete -f -
    ```



* In Superset, add trino with SqlAlchemy URI - `trino://hive@trino:8080/hive`