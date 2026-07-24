import { StyleSheet, Text, View } from "react-native";
import type { ModelValues } from "../../../core/types";

export function SyncLogList({ logs }: { logs: ModelValues[] }) {
  if (!logs.length) return <Text style={styles.empty}>Chưa có nhật ký đồng bộ.</Text>;
  return <View style={styles.list}>{logs.map((log) => <View key={log.id as string} style={styles.row}><View style={[styles.dot, log.level === "error" ? styles.error : log.level === "success" ? styles.success : styles.info]} /><View style={styles.body}><Text style={styles.name}>{String(log.name)}</Text>{log.details ? <Text style={styles.details} numberOfLines={3}>{String(log.details)}</Text> : null}<Text style={styles.meta}>{String(log.model_name || "Hệ thống")} · {String(log.logged_at || "")}</Text></View></View>)}</View>;
}

const styles = StyleSheet.create({ list: { gap: 7 }, row: { flexDirection: "row", gap: 9, padding: 10, borderRadius: 11, backgroundColor: "#FFF", borderWidth: 1, borderColor: "#E8E2E5" }, dot: { width: 8, height: 8, marginTop: 4, borderRadius: 4 }, error: { backgroundColor: "#C1454D" }, success: { backgroundColor: "#2E8158" }, info: { backgroundColor: "#5479A8" }, body: { flex: 1 }, name: { color: "#433941", fontSize: 11, fontWeight: "800" }, details: { color: "#7F747B", fontSize: 9, marginTop: 3 }, meta: { color: "#A0959C", fontSize: 8, marginTop: 4 }, empty: { color: "#948990", fontSize: 11, textAlign: "center", padding: 20 } });
