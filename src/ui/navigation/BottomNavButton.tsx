import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text } from "react-native";

export function BottomNavButton({ active, icon, label, onPress }: { active: boolean; icon: React.ComponentProps<typeof Ionicons>["name"]; label: string; onPress: () => void }) {
  return <Pressable style={styles.button} onPress={onPress}><Ionicons name={icon} size={21} color={active ? "#714B67" : "#928990"} /><Text style={[styles.text, active && styles.active]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({ button: { flex: 1, alignItems: "center", justifyContent: "center", gap: 3 }, text: { color: "#928990", fontSize: 10, fontWeight: "700" }, active: { color: "#714B67" } });
