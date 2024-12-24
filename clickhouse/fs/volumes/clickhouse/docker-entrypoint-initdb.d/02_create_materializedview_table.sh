#!/bin/bash
set -e
clickhouse client -n <<-EOSQL
CREATE MATERIALIZED VIEW rawEvents_mv TO rawEvents
AS
   SELECT
        id,
        tupleElement(tupleElement(metadata, 'event'), 'type') AS event_type,
        tupleElement(tupleElement(metadata, 'event'), 'action') AS event_action,
        toTimeZone(parseDateTime64BestEffort(tupleElement(tupleElement(metadata, 'event'), 'createdAt'), 3), 'UTC') AS created_at,
        tupleElement(tupleElement(tupleElement(metadata, 'event'), 'state'), 'status') AS status,
        tupleElement(tupleElement(metadata, 'trace'), 'service') AS service,
        tupleElement(tupleElement(tupleElement(metadata, 'trace'), 'tags'), 'source') AS source,
        tupleElement(tupleElement(tupleElement(metadata, 'trace'), 'tags'), 'destination') AS destination,
        content

FROM auditEvents
SETTINGS date_time_input_format = 'best_effort';
EOSQL
