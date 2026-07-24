import { StyleSheet, Text, View } from "react-native";

import type { SelectionField } from "../../core/fields";
import { RelationChip } from "./RelationChip";

export function SelectionFieldInput({ name, field, value, onChange }: { name: string; field: SelectionField; value: unknown; onChange: (value: unknown) => void }) {
  return <View style={styles.field}><Text style={styles.label}>{field.string || name}{field.required ? " *" : ""}</Text><View style={styles.options}>{field.selection.map(([key, label]) => <RelationChip key={key} label={label} selected={value === key} onPress={() => onChange(key)} />)}</View></View>;
}

const styles = StyleSheet.create({ field: { gap: 7 }, label: { color: "#554C54", fontSize: 13, fontWeight: "700" }, options: { flexDirection: "row", flexWrap: "wrap", gap: 8 } });
