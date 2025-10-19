import dayjs from "dayjs";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState, type JSX } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  doc,
  getFirestore,
  onSnapshot,
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import { TicketStatus, normalizeStatus } from "@/types/TicketStatus";

type TicketDoc = {
  createdAt?: FirebaseFirestoreTypes.Timestamp | null;
  status?: TicketStatus;
  uid?: string | null;
  name?: string;
  email?: string;
  title?: string;
  message?: string;
};

export default function SupportDetail(): JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [docData, setDocData] = useState<TicketDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      return;
    }
    const ref = doc(getFirestore(), "support_tickets", id);
    const unsub = onSnapshot(
      ref,
      (snap: FirebaseFirestoreTypes.DocumentSnapshot) => {
        if (snap.exists()) {
          setDocData(snap.data() as TicketDoc);
        } else {
          setDocData(null);
        }
        setLoading(false);
      },
      () => {
        setLoading(false);
      },
    );
    return unsub;
  }, [id]);

  const created = docData?.createdAt?.toDate();
  const createdText = created ? dayjs(created).format("YYYY-MM-DD HH:mm") : "—";
  const statusStyle = normalizeStatus(docData?.status);

  if (loading) {
    return (
      <>
        <Stack.Screen
          options={{
            presentation: "modal",
            headerShown: true,
            title: "Ticket Detail",
            headerShadowVisible: true,
          }}
        />
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8 }}>Loading…</Text>
        </View>
      </>
    );
  }

  if (!docData) {
    return (
      <>
        <Stack.Screen
          options={{
            presentation: "modal",
            headerShown: true,
            title: "Ticket Detail",
            headerShadowVisible: true,
          }}
        />
        <View style={styles.center}>
          <Text style={{ color: "#666" }}>Ticket not found.</Text>
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
          title: "Ticket Detail",
          headerShadowVisible: true,
        }}
      />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        style={{ flex: 1, backgroundColor: "#fff" }}
      >
        {/* Status */}
        <Text style={styles.label}>Status</Text>
        <View style={styles.badgeContainer}>
          <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.badgeText, { color: statusStyle.fg }]}>
              {statusStyle.text}
            </Text>
          </View>
        </View>

        {/* Name */}
        <Text style={styles.label}>Name</Text>
        <View style={styles.input}>
          <Text style={styles.readonlyText}>{docData.name?.trim() || "—"}</Text>
        </View>

        {/* Email */}
        <Text style={styles.label}>Email</Text>
        <View style={styles.input}>
          <Text style={styles.readonlyText}>
            {docData.email?.trim() || "—"}
          </Text>
        </View>

        {/* Created At */}
        <Text style={styles.label}>Created At</Text>
        <View style={styles.input}>
          <Text style={styles.readonlyText}>{createdText}</Text>
        </View>

        {/* Title */}
        <Text style={styles.label}>Title</Text>
        <View style={styles.input}>
          <Text style={styles.readonlyText}>
            {docData.title?.trim() || "(no title)"}
          </Text>
        </View>

        {/* Details */}
        <Text style={styles.label}>Details</Text>
        <View style={[styles.input, styles.textArea]}>
          <Text style={[styles.readonlyText, styles.detailsText]}>
            {docData.message?.trim() || "—"}
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    color: "#444",
    marginBottom: 6,
    marginTop: 12,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E3E3E3",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    minHeight: 44,
  },
  textArea: {
    minHeight: 140,
  },
  readonlyText: {
    fontSize: 15,
    color: "#111",
  },
  detailsText: {
    lineHeight: 20,
  },
  badgeContainer: {
    paddingVertical: 2,
  },
  badge: {
    paddingHorizontal: 8,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  badgeText: { fontWeight: "700", fontSize: 12 },
  center: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
