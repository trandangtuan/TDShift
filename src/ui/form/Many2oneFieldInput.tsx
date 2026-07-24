import { StyleSheet, Text, View } from "react-native";

import type { Environment } from "../../core/Environment";
import type { Many2oneField } from "../../core/fields";
import type { ModelValues } from "../../core/types";
import { RelationChip } from "./RelationChip";

export function Many2oneFieldInput({ env, name, field, value, relations, onChange }: { env: Environment; name: string; field: Many2oneField; value: unknown; relations: ModelValues[]; onChange: (value: unknown) => void }) {
  const displayName = env.registry.getDefinition(field.comodelName).displayName;
  return <View style={styles.field}><Text style={styles.label}>{field.string || name}{field.required ? " *" : ""}</Text><View style={styles.chips}>{relations.map((item) => <RelationChip key={item.id as string} label={String(item[displayName] ?? item.id)} selected={value === item.id} onPress={() => onChange(item.id)} />)}</View></View>;
}

const styles = StyleSheet.create({ field: { gap: 7 }, label: { color: "#554C54", fontSize: 13, fontWeight: "700" }, chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 } });
