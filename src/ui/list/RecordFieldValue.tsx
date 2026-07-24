import { StyleSheet, Text } from "react-native";

import { SelectionField, type Field } from "../../core/fields";

export function RecordFieldValue({ field, name, value, primary }: { field?: Field; name: string; value: unknown; primary: boolean }) {
  const display = field?.kind === "boolean"
    ? (value ? "Có" : "Không")
    : field instanceof SelectionField
      ? field.selection.find(([key]) => key === value)?.[1] ?? String(value ?? "—")
      : Array.isArray(value) ? `${value.length} bản ghi` : String(value ?? "—");
  return primary ? <Text style={styles.title} numberOfLines={1}>{display}</Text> : <Text style={styles.line} numberOfLines={1}><Text style={styles.label}>{field?.string || name}: </Text>{display}</Text>;
}

const styles = StyleSheet.create({ title: { color: "#332C33", fontSize: 16, fontWeight: "800", marginBottom: 3 }, line: { color: "#756D73", fontSize: 12 }, label: { fontWeight: "700", color: "#5B5359" } });
