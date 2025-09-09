import ChatList from "@/components/message/ChatList";
import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DetailsScreen() {
  const { gid, gname, uid } = useLocalSearchParams<{
    gid: string;
    gname: string;
    uid: string;
  }>();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack.Screen
        options={{ headerShown: true, title: gname, presentation: "modal" }}
      />
      <ChatList gid={gid} gname={gname} uid={uid} />
    </SafeAreaView>
  );
}
