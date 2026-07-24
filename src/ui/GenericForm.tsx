import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";

import { Many2manyField, Many2oneField, One2manyField } from "../core/fields";
import type { Environment } from "../core/Environment";
import type { ModelValues } from "../core/types";

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

  function set(name: string, value: unknown) { setValues((current) => ({ ...current, [name]: value })); }

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
      if (record) await env.model(modelName).write(record.id as string, payload);
      else await env.model(modelName).create(payload);
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
        <View style={styles.header}>
          <View><Text style={styles.model}>{modelName}</Text><Text style={styles.title}>{record ? "Chỉnh sửa" : "Tạo"} {view.title}</Text></View>
          <Pressable onPress={onClose}><Text style={styles.close}>Đóng</Text></Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          {view.fields.map((name) => {
            const field = definition.fields[name];
            if (!field) return null;
            const label = field.string || name;
            if (field.kind === "boolean") return (
              <View style={styles.toggle} key={name}><Text style={styles.label}>{label}</Text><Switch value={Boolean(values[name])} onValueChange={(value) => set(name, value)} /></View>
            );
            if (field instanceof Many2oneField) return (
              <View style={styles.field} key={name}><Text style={styles.label}>{label}{field.required ? " *" : ""}</Text><View style={styles.chips}>
                {(relations[name] ?? []).map((item) => <Chip key={item.id as string} label={String(item[env.registry.getDefinition(field.comodelName).displayName] ?? item.id)} selected={values[name] === item.id} onPress={() => set(name, item.id)} />)}
              </View></View>
            );
            if (field instanceof Many2manyField) return (
              <View style={styles.field} key={name}><Text style={styles.label}>{label}</Text><View style={styles.chips}>
                {(relations[name] ?? []).map((item) => {
                  const selected = ((values[name] as string[]) ?? []).includes(item.id as string);
                  return <Chip key={item.id as string} label={String(item[env.registry.getDefinition(field.comodelName).displayName] ?? item.id)} selected={selected} onPress={() => set(name, selected ? (values[name] as string[]).filter((id) => id !== item.id) : [...((values[name] as string[]) ?? []), item.id])} />;
                })}
              </View></View>
            );
            if (field instanceof One2manyField) return <View style={styles.readonly} key={name}><Text style={styles.label}>{label}</Text><Text style={styles.readonlyText}>{((values[name] as string[]) ?? []).length} bản ghi liên quan</Text></View>;
            return (
              <View style={styles.field} key={name}>
                <Text style={styles.label}>{label}{field.required ? " *" : ""}</Text>
                <TextInput
                  value={String(values[name] ?? "")}
                  onChangeText={(value) => set(name, value)}
                  editable={!field.readonly}
                  multiline={field.kind === "text"}
                  keyboardType={field.kind === "integer" || field.kind === "float" ? "numeric" : "default"}
                  placeholder={field.kind === "date" ? "YYYY-MM-DD" : label}
                  style={[styles.input, field.kind === "text" && styles.textarea]}
                />
              </View>
            );
          })}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable onPress={save} disabled={saving} style={styles.save}><Text style={styles.saveText}>{saving ? "Đang lưu…" : "Lưu offline"}</Text></Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}><Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F7F6F4" }, header: { padding: 20, paddingTop: 56, backgroundColor: "#FFF", flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#E7E1E5" },
  model: { fontSize: 10, fontWeight: "800", color: "#876E7E", letterSpacing: 1 }, title: { fontSize: 24, fontWeight: "800", color: "#302832", marginTop: 3 }, close: { color: "#714B67", fontWeight: "800" },
  form: { padding: 18, gap: 16, paddingBottom: 40 }, field: { gap: 7 }, label: { color: "#554C54", fontSize: 13, fontWeight: "700" },
  input: { minHeight: 48, borderWidth: 1, borderColor: "#DAD3D8", backgroundColor: "#FFF", borderRadius: 12, paddingHorizontal: 13, color: "#302A30" }, textarea: { height: 90, paddingTop: 12, textAlignVertical: "top" },
  toggle: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 4 }, chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, chip: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 18, borderWidth: 1, borderColor: "#D8D1D6", backgroundColor: "#FFF" }, chipSelected: { backgroundColor: "#EEE2EA", borderColor: "#714B67" }, chipText: { color: "#665E64", fontSize: 12, fontWeight: "600" }, chipTextSelected: { color: "#714B67" },
  readonly: { padding: 13, gap: 4, borderRadius: 11, backgroundColor: "#EEEAEF" }, readonlyText: { color: "#756D74", fontSize: 13 }, error: { color: "#B42318", backgroundColor: "#FFF0F0", padding: 12, borderRadius: 10 }, save: { height: 52, alignItems: "center", justifyContent: "center", backgroundColor: "#714B67", borderRadius: 14 }, saveText: { color: "#FFF", fontSize: 16, fontWeight: "800" },
});
