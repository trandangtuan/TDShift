import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { RegisteredMenu } from "../../core/types";

export function MenuRow({ menu, activeModel, expanded, onToggle, onSelect }: { menu: RegisteredMenu; activeModel: string; expanded: Set<string>; onToggle: (id: string) => void; onSelect: (modelName: string) => void }) {
  const hasChildren = menu.children.length > 0;
  const isExpanded = expanded.has(menu.id);
  const active = menu.modelName === activeModel;
  const paddingLeft = 15 + (menu.level - 1) * 18;
  function press() { if (menu.modelName) onSelect(menu.modelName); else if (hasChildren) onToggle(menu.id); }
  return <><Pressable onPress={press} style={[styles.row, { paddingLeft }, active && styles.activeRow]}>{menu.level === 1 ? <View style={styles.rootIcon}><Ionicons name={(menu.icon ?? "folder-outline") as React.ComponentProps<typeof Ionicons>["name"]} size={19} color={active ? "#FFF" : "#714B67"} /></View> : <View style={[styles.dot, active && styles.activeDot]} />}<Text style={[styles.text, menu.level === 1 && styles.rootText, active && styles.activeText]} numberOfLines={1}>{menu.name}</Text>{hasChildren ? <Pressable hitSlop={10} onPress={() => onToggle(menu.id)}><Ionicons name={isExpanded ? "chevron-down" : "chevron-forward"} size={16} color={active ? "#FFF" : "#8B8188"} /></Pressable> : null}</Pressable>{hasChildren && isExpanded ? menu.children.map((child) => <MenuRow key={child.id} menu={child} activeModel={activeModel} expanded={expanded} onToggle={onToggle} onSelect={onSelect} />) : null}</>;
}

const styles = StyleSheet.create({ row: { minHeight: 46, flexDirection: "row", alignItems: "center", gap: 10, paddingRight: 13, borderRadius: 11, marginVertical: 2 }, activeRow: { backgroundColor: "#714B67" }, rootIcon: { width: 31, height: 31, borderRadius: 9, alignItems: "center", justifyContent: "center", backgroundColor: "#EFE5EB" }, dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#C5B9C1", marginHorizontal: 12 }, activeDot: { backgroundColor: "#FFF" }, text: { flex: 1, color: "#5D545A", fontSize: 13, fontWeight: "600" }, rootText: { color: "#393139", fontSize: 14, fontWeight: "800" }, activeText: { color: "#FFF" } });
