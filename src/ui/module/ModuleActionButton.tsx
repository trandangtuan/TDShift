import { Pressable, StyleSheet, Text } from "react-native";

export function ModuleActionButton({ label, onPress, primary, danger }: { label: string; onPress: () => void; primary?: boolean; danger?: boolean }) {
  return <Pressable onPress={onPress} style={[styles.button, primary && styles.primary, danger && styles.danger]}><Text style={[styles.text, primary && styles.primaryText, danger && styles.dangerText]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({ button: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 9, borderWidth: 1, borderColor: "#CFC7CC" }, text: { color: "#61585F", fontSize: 11, fontWeight: "800" }, primary: { backgroundColor: "#714B67", borderColor: "#714B67" }, primaryText: { color: "#FFF" }, danger: { borderColor: "#E3B5B5" }, dangerText: { color: "#B54747" } });
