## Blogs
- https://clickhouse.com/blog/didi-migrates-from-elasticsearch-to-clickHouse-for-a-new-generation-log-storage-system
- https://clickhouse.com/blog/how-trip.com-migrated-from-elasticsearch-and-built-a-50pb-logging-solution-with-clickhouse

## References
- https://clickhouse.com/docs/en/observability


## Docker compose
docker compose up -d
docker compose exec clickhouse clickhouse-client


## JSON Data Type (Beta)
```
SET enable_json_type = 1;
SELECT name, value FROM system.settings WHERE name = 'enable_json_type';
```

https://clickhouse.com/docs/en/sql-reference/data-types/newjson
```
CREATE TABLE test (json JSON) ENGINE = Memory;
INSERT INTO test VALUES ('{"a" : {"b" : 42}, "c" : [1, 2, 3]}'), ('{"f" : "Hello, World!"}'), ('{"a" : {"b" : 43, "e" : 10}, "c" : [4, 5, 6]}');
SELECT json FROM test;
```


## Visualizations

https://clickhouse.com/docs/en/integrations/data-visualization
https://clickhouse.com/docs/en/integrations/grafana
https://clickhouse.com/docs/en/interfaces/third-party/gui

docker run -p 5521:5521 ggartyy/ch-ui:latest

docker run -p 8080:80 spoonest/clickhouse-tabix-web-client

docker run -p 8080:80  ctilab2/clickhouse-tabix-web-client:stable


## Kafka Ingestion
https://clickhouse.com/docs/en/integrations/kafka


### Querying the kafka table directly (Useful for debugging, only works when there is no materialized view)
```
SELECT *
FROM auditEvents
LIMIT 20
FORMAT Vertical
SETTINGS stream_like_engine_allow_direct_select = 1;

SELECT
    id,
    tupleElement(tupleElement(metadata, 'event'), 'type') AS event_type,
    tupleElement(tupleElement(metadata, 'event'), 'action') AS event_action,
    tupleElement(tupleElement(metadata, 'event'), 'createdAt') AS created_at
FROM auditEvents
LIMIT 30
FORMAT Vertical
SETTINGS stream_like_engine_allow_direct_select = 1;
```

### Sample Queries
``
SELECT count() FROM rawEvents;

SELECT *
FROM rawEvents
LIMIT 5
FORMAT Vertical

SELECT
    event_action,
    count()
FROM rawEvents
GROUP BY event_action;
```