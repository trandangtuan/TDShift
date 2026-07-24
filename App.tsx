import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { bootstrap, env, moduleManager } from "./src/runtime/runtime";
import { GenericList } from "./src/ui/GenericList";
import { ModuleScreen } from "./src/ui/ModuleScreen";

type Section = "data" | "modules";

export default function App() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [section, setSection] = useState<Section>("data");
  const [modelName, setModelName] = useState("");
  const [revision, setRevision] = useState(0);

  useEffect(() => { bootstrap().then(() => setReady(true)).catch((reason) => setError(reason instanceof Error ? reason.message : "Lỗi khởi tạo")); }, []);

  const models = ready ? env.registry.listModels() : [];
  const selected = models.some((item) => item.name === modelName) ? modelName : models[0]?.name ?? "";

  if (!ready) return <SafeAreaView style={styles.loading}><StatusBar style="dark" />{error ? <Text style={styles.error}>{error}</Text> : <><ActivityIndicator size="large" color="#714B67" /><Text>Đang nạp ORM registry…</Text></>}</SafeAreaView>;

  return (
    <SafeAreaView style={styles.app} key={revision}>
      <StatusBar style="dark" />
      <View style={styles.topbar}><Text style={styles.brand}>mini<Text style={styles.brandAccent}>Odoo</Text></Text><View style={styles.local}><View style={styles.dot} /><Text style={styles.localText}>OFFLINE ORM</Text></View></View>
      {section === "data" ? <>
        {models.length ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.models}>{models.map((model) => <Pressable key={model.name} onPress={() => setModelName(model.name)} style={[styles.modelChip, selected === model.name && styles.modelChipSelected]}><Text style={[styles.modelText, selected === model.name && styles.modelTextSelected]}>{model.description}</Text></Pressable>)}</ScrollView> : null}
        <View style={styles.content}>{selected ? <GenericList env={env} modelName={selected} /> : <View style={styles.noModule}><Text style={styles.noModuleTitle}>Chưa có model</Text><Text style={styles.noModuleText}>Mở Ứng dụng để cài một module plugin.</Text></View>}</View>
      </> : <View style={styles.content}><ModuleScreen manager={moduleManager} onChanged={() => setRevision((value) => value + 1)} /></View>}
      <View style={styles.nav}><NavButton active={section === "data"} icon="server-outline" label="Dữ liệu" onPress={() => setSection("data")} /><NavButton active={section === "modules"} icon="apps-outline" label="Ứng dụng" onPress={() => setSection("modules")} /></View>
    </SafeAreaView>
  );
}

function NavButton({ active, icon, label, onPress }: { active: boolean; icon: React.ComponentProps<typeof Ionicons>["name"]; label: string; onPress: () => void }) {
  return <Pressable style={styles.navButton} onPress={onPress}><Ionicons name={icon} size={21} color={active ? "#714B67" : "#928990"} /><Text style={[styles.navText, active && styles.navActive]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: "#F7F6F4" }, loading: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, backgroundColor: "#F7F6F4" }, error: { color: "#B42318", padding: 20 }, topbar: { height: 55, paddingHorizontal: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#FFF", borderBottomWidth: 1, borderBottomColor: "#E8E2E6" }, brand: { color: "#372E35", fontSize: 21, fontWeight: "900" }, brandAccent: { color: "#714B67" }, local: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 13, backgroundColor: "#EEE5EB" }, dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#714B67" }, localText: { color: "#714B67", fontSize: 8, fontWeight: "900", letterSpacing: 0.7 },
  models: { gap: 8, padding: 10, backgroundColor: "#FFF", borderBottomWidth: 1, borderBottomColor: "#EEE9EC" }, modelChip: { height: 34, justifyContent: "center", paddingHorizontal: 13, borderRadius: 17, backgroundColor: "#F1EEF0" }, modelChipSelected: { backgroundColor: "#714B67" }, modelText: { color: "#6F666D", fontSize: 11, fontWeight: "700" }, modelTextSelected: { color: "#FFF" }, content: { flex: 1 }, nav: { height: 62, flexDirection: "row", backgroundColor: "#FFF", borderTopWidth: 1, borderTopColor: "#E4DEE2" }, navButton: { flex: 1, alignItems: "center", justifyContent: "center", gap: 3 }, navText: { color: "#928990", fontSize: 10, fontWeight: "700" }, navActive: { color: "#714B67" }, noModule: { flex: 1, alignItems: "center", justifyContent: "center" }, noModuleTitle: { fontSize: 18, fontWeight: "800", color: "#443A42" }, noModuleText: { color: "#81787F", marginTop: 5 },
});
