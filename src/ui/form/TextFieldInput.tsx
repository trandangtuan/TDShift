import { StyleSheet, Text, TextInput, View } from "react-native";

import type { Field } from "../../core/fields";

export function TextFieldInput({ name, field, value, onChange }: { name: string; field: Field; value: unknown; onChange: (value: unknown) => void }) {
  const label = field.string || name;
  const placeholder = field.kind === "date" ? "YYYY-MM-DD" : field.kind === "datetime" ? "YYYY-MM-DDTHH:mm:ss" : label;
  const displayValue = field.kind === "json" && value && typeof value !== "string" ? JSON.stringify(value, null, 2) : String(value ?? "");
  const multiline = field.kind === "text" || field.kind === "json";
  return <View style={styles.field}><Text style={styles.label}>{label}{field.required ? " *" : ""}</Text><TextInput value={displayValue} onChangeText={onChange} editable={!field.readonly} multiline={multiline} keyboardType={field.kind === "integer" || field.kind === "float" ? "numeric" : "default"} placeholder={placeholder} style={[styles.input, multiline && styles.textarea]} /></View>;
}

const styles = StyleSheet.create({ field: { gap: 7 }, label: { color: "#554C54", fontSize: 13, fontWeight: "700" }, input: { minHeight: 48, borderWidth: 1, borderColor: "#DAD3D8", backgroundColor: "#FFF", borderRadius: 12, paddingHorizontal: 13, color: "#302A30" }, textarea: { height: 90, paddingTop: 12, textAlignVertical: "top" } });
