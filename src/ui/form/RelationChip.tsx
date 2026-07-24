import { Pressable, StyleSheet, Text } from "react-native";

export function RelationChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.chip, selected && styles.selected]}><Text style={[styles.text, selected && styles.selectedText]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({ chip: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 18, borderWidth: 1, borderColor: "#D8D1D6", backgroundColor: "#FFF" }, selected: { backgroundColor: "#EEE2EA", borderColor: "#714B67" }, text: { color: "#665E64", fontSize: 12, fontWeight: "600" }, selectedText: { color: "#714B67" } });
