import { StyleSheet, Text, View } from "react-native";

import type { Environment } from "../../core/Environment";
import type { BinaryField } from "../../core/fields";
import { BinaryFieldInput } from "../BinaryFieldInput";

export function BinaryFormField({ env, name, field, value, modelName, recordId, onChange }: { env: Environment; name: string; field: BinaryField; value: unknown; modelName: string; recordId?: string; onChange: (value: unknown) => void }) {
  return <View style={styles.field}><Text style={styles.label}>{field.string || name}{field.required ? " *" : ""}</Text><BinaryFieldInput env={env} field={field} value={String(value ?? "")} resModel={modelName} resId={recordId} onChange={onChange} /></View>;
}

const styles = StyleSheet.create({ field: { gap: 7 }, label: { color: "#554C54", fontSize: 13, fontWeight: "700" } });
