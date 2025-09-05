import MessageList from "@/components/message/MessageList";
import { useLocalSearchParams } from "expo-router";
import React from "react";

export default function DetailsScreen() {
  const { gid, gname } = useLocalSearchParams<{ gid: string; gname: string }>();

  return <MessageList gid={gid} gname={gname} />;
}
