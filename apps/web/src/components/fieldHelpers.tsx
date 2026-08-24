import { useEffect, useState } from "react";
import type { FieldDefinition } from "./types";
import type { RuntimeModel, ApiClient } from "./types";

export function fieldLabel(model: RuntimeModel, fieldName: string) {
  return model.fields.find((field) => field.name === fieldName)?.label ?? fieldName;
}

export function formatValue(model: RuntimeModel, fieldName: string, value: unknown, api?: ApiClient) {
  const field = model.fields.find((candidate) => candidate.name === fieldName);
  if (field?.type === "boolean") return value ? "Yes" : "No";
  if (field?.type === "many2one" && api) return <ManyToOneDisplay api={api} field={field} value={value} />;
  if (field?.name === "url" && value) {
    const href = String(value);
    return <a className="table-link" href={href} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>{href}</a>;
  }
  return String(value ?? "");
}

function ManyToOneDisplay({ api, field, value }: { api: ApiClient; field: FieldDefinition; value: unknown }) {
  const [label, setLabel] = useState("");
  useEffect(() => {
    if (!field.relationModel || value == null || value === "") {
      setLabel("");
      return;
    }
    api<RuntimeModel>(`/api/model/${field.relationModel}/metadata`).then((relatedModel) => {
      const displayField = getDisplayField(relatedModel);
      return api<{ records: Record<string, unknown>[] }>("/api/model/read", { method: "POST", body: { model: field.relationModel, ids: [Number(value)], fields: [displayField] } }).then((data) => String(data.records[0]?.[displayField] ?? value));
    }).then(setLabel);
  }, [api, field.relationModel, value]);
  return <span>{label || String(value ?? "")}</span>;
}

export function getDisplayField(model: RuntimeModel) {
  return model.fields.find((field) => field.name === "name")?.name
    ?? model.fields.find((field) => field.name === "display_name")?.name
    ?? model.fields.find((field) => field.name === "technical_name")?.name
    ?? model.fields[0]?.name
    ?? "id";
}
