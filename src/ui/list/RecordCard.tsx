import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { ModelDefinition, ModelValues } from "../../core/types";
import { RecordFieldValue } from "./RecordFieldValue";

export function RecordCard({ record, fields, definition, onPress, onDelete }: { record: ModelValues; fields: string[]; definition: ModelDefinition; onPress: () => void; onDelete: () => void }) {
  return <Pressable style={styles.card} onPress={onPress}><View style={styles.body}>{fields.map((name, index) => <RecordFieldValue key={name} name={name} field={definition.fields[name]} value={record[name]} primary={index === 0} />)}<Text style={styles.status}>{record.sync_status === "synced" ? "Đã đồng bộ" : "● Chờ đồng bộ"}</Text></View><Pressable style={styles.delete} onPress={onDelete}><Ionicons name="trash-outline" size={18} color="#B54747" /></Pressable></Pressable>;
}

const styles = StyleSheet.create({ card: { flexDirection: "row", backgroundColor: "#FFF", padding: 14, borderRadius: 14, borderWidth: 1, borderColor: "#E7E1E5" }, body: { flex: 1, gap: 4 }, status: { color: "#94702A", fontSize: 9, fontWeight: "800", marginTop: 6 }, delete: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: "#FFF1F1" } });
