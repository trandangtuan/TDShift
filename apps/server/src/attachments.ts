import { createHash, randomUUID } from "node:crypto";
import { PassThrough } from "node:stream";
import { Client } from "minio";
import { config } from "./config";

let client: Client | null = null;

function minioClient() {
  client ??= new Client({
    endPoint: config.minioEndpoint,
    port: config.minioPort,
    useSSL: config.minioUseSsl,
    accessKey: config.minioAccessKey,
    secretKey: config.minioSecretKey
  });
  return client;
}

export async function storeAttachmentPayload(values: Record<string, unknown>) {
  const rawData = typeof values.datas === "string" ? values.datas.trim() : "";
  if (!rawData) return values;

  const buffer = Buffer.from(rawData.replace(/^data:[^;]+;base64,/, ""), "base64");
  const checksum = createHash("sha256").update(buffer).digest("hex");
  const fileName = String(values.file_name || values.name || "attachment");
  const objectName = String(values.object_name || `${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${safeFileName(fileName)}`);
  const bucket = String(values.bucket || config.minioBucket);
  await ensureBucket(bucket);
  await minioClient().putObject(bucket, objectName, buffer, buffer.length, {
    "Content-Type": String(values.mime_type || "application/octet-stream")
  });

  return {
    ...values,
    storage: "minio",
    bucket,
    object_name: objectName,
    file_size: buffer.length,
    checksum,
    datas: null
  };
}

export async function storeAttachmentStream(input: { stream: NodeJS.ReadableStream; fileName: string; mimeType?: string; bucket?: string; objectName?: string }) {
  const bucket = input.bucket || config.minioBucket;
  const objectName = input.objectName || `${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${safeFileName(input.fileName)}`;
  const checksum = createHash("sha256");
  let fileSize = 0;
  const passThrough = new PassThrough();

  input.stream.on("data", (chunk: Buffer) => {
    fileSize += chunk.length;
    checksum.update(chunk);
  });
  input.stream.on("error", (error) => passThrough.destroy(error));
  input.stream.pipe(passThrough);

  await ensureBucket(bucket);
  await minioClient().putObject(bucket, objectName, passThrough, undefined, {
    "Content-Type": input.mimeType || "application/octet-stream"
  });

  return {
    bucket,
    object_name: objectName,
    file_size: fileSize,
    checksum: checksum.digest("hex")
  };
}

export async function getAttachmentObject(bucket: string, objectName: string) {
  return minioClient().getObject(bucket, objectName);
}

async function ensureBucket(bucket: string) {
  const exists = await minioClient().bucketExists(bucket).catch(() => false);
  if (!exists) await minioClient().makeBucket(bucket);
}

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/^_+|_+$/g, "") || "attachment";
}
