import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { menuTarget, type RegisteredMenu } from "../core/types";
import { MenuRow } from "./menu/MenuRow";

interface Props {
  visible: boolean;
  menus: RegisteredMenu[];
  activeTarget: string;
  onClose: () => void;
  onSelect: (menu: RegisteredMenu) => void;
  onOpenModules: () => void;
}

export function MenuDrawer({ visible, menus, activeTarget, onClose, onSelect, onOpenModules }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!visible) return;
    const initial = new Set<string>();
    function visit(items: RegisteredMenu[], ancestors: string[]): boolean {
      let found = false;
      for (const item of items) {
        const childActive = visit(item.children, [...ancestors, item.id]);
        if (menuTarget(item) === activeTarget || childActive) {
          ancestors.forEach((id) => initial.add(id));
          if (item.children.length) initial.add(item.id);
          found = true;
        }
      }
      return found;
    }
    visit(menus, []);
    setExpanded(initial);
  }, [visible, activeTarget, menus]);

  function toggle(id: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.drawer}>
          <View style={styles.header}>
            <View>
              <Text style={styles.brand}>TD<Text style={styles.brandAccent}>shift</Text></Text>
              <Text style={styles.caption}>DANH SÁCH MENU</Text>
            </View>
            <Pressable style={styles.close} onPress={onClose}><Ionicons name="close" size={23} color="#564B53" /></Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.menuList}>
            {menus.length ? menus.map((menu) => (
              <MenuRow key={menu.id} menu={menu} activeTarget={activeTarget} expanded={expanded} onToggle={toggle} onSelect={(selectedMenu) => { onSelect(selectedMenu); onClose(); }} />
            )) : <Text style={styles.empty}>Chưa có menu. Hãy cài một module.</Text>}
          </ScrollView>

          <Pressable style={styles.appsButton} onPress={() => { onOpenModules(); onClose(); }}>
            <View style={styles.appsIcon}><Ionicons name="apps-outline" size={20} color="#714B67" /></View>
            <Text style={styles.appsText}>Ứng dụng</Text>
            <Ionicons name="chevron-forward" size={17} color="#9A9097" />
          </Pressable>
        </View>
        <Pressable style={styles.dismiss} onPress={onClose} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, flexDirection: "row", backgroundColor: "rgba(27, 21, 26, 0.42)" },
  drawer: { width: "86%", maxWidth: 390, backgroundColor: "#FAF9F8", shadowColor: "#1D171B", shadowOffset: { width: 7, height: 0 }, shadowOpacity: 0.25, shadowRadius: 18, elevation: 18 },
  dismiss: { flex: 1 },
  header: { minHeight: 112, paddingHorizontal: 19, paddingTop: 48, paddingBottom: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#FFF", borderBottomWidth: 1, borderBottomColor: "#E9E3E7" },
  brand: { color: "#342C32", fontSize: 25, fontWeight: "900", letterSpacing: -0.6 }, brandAccent: { color: "#714B67" }, caption: { color: "#948991", fontSize: 8, fontWeight: "900", letterSpacing: 1.3, marginTop: 2 },
  close: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: "#F1EDF0" },
  menuList: { paddingVertical: 12, paddingHorizontal: 9 }, empty: { color: "#7F747C", textAlign: "center", padding: 30 },
  appsButton: { minHeight: 68, flexDirection: "row", alignItems: "center", gap: 11, paddingHorizontal: 18, borderTopWidth: 1, borderTopColor: "#E7E1E5", backgroundColor: "#FFF" }, appsIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: "#EFE5EB" }, appsText: { flex: 1, color: "#423841", fontSize: 14, fontWeight: "800" },
});
