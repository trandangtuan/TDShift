import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";

import type { Environment } from "../core/Environment";
import type { BinaryField } from "../core/fields";
import type { ModelValues } from "../core/types";
import { AttachmentService, type LocalFileAsset } from "../services/AttachmentService";

interface Props {
  env: Environment;
  field: BinaryField;
  value: string;
  resModel: string;
  resId?: string;
  onChange: (attachmentId: string) => void;
}

export function BinaryFieldInput({ env, field, value, resModel, resId, onChange }: Props) {
  const service = useMemo(() => new AttachmentService(env), [env]);
  const [attachment, setAttachment] = useState<ModelValues | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!value) { setAttachment(null); return; }
    service.get(value).then(setAttachment).catch(() => setAttachment(null));
  }, [value, service]);

  async function store(asset: LocalFileAsset) {
    setLoading(true);
    setError("");
    try {
      if (field.acceptedTypes?.length && asset.mimeType && !matchesMime(asset.mimeType, field.acceptedTypes)) {
        throw new Error("Định dạng tệp không được hỗ trợ");
      }
      const next = await service.importFile(asset, { resModel, resId, maxSize: field.maxSize });
      setAttachment(next);
      onChange(next.id as string);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không thể lưu tệp");
    } finally {
      setLoading(false);
    }
  }

  async function chooseFile() {
    const result = await DocumentPicker.getDocumentAsync({
      type: field.acceptedTypes ?? "*/*",
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (asset) await store({ uri: asset.uri, name: asset.name, mimeType: asset.mimeType, size: asset.size });
  }

  async function chooseImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { setError("Cần quyền truy cập thư viện ảnh"); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 1 });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (asset) await store({
      uri: asset.uri,
      name: asset.fileName ?? `image-${Date.now()}.jpg`,
      mimeType: asset.mimeType ?? "image/jpeg",
      size: asset.fileSize,
    });
  }

  const isImage = String(attachment?.mimetype ?? "").startsWith("image/");

  return (
    <View style={styles.container}>
      {attachment ? <View style={styles.fileCard}>
        {isImage ? <Image source={{ uri: attachment.local_uri as string }} style={styles.preview} /> : <View style={styles.fileIcon}><Ionicons name="document-outline" size={28} color="#714B67" /></View>}
        <View style={styles.fileInfo}><Text style={styles.fileName} numberOfLines={1}>{String(attachment.name)}</Text><Text style={styles.fileMeta}>{String(attachment.mimetype)} · {service.formatSize(Number(attachment.file_size ?? 0))}</Text></View>
        <Pressable style={styles.remove} onPress={() => { setAttachment(null); onChange(""); }}><Ionicons name="close" size={18} color="#A13F3F" /></Pressable>
      </View> : <View style={styles.placeholder}><Ionicons name="cloud-upload-outline" size={28} color="#92798A" /><Text style={styles.placeholderText}>Chưa chọn tệp</Text></View>}
      <View style={styles.actions}>
        <Pressable disabled={loading} style={styles.button} onPress={chooseFile}><Ionicons name="folder-open-outline" size={17} color="#714B67" /><Text style={styles.buttonText}>Chọn file</Text></Pressable>
        <Pressable disabled={loading} style={styles.button} onPress={chooseImage}><Ionicons name="images-outline" size={17} color="#714B67" /><Text style={styles.buttonText}>Chọn ảnh</Text></Pressable>
        {loading ? <ActivityIndicator color="#714B67" /> : null}
      </View>
      {field.maxSize ? <Text style={styles.hint}>Tối đa {service.formatSize(field.maxSize)}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

function matchesMime(mime: string, accepted: string[]): boolean {
  return accepted.some((type) => type === "*/*" || type === mime || (type.endsWith("/*") && mime.startsWith(type.slice(0, -1))));
}

const styles = StyleSheet.create({
  container: { gap: 9 }, placeholder: { height: 92, borderWidth: 1, borderStyle: "dashed", borderColor: "#CFC3CB", borderRadius: 12, alignItems: "center", justifyContent: "center", gap: 5, backgroundColor: "#FBF8FA" }, placeholderText: { color: "#887C84", fontSize: 12 },
  fileCard: { minHeight: 72, flexDirection: "row", alignItems: "center", gap: 11, padding: 9, borderRadius: 12, borderWidth: 1, borderColor: "#DCD3D9", backgroundColor: "#FFF" }, preview: { width: 58, height: 58, borderRadius: 9, backgroundColor: "#EEE" }, fileIcon: { width: 52, height: 52, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: "#F1E7ED" }, fileInfo: { flex: 1, minWidth: 0 }, fileName: { color: "#3D343B", fontWeight: "800", fontSize: 13 }, fileMeta: { color: "#8A7F86", fontSize: 9, marginTop: 4 }, remove: { width: 30, height: 30, borderRadius: 9, alignItems: "center", justifyContent: "center", backgroundColor: "#FFF0F0" },
  actions: { flexDirection: "row", alignItems: "center", gap: 8 }, button: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 11, paddingVertical: 9, borderWidth: 1, borderColor: "#CFC4CB", borderRadius: 9, backgroundColor: "#FFF" }, buttonText: { color: "#714B67", fontSize: 11, fontWeight: "800" }, hint: { color: "#90858C", fontSize: 9 }, error: { color: "#B42318", fontSize: 11 },
});
