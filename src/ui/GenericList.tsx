import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";

import type { Environment } from "../core/Environment";
import type { ModelValues } from "../core/types";
import { GenericForm } from "./GenericForm";
import { ListHeader } from "./list/ListHeader";
import { ListSearchBar } from "./list/ListSearchBar";
import { RecordCard } from "./list/RecordCard";

export function GenericList({ env, modelName }: { env: Environment; modelName: string }) {
  const definition = env.registry.getDefinition(modelName);
  const view = env.registry.getViews(modelName).list;
  const [records, setRecords] = useState<ModelValues[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<ModelValues | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setRecords(await env.model(modelName).searchRead({ search, limit: 100 })); }
    finally { setLoading(false); }
  }, [env, modelName, search]);

  useEffect(() => { const timer = setTimeout(load, 150); return () => clearTimeout(timer); }, [load]);

  function create() { setEditing(null); setFormOpen(true); }
  function edit(record: ModelValues) { setEditing(record); setFormOpen(true); }
  function remove(record: ModelValues) {
    Alert.alert("Xóa bản ghi?", "Thao tác được lưu offline và có thể đồng bộ lên server sau này.", [
      { text: "Hủy", style: "cancel" },
      { text: "Xóa", style: "destructive", onPress: async () => { await env.model(modelName).unlink(record.id as string); await load(); } },
    ]);
  }

  return <View style={styles.page}>
    <ListHeader modelName={modelName} title={view.title} onCreate={create} />
    <ListSearchBar value={search} onChange={setSearch} />
    <FlatList data={records} keyExtractor={(item) => item.id as string} contentContainerStyle={styles.list} refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor="#714B67" />} ListEmptyComponent={!loading ? <Text style={styles.empty}>Chưa có bản ghi.</Text> : null} renderItem={({ item }) => <RecordCard record={item} fields={view.fields} definition={definition} onPress={() => edit(item)} onDelete={() => remove(item)} />} />
    <GenericForm env={env} modelName={modelName} record={editing} visible={formOpen} onClose={() => setFormOpen(false)} onSaved={load} />
  </View>;
}

const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: "#F7F6F4" }, list: { padding: 18, gap: 10, paddingBottom: 30 }, empty: { textAlign: "center", color: "#81787F", paddingTop: 60 } });
