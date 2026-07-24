import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import type { Environment } from "../../core/Environment";
import type { ModelValues } from "../../core/types";
import { SyncEngine, DEFAULT_SYNC_MODELS, type SyncProgress } from "./SyncEngine";
import { DynamicSchemaService } from "./DynamicSchemaService";
import { SyncConfigForm, type SyncFormValues } from "./components/SyncConfigForm";
import { SyncLogList } from "./components/SyncLogList";
import { SyncModelSelector } from "./components/SyncModelSelector";

const emptyForm: SyncFormValues = { name: "Odoo chính", url: "", database: "", username: "", apiKey: "", batchSize: "50" };

export function SyncScreen({ env }: { env: Environment }) {
  const [config, setConfig] = useState<ModelValues | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [models, setModels] = useState<string[]>(DEFAULT_SYNC_MODELS);
  const [logs, setLogs] = useState<ModelValues[]>([]);
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [progress, setProgress] = useState<SyncProgress | null>(null);
  const [availableModels, setAvailableModels] = useState<string[]>(DEFAULT_SYNC_MODELS);

  const load = useCallback(async () => {
    const saved = (await env.model("sync.config").searchRead({ where: { active: true }, limit: 1 }))[0] ?? null;
    setConfig(saved);
    if (saved) {
      setForm({ name: String(saved.name ?? "Odoo chính"), url: String(saved.url ?? ""), database: String(saved.database ?? ""), username: String(saved.username ?? ""), apiKey: String(saved.api_key ?? ""), batchSize: String(saved.batch_size ?? 50) });
      const savedModels = String(saved.enabled_models ?? "").split(/[\n,;]/).map((item) => item.trim()).filter(Boolean);
      setModels(savedModels.length ? savedModels : DEFAULT_SYNC_MODELS);
      const remoteModels = await new DynamicSchemaService(env).availableModels(saved.id as string);
      setAvailableModels([...new Set([...DEFAULT_SYNC_MODELS, ...remoteModels.map((item) => item.name)])]);
    }
    setLogs(await env.model("sync.log").searchRead({ limit: 30 }));
  }, [env]);

  useEffect(() => { void load(); }, [load]);

  async function save(): Promise<ModelValues> {
    if (!form.url.trim() || !form.database.trim() || !form.username.trim() || !form.apiKey.trim()) throw new Error("Cần nhập URL, database, tài khoản và API key");
    const values = { name: form.name.trim() || "Odoo chính", url: form.url.trim(), database: form.database.trim(), username: form.username.trim(), api_key: form.apiKey, enabled_models: models.join("\n"), batch_size: Math.max(1, Math.min(500, Number(form.batchSize) || 50)), active: true };
    const saved = config ? await env.model("sync.config").write(config.id as string, values) : await env.model("sync.config").create(values);
    setConfig(saved);
    return saved;
  }

  async function execute(action: "save" | "test" | "schema" | "sync") {
    setBusy(true);
    try {
      const saved = await save();
      if (action === "save") Alert.alert("Đã lưu", "Cấu hình đồng bộ được lưu offline trên thiết bị.");
      if (action === "test") {
        const message = await new SyncEngine(env, saved).testConnection();
        await env.model("sync.log").create({ name: `Kết nối thành công: ${message}`, config_id: saved.id, operation: "connect", level: "success", logged_at: new Date().toISOString(), active: true });
        Alert.alert("Kết nối thành công", message);
      }
      if (action === "schema") {
        const count = await new SyncEngine(env, saved).refreshSchema();
        Alert.alert("Đã cập nhật Dynamic Schema", `Đã tải danh mục ${count} model cùng field và view của các model đang chọn.`);
      }
      if (action === "sync") {
        const summary = await new SyncEngine(env, saved).run(setProgress);
        Alert.alert("Đồng bộ hoàn tất", `Đã đẩy ${summary.pushed}, tải ${summary.pulled}, lỗi ${summary.errors}.`);
      }
      await load();
    } catch (reason) { Alert.alert("Không thể thực hiện", reason instanceof Error ? reason.message : "Lỗi không xác định"); }
    finally { setBusy(false); setProgress(null); }
  }

  return <ScrollView style={styles.page} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load().finally(() => setRefreshing(false)); }} />}><View style={styles.hero}><View style={styles.icon}><Ionicons name="cloud-done-outline" size={25} color="#714B67" /></View><View style={styles.heroText}><Text style={styles.title}>Đồng bộ Odoo</Text><Text style={styles.subtitle}>JSON-RPC · dynamic schema · push & pull</Text></View>{config?.last_sync_at ? <Text style={styles.last}>Lần cuối{`\n`}{String(config.last_sync_at).slice(0, 16).replace("T", " ")}</Text> : null}</View><SyncConfigForm values={form} onChange={setForm} /><View style={styles.selector}><SyncModelSelector selected={models} available={availableModels} onChange={setModels} /></View>{progress ? <View style={styles.progress}><Text style={styles.progressText}>{progress.phase === "push" ? "Đang đẩy" : "Đang tải"} {progress.model}</Text><Text style={styles.progressCount}>{progress.current}/{progress.total}</Text></View> : null}<View style={styles.actions}><Pressable disabled={busy} style={[styles.secondary, busy && styles.disabled]} onPress={() => void execute("save")}><Text style={styles.secondaryText}>Lưu</Text></Pressable><Pressable disabled={busy} style={[styles.secondary, busy && styles.disabled]} onPress={() => void execute("test")}><Text style={styles.secondaryText}>Kiểm tra</Text></Pressable><Pressable disabled={busy} style={[styles.secondary, busy && styles.disabled]} onPress={() => void execute("schema")}><Text style={styles.secondaryText}>Cập nhật schema</Text></Pressable></View><Pressable disabled={busy || !models.length} style={[styles.primary, (busy || !models.length) && styles.disabled]} onPress={() => void execute("sync")}><Ionicons name="sync" size={16} color="#FFF" /><Text style={styles.primaryText}>{busy ? "Đang xử lý…" : "Đồng bộ ngay"}</Text></Pressable><View style={styles.warning}><Ionicons name="shield-checkmark-outline" size={17} color="#8B6841" /><Text style={styles.warningText}>Dynamic Schema tải module/model/field/view từ Odoo. Mã Python và workflow server không chạy trên mobile.</Text></View><Text style={styles.logTitle}>NHẬT KÝ GẦN ĐÂY</Text><SyncLogList logs={logs} /></ScrollView>;
}

