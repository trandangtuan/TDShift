import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";

import type { Environment } from "../../core/Environment";
import { PosService } from "./PosService";
import type { PosCartLine, PosCatalogProduct, PosContext } from "./types";
import { PosCartModal } from "./components/PosCartModal";
import { PosProductCard } from "./components/PosProductCard";
import { formatCurrency } from "./format";

export function PosScreen({ env }: { env: Environment }) {
  const service = useMemo(() => new PosService(env), [env]);
  const [context, setContext] = useState<PosContext | null>(null);
  const [products, setProducts] = useState<PosCatalogProduct[]>([]);
  const [cart, setCart] = useState<PosCartLine[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [nextContext, nextProducts] = await Promise.all([service.loadContext(), service.loadProducts(search)]);
      setContext(nextContext);
      setProducts(nextProducts);
    } catch (reason) { Alert.alert("Không thể mở POS", reason instanceof Error ? reason.message : "Lỗi không xác định"); }
    finally { setLoading(false); }
  }, [service, search]);

  useEffect(() => { const timer = setTimeout(load, 180); return () => clearTimeout(timer); }, [load]);

  function addProduct(product: PosCatalogProduct) {
    setCart((current) => {
      const existing = current.find((line) => line.product.id === product.id && line.priceUnit === product.price && line.discount === 0);
      return existing ? current.map((line) => line.key === existing.key ? { ...line, qty: line.qty + 1 } : line) : [...current, { key: `line-${Date.now()}-${product.id}`, product, qty: 1, priceUnit: product.price, discount: 0 }];
    });
  }

  async function checkout(paymentMethodId: string, customerName: string) {
    setCheckingOut(true);
    try {
      const order = await service.checkout(cart, paymentMethodId, customerName);
      setCart([]);
      setCartOpen(false);
      await load();
      Alert.alert("Thanh toán thành công", `Đã lưu đơn ${String(order.name)} và phiếu xuất kho offline.`);
    } catch (reason) { Alert.alert("Thanh toán thất bại", reason instanceof Error ? reason.message : "Lỗi không xác định"); }
    finally { setCheckingOut(false); }
  }

  const itemCount = cart.reduce((sum, line) => sum + line.qty, 0);
  const total = cart.reduce((sum, line) => sum + service.lineTotal(line), 0);

  return <View style={styles.page}><View style={styles.header}><View><Text style={styles.overline}>POINT OF SALE</Text><Text style={styles.title}>{String(context?.config.name ?? "Bán hàng")}</Text><Text style={styles.session}>{String(context?.session.name ?? "Đang tải ca bán…")}</Text></View><View style={styles.openBadge}><View style={styles.openDot} /><Text style={styles.openText}>ĐANG MỞ</Text></View></View><View style={styles.search}><Ionicons name="search" size={19} color="#8B8188" /><TextInput value={search} onChangeText={setSearch} placeholder="Tên, mã nội bộ hoặc barcode…" style={styles.searchInput} />{search ? <Pressable onPress={() => setSearch("")}><Ionicons name="close-circle" size={18} color="#A69CA3" /></Pressable> : null}</View><FlatList data={products} numColumns={2} columnWrapperStyle={styles.row} contentContainerStyle={styles.catalog} keyExtractor={(item) => item.id} refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor="#714B67" />} renderItem={({ item }) => <PosProductCard product={item} onPress={() => addProduct(item)} />} ListEmptyComponent={!loading ? <Text style={styles.empty}>Không tìm thấy sản phẩm.</Text> : null} /><Pressable style={styles.cartBar} onPress={() => setCartOpen(true)}><View style={styles.cartCount}><Ionicons name="cart" size={19} color="#714B67" /><Text style={styles.count}>{itemCount}</Text></View><Text style={styles.cartText}>Xem giỏ hàng</Text><Text style={styles.cartTotal}>{formatCurrency(total)}</Text><Ionicons name="chevron-forward" size={18} color="#FFF" /></Pressable><PosCartModal visible={cartOpen} lines={cart} methods={context?.paymentMethods ?? []} busy={checkingOut} lineTotal={(line) => service.lineTotal(line)} onChangeLine={(next) => setCart((current) => current.map((line) => line.key === next.key ? next : line))} onRemoveLine={(key) => setCart((current) => current.filter((line) => line.key !== key))} onClose={() => setCartOpen(false)} onCheckout={checkout} /></View>;
}

const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: "#F7F6F4" }, header: { paddingHorizontal: 17, paddingTop: 14, paddingBottom: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, overline: { color: "#8D7585", fontSize: 9, fontWeight: "900", letterSpacing: 1.1 }, title: { color: "#342C32", fontSize: 24, fontWeight: "900", marginTop: 2 }, session: { color: "#887F85", fontSize: 9, marginTop: 2 }, openBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 13, backgroundColor: "#E8F4ED" }, openDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#347553" }, openText: { color: "#347553", fontSize: 8, fontWeight: "900" }, search: { height: 44, marginHorizontal: 17, marginBottom: 10, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: "#DDD5DA", borderRadius: 12, backgroundColor: "#FFF" }, searchInput: { flex: 1, color: "#3D353B", fontSize: 13 }, catalog: { paddingHorizontal: 12, paddingBottom: 90 }, row: { gap: 10, marginBottom: 10 }, empty: { textAlign: "center", color: "#8C8188", paddingTop: 60 }, cartBar: { position: "absolute", left: 16, right: 16, bottom: 14, height: 58, flexDirection: "row", alignItems: "center", gap: 9, paddingHorizontal: 12, borderRadius: 17, backgroundColor: "#714B67", shadowColor: "#30212A", shadowOffset: { width: 0, height: 7 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 8 }, cartCount: { minWidth: 38, height: 38, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 3, paddingHorizontal: 7, borderRadius: 12, backgroundColor: "#FFF" }, count: { color: "#714B67", fontSize: 11, fontWeight: "900" }, cartText: { flex: 1, color: "#FFF", fontSize: 13, fontWeight: "800" }, cartTotal: { color: "#FFF", fontSize: 14, fontWeight: "900" } });
