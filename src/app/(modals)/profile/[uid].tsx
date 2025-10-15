import ProfilePreview from "@/components/ProfilePreview";

import { Stack, useLocalSearchParams } from "expo-router";
import type { JSX } from "react";
import { Text, View } from "react-native";

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
      <ProfilePreview source="uid" uid={uid} />
    </View>
  );
}
