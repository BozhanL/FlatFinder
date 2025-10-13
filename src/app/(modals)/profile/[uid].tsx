import ProfilePreview from "@/components/ProfilePreview";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router, useLocalSearchParams } from "expo-router";
import type { JSX } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function ProfileScreen(): JSX.Element {
  const { uid } = useLocalSearchParams<{ uid: string }>();

  if (!uid) return <Text>No user found</Text>;

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View
        style={{
          height: 52,
          flexDirection: "row",
          alignItems: "center",
          borderBottomWidth: 1,
          borderColor: "#eee",
          paddingHorizontal: 12,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            router.back();
          }}
        >
          <MaterialCommunityIcons name="arrow-left" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={{ marginLeft: 12, fontSize: 18, fontWeight: "600" }}>
          Profile
        </Text>
      </View>

      <ProfilePreview source="uid" uid={uid} />
    </View>
  );
}
