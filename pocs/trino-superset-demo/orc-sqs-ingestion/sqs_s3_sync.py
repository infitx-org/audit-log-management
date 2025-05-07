import os
import json
import pyorc
import boto3
import io
import uuid
import logging
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# Setup Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# SQS Configuration
SQS_QUEUE_URL = os.getenv("SQS_QUEUE_URL")
SQS_ACCESS_KEY = os.getenv("SQS_ACCESS_KEY", "access_key")
SQS_SECRET_KEY = os.getenv("SQS_SECRET_KEY", "secret_key")
SQS_SESSION_TOKEN = os.getenv("SQS_SESSION_TOKEN")
SQS_REGION = os.getenv("SQS_REGION", "eu-west-2")


# S3 Configuration
S3_BUCKET = os.getenv("S3_BUCKET", "audit-logs")
S3_ENDPOINT = os.getenv("S3_ENDPOINT", "http://localhost:9595")
S3_ACCESS_KEY = os.getenv("S3_ACCESS_KEY", "minio_access_key")
S3_SECRET_KEY = os.getenv("S3_SECRET_KEY", "minio_secret_key")
S3_FOLDER = os.getenv("S3_FOLDER", "some-env-orc")

# Batch Settings
BATCH_SIZE = int(os.getenv("BATCH_SIZE", "10"))  # Max 10 messages per SQS receive
POLL_TIMEOUT = int(os.getenv("POLL_TIMEOUT", "20"))  # SQS long poll timeout (seconds)

# ORC Schema
schema = "struct<trace_id:string,span_id:string,trace_service:string,event_id:string,event_type:string,event_action:string,event_status:string,source:string,destination:string,timestamp:bigint,line:string>"

# Create S3 client
s3_client = boto3.client(
    "s3",
    endpoint_url=S3_ENDPOINT,
    aws_access_key_id=S3_ACCESS_KEY,
    aws_secret_access_key=S3_SECRET_KEY,
)

# Create SQS client
sqs_client = boto3.client(
    "sqs",
    aws_access_key_id=SQS_ACCESS_KEY,
    aws_secret_access_key=SQS_SECRET_KEY,
    aws_session_token=SQS_SESSION_TOKEN,
    region_name=SQS_REGION,
)

def get_s3_partitioned_key(filename, logDateTime):
    return f"{S3_FOLDER}/year={logDateTime.year}/month={logDateTime.month:02d}/day={logDateTime.day:02d}/hour={logDateTime.hour:02d}/{filename}"

def process_batch(messages):
    if not messages:
        logging.info("No messages to process in this batch.")
        return

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
                raw_log_str = msg["Body"]
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
                    logging.warning(f"❌ Skipping bad JSON message: {raw_log_str[:100]}...")

        # Upload to S3
        orc_data = output.getvalue()
        s3_client.put_object(Bucket=S3_BUCKET, Key=s3_key, Body=orc_data)
        logging.info(f"✅ Uploaded ORC file to s3://{S3_BUCKET}/{s3_key}")
    except Exception as e:
        logging.error(f"❌ Error writing ORC file: {e}", exc_info=True)
        raise

def consume_messages():
    logging.info("Starting SQS consumer loop...")
    try:
        while True:
            response = sqs_client.receive_message(
                QueueUrl=SQS_QUEUE_URL,
                MaxNumberOfMessages=BATCH_SIZE,
                WaitTimeSeconds=POLL_TIMEOUT,
            )

            messages = response.get("Messages", [])

            if not messages:
                logging.info("No new messages received.")
                continue

            try:
                process_batch(messages)

                # Delete messages after successful processing
                entries = [{"Id": msg["MessageId"], "ReceiptHandle": msg["ReceiptHandle"]} for msg in messages]
                sqs_client.delete_message_batch(QueueUrl=SQS_QUEUE_URL, Entries=entries)
                logging.info(f"✅ Deleted {len(entries)} messages from SQS.")
            except Exception as e:
                logging.error(f"❌ Error processing batch: {e}", exc_info=True)

    except KeyboardInterrupt:
        logging.info("🛑 Stopping SQS consumer...")

if __name__ == "__main__":
    consume_messages()
