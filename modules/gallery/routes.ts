import { randomUUID } from "node:crypto";
import type { ModuleRoute } from "@record-platform/core";
import { deleteAttachmentObject, getAttachmentObject, storeAttachmentStream } from "../../apps/server/src/attachments";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const PAGE_SIZE = 20;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export const galleryRoutes: ModuleRoute[] = [{
  async register({ app, db, createRequestEnvironment }) {
    app.post("/api/gallery/upload", async (request: any, reply: any) => {
      const file = await request.file({ limits: { fileSize: MAX_FILE_SIZE } });
      if (!file) return reply.code(400).send({ error: "File is required" });
      if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
        file.file.resume();
        return reply.code(415).send({ error: "Only JPEG, PNG, WebP, and GIF images are supported" });
      }
      const stored = await storeAttachmentStream({ stream: file.file, fileName: file.filename, mimeType: file.mimetype, objectName: `gallery/${new Date().toISOString().slice(0, 10)}/${randomUUID()}` });
      if (file.file.truncated || stored.file_size > MAX_FILE_SIZE) {
        await deleteAttachmentObject(stored.bucket, stored.object_name);
        return reply.code(413).send({ error: "Image must be 10 MB or smaller" });
      }
      const env = createRequestEnvironment(request);
      const id = await env.model("gallery.image").create({ name: file.filename, filename: file.filename, mime_type: file.mimetype, size: stored.file_size, storage_path: `${stored.bucket}/${stored.object_name}`, width: null, height: null, owner_id: env.user.id });
      return imageResponse(id, file.filename, file.mimetype, stored.file_size, new Date().toISOString());
    });

    app.get("/api/gallery/images", async (request: any) => {
      const env = createRequestEnvironment(request);
      const limit = parsePageValue(request.query.limit, PAGE_SIZE, 100);
      const offset = parsePageValue(request.query.offset, 0, Number.MAX_SAFE_INTEGER);
      const rows = db.prepare("SELECT id, name, filename, mime_type, size, width, height, create_date FROM gallery_image WHERE owner_id = ? ORDER BY create_date DESC, id DESC LIMIT ? OFFSET ?").all(env.user.id, limit + 1, offset) as GalleryRow[];
      return { items: rows.slice(0, limit).map((row) => imageResponse(row.id, row.name, row.mime_type, row.size, row.create_date, row)), limit, offset, has_more: rows.length > limit };
    });

    for (const suffix of ["content", "thumbnail"]) {
      app.get(`/api/gallery/images/:id/${suffix}`, async (request: any, reply: any) => {
        const env = createRequestEnvironment(request);
        const row = ownedImage(db, env.user.id, Number(request.params.id));
        if (!row) return reply.code(404).send({ error: "Image not found" });
        const separator = row.storage_path.indexOf("/");
        const stream = await getAttachmentObject(row.storage_path.slice(0, separator), row.storage_path.slice(separator + 1));
        return reply.header("Content-Type", row.mime_type).header("Cache-Control", "private, max-age=3600").send(stream);
      });
    }

    app.delete("/api/gallery/images/:id", async (request: any, reply: any) => {
      const env = createRequestEnvironment(request);
      const row = ownedImage(db, env.user.id, Number(request.params.id));
      if (!row) return reply.code(404).send({ error: "Image not found" });
      const separator = row.storage_path.indexOf("/");
      await deleteAttachmentObject(row.storage_path.slice(0, separator), row.storage_path.slice(separator + 1));
      await env.model("gallery.image").unlink([row.id]);
      return { ok: true };
    });
  }
}];

type GalleryRow = { id: number; name: string; filename: string; mime_type: string; size: number; width?: number | null; height?: number | null; create_date: string };
type StoredImage = GalleryRow & { storage_path: string };

function ownedImage(db: any, userId: number, id: number) {
  return db.prepare("SELECT id, name, filename, mime_type, size, width, height, create_date, storage_path FROM gallery_image WHERE id = ? AND owner_id = ?").get(id, userId) as StoredImage | undefined;
}

function imageResponse(id: number, name: string, mimeType: string, size: number, createdAt: string, row?: Partial<GalleryRow>) {
  return { id, name, filename: row?.filename ?? name, mime_type: mimeType, size, width: row?.width ?? null, height: row?.height ?? null, url: `/api/gallery/images/${id}/content`, thumbnail_url: `/api/gallery/images/${id}/thumbnail`, created_at: createdAt };
}

function parsePageValue(value: unknown, fallback: number, maximum: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? Math.min(parsed, maximum) : fallback;
}