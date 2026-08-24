import type { ActionDefinition, FieldDefinition, RuntimeMenu, RuntimeView, ViewNode } from "@record-platform/core";

export type RuntimeModel = {
  technicalName: string;
  name: string;
  tableName: string;
  fields: FieldDefinition[];
};

export type AuthUser = { id: number; login?: string; name: string };
export type ApiClient = <T>(path: string, init?: { method?: string; body?: unknown }) => Promise<T>;
export type { ActionDefinition, FieldDefinition, RuntimeMenu, RuntimeView, ViewNode };
