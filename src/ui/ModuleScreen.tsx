import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";

import type { ModuleManager } from "../core/ModuleManager";
import type { ModuleInfo } from "../core/types";
import { ModuleCard } from "./module/ModuleCard";

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
      <FlatList data={modules} keyExtractor={(item) => item.name} contentContainerStyle={styles.list} renderItem={({ item }) => <ModuleCard module={item} busy={busy === item.name} onAction={(type) => action(item, type)} />} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F7F6F4" }, heading: { padding: 18, paddingBottom: 8 }, overline: { color: "#8B7483", fontSize: 10, fontWeight: "800", letterSpacing: 1.2 }, title: { color: "#302932", fontSize: 28, fontWeight: "800" }, subtitle: { color: "#7C747A", marginTop: 3 }, list: { padding: 18, gap: 12 },
});
