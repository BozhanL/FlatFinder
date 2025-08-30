import MessageList from "@/components/message/MessageList";
import { useLocalSearchParams } from "expo-router";
import React from "react";

export default function DetailsScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();

  return <MessageList id={id} name={name} />;
}
