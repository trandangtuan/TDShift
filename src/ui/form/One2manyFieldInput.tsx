import { StyleSheet, Text, View } from "react-native";

import type { Field } from "../../core/fields";

export function One2manyFieldInput({ name, field, value }: { name: string; field: Field; value: unknown }) {
  return <View style={styles.box}><Text style={styles.label}>{field.string || name}</Text><Text style={styles.value}>{((value as string[]) ?? []).length} bản ghi liên quan</Text></View>;
}

const styles = StyleSheet.create({ box: { padding: 13, gap: 4, borderRadius: 11, backgroundColor: "#EEEAEF" }, label: { color: "#554C54", fontSize: 13, fontWeight: "700" }, value: { color: "#756D74", fontSize: 13 } });
