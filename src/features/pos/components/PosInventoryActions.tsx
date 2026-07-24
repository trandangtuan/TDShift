import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { InventoryOperation } from "../types";

export function PosInventoryActions({ onSelect }: { onSelect: (operation: InventoryOperation) => void }) {
  return <View style={styles.row}><Pressable style={[styles.button, styles.incoming]} onPress={() => onSelect("incoming")}><Ionicons name="qr-code-outline" size={17} color="#2D6E4D" /><Text style={[styles.text, styles.incomingText]}>Quét nhập kho</Text></Pressable><Pressable style={[styles.button, styles.outgoing]} onPress={() => onSelect("outgoing")}><Ionicons name="scan-outline" size={17} color="#8B4C36" /><Text style={[styles.text, styles.outgoingText]}>Quét xuất kho</Text></Pressable></View>;
}

const styles = StyleSheet.create({ row: { flexDirection: "row", gap: 8, paddingHorizontal: 17, marginBottom: 10 }, button: { flex: 1, height: 40, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, borderRadius: 11, borderWidth: 1 }, incoming: { backgroundColor: "#EAF5EF", borderColor: "#C7E4D3" }, outgoing: { backgroundColor: "#F8EEE9", borderColor: "#EACFC3" }, text: { fontSize: 11, fontWeight: "900" }, incomingText: { color: "#2D6E4D" }, outgoingText: { color: "#8B4C36" } });
