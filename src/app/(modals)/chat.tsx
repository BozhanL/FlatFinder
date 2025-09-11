import ChatList from "@/components/message/ChatList";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { JSX } from "react";

export default function DetailsScreen(): JSX.Element {
  const { gid, gname, uid } = useLocalSearchParams<{
    gid: string;
    gname: string;
    uid: string;
  }>();

  return (
    <>
      <Stack.Screen
        options={{ headerShown: true, title: gname, presentation: "modal" }}
      />
      <ChatList gid={gid} gname={gname} uid={uid} />
    </>
  );
}
