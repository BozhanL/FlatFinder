import type { Flatmate } from "@/types/Flatmate";
import type { JSX } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { calculateAge } from "@/utils/date";
import React, { useMemo } from "react";

type Props = { item: Flatmate; onPress: () => void };

export default function SwipeCard({ item, onPress }: Props): JSX.Element {
  const age = useMemo(() => calculateAge(item.dob), [item.dob]);
  const avatarSrc = useMemo(() => {
    const mainPhoto =
      Array.isArray(item.photoUrls) && item.photoUrls.length > 0
        ? item.photoUrls[0]
        : item.avatarUrl;

    if (mainPhoto && typeof mainPhoto === "string" && mainPhoto.trim() !== "") {
      return { uri: mainPhoto };
    }

    return {
      uri:
        "https://ui-avatars.com/api/?background=EAEAEA&color=111&name=" +
        encodeURIComponent(item.name),
    };
  }, [item.photoUrls, item.avatarUrl, item.name]);
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
            {Number.isFinite(age ?? NaN) ? `, ${age}` : ""}
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
