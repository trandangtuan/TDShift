import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { bootstrap, env, moduleManager } from "./src/runtime/runtime";
import { GenericList } from "./src/ui/GenericList";
import { ModuleScreen } from "./src/ui/ModuleScreen";
import { MenuDrawer } from "./src/ui/MenuDrawer";
import { BottomNavButton } from "./src/ui/navigation/BottomNavButton";

type Section = "data" | "modules";

export default function App() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [section, setSection] = useState<Section>("data");
  const [modelName, setModelName] = useState("");
  const [revision, setRevision] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { bootstrap().then(() => setReady(true)).catch((reason) => setError(reason instanceof Error ? reason.message : "Lỗi khởi tạo")); }, []);

  const models = ready ? env.registry.listModels() : [];
  const menus = ready ? env.registry.getMenuTree() : [];
  const selected = models.some((item) => item.name === modelName) ? modelName : models[0]?.name ?? "";

  if (!ready) return <SafeAreaView style={styles.loading}><StatusBar style="dark" />{error ? <Text style={styles.error}>{error}</Text> : <><ActivityIndicator size="large" color="#714B67" /><Text>Đang nạp ORM registry…</Text></>}</SafeAreaView>;

  return (
    <SafeAreaView style={styles.app} key={revision}>
      <StatusBar style="dark" />
      <View style={styles.topbar}>
        <View style={styles.topbarLeft}>
          <Pressable style={styles.menuButton} onPress={() => setMenuOpen(true)}><Ionicons name="menu" size={24} color="#714B67" /></Pressable>
          <Text style={styles.brand}>TD<Text style={styles.brandAccent}>shift</Text></Text>
        </View>
        <View style={styles.local}><View style={styles.dot} /><Text style={styles.localText}>OFFLINE ORM</Text></View>
      </View>
      {section === "data" ?
          <View style={styles.content}>
            {selected ? <GenericList env={env} modelName={selected} />
            : <View style={styles.noModule}>
                <Text style={styles.noModuleTitle}>Chưa có model</Text>
                <Text style={styles.noModuleText}>Mở Ứng dụng để cài một module plugin.</Text></View>}
              </View>
        :
        <View style={styles.content}>
          <ModuleScreen manager={moduleManager} onChanged={() => setRevision((value) => value + 1)} /></View>
      }
      <View style={styles.nav}>
        <BottomNavButton active={section === "data"} icon="server-outline" label="Dữ liệu" onPress={() => setSection("data")} /><BottomNavButton active={section === "modules"} icon="apps-outline" label="Ứng dụng" onPress={() => setSection("modules")} /></View>
      <MenuDrawer
        visible={menuOpen}
        menus={menus}
        activeModel={selected}
        onClose={() => setMenuOpen(false)}
        onSelect={(nextModel) => { setModelName(nextModel); setSection("data"); }}
        onOpenModules={() => setSection("modules")}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: "#F7F6F4" }, loading: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, backgroundColor: "#F7F6F4" }, error: { color: "#B42318", padding: 20 }, topbar: { height: 55, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#FFF", borderBottomWidth: 1, borderBottomColor: "#E8E2E6" }, topbarLeft: { flexDirection: "row", alignItems: "center", gap: 10 }, menuButton: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: "#F1E9EE" }, brand: { color: "#372E35", fontSize: 21, fontWeight: "900" }, brandAccent: { color: "#714B67" }, local: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 13, backgroundColor: "#EEE5EB" }, dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#714B67" }, localText: { color: "#714B67", fontSize: 8, fontWeight: "900", letterSpacing: 0.7 },
  models: { gap: 8, padding: 10, backgroundColor: "#FFF", borderBottomWidth: 1, borderBottomColor: "#EEE9EC" }, modelChip: { height: 34, justifyContent: "center", paddingHorizontal: 13, borderRadius: 17, backgroundColor: "#F1EEF0" }, modelChipSelected: { backgroundColor: "#714B67" }, modelText: { color: "#6F666D", fontSize: 11, fontWeight: "700" }, modelTextSelected: { color: "#FFF" }, content: { flex: 1 }, nav: { height: 62, flexDirection: "row", backgroundColor: "#FFF", borderTopWidth: 1, borderTopColor: "#E4DEE2" }, noModule: { flex: 1, alignItems: "center", justifyContent: "center" }, noModuleTitle: { fontSize: 18, fontWeight: "800", color: "#443A42" }, noModuleText: { color: "#81787F", marginTop: 5 },
});
