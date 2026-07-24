import { Pressable, StyleSheet, Text } from "react-native";

export function FormSaveButton({ saving, onPress }: { saving: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} disabled={saving} style={styles.button}><Text style={styles.text}>{saving ? "Đang lưu…" : "Lưu offline"}</Text></Pressable>;
}

const styles = StyleSheet.create({ button: { height: 52, alignItems: "center", justifyContent: "center", backgroundColor: "#714B67", borderRadius: 14 }, text: { color: "#FFF", fontSize: 16, fontWeight: "800" } });
