const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const Config = require('./lib/config')
const parquet = require('parquetjs-lite');
const fs = require('fs-extra');
const path = require('path');

// Initialize S3 or MinIO Client
const s3 = new S3Client({
  region: Config.S3_CONFIG.REGION,
  endpoint: Config.S3_CONFIG.TYPE === 'minio' ? Config.S3_CONFIG.ENDPOINT : undefined,
  forcePathStyle: Config.S3_CONFIG.TYPE === 'minio',
  credentials: {
    accessKeyId: Config.S3_CONFIG.ACCESS_KEY,
    secretAccessKey: Config.S3_CONFIG.SECRET_KEY,
  },
});

// Ensure ../data directory exists
const TEMP_DIR = path.join(__dirname, '../data');
fs.ensureDirSync(TEMP_DIR);

// Parquet Schema Definition
const schema = new parquet.ParquetSchema({
  trace_id: { type: 'UTF8' },
  span_id: { type: 'UTF8' },
  trace_service: { type: 'UTF8' },
  event_id: { type: 'UTF8' },
  event_type: { type: 'UTF8' },
  event_action: { type: 'UTF8' },
  event_status: { type: 'UTF8' },
  source: { type: 'UTF8' },
  destination: { type: 'UTF8' },
  timestamp: { type: 'TIMESTAMP_MILLIS' },
});

async function processBatch(messagesBuffer) {
  if (messagesBuffer.length === 0) return;

  const filePath = path.join(TEMP_DIR, `batch-${Date.now()}-${messagesBuffer.length}.parquet`);
  const writer = await parquet.ParquetWriter.openFile(schema, filePath);

  for (const message of messagesBuffer) {
    let rawLog = message.value;
    if (typeof message.value === 'string') {
      rawLog = JSON.parse(message.value);
    }

    // Extracting nested fields
    const log = {
      trace_id: rawLog?.metadata?.trace?.traceId || '',
      span_id: rawLog?.metadata?.trace?.spanId || '',
      trace_service: rawLog?.metadata?.trace?.service || '',
      event_id: rawLog?.metadata?.event?.id || '',
      event_type: rawLog?.metadata?.event?.type || '',
      event_action: rawLog?.metadata?.event?.action || '',
      event_status: rawLog?.metadata?.event?.state?.status || '',
      source: rawLog?.metadata?.trace?.tags?.source || '',
      destination: rawLog?.metadata?.trace?.tags?.destination || '',
      timestamp: typeof rawLog?.metadata?.timestamp === 'number' ? rawLog.metadata.timestamp : Date.now(),
    };

    await writer.appendRow(log);
  }

  await writer.close();
  await uploadToS3(filePath);
}

function constructS3Path(rootFolder, date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0"); // Ensure 2-digit format

  return `${rootFolder}/year=${year}/month=${month}/day=${day}/hour=${hour}`;
}

async function uploadToS3(filePath) {
  try {
    const fileBuffer = await fs.promises.readFile(filePath);
    const fileSize = fileBuffer.length;
    const s3Path = constructS3Path(Config.S3_CONFIG.ROOT);

    const uploadParams = {
      Bucket: Config.S3_CONFIG.BUCKET,
      Key: `${s3Path}/${path.basename(filePath)}`,
      Body: fileBuffer,
      ContentType: 'application/octet-stream',
      ContentLength: fileSize, // Ensure Content-Length is set
    };
    await s3.send(new PutObjectCommand(uploadParams));
    console.log(`Uploaded ${filePath} to S3'}`);
    await fs.remove(filePath);
  } catch (err) {
    await fs.remove(filePath);
    console.error('Error uploading:', err);
    throw err; // Rethrow the error for further handling
  }
}

module.exports = {
  processBatch
}