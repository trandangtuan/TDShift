import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { PosCatalogProduct } from "../types";
import { formatCurrency } from "../format";

export function PosProductCard({ product, onPress }: { product: PosCatalogProduct; onPress: () => void }) {
  return <Pressable style={styles.card} onPress={onPress}><View style={styles.icon}><Ionicons name="cube-outline" size={27} color="#714B67" /></View><Text style={styles.name} numberOfLines={2}>{product.name}</Text><Text style={styles.code} numberOfLines={1}>{product.defaultCode || "Không có mã"}</Text><Text style={styles.price}>{formatCurrency(product.price)}</Text><View style={styles.add}><Ionicons name="add" size={17} color="#FFF" /></View></Pressable>;
}

const styles = StyleSheet.create({ card: { flex: 1, minHeight: 175, padding: 12, borderRadius: 15, borderWidth: 1, borderColor: "#E5DFE3", backgroundColor: "#FFF" }, icon: { width: 46, height: 46, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: "#F1E7ED", marginBottom: 9 }, name: { minHeight: 38, color: "#352E34", fontSize: 13, fontWeight: "800", lineHeight: 18 }, code: { color: "#92888F", fontSize: 9, marginTop: 3 }, price: { color: "#347553", fontSize: 13, fontWeight: "900", marginTop: 9 }, add: { position: "absolute", right: 10, bottom: 10, width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "#714B67" } });
