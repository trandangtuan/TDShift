import type { ModelDefinition } from "@record-platform/core";

export const moduleModel: ModelDefinition = {
  technicalName: "core.module",
  name: "Module",
  tableName: "core_module",
  fields: [
    { name: "technical_name", label: "Technical Name", type: "char", required: true, indexed: true, sequence: 10 },
    { name: "display_name", label: "Display Name", type: "char", required: true, sequence: 20 },
    { name: "version", label: "Version", type: "char", required: true, sequence: 30 },
    {
      name: "state",
      label: "State",
      type: "selection",
      required: true,
      selectionOptions: [
        { label: "Uninstalled", value: "UNINSTALLED" },
        { label: "Installed", value: "INSTALLED" },
        { label: "Disabled", value: "DISABLED" }
      ],
      sequence: 40
    },
    { name: "installable", label: "Installable", type: "boolean", sequence: 50 },
    { name: "auto_install", label: "Auto Install", type: "boolean", sequence: 60 },
    { name: "sequence", label: "Sequence", type: "integer", sequence: 70 }
  ]
};
