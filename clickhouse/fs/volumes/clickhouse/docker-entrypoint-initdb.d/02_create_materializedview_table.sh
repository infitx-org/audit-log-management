#!/bin/bash
set -e
clickhouse client -n <<-EOSQL
CREATE MATERIALIZED VIEW rawEvents_mv TO rawEvents
AS
   SELECT
       id,
       tupleElement(tupleElement(metadata, 'event'), 'type') AS event_type,
       tupleElement(tupleElement(metadata, 'event'), 'action') AS event_action,
       tupleElement(tupleElement(metadata, 'event'), 'createdAt') AS created_at
FROM auditEvents
SETTINGS date_time_input_format = 'best_effort';
EOSQL
