import { Pressable, StyleSheet, Text, View } from "react-native";

export function FormHeader({ modelName, title, editing, onClose }: { modelName: string; title: string; editing: boolean; onClose: () => void }) {
  return <View style={styles.header}><View><Text style={styles.model}>{modelName}</Text><Text style={styles.title}>{editing ? "Chỉnh sửa" : "Tạo"} {title}</Text></View><Pressable onPress={onClose}><Text style={styles.close}>Đóng</Text></Pressable></View>;
}

const styles = StyleSheet.create({
  header: { padding: 20, paddingTop: 56, backgroundColor: "#FFF", flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#E7E1E5" },
  model: { fontSize: 10, fontWeight: "800", color: "#876E7E", letterSpacing: 1 },
  title: { fontSize: 24, fontWeight: "800", color: "#302832", marginTop: 3 },
  close: { color: "#714B67", fontWeight: "800" },
});
