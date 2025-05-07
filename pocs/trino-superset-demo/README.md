# Trino Superset Demo

This repository contains a demo integration of trino with Apache Superset.
With this repository, we can visualize columnar file formats parquet

## Tech stack
* Trino (formerly PrestoSQL)
* Minio - for hosting the file. AWS S3 compatible.
* Apache superset - for visualizing

The following file types are supported for the Hive connector:

- ORC
- Parquet
- Avro
- RCText (RCFile using ColumnarSerDe)
- RCBinary (RCFile using LazyBinaryColumnarSerDe)
- SequenceFile
- JSON (using org.apache.hive.hcatalog.data.JsonSerDe)
- CSV (using org.apache.hadoop.hive.serde2.OpenCSVSerde)
- TextFile

## Getting started
* `docker-compose up -d`


### Setup superset
* First time : `sh superset_init.sh`
* In Superset, add trino with SqlAlchemy URI - `trino://hive@trino-coordinator:8080/hive`

## Service links

* [Superset](http://localhost:8088/) (username: `admin`, password: `admin`)
* [Minio](http://localhost:9595/) - username: `minio_access_key`, password: `minio_secret_key`)
* [Trino](http://localhost:8080/ui/)


## Trino CLI

```
docker exec -it trino trino
```

Run SQL commands listed `trino/init.sql`

## Useful commands

```sh
# restart just trino
docker-compose restart trino-coordinator

```