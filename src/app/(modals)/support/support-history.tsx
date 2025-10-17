import useUser from "@/hooks/useUser";
import {
  collection,
  FirebaseFirestoreTypes,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  where,
} from "@react-native-firebase/firestore";
import dayjs from "dayjs";
import { router, Stack } from "expo-router";
import React, { useEffect, useState, type JSX } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { TicketStatus, normalizeStatus } from "@/types/TicketStatus";

type Ticket = {
  id: string;
  createdAt?: { toDate?: () => Date } | null;
  status?: TicketStatus;
  title?: string;
  message?: string;
};

export default function SupportHistory(): JSX.Element {
  const user = useUser();
  const [items, setItems] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setItems([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(getFirestore(), "support_tickets"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc"),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const arr: Ticket[] = snap.docs.map(
          (d: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
            const data = d.data() as Record<string, unknown>;
            return {
              id: d.id,
              createdAt:
                (data["createdAt"] as { toDate?: () => Date } | null) ?? null,
              status: (data["status"] as string | undefined) ?? "open",
              title: (data["title"] as string | undefined) ?? "",
              message: (data["message"] as string | undefined) ?? "",
            };
          },
        );
        setItems(arr);
        setLoading(false);
      },
      (err) => {
        console.error("tickets onSnapshot error:", err);
        setLoading(false);
      },
    );

    return unsub;
  }, [user?.uid]);

  if (loading) {
    return (
      <>
        <Stack.Screen
          options={{
            presentation: "modal",
            headerShown: true,
            title: "My Tickets",
            headerShadowVisible: false,
          }}
        />
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8 }}>Loading…</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          presentation: "modal",
          headerShown: true,
          title: "My Tickets",
          headerShadowVisible: true,
        }}
      />
      <FlatList
        style={{ flex: 1, backgroundColor: "#fff" }}
        contentContainerStyle={{ padding: 12 }}
        data={items}
        keyExtractor={(it) => it.id}
        renderItem={({ item }) => (
          <TicketItem
            item={item}
            onPress={() => {
              router.push({
                pathname: "/support/support-detail",
                params: { id: item.id },
              });
            }}
          />
        )}
        ListEmptyComponent={
          <View style={[styles.center, { paddingVertical: 40 }]}>
            <Text style={{ color: "#666" }}>No tickets yet.</Text>
          </View>
        }
      />
    </>
  );
}

function TicketItem({
  item,
  onPress,
}: {
  item: Ticket;
  onPress?: () => void;
}): JSX.Element {
  const createdDate = item.createdAt?.toDate ? item.createdAt.toDate() : null;
  const formattedDate = createdDate
    ? dayjs(createdDate).format("YYYY-MM-DD HH:mm")
    : "—";
  const status = normalizeStatus(item.status);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={styles.card}
    >
      <View style={styles.row}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title || "(no title)"}
        </Text>
        <View style={[styles.badge, { backgroundColor: status.bg }]}>
          <Text style={[styles.badgeText, { color: status.fg }]}>
            {status.text}
          </Text>
        </View>
      </View>
      <Text style={styles.meta}>{formattedDate}</Text>
      <Text style={styles.message} numberOfLines={4}>
        {item.message}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  card: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ECECEC",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 16, fontWeight: "700", maxWidth: "60%" },
  meta: { fontSize: 12, color: "#777", marginTop: 4 },
  message: { fontSize: 14, color: "#222", marginTop: 8, lineHeight: 20 },
  badge: {
    paddingHorizontal: 8,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { fontWeight: "700", fontSize: 12 },
});
