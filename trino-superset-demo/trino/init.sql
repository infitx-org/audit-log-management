-- Need to manually run each query now.

CREATE SCHEMA IF NOT EXISTS hive.iris
WITH (location = 's3a://iris/');

-- Path s3a://iris/iris_data is the holding directory. We dont give full file path. Only parent directory
CREATE TABLE IF NOT EXISTS hive.iris.iris_data (
  sepal_length DOUBLE,
  sepal_width  DOUBLE,
  petal_length DOUBLE,
  petal_width  DOUBLE,
  class        VARCHAR
)
WITH (
  external_location = 's3a://iris/iris_data',
  format = 'PARQUET'
);

-- Testing
SELECT 
  sepal_length,
  class
FROM hive.iris.iris_data
LIMIT 10;

SHOW TABLES IN hive.iris;


CREATE TABLE IF NOT EXISTS hive.iris.ml_data (
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
  commit_request_id VARCHAR
)
WITH (
  external_location = 's3a://iris/ml_data',
  format = 'PARQUET'
);


-- Partitions
CREATE TABLE hive.sales.sales_data_partitioned (
    product_name VARCHAR,
    category VARCHAR,
    sale_amount DOUBLE,
    sale_date DATE,
    year INT,
    month INT,
    day INT
)
WITH (
    format = 'ORC',
    external_location = 's3a://my-sales-data-bucket/sales-data/',
    partitioned_by = ARRAY['year', 'month', 'day']
);

call hive.system.sync_partition_metadata('sales', 'sales_data_partition', 'ADD');
-- This command essentially asks trino to discover any newly
-- created partitions for hive catalog, in schema sales, table sales_data_partition
-- and update it''s partition metadata. So next time
-- any new query runs which tries to use this partition, trino will 
-- scan this directory looking for data.