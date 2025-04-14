DESCRIBE TABLE s3('http://minio:9000/audit-env1/orc', 'TabSeparatedWithNames');

DESCRIBE TABLE s3(
  'http://minio:9000/audit-env1/some-env-orc',
  'admin',
  'admin123',
  'ORC',
  'trace_id String'
);


SELECT *,
extract(_path, 'year=(\\d+)') AS year,
extract(_path, 'month=(\\d+)') AS month,
extract(_path, 'day=(\\d+)') AS day,
extract(_path, 'hour=(\\d+)') AS hour
FROM s3(
    'http://minio:9000/audit-env1/some-env-orc/year=*/month=*/day=*/hour=*/*.orc',
    'admin',
    'admin123',
    'ORC',
    'trace_id String'
)
LIMIT 10;


SELECT *,
    extract(_path, 'year=(\\d+)') AS year,
    extract(_path, 'month=(\\d+)') AS month,
    extract(_path, 'day=(\\d+)') AS day,
    extract(_path, 'hour=(\\d+)') AS hour
FROM s3(
    'http://minio:9000/audit-env1/some-env-orc/year=*/month=*/day=*/hour=*/*.orc',
    'admin',
    'admin123',
    'ORC',
    'trace_id String,
     span_id String,
     trace_service String,
     event_id String,
     event_type String,
     event_action String,
     event_status String,
     source String,
     destination String,
     transaction_type String,
     transaction_action String,
     audit_type String,
     content_type String,
     service_name String,
     operation String,
     http_method String,
     http_path String,
     http_query String,
     http_url String,
     party_id_type String,
     party_identifier String,
     party_sub_id_or_type String,
     request_id String,
     oracle_id String,
     quote_id String,
     transaction_id String,
     conversion_request_id String,
     conversion_id String,
     determining_transfer_id String,
     transfer_id String,
     commit_request_id String,
     timestamp UInt64,
     line String'
)
LIMIT 10;


CREATE TABLE audit_logs
(
    trace_id String,
    span_id String,
    trace_service String,
    event_id String,
    event_type String,
    event_action String,
    event_status String,
    source String,
    destination String,
    transaction_type String,
    transaction_action String,
    audit_type String,
    content_type String,
    service_name String,
    operation String,
    http_method String,
    http_path String,
    http_query String,
    http_url String,
    party_id_type String,
    party_identifier String,
    party_sub_id_or_type String,
    request_id String,
    oracle_id String,
    quote_id String,
    transaction_id String,
    conversion_request_id String,
    conversion_id String,
    determining_transfer_id String,
    transfer_id String,
    commit_request_id String,
    timestamp UInt64,
    line String,
    year UInt16,
    month UInt8,
    day UInt8,
    hour UInt8
)
ENGINE = S3(
    'http://minio:9000/audit-env1/orc/year=*/month=*/day=*/hour=*/*.orc',
    'admin',
    'admin123',
    'ORC'
)
SETTINGS 
    input_format_with_names_use_header = 1,
    input_format_allow_errors_num = 10;


SELECT *,
    extract(_path, 'year=(\\d+)') AS year,
    extract(_path, 'month=(\\d+)') AS month,
    extract(_path, 'day=(\\d+)') AS day,
    extract(_path, 'hour=(\\d+)') AS hour
FROM audit_logs
LIMIT 10;


DROP TABLE audit_logs;