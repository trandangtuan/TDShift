import type { ViewDefinition } from "@record-platform/core";

export const moduleView: ViewDefinition[] = [
  { technicalName: "base.module.list", name: "Module", model: "core.module", type: "list", architecture: { type: "list", model: "core.module", fields: ["technical_name", "display_name", "version", "state", "installable", "auto_install"] } },
  {
    technicalName: "base.module.form",
    name: "Module",
    model: "core.module",
    type: "form",
    architecture: {
      type: "form",
      model: "core.module",
      children: [{ type: "group", children: [{ type: "field", name: "technical_name" }, { type: "field", name: "display_name" }, { type: "field", name: "version" }, { type: "field", name: "state" }, { type: "field", name: "installable" }, { type: "field", name: "auto_install" }, { type: "field", name: "sequence" }] }]
    }
  }
];
