import { CameraView, useCameraPermissions, type BarcodeScanningResult } from "expo-camera";
import { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export function QrBarcodeScanner({ onCode }: { onCode: (code: string) => Promise<void> }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [paused, setPaused] = useState(false);
  const [manualCode, setManualCode] = useState("");

  async function submit(code: string) {
    const value = code.trim();
    if (!value || paused) return;
    setPaused(true);
    try { await onCode(value); }
    finally { setTimeout(() => setPaused(false), 900); }
  }

  function scanned(result: BarcodeScanningResult) { void submit(result.data); }

  return <View style={styles.wrapper}>
    {permission?.granted ? <View style={styles.cameraFrame}><CameraView style={styles.camera} facing="back" barcodeScannerSettings={{ barcodeTypes: ["qr", "ean13", "ean8", "code128", "code39", "upc_a", "upc_e"] }} onBarcodeScanned={paused ? undefined : scanned} /><View pointerEvents="none" style={styles.target} /><Text style={styles.hint}>{paused ? "Đã nhận mã…" : "Đưa QR hoặc mã vạch vào khung"}</Text></View> : <View style={styles.permission}><Text style={styles.permissionText}>{Platform.OS === "web" ? "Cho phép camera trên trình duyệt để quét mã." : "TDshift cần quyền camera để quét QR/mã vạch."}</Text><Pressable style={styles.permissionButton} onPress={() => void requestPermission()}><Text style={styles.permissionButtonText}>Cho phép camera</Text></Pressable></View>}
    <View style={styles.manual}><TextInput value={manualCode} onChangeText={setManualCode} onSubmitEditing={() => { void submit(manualCode); setManualCode(""); }} placeholder="Hoặc nhập barcode / mã nội bộ" autoCapitalize="characters" style={styles.input} /><Pressable style={styles.addButton} onPress={() => { void submit(manualCode); setManualCode(""); }}><Text style={styles.addText}>Thêm</Text></Pressable></View>
  </View>;
}

const styles = StyleSheet.create({ wrapper: { gap: 10 }, cameraFrame: { height: 220, overflow: "hidden", borderRadius: 16, backgroundColor: "#171217" }, camera: { flex: 1 }, target: { position: "absolute", left: "20%", right: "20%", top: 38, bottom: 48, borderWidth: 2, borderColor: "#FFF", borderRadius: 14 }, hint: { position: "absolute", left: 0, right: 0, bottom: 12, color: "#FFF", textAlign: "center", fontSize: 11, fontWeight: "700" }, permission: { height: 150, alignItems: "center", justifyContent: "center", gap: 12, padding: 20, borderRadius: 16, backgroundColor: "#EEE9EC" }, permissionText: { color: "#665C63", textAlign: "center", fontSize: 12 }, permissionButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: "#714B67" }, permissionButtonText: { color: "#FFF", fontWeight: "800" }, manual: { flexDirection: "row", gap: 8 }, input: { flex: 1, height: 43, paddingHorizontal: 12, borderWidth: 1, borderColor: "#D9D0D6", borderRadius: 11, backgroundColor: "#FFF", fontSize: 12 }, addButton: { justifyContent: "center", paddingHorizontal: 16, borderRadius: 11, backgroundColor: "#714B67" }, addText: { color: "#FFF", fontWeight: "800" } });
