import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { FastifyRequest } from "fastify";
import { config } from "./config";
import { db, getCurrentDatabaseName } from "./db";
import { assertDatabaseName, isDatabaseAllowed } from "./database-manager";

export interface AuthUser {
  id: number;
  login: string;
  name: string;
  isAdmin: boolean;
  database?: string;
}

interface UserRow {
  id: number;
  login: string;
  name: string;
  email: string | null;
  password_hash: string;
  token_version: number;
  active: number;
}

const requestUserCache = new WeakMap<FastifyRequest, AuthUser | null>();

export function ensureAdminUser() {
  const now = new Date().toISOString();
  const existing = db.prepare("SELECT id FROM core_user WHERE login = ?").get(config.adminLogin);
  if (existing) return;
  db.prepare(`
    INSERT INTO core_user (login, name, email, password_hash, token_version, api_token, active, created_at, updated_at)
    VALUES (?, ?, ?, ?, 0, ?, 1, ?, ?)
  `).run(config.adminLogin, config.adminName, config.adminEmail, hashPassword(config.adminPassword), randomToken(), now, now);
}

export function login(login: string, password: string, database = getCurrentDatabaseName(), host = "") {
  if (!isDatabaseAllowed(database, host)) return null;
  assertDatabaseName(database, host);
  const user = db.prepare("SELECT * FROM core_user WHERE login = ? AND active = 1").get(login) as UserRow | undefined;
  if (!user || !verifyPassword(password, user.password_hash)) return null;
  return { user: toAuthUser(user, database), database, token: signToken(user, database) };
}

export function registerUser(values: { login: string; name: string; email?: string; password: string }) {
  const now = new Date().toISOString();
  const result = db.prepare(`
    INSERT INTO core_user (login, name, email, password_hash, token_version, api_token, active, created_at, updated_at, create_uid, write_uid, create_date, write_date)
    VALUES (?, ?, ?, ?, 0, ?, 1, ?, ?, 1, 1, ?, ?)
  `).run(values.login, values.name, values.email ?? null, hashPassword(values.password), randomToken(), now, now, now, now);
  const user = db.prepare("SELECT * FROM core_user WHERE id = ?").get(result.lastInsertRowid) as UserRow;
  return { user: toAuthUser(user, getCurrentDatabaseName()), token: signToken(user) };
}

export function getUserFromRequest(request: FastifyRequest): AuthUser | null {
  if (requestUserCache.has(request)) return requestUserCache.get(request) ?? null;
  const header = request.headers.authorization;
  const user = header?.startsWith("Bearer ") ? verifyToken(header.slice("Bearer ".length), request.hostname) : null;
  requestUserCache.set(request, user);
  return user;
}

export function resetUserToken(userId: number) {
  const now = new Date().toISOString();
  const apiToken = randomToken();
  const result = db.prepare(`
    UPDATE core_user
    SET token_version = token_version + 1,
        api_token = ?,
        updated_at = ?
    WHERE id = ? AND active = 1
  `).run(apiToken, now, userId);
  if (!result.changes) return null;
  const user = db.prepare("SELECT * FROM core_user WHERE id = ?").get(userId) as UserRow;
  return { apiToken, token: signToken(user), user: toAuthUser(user, getCurrentDatabaseName()) };
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const hash = scryptSync(password, salt, 64).toString("base64url");
  return `scrypt$${salt}$${hash}`;
}

function verifyPassword(password: string, stored: string) {
  const [algorithm, salt, hash] = stored.split("$");
  if (algorithm !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64url");
  const actual = scryptSync(password, salt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function signToken(user: UserRow, database = getCurrentDatabaseName()) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    sub: String(user.id),
    login: user.login,
    name: user.name,
    tokenVersion: user.token_version,
    database,
    iat: now,
    exp: now + config.jwtExpiresSeconds
  };
  const body = `${base64Json(header)}.${base64Json(payload)}`;
  return `${body}.${signature(body)}`;
}

function verifyToken(token: string, host = "") {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const body = `${parts[0]}.${parts[1]}`;
  if (!safeEqual(parts[2], signature(body))) return null;
  const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as { sub: string; exp: number; tokenVersion: number; database?: string };
  if (payload.exp < Math.floor(Date.now() / 1000)) return null;
  if (!payload.database || payload.database !== getCurrentDatabaseName() || !isDatabaseAllowed(payload.database, host)) return null;
  const user = db.prepare("SELECT * FROM core_user WHERE id = ? AND active = 1").get(Number(payload.sub)) as UserRow | undefined;
  if (!user || user.token_version !== payload.tokenVersion) return null;
  return toAuthUser(user, getCurrentDatabaseName());
}

export function getUserFromToken(token: string, host = "") {
  return verifyToken(token, host);
}

export function getDatabaseNameFromToken(token: string, host = "") {
  const [, encodedPayload] = token.split(".");
  if (!encodedPayload) return null;
  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as { database?: string };
    return payload.database && assertDatabaseName(payload.database, host);
  } catch {
    return null;
  }
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function base64Json(value: unknown) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function signature(body: string) {
  return createHmac("sha256", config.jwtSecret).update(body).digest("base64url");
}

function randomToken() {
  return randomBytes(32).toString("base64url");
}

function toAuthUser(user: UserRow, database = getCurrentDatabaseName()): AuthUser {
  return { id: user.id, login: user.login, name: user.name, isAdmin: user.login === config.adminLogin, database };
}
