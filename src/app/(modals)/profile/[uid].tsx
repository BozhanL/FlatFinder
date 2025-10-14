import ProfilePreview from "@/components/ProfilePreview";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import type { JSX } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function ProfileScreen(): JSX.Element {
  const { uid } = useLocalSearchParams<{ uid: string }>();

  if (!uid) {
    return <Text>No user found</Text>;
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Stack.Screen
        options={{
          title: "Profile",
          headerShown: true,
        }}
      />
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

      <ProfilePreview source="uid" uid={uid} />
    </View>
  );
}
