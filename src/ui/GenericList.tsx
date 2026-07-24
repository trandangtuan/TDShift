import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";

import type { Environment } from "../core/Environment";
import type { ModelValues } from "../core/types";
import { GenericForm } from "./GenericForm";

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

  function remove(record: ModelValues) {
    Alert.alert("Xóa bản ghi?", "Thao tác được lưu offline và có thể đồng bộ lên server sau này.", [
      { text: "Hủy", style: "cancel" },
      { text: "Xóa", style: "destructive", onPress: async () => { await env.model(modelName).unlink(record.id as string); await load(); } },
    ]);
  }

  return (
    <View style={styles.page}>
      <View style={styles.headingRow}>
        <View><Text style={styles.model}>{modelName}</Text><Text style={styles.heading}>{view.title}</Text></View>
        <Pressable style={styles.create} onPress={() => { setEditing(null); setFormOpen(true); }}><Ionicons name="add" size={21} color="#FFF" /><Text style={styles.createText}>Tạo</Text></Pressable>
      </View>
      <View style={styles.search}><Ionicons name="search" size={18} color="#8D858B" /><TextInput value={search} onChangeText={setSearch} placeholder="Tìm kiếm…" style={styles.searchInput} /></View>
      <FlatList
        data={records}
        keyExtractor={(item) => item.id as string}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor="#714B67" />}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>Chưa có bản ghi.</Text> : null}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => { setEditing(item); setFormOpen(true); }}>
            <View style={styles.cardBody}>
              {view.fields.map((name, index) => {
                const field = definition.fields[name];
                const value = item[name];
                const display = field?.kind === "boolean" ? (value ? "Có" : "Không") : Array.isArray(value) ? `${value.length} bản ghi` : String(value ?? "—");
                return index === 0
                  ? <Text key={name} style={styles.title} numberOfLines={1}>{display}</Text>
                  : <Text key={name} style={styles.line} numberOfLines={1}><Text style={styles.lineLabel}>{field?.string || name}: </Text>{display}</Text>;
              })}
              <Text style={styles.status}>{item.sync_status === "synced" ? "Đã đồng bộ" : "● Chờ đồng bộ"}</Text>
            </View>
            <Pressable style={styles.delete} onPress={() => remove(item)}><Ionicons name="trash-outline" size={18} color="#B54747" /></Pressable>
          </Pressable>
        )}
      />
      <GenericForm env={env} modelName={modelName} record={editing} visible={formOpen} onClose={() => setFormOpen(false)} onSaved={load} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F7F6F4" }, headingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18, paddingTop: 16 }, model: { color: "#8B7483", fontSize: 9, fontWeight: "800", letterSpacing: 1 }, heading: { color: "#302932", fontSize: 25, fontWeight: "800" },
  create: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 20, paddingVertical: 9, paddingHorizontal: 14, backgroundColor: "#714B67" }, createText: { color: "#FFF", fontWeight: "800" },
  search: { margin: 18, marginBottom: 5, height: 44, flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: "#DDD6DB", backgroundColor: "#FFF", borderRadius: 12, paddingHorizontal: 12 }, searchInput: { flex: 1, color: "#332D32" },
  list: { padding: 18, gap: 10, paddingBottom: 30 }, card: { flexDirection: "row", backgroundColor: "#FFF", padding: 14, borderRadius: 14, borderWidth: 1, borderColor: "#E7E1E5" }, cardBody: { flex: 1, gap: 4 }, title: { color: "#332C33", fontSize: 16, fontWeight: "800", marginBottom: 3 }, line: { color: "#756D73", fontSize: 12 }, lineLabel: { fontWeight: "700", color: "#5B5359" }, status: { color: "#94702A", fontSize: 9, fontWeight: "800", marginTop: 6 }, delete: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: "#FFF1F1" }, empty: { textAlign: "center", color: "#81787F", paddingTop: 60 },
});
