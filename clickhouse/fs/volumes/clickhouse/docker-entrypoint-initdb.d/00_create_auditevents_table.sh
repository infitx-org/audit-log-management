
#!/bin/bash
set -e 
clickhouse client -n <<-EOSQL
CREATE OR REPLACE TABLE auditEvents
(
    id String,
    type String,
    metadata Tuple(event Tuple(type String, action String, createdAt String, state Tuple(status Enum('success', 'error'))), trace Tuple(service String, tags Tuple(source String, destination String))),
    content String,
)
ENGINE = Kafka(
   'kafka:29092',
   'topic-event-audit',
   'consumer-group-clickhouse',
   'JSONEachRow'
)
SETTINGS kafka_skip_broken_messages=20;
EOSQL
