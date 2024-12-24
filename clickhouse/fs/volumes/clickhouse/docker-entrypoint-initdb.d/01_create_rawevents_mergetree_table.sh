#!/bin/bash
set -e
clickhouse client -n <<-EOSQL
CREATE TABLE rawEvents (
    id String,
    event_type String,
    event_action String,
    created_at DateTime64(3),
    status Enum('success', 'error'),
    service String,
    source String,
    destination String,
    content String,
)
ENGINE = MergeTree
ORDER BY (created_at);
EOSQL
