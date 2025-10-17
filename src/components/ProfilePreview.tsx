import { calculateAge } from "@/utils/date";
import {
  doc,
  getFirestore,
  onSnapshot,
  Timestamp,
} from "@react-native-firebase/firestore";
import { useEffect, useMemo, useState, type JSX } from "react";
import type { ImageSourcePropType } from "react-native";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

type PreviewData = {
  id: string;
  name: string;
  dob?: Timestamp | null;
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

type UserDoc = {
  name?: string;
  dob?: Timestamp | null;
  bio?: string;
  budget?: number;
  location?: string;
  tags?: unknown;
  avatarUrl?: string | null;
};

function mapDocToPreview(uid: string, d: UserDoc | undefined): PreviewData {
  return {
    id: uid,
    name: d?.name ?? "Unnamed",
    ...(d?.dob ? { dob: d.dob } : {}),
    ...(d?.bio ? { bio: d.bio } : {}),
    ...(typeof d?.budget === "number" ? { budget: d.budget } : {}),
    ...(d?.location ? { location: d.location } : {}),
    ...(Array.isArray(d?.tags) && d.tags.length
      ? { tags: d.tags as string[] }
      : {}),
    ...(d?.avatarUrl
      ? { avatar: { uri: d.avatarUrl }, avatarUrl: d.avatarUrl }
      : {
          avatar: {
            uri: `https://ui-avatars.com/api/?background=EAEAEA&color=111&name=${encodeURIComponent(
              d?.name ?? "U",
            )}`,
          },
          avatarUrl: null,
        }),
  };
}

function formatNZD(n?: number): string {
  if (!Number.isFinite(n)) {
    return "—";
  }
  return (
    "$" +
    Number(n).toLocaleString("en-NZ", {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    })
  );
}

export default function ProfilePreview(props: Props): JSX.Element {
  const [live, setLive] = useState<PreviewData | null>(
    props.source === "data" ? props.data : null,
  );

  const avatarSource: ImageSourcePropType | undefined = useMemo(
    () =>
      live?.avatarUrl ? { uri: live.avatarUrl } : (live?.avatar ?? undefined),
    [live?.avatarUrl, live?.avatar],
  );

  const age = useMemo(() => calculateAge(live?.dob), [live?.dob]);

  useEffect(() => {
    if (props.source !== "uid") {
      return;
    }
    const ref = doc(getFirestore(), "users", props.uid);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setLive(mapDocToPreview(snap.id, snap.data() as UserDoc | undefined));
      },
      (err) => {
        console.error("ProfilePreview onSnapshot error:", err);
      },
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

  const tags = (live.tags ?? []).slice(0, 5);
  const extra = Math.max(0, (live.tags?.length ?? 0) - tags.length);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 20 }}>
      <View style={{ alignItems: "center", marginTop: 4 }}>
        <View style={styles.avatarWrap}>
          {!!avatarSource && (
            <Image source={avatarSource} style={styles.avatar} />
          )}
          {Number.isFinite(age ?? NaN) && (
            <View style={styles.ageBadge}>
              <Text style={styles.ageTxt}>{age}</Text>
            </View>
          )}
        </View>

        <Text
          style={{
            fontSize: 20,
            fontWeight: "800",
            marginTop: 12,
            color: "#111",
          }}
        >
          {live.name || "Unnamed"}
        </Text>

        {!!live.bio && (
          <Text
            style={{
              color: "#555",
              marginTop: 6,
              paddingHorizontal: 24,
              textAlign: "center",
            }}
            numberOfLines={2}
          >
            {live.bio}
          </Text>
        )}
      </View>

      <View style={styles.card}>
        <KV label="Budget per week" value={formatNZD(live.budget)} />
        <Divider />
        <KV label="Preferred location" value={live.location ?? "—"} />
      </View>

      {!!tags.length && (
        <View style={{ marginTop: 16 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "700",
              color: "#111",
              marginBottom: 8,
            }}
          >
            Tags
          </Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            {tags.map((t, i) => (
              <View key={`${t}-${i}`} style={styles.tag}>
                <Text
                  style={{ fontSize: 12, color: "#333", fontWeight: "700" }}
                >
                  {t}
                </Text>
              </View>
            ))}
            {extra > 0 && (
              <View style={[styles.tag, { backgroundColor: "#EFEFEF" }]}>
                <Text
                  style={{ fontSize: 12, color: "#333", fontWeight: "700" }}
                >
                  +{extra}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function KV({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function Divider(): JSX.Element {
  return <View style={styles.hr} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  avatarWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  ageBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    backgroundColor: "#111",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  ageTxt: { color: "#fff", fontSize: 12, fontWeight: "800" },
  card: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#EDEDED",
    borderRadius: 12,
    backgroundColor: "#FFF",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    height: 52,
  },
  rowLabel: { color: "#777", fontSize: 13, fontWeight: "600" },
  rowValue: {
    color: "#111",
    fontSize: 15,
    fontWeight: "700",
    maxWidth: "55%",
    textAlign: "right",
  },
  hr: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#EFEFEF",
    marginLeft: 12,
    marginRight: 12,
  },
  avatar: {
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: "#eee",
  },
  tag: {
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F1F1F5",
    alignItems: "center",
    justifyContent: "center",
  },
});
