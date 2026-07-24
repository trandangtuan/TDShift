import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import type { Environment } from "../../core/Environment";
import type { One2manyField } from "../../core/fields";
import type { ModelValues } from "../../core/types";
import { GenericForm } from "../GenericForm";
import { RecordCard } from "../list/RecordCard";

export function One2manyFieldInput({ env, name, field, parentId }: { env: Environment; name: string; field: One2manyField; parentId?: string }) {
  const definition = env.registry.getDefinition(field.comodelName);
  const listView = env.registry.getViews(field.comodelName).list;
  const [records, setRecords] = useState<ModelValues[]>([]);
  const [editing, setEditing] = useState<ModelValues | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const forcedValues = useMemo<ModelValues>(() => parentId ? { [field.inverseName]: parentId } : {}, [field.inverseName, parentId]);

  const load = useCallback(async () => {
    if (!parentId) { setRecords([]); return; }
    setRecords(await env.model(field.comodelName).searchRead({ where: { [field.inverseName]: parentId }, limit: 100 }));
  }, [env, field.comodelName, field.inverseName, parentId]);

  useEffect(() => { load(); }, [load]);

  function create() {
    if (!parentId) { Alert.alert("Hãy lưu bản ghi cha", "Sau khi bản ghi cha có ID local, bạn có thể thêm các dòng chi tiết."); return; }
    setEditing(null);
    setFormOpen(true);
  }

  function remove(record: ModelValues) {
    Alert.alert("Xóa dòng?", "Dòng này sẽ được xóa khỏi danh sách quan hệ.", [
      { text: "Hủy", style: "cancel" },
      { text: "Xóa", style: "destructive", onPress: async () => { await env.model(field.comodelName).unlink(record.id as string); await load(); } },
    ]);
  }

  return <View style={styles.container}>
    <View style={styles.header}><View><Text style={styles.label}>{field.string || name}</Text><Text style={styles.count}>{records.length} dòng</Text></View><Pressable style={[styles.add, !parentId && styles.disabled]} onPress={create}><Ionicons name="add" size={16} color="#714B67" /><Text style={styles.addText}>Thêm dòng</Text></Pressable></View>
    <View style={styles.list}>{records.length ? records.map((record) => <RecordCard key={record.id as string} record={record} fields={listView.fields} definition={definition} onPress={() => { setEditing(record); setFormOpen(true); }} onDelete={() => remove(record)} />) : <View style={styles.empty}><Text style={styles.emptyText}>{parentId ? "Chưa có dòng chi tiết" : "Lưu bản ghi cha để thêm dòng"}</Text></View>}</View>
    <GenericForm env={env} modelName={field.comodelName} record={editing} visible={formOpen} forcedValues={forcedValues} onClose={() => setFormOpen(false)} onSaved={load} />
  </View>;
}

const styles = StyleSheet.create({
  container: { gap: 10, padding: 12, borderRadius: 13, backgroundColor: "#EEEAEF" }, header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, label: { color: "#554C54", fontSize: 13, fontWeight: "800" }, count: { color: "#8A8087", fontSize: 9, marginTop: 2 }, add: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 9, borderWidth: 1, borderColor: "#CBBCC6", backgroundColor: "#FFF" }, disabled: { opacity: 0.45 }, addText: { color: "#714B67", fontSize: 10, fontWeight: "800" }, list: { gap: 8 }, empty: { minHeight: 54, alignItems: "center", justifyContent: "center", borderRadius: 9, borderWidth: 1, borderStyle: "dashed", borderColor: "#CCC2C8" }, emptyText: { color: "#8B8188", fontSize: 11 },
});
