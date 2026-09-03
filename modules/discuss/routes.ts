import type { ModuleRoute } from "@record-platform/core";
import { Server as SocketIOServer } from "socket.io";
import { getUserFromToken, type AuthUser } from "../../apps/server/src/auth";

type SocketUser = AuthUser;

export const discussRoutes: ModuleRoute[] = [{
  register({ app, db, createRequestEnvironment }) {
    const io = new SocketIOServer(app.server, { cors: { origin: true } });

    app.delete("/api/discuss/channels/:id", async (request: any, reply: any) => {
      const env = createRequestEnvironment(request);
      const channelId = Number(request.params.id);
      if (!Number.isInteger(channelId)) return reply.code(400).send({ error: "Invalid channel" });
      const member = db.prepare("SELECT id FROM discuss_channel_member WHERE channel_id = ? AND user_id = ? AND active = 1").get(channelId, env.user.id);
      if (!member) return reply.code(403).send({ error: "You are not an active member of this channel" });
      db.prepare("DELETE FROM discuss_message_read WHERE message_id IN (SELECT id FROM discuss_message WHERE channel_id = ?)").run(channelId);
      db.prepare("DELETE FROM discuss_message WHERE channel_id = ?").run(channelId);
      db.prepare("DELETE FROM discuss_channel_member WHERE channel_id = ?").run(channelId);
      db.prepare("DELETE FROM discuss_channel WHERE id = ?").run(channelId);
      return { ok: true };
    });

    io.use((socket, next) => {
      const token = socket.handshake.auth?.token ?? socket.handshake.headers.authorization?.replace(/^Bearer /, "");
      const user = typeof token === "string" ? getUserFromToken(token) : null;
      if (!user) return next(new Error("Authentication required"));
      socket.data.user = user;
      next();
    });

    io.on("connection", (socket) => {
      const user = socket.data.user as SocketUser;

      socket.on("channel:join", (channelId: number) => {
        if (!Number.isInteger(channelId)) return;
        const membership = db.prepare("SELECT id FROM discuss_channel_member WHERE channel_id = ? AND user_id = ? AND active = 1").get(channelId, user.id);
        if (membership) socket.join(channelRoom(channelId));
      });

      socket.on("channel:leave", (channelId: number) => {
        if (Number.isFinite(channelId)) socket.leave(channelRoom(channelId));
      });

      socket.on("message:send", (payload: { channelId?: number; body?: string }) => {
        const channelId = Number(payload?.channelId);
        const body = typeof payload?.body === "string" ? payload.body.trim() : "";
        if (!Number.isInteger(channelId) || !body || body.length > 4000) return;
        const membership = db.prepare("SELECT id FROM discuss_channel_member WHERE channel_id = ? AND user_id = ? AND active = 1").get(channelId, user.id);
        if (!membership) return socket.emit("message:error", { message: "Bạn không còn là thành viên của channel này." });
        const sentAt = new Date().toISOString();
        const result = db.prepare(`
          INSERT INTO discuss_message (channel_id, author_id, body, sent_at, active, create_uid, write_uid, create_date, write_date)
          VALUES (?, ?, ?, ?, 1, ?, ?, ?, ?)
        `).run(channelId, user.id, body, sentAt, user.id, user.id, sentAt, sentAt);
        const message = { id: Number(result.lastInsertRowid), channelId, authorId: user.id, authorName: user.name, body, sentAt };
        io.to(channelRoom(channelId)).emit("message:new", message);
      });

      socket.on("message:read", (payload: { messageId?: number; channelId?: number }) => {
        const messageId = Number(payload?.messageId);
        const channelId = Number(payload?.channelId);
        if (!Number.isInteger(messageId) || !Number.isInteger(channelId)) return;
        const membership = db.prepare("SELECT id FROM discuss_channel_member WHERE channel_id = ? AND user_id = ? AND active = 1").get(channelId, user.id);
        const message = db.prepare("SELECT id FROM discuss_message WHERE id = ? AND channel_id = ? AND active = 1").get(messageId, channelId);
        if (!membership || !message) return;
        const readAt = new Date().toISOString();
        const existingReceipt = db.prepare("UPDATE discuss_message_read SET read_at = ?, write_uid = ?, write_date = ? WHERE message_id = ? AND user_id = ?").run(readAt, user.id, readAt, messageId, user.id);
        if (!existingReceipt.changes) db.prepare(`
          INSERT INTO discuss_message_read (message_id, user_id, read_at, create_uid, write_uid, create_date, write_date)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(messageId, user.id, readAt, user.id, user.id, readAt, readAt);
        io.to(channelRoom(channelId)).emit("message:read", { messageId, userId: user.id, readAt });
      });
    });
  }
}];

function channelRoom(channelId: number) {
  return `discuss-channel-${channelId}`;
}