import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Modal, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import type { Environment } from "../../../core/Environment";
import { InventoryScanService } from "../InventoryScanService";
import type { InventoryOperation, InventoryScanLine } from "../types";
import { InventoryScanLineItem } from "./InventoryScanLineItem";
import { QrBarcodeScanner } from "./QrBarcodeScanner";

export function InventoryScanModal({ env, operation, visible, onClose, onCompleted }: { env: Environment; operation: InventoryOperation; visible: boolean; onClose: () => void; onCompleted: () => void }) {
  const service = useMemo(() => new InventoryScanService(env), [env]);
  const [lines, setLines] = useState<InventoryScanLine[]>([]);
  const [saving, setSaving] = useState(false);
  const title = operation === "incoming" ? "Quét nhập kho" : "Quét xuất kho";

  useEffect(() => { if (!visible) setLines([]); }, [visible]);

  async function addCode(code: string) {
    const product = await service.findProduct(code);
    if (!product) { Alert.alert("Không tìm thấy sản phẩm", `Không có sản phẩm mang mã “${code}”.`); return; }
    setLines((current) => {
      const existing = current.find((line) => line.product.id === product.id);
      return existing ? current.map((line) => line.product.id === product.id ? { ...line, qty: line.qty + 1 } : line) : [...current, { product, qty: 1 }];
    });
  }

  async function confirm() {
    setSaving(true);
    try {
      const picking = await service.validateAndCreate(operation, lines);
      Alert.alert("Đã hoàn tất", `Đã tạo phiếu ${String(picking.name)}.`);
      onCompleted();
      onClose();
    } catch (reason) { Alert.alert("Không thể hoàn tất", reason instanceof Error ? reason.message : "Lỗi không xác định"); }
    finally { setSaving(false); }
  }

  return <Modal visible={visible} animationType="slide" onRequestClose={onClose}><SafeAreaView style={styles.page}><View style={styles.header}><Pressable style={styles.close} onPress={onClose}><Ionicons name="close" size={22} color="#554A51" /></Pressable><View style={styles.heading}><Text style={styles.title}>{title}</Text><Text style={styles.subtitle}>Quét QR, EAN, Code 128 hoặc nhập mã nội bộ</Text></View><View style={styles.placeholder} /></View><View style={styles.content}><QrBarcodeScanner onCode={addCode} /><View style={styles.summary}><Text style={styles.summaryTitle}>Sản phẩm đã quét</Text><Text style={styles.summaryCount}>{lines.length} mặt hàng · {lines.reduce((sum, line) => sum + line.qty, 0)} sản phẩm</Text></View><FlatList data={lines} keyExtractor={(line) => line.product.id} style={styles.list} renderItem={({ item }) => <InventoryScanLineItem line={item} onChangeQty={(qty) => setLines((current) => current.map((line) => line.product.id === item.product.id ? { ...line, qty } : line))} onRemove={() => setLines((current) => current.filter((line) => line.product.id !== item.product.id))} />} /></View><View style={styles.footer}><Pressable disabled={saving || !lines.length} style={[styles.confirm, (saving || !lines.length) && styles.disabled]} onPress={() => void confirm()}><Ionicons name={operation === "incoming" ? "download-outline" : "share-outline"} size={18} color="#FFF" /><Text style={styles.confirmText}>{saving ? "Đang lưu…" : operation === "incoming" ? "Xác nhận nhập kho" : "Xác nhận xuất kho"}</Text></Pressable></View></SafeAreaView></Modal>;
}

const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: "#F7F6F4" }, header: { minHeight: 62, flexDirection: "row", alignItems: "center", paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: "#E6E0E3", backgroundColor: "#FFF" }, close: { width: 40, height: 40, alignItems: "center", justifyContent: "center" }, heading: { flex: 1, alignItems: "center" }, title: { color: "#392F36", fontSize: 17, fontWeight: "900" }, subtitle: { color: "#91868D", fontSize: 9, marginTop: 2 }, placeholder: { width: 40 }, content: { flex: 1, padding: 14 }, summary: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 13, paddingBottom: 5 }, summaryTitle: { color: "#493E45", fontSize: 13, fontWeight: "900" }, summaryCount: { color: "#8C8188", fontSize: 10 }, list: { flex: 1 }, footer: { padding: 14, borderTopWidth: 1, borderTopColor: "#E5DEE2", backgroundColor: "#FFF" }, confirm: { height: 50, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, backgroundColor: "#714B67" }, disabled: { opacity: 0.45 }, confirmText: { color: "#FFF", fontSize: 13, fontWeight: "900" } });
