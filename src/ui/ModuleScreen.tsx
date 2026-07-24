import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import type { ModuleManager } from "../core/ModuleManager";
import type { ModuleInfo } from "../core/types";

export function ModuleScreen({ manager, onChanged }: { manager: ModuleManager; onChanged: () => void }) {
  const [modules, setModules] = useState<ModuleInfo[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const load = useCallback(async () => setModules(await manager.list()), [manager]);
  useEffect(() => { load(); }, [load]);

  async function action(module: ModuleInfo, type: "install" | "update" | "uninstall") {
    if (type === "uninstall") {
      Alert.alert("Gỡ module?", "Toàn bộ bảng và dữ liệu local thuộc module sẽ bị xóa.", [
        { text: "Hủy", style: "cancel" },
        { text: "Gỡ", style: "destructive", onPress: () => run(module, type) },
      ]);
      return;
    }
    await run(module, type);
  }

  async function run(module: ModuleInfo, type: "install" | "update" | "uninstall") {
    setBusy(module.name);
    try {
      await manager[type](module.name);
      await load();
      onChanged();
    } catch (reason) { Alert.alert("Lỗi module", reason instanceof Error ? reason.message : "Không thể thực hiện"); }
    finally { setBusy(null); }
  }

  return (
    <View style={styles.page}>
      <View style={styles.heading}><Text style={styles.overline}>PLUGIN REGISTRY</Text><Text style={styles.title}>Ứng dụng</Text><Text style={styles.subtitle}>Cài đặt, nâng cấp hoặc gỡ module local.</Text></View>
      <FlatList data={modules} keyExtractor={(item) => item.name} contentContainerStyle={styles.list} renderItem={({ item }) => {
        const installed = item.state === "installed";
        return <View style={styles.card}>
          <View style={styles.icon}><Text style={styles.iconText}>{item.displayName.slice(0, 1)}</Text></View>
          <View style={styles.body}><Text style={styles.name}>{item.displayName}</Text><Text style={styles.technical}>{item.name} · v{item.version}</Text><Text style={styles.summary}>{item.summary}</Text>
            <View style={styles.actions}>
              {installed ? <><Button label="Nâng cấp" onPress={() => action(item, "update")} /><Button label="Gỡ" danger onPress={() => action(item, "uninstall")} /></> : <Button label="Cài đặt" primary onPress={() => action(item, "install")} />}
            </View>
          </View>
          <Text style={[styles.state, installed && styles.installed]}>{busy === item.name ? "ĐANG XỬ LÝ" : installed ? "ĐÃ CÀI" : "CHƯA CÀI"}</Text>
        </View>;
      }} />
    </View>
  );
}

function Button({ label, onPress, primary, danger }: { label: string; onPress: () => void; primary?: boolean; danger?: boolean }) {
  return <Pressable onPress={onPress} style={[styles.button, primary && styles.primaryButton, danger && styles.dangerButton]}><Text style={[styles.buttonText, primary && styles.primaryText, danger && styles.dangerText]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F7F6F4" }, heading: { padding: 18, paddingBottom: 8 }, overline: { color: "#8B7483", fontSize: 10, fontWeight: "800", letterSpacing: 1.2 }, title: { color: "#302932", fontSize: 28, fontWeight: "800" }, subtitle: { color: "#7C747A", marginTop: 3 }, list: { padding: 18, gap: 12 }, card: { flexDirection: "row", gap: 12, padding: 15, borderRadius: 15, backgroundColor: "#FFF", borderWidth: 1, borderColor: "#E7E1E5" }, icon: { width: 45, height: 45, borderRadius: 12, backgroundColor: "#714B67", alignItems: "center", justifyContent: "center" }, iconText: { color: "#FFF", fontSize: 20, fontWeight: "900" }, body: { flex: 1 }, name: { color: "#342D34", fontSize: 16, fontWeight: "800" }, technical: { color: "#8A8188", fontSize: 10, marginTop: 2 }, summary: { color: "#6B6369", fontSize: 12, lineHeight: 17, marginTop: 8 }, state: { color: "#887F86", fontSize: 8, fontWeight: "900" }, installed: { color: "#347553" }, actions: { flexDirection: "row", gap: 8, marginTop: 12 }, button: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 9, borderWidth: 1, borderColor: "#CFC7CC" }, buttonText: { color: "#61585F", fontSize: 11, fontWeight: "800" }, primaryButton: { backgroundColor: "#714B67", borderColor: "#714B67" }, primaryText: { color: "#FFF" }, dangerButton: { borderColor: "#E3B5B5" }, dangerText: { color: "#B54747" },
});
