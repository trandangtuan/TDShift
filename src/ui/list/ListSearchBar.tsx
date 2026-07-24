import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TextInput, View } from "react-native";

export function ListSearchBar({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <View style={styles.search}><Ionicons name="search" size={18} color="#8D858B" /><TextInput value={value} onChangeText={onChange} placeholder="Tìm kiếm…" style={styles.input} /></View>;
}

const styles = StyleSheet.create({ search: { margin: 18, marginBottom: 5, height: 44, flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: "#DDD6DB", backgroundColor: "#FFF", borderRadius: 12, paddingHorizontal: 12 }, input: { flex: 1, color: "#332D32" } });
