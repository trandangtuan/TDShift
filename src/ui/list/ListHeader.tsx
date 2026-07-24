import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

export function ListHeader({ modelName, title, onCreate }: { modelName: string; title: string; onCreate: () => void }) {
  return <View style={styles.row}><View><Text style={styles.model}>{modelName}</Text><Text style={styles.heading}>{title}</Text></View><Pressable style={styles.create} onPress={onCreate}><Ionicons name="add" size={21} color="#FFF" /><Text style={styles.createText}>Tạo</Text></Pressable></View>;
}

const styles = StyleSheet.create({ row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18, paddingTop: 16 }, model: { color: "#8B7483", fontSize: 9, fontWeight: "800", letterSpacing: 1 }, heading: { color: "#302932", fontSize: 25, fontWeight: "800" }, create: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 20, paddingVertical: 9, paddingHorizontal: 14, backgroundColor: "#714B67" }, createText: { color: "#FFF", fontWeight: "800" } });
