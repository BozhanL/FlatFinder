import { getApp } from "@react-native-firebase/app";
import {
  doc,
  getFirestore,
  onSnapshot,
} from "@react-native-firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import type { ImageSourcePropType } from "react-native";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

const app = getApp();
const db = getFirestore(app);

type PreviewData = {
  id: string;
  name: string;
  age?: number;
  bio?: string;
  budget?: number;
  location?: string;
  tags?: string[];
  avatar?: ImageSourcePropType;
  avatarUrl?: string | null;
};

type Props =
  | { source: "data"; data: PreviewData }
  | { source: "uid"; uid: string };

function mapDocToPreview(uid: string, d: any): PreviewData {
  return {
    id: uid,
    name: d?.name ?? "Unnamed",
    ...(typeof d?.age === "number" ? { age: d.age } : {}),
    ...(d?.bio ? { bio: d.bio } : {}),
    ...(typeof d?.budget === "number" ? { budget: d.budget } : {}),
    ...(d?.location ? { location: d.location } : {}),
    ...(Array.isArray(d?.tags) && d.tags.length ? { tags: d.tags } : {}),
    ...(d?.avatarUrl
      ? { avatar: { uri: d.avatarUrl }, avatarUrl: d.avatarUrl }
      : {
          avatar: {
            uri: `https://ui-avatars.com/api/?background=EAEAEA&color=111&name=${encodeURIComponent(
              d?.name ?? "U"
            )}`,
          },
          avatarUrl: null,
        }),
  };
}

export default function ProfilePreview(props: Props) {
  const [live, setLive] = useState<PreviewData | null>(
    props.source === "data" ? props.data : null
  );
  const avatarSource = useMemo(
    () =>
      live?.avatarUrl ? { uri: live.avatarUrl } : (live?.avatar ?? undefined),
    [live?.avatarUrl, live?.avatar]
  );

  useEffect(() => {
    if (props.source !== "uid") return;
    const ref = doc(db, "users", props.uid);
    const unsub = onSnapshot(
      ref,
      (snap) => setLive(mapDocToPreview(snap.id, snap.data())),
      (err) => console.error("ProfilePreview onSnapshot error:", err)
    );
    return unsub;
  }, [props]);

  if (!live) {
    return (
      <View style={styles.center}>
        <Text>Loading…</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
      <View style={{ alignItems: "center", marginTop: 12 }}>
        {!!avatarSource && (
          <Image source={avatarSource as any} style={styles.avatar} />
        )}
        <Text style={{ fontSize: 20, fontWeight: "700", marginTop: 10 }}>
          {live.name || "Unnamed"}
          {live.age ? `, ${live.age}` : ""}
        </Text>

        {!!live.bio && (
          <Text
            style={{
              color: "#555",
              marginTop: 6,
              paddingHorizontal: 24,
              textAlign: "center",
            }}
          >
            {live.bio}
          </Text>
        )}
      </View>

      <View style={{ marginTop: 16, paddingHorizontal: 16, gap: 8 }}>
        {live.budget != null && <KV label="Budget" value={`$${live.budget}`} />}
        {!!live.location && (
          <KV label="Preferred Location" value={String(live.location)} />
        )}
        {!!(live.tags && live.tags.length) && (
          <View
            style={{
              marginTop: 8,
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            {live.tags.map((t, i) => (
              <View key={i} style={styles.tag}>
                <Text style={{ fontSize: 12, color: "#111" }}>{t}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 0,
        paddingVertical: 10,
      }}
    >
      <Text style={{ color: "#666" }}>{label}</Text>
      <Text style={{ fontWeight: "600" }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#eee",
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#eee",
    borderRadius: 999,
  },
});
