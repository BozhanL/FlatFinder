import Message from "@/app/message";
import HeaderLogo from "@/components/HeaderLogo";
import React from "react";
import { View } from "react-native";

export default function MessageScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <HeaderLogo />
      <Message />
    </View>
  );
}
