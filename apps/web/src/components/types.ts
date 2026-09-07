import type { ActionDefinition, FieldDefinition, RuntimeMenu, RuntimeView, ViewNode } from "@record-platform/core";

export type RuntimeModel = {
  technicalName: string;
  name: string;
  tableName: string;
  fields: FieldDefinition[];
};

export type AuthUser = { id: number; login?: string; name: string; isAdmin?: boolean; database?: string };
export type ApiClient = <T>(path: string, init?: { method?: string; body?: unknown }) => Promise<T>;
export type StreamHandler = (event: Record<string, unknown>) => void;
export type StreamClient = (path: string, init: { method?: string; body?: unknown; onEvent: StreamHandler }) => Promise<void>;
export type { ActionDefinition, FieldDefinition, RuntimeMenu, RuntimeView, ViewNode };
