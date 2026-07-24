import { StyleSheet, Switch, Text, View } from "react-native";

import type { Field } from "../../core/fields";

export function BooleanFieldInput({ name, field, value, onChange }: { name: string; field: Field; value: unknown; onChange: (value: unknown) => void }) {
  return <View style={styles.row}><Text style={styles.label}>{field.string || name}</Text><Switch value={Boolean(value)} onValueChange={onChange} disabled={field.readonly} /></View>;
}

const styles = StyleSheet.create({ row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 4 }, label: { color: "#554C54", fontSize: 13, fontWeight: "700" } });
