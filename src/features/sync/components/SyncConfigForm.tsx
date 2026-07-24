import { StyleSheet, Text, TextInput, View } from "react-native";

export interface SyncFormValues { name: string; url: string; database: string; username: string; apiKey: string; batchSize: string }

export function SyncConfigForm({ values, onChange }: { values: SyncFormValues; onChange: (values: SyncFormValues) => void }) {
  const field = (key: keyof SyncFormValues, label: string, placeholder: string, secure = false) => <View style={styles.group}><Text style={styles.label}>{label}</Text><TextInput value={values[key]} onChangeText={(value) => onChange({ ...values, [key]: value })} placeholder={placeholder} autoCapitalize="none" autoCorrect={false} secureTextEntry={secure} keyboardType={key === "batchSize" ? "number-pad" : key === "url" ? "url" : "default"} style={styles.input} /></View>;
  return <View style={styles.card}>{field("name", "Tên kết nối", "Odoo chính")}{field("url", "URL Odoo", "https://company.odoo.com")}{field("database", "Database", "company_prod")}{field("username", "Tài khoản", "user@company.com")}{field("apiKey", "API key hoặc mật khẩu", "••••••••", true)}{field("batchSize", "Batch size", "50")}</View>;
}

const styles = StyleSheet.create({ card: { gap: 11, padding: 14, borderWidth: 1, borderColor: "#E3DDE1", borderRadius: 15, backgroundColor: "#FFF" }, group: { gap: 5 }, label: { color: "#62575E", fontSize: 10, fontWeight: "800" }, input: { height: 42, paddingHorizontal: 11, borderWidth: 1, borderColor: "#DCD4D9", borderRadius: 10, backgroundColor: "#FAF9F8", color: "#392F36", fontSize: 12 } });
