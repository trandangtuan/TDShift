import { createHash, randomUUID } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, unlink } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
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
  await writeAttachmentFile(bucket, objectName, buffer);

  return {
    ...values,
    storage: "file",
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
  const filePath = attachmentFilePath(bucket, objectName);
  await mkdir(dirname(filePath), { recursive: true });
  const digest = new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      fileSize += chunk.length;
      checksum.update(chunk);
      callback(null, chunk);
    }
  });
  await pipeline(input.stream, digest, createWriteStream(filePath));

  return {
    bucket,
    object_name: objectName,
    file_size: fileSize,
    checksum: checksum.digest("hex")
  };
}

export async function getAttachmentObject(bucket: string, objectName: string) {
  return createReadStream(attachmentFilePath(bucket, objectName));
}

export async function deleteAttachmentObject(bucket: string, objectName: string) {
  await unlink(attachmentFilePath(bucket, objectName));
}

export async function getLegacyMinioObject(bucket: string, objectName: string) {
  return minioClient().getObject(bucket, objectName);
}

async function writeAttachmentFile(bucket: string, objectName: string, buffer: Buffer) {
  const filePath = attachmentFilePath(bucket, objectName);
  await mkdir(dirname(filePath), { recursive: true });
  await new Promise<void>((resolvePromise, reject) => {
    const stream = createWriteStream(filePath);
    stream.on("error", reject);
    stream.on("finish", resolvePromise);
    stream.end(buffer);
  });
}

function attachmentFilePath(bucket: string, objectName: string) {
  const root = resolve(config.attachmentStoragePath);
  const filePath = resolve(root, safePathPart(bucket), safeObjectName(objectName));
  const pathFromRoot = relative(root, filePath);
  if (pathFromRoot.startsWith("..") || isAbsolute(pathFromRoot)) throw new Error("Invalid attachment path");
  return filePath;
}

function safeObjectName(objectName: string) {
  const normalized = objectName.replaceAll("\\", "/");
  if (!normalized || normalized.split("/").some((part) => !part || part === "." || part === "..")) throw new Error("Invalid attachment object name");
  return normalized;
}

function safePathPart(value: string) {
  if (!value || value === "." || value === ".." || value.includes("/") || value.includes("\\")) throw new Error("Invalid attachment bucket");
  return value;
}

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/^_+|_+$/g, "") || "attachment";
}
