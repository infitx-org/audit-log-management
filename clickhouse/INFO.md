## Blogs
- https://clickhouse.com/blog/didi-migrates-from-elasticsearch-to-clickHouse-for-a-new-generation-log-storage-system
- https://clickhouse.com/blog/how-trip.com-migrated-from-elasticsearch-and-built-a-50pb-logging-solution-with-clickhouse

## References
- https://clickhouse.com/docs/en/observability


## Quick Start
https://clickhouse.com/docs/en/getting-started/quick-start

curl https://clickhouse.com/ | sh

```
./clickhouse server

./clickhouse client
```

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


```
CREATE OR REPLACE TABLE auditEvents
(
    `id` UUID,
    `type` String,
    `metadata` Tuple(event Tuple(type String, action String, createdAt String)),
    `content` Tuple(size UInt64, topic String, timestamp String),
)
ENGINE = Kafka(
   'localhost:9092',
   'topic-event-audit',
   'consumer-group-clickhouse',
   'JSONEachRow'
)
SETTINGS kafka_skip_broken_messages=20;
```


```
SELECT *
FROM auditEvents
LIMIT 20
FORMAT Vertical
SETTINGS stream_like_engine_allow_direct_select = 1;
```

```
CREATE TABLE rawEvents (
    id UUID,
    event_type String,
    event_action String,
    created_at String
)
ENGINE = MergeTree
ORDER BY (created_at);
```

```
CREATE MATERIALIZED VIEW rawEvents_mv TO rawEvents
AS
   SELECT
       id,
       tupleElement(tupleElement(metadata, 'event'), 'type') AS event_type,
       tupleElement(tupleElement(metadata, 'event'), 'action') AS event_action,
       tupleElement(tupleElement(metadata, 'event'), 'createdAt') AS created_at
FROM auditEvents
SETTINGS date_time_input_format = 'best_effort';
```

Querying the kafka table directly
```
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

Sample Queries
``
SELECT count()
FROM rawEvents;


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