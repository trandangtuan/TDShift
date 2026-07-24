import { StyleSheet, Text, View } from "react-native";

import type { Environment } from "../../core/Environment";
import type { Many2manyField } from "../../core/fields";
import type { ModelValues } from "../../core/types";
import { RelationChip } from "./RelationChip";

export function Many2manyFieldInput({ env, name, field, value, relations, onChange }: { env: Environment; name: string; field: Many2manyField; value: unknown; relations: ModelValues[]; onChange: (value: unknown) => void }) {
  const selectedIds = (value as string[]) ?? [];
  const displayName = env.registry.getDefinition(field.comodelName).displayName;
  return <View style={styles.field}><Text style={styles.label}>{field.string || name}</Text><View style={styles.chips}>{relations.map((item) => {
    const id = item.id as string;
    const selected = selectedIds.includes(id);
    return <RelationChip key={id} label={String(item[displayName] ?? id)} selected={selected} onPress={() => onChange(selected ? selectedIds.filter((current) => current !== id) : [...selectedIds, id])} />;
  })}</View></View>;
}

const styles = StyleSheet.create({ field: { gap: 7 }, label: { color: "#554C54", fontSize: 13, fontWeight: "700" }, chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 } });
