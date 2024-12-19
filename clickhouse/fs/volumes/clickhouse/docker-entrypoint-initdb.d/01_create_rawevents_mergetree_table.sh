#!/bin/bash
set -e
clickhouse client -n <<-EOSQL
CREATE TABLE rawEvents (
    id UUID,
    event_type String,
    event_action String,
    created_at String
)
ENGINE = MergeTree
ORDER BY (created_at);
EOSQL