const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: "#F7F6F4" }, content: { padding: 14, paddingBottom: 40, gap: 13 }, hero: { flexDirection: "row", alignItems: "center", gap: 10 }, icon: { width: 45, height: 45, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: "#EEE5EB" }, heroText: { flex: 1 }, title: { color: "#382F35", fontSize: 20, fontWeight: "900" }, subtitle: { color: "#8C8088", fontSize: 10, marginTop: 2 }, last: { color: "#8C8088", fontSize: 8, textAlign: "right" }, selector: { padding: 13, borderWidth: 1, borderColor: "#E3DDE1", borderRadius: 15, backgroundColor: "#FFF" }, actions: { flexDirection: "row", gap: 8 }, secondary: { height: 45, justifyContent: "center", paddingHorizontal: 15, borderWidth: 1, borderColor: "#714B67", borderRadius: 12, backgroundColor: "#FFF" }, secondaryText: { color: "#714B67", fontSize: 11, fontWeight: "900" }, primary: { flex: 1, height: 45, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, borderRadius: 12, backgroundColor: "#714B67" }, primaryText: { color: "#FFF", fontSize: 11, fontWeight: "900" }, disabled: { opacity: 0.45 }, progress: { flexDirection: "row", justifyContent: "space-between", padding: 11, borderRadius: 10, backgroundColor: "#EEE5EB" }, progressText: { color: "#714B67", fontSize: 10, fontWeight: "800" }, progressCount: { color: "#714B67", fontSize: 10 }, warning: { flexDirection: "row", gap: 8, padding: 11, borderRadius: 11, backgroundColor: "#F7F0E7" }, warningText: { flex: 1, color: "#806443", fontSize: 9, lineHeight: 14 }, logTitle: { color: "#857780", fontSize: 9, fontWeight: "900", letterSpacing: 0.8, marginTop: 4 } });
