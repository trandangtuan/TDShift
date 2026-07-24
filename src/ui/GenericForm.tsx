import { useEffect, useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, View } from "react-native";

import type { Environment } from "../core/Environment";
import { BinaryField, Many2manyField, Many2oneField, One2manyField } from "../core/fields";
import type { ModelValues } from "../core/types";
import { FormFieldRenderer } from "./form/FormFieldRenderer";
import { FormHeader } from "./form/FormHeader";
import { FormSaveButton } from "./form/FormSaveButton";

interface Props {
  env: Environment;
  modelName: string;
  record: ModelValues | null;
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function GenericForm({ env, modelName, record, visible, onClose, onSaved }: Props) {
  const definition = env.registry.getDefinition(modelName);
  const view = env.registry.getViews(modelName).form;
  const [values, setValues] = useState<ModelValues>({});
  const [relations, setRelations] = useState<Record<string, ModelValues[]>>({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const initial: ModelValues = {};
    for (const [name, field] of Object.entries(definition.fields)) {
      initial[name] = record?.[name] ?? field.getDefault() ?? (field.kind === "many2many" || field.kind === "one2many" ? [] : "");
    }
    setValues(initial);
    setError("");
    Promise.all(view.fields.map(async (name) => {
      const field = definition.fields[name];
      if (field instanceof Many2oneField || field instanceof Many2manyField) {
        return [name, await env.model(field.comodelName).searchRead({ limit: 100 })] as const;
      }
      return [name, []] as const;
    })).then((entries) => setRelations(Object.fromEntries(entries)));
  }, [visible, record, modelName]);

  function setValue(name: string, value: unknown) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const payload: ModelValues = {};
      for (const name of view.fields) {
        const field = definition.fields[name];
        if (!field || field.readonly || field instanceof One2manyField) continue;
        const raw = values[name];
        payload[name] = field.kind === "integer" || field.kind === "float" ? Number(raw) || 0 : raw;
      }
      const saved = record
        ? await env.model(modelName).write(record.id as string, payload)
        : await env.model(modelName).create(payload);
      for (const [name, field] of Object.entries(definition.fields)) {
        const attachmentId = payload[name];
        if (field instanceof BinaryField && attachmentId) {
          await env.model("ir.attachment").write(attachmentId as string, { res_model: modelName, res_id: saved.id });
        }
      }
      onSaved();
      onClose();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không thể lưu bản ghi");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.page}>
        <FormHeader modelName={modelName} title={view.title} editing={Boolean(record)} onClose={onClose} />
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          {view.fields.map((name) => {
            const field = definition.fields[name];
            return field ? <FormFieldRenderer key={name} env={env} modelName={modelName} recordId={record?.id as string | undefined} name={name} field={field} value={values[name]} relations={relations[name] ?? []} onChange={(value) => setValue(name, value)} /> : null;
          })}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <FormSaveButton saving={saving} onPress={save} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F7F6F4" },
  form: { padding: 18, gap: 16, paddingBottom: 40 },
  error: { color: "#B42318", backgroundColor: "#FFF0F0", padding: 12, borderRadius: 10 },
});
