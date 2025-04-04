-- Need to manually run each query now.

CREATE SCHEMA IF NOT EXISTS hive.audit_logs;

CREATE TABLE IF NOT EXISTS hive.audit_logs.some_env (
  trace_id VARCHAR,
  span_id VARCHAR,
  trace_service VARCHAR,
  event_id VARCHAR,
  event_type VARCHAR,
  event_action VARCHAR,
  event_status VARCHAR,
  source VARCHAR,
  destination VARCHAR,
  transaction_type VARCHAR,
  transaction_action VARCHAR,
  audit_type VARCHAR,
  content_type VARCHAR,
  operation VARCHAR,
  http_method VARCHAR,
  http_path VARCHAR,
  http_query VARCHAR,
  http_url VARCHAR,
  party_id_type VARCHAR,
  party_identifier VARCHAR,
  party_sub_id_or_type VARCHAR,
  request_id VARCHAR,
  oracle_id VARCHAR,
  quote_id VARCHAR,
  transaction_id VARCHAR,
  conversion_request_id VARCHAR,
  conversion_id VARCHAR,
  determining_transfer_id VARCHAR,
  transfer_id VARCHAR,
  commit_request_id VARCHAR,
  year INT,
  month INT,
  day INT,
  hour INT
)
WITH (
  external_location = 's3a://audit-logs/some-env',
  format = 'PARQUET',
  partitioned_by = ARRAY['year', 'month', 'day', 'hour']
);


call hive.system.sync_partition_metadata('audit_logs', 'some_env', 'ADD');
-- This command essentially asks trino to discover any newly
-- created partitions for hive catalog, in schema sales, table sales_data_partition
-- and update it''s partition metadata. So next time
-- any new query runs which tries to use this partition, trino will 
-- scan this directory looking for data.


-- Testing
SELECT 
  trace_id,
  event_action
FROM hive.audit_logs.some_env
LIMIT 10;

SHOW TABLES IN hive.audit_logs;