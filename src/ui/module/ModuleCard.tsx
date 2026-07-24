import { StyleSheet, Text, View } from "react-native";

import type { ModuleInfo } from "../../core/types";
import { ModuleActionButton } from "./ModuleActionButton";

type Action = "install" | "update" | "uninstall";

export function ModuleCard({ module, busy, onAction }: { module: ModuleInfo; busy: boolean; onAction: (type: Action) => void }) {
  const installed = module.state === "installed";
  return <View style={styles.card}><View style={styles.icon}><Text style={styles.iconText}>{module.displayName.slice(0, 1)}</Text></View><View style={styles.body}><Text style={styles.name}>{module.displayName}</Text><Text style={styles.technical}>{module.name} · v{module.version}</Text><Text style={styles.summary}>{module.summary}</Text><View style={styles.actions}>{installed ? <><ModuleActionButton label="Nâng cấp" onPress={() => onAction("update")} /><ModuleActionButton label="Gỡ" danger onPress={() => onAction("uninstall")} /></> : <ModuleActionButton label="Cài đặt" primary onPress={() => onAction("install")} />}</View></View><Text style={[styles.state, installed && styles.installed]}>{busy ? "ĐANG XỬ LÝ" : installed ? "ĐÃ CÀI" : "CHƯA CÀI"}</Text></View>;
}

const styles = StyleSheet.create({ card: { flexDirection: "row", gap: 12, padding: 15, borderRadius: 15, backgroundColor: "#FFF", borderWidth: 1, borderColor: "#E7E1E5" }, icon: { width: 45, height: 45, borderRadius: 12, backgroundColor: "#714B67", alignItems: "center", justifyContent: "center" }, iconText: { color: "#FFF", fontSize: 20, fontWeight: "900" }, body: { flex: 1 }, name: { color: "#342D34", fontSize: 16, fontWeight: "800" }, technical: { color: "#8A8188", fontSize: 10, marginTop: 2 }, summary: { color: "#6B6369", fontSize: 12, lineHeight: 17, marginTop: 8 }, state: { color: "#887F86", fontSize: 8, fontWeight: "900" }, installed: { color: "#347553" }, actions: { flexDirection: "row", gap: 8, marginTop: 12 } });
