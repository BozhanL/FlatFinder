import type { Flatmate } from "@/types/Flatmate";
import type { Timestamp } from "@react-native-firebase/firestore";
import type { JSX } from "react";
import { Image, Pressable, Text, View } from "react-native";

type Props = { item: Flatmate; onPress: () => void };

function formatDob(dob: Flatmate["dob"]): string {
  if (!dob) return "";
  if (typeof dob === "string") return dob;
  const maybeTs = dob as unknown as Timestamp;
  if (typeof maybeTs.toDate === "function") {
    const d = maybeTs.toDate();
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }
  return "";
}

export default function SwipeCard({ item, onPress }: Props): JSX.Element {
  const dobText = formatDob(item.dob);
  const avatarSrc = item.avatar ?? {
    uri: "https://ui-avatars.com/api/?background=EAEAEA&color=111&name=U",
  };

  return (
    <Pressable onPress={onPress} testID={`swipe-card-${item.id}`}>
      <View
        style={{
          borderRadius: 16,
          overflow: "hidden",
          backgroundColor: "#fff",
          elevation: 2,
        }}
      >
        <Image
          source={avatarSrc}
          style={{ width: "100%", height: 420 }}
          resizeMode="cover"
        />
        <View style={{ padding: 14, gap: 6 }}>
          <Text style={{ fontSize: 20, fontWeight: "700" }}>
            {item.name}
            {dobText ? `, ${dobText}` : ""}
          </Text>

          <Text style={{ color: "#555" }}>
            {typeof item.location === "string"
              ? item.location
              : item.location?.area}
            {item.budget ? ` · $${item.budget}/wk` : ""}
          </Text>

          {item.bio ? <Text style={{ marginTop: 4 }}>{item.bio}</Text> : null}

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
              marginTop: 6,
            }}
          >
            {item.tags?.map((t) => (
              <View
                key={t}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  backgroundColor: "#eee",
                  borderRadius: 999,
                }}
              >
                <Text>{t}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </Pressable>
  );
}
