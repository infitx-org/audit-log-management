
#!/bin/bash
set -e 
clickhouse client -n <<-EOSQL
CREATE OR REPLACE TABLE auditEvents
(
    id UUID,
    type String,
    metadata Tuple(event Tuple(type String, action String, createdAt String)),
    content Tuple(size UInt64, topic String, timestamp String),
)
ENGINE = Kafka(
   'kafka:29092',
   'topic-event-audit',
   'consumer-group-clickhouse',
   'JSONEachRow'
)
SETTINGS kafka_skip_broken_messages=20;
EOSQL
