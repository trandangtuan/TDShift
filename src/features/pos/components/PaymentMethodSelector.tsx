import { Pressable, StyleSheet, Text, View } from "react-native";

import type { ModelValues } from "../../../core/types";

export function PaymentMethodSelector({ methods, selectedId, onSelect }: { methods: ModelValues[]; selectedId: string; onSelect: (id: string) => void }) {
  return <View style={styles.container}><Text style={styles.label}>PHƯƠNG THỨC THANH TOÁN</Text><View style={styles.methods}>{methods.map((method) => { const selected = method.id === selectedId; return <Pressable key={method.id as string} onPress={() => onSelect(method.id as string)} style={[styles.method, selected && styles.selected]}><Text style={[styles.text, selected && styles.selectedText]}>{String(method.name)}</Text></Pressable>; })}</View></View>;
}

const styles = StyleSheet.create({ container: { gap: 7 }, label: { color: "#887E85", fontSize: 9, fontWeight: "900", letterSpacing: 0.8 }, methods: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, method: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 11, borderWidth: 1, borderColor: "#D6CDD3", backgroundColor: "#FFF" }, selected: { backgroundColor: "#714B67", borderColor: "#714B67" }, text: { color: "#625960", fontSize: 12, fontWeight: "800" }, selectedText: { color: "#FFF" } });
