import json
import pyorc
import io
import uuid
import logging
import os
from datetime import datetime
import boto3

# Setup Logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# S3 Config (assumes IAM role or env vars in Lambda)
S3_BUCKET = os.getenv("S3_BUCKET", "audit-logs")
S3_FOLDER = os.getenv("S3_FOLDER", "some-env-orc")
S3_ENDPOINT = os.getenv("S3_ENDPOINT")  # Optional for MinIO/local dev

# ORC Schema
schema = "struct<trace_id:string,span_id:string,trace_service:string,event_id:string,event_type:string,event_action:string,event_status:string,source:string,destination:string,timestamp:bigint,line:string>"

def get_s3_partitioned_key(filename, logDateTime):
    return f"{S3_FOLDER}/year={logDateTime.year}/month={logDateTime.month:02d}/day={logDateTime.day:02d}/hour={logDateTime.hour:02d}/{filename}"

# Optional: create S3 client only if needed
def get_s3_client():
    if S3_ENDPOINT:
        return boto3.client("s3", endpoint_url=S3_ENDPOINT)
    return boto3.client("s3")

def lambda_handler(event, context):
    messages = event.get("Records", [])
    if not messages:
        logger.info("No messages received.")
        return {"status": "empty"}

    batch_size = len(messages)
    logDateTime = datetime.utcnow()
    timestamp = int(logDateTime.timestamp())
    unique_id = uuid.uuid4().hex[:8]
    filename = f"batch-{timestamp}-{unique_id}-{batch_size}.orc"
    s3_key = get_s3_partitioned_key(filename, logDateTime)

    output = io.BytesIO()

    try:
        with pyorc.Writer(output, schema, compression=pyorc.CompressionKind.ZSTD) as writer:
            for msg in messages:
                raw_log_str = msg["body"]
                try:
                    rawLog = json.loads(raw_log_str)
                    record = (
                        rawLog.get("metadata", {}).get("trace", {}).get("traceId", ""),
                        rawLog.get("metadata", {}).get("trace", {}).get("spanId", ""),
                        rawLog.get("metadata", {}).get("trace", {}).get("service", ""),
                        rawLog.get("metadata", {}).get("event", {}).get("id", ""),
                        rawLog.get("metadata", {}).get("event", {}).get("type", ""),
                        rawLog.get("metadata", {}).get("event", {}).get("action", ""),
                        rawLog.get("metadata", {}).get("event", {}).get("state", {}).get("status", ""),
                        rawLog.get("metadata", {}).get("trace", {}).get("tags", {}).get("source", ""),
                        rawLog.get("metadata", {}).get("trace", {}).get("tags", {}).get("destination", ""),
                        int(rawLog.get("metadata", {}).get("timestamp", 0)),
                        raw_log_str,
                    )
                    writer.write(record)
                except json.JSONDecodeError:
                    logger.warning(f"❌ Skipping bad JSON message: {raw_log_str[:100]}...")

        orc_data = output.getvalue()

        # Optional: Upload to S3
        s3_client = get_s3_client()
        s3_client.put_object(Bucket=S3_BUCKET, Key=s3_key, Body=orc_data)
        logger.info(f"✅ Uploaded ORC file to s3://{S3_BUCKET}/{s3_key}")

        return {
            "status": "success",
            "orc_filename": filename,
            "s3_key": s3_key,
            "orc_size_bytes": len(orc_data),
        }

    except Exception as e:
        logger.error(f"❌ Error writing ORC: {e}", exc_info=True)
        raise
