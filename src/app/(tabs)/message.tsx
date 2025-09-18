import HeaderLogo from "@/components/HeaderLogo";
import MessageList from "@/components/message/MessageList";
import useUser from "@/hooks/useUser";
import { JSX } from "react";
import { ActivityIndicator, View } from "react-native";

export default function MessageView(): JSX.Element {
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <HeaderLogo />
      <Message />
    </View>
  );
}

function Message(): JSX.Element {
  // Set an initializing state whilst Firebase connects
  const user = useUser();

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator accessibilityHint="loading" />
      </View>
    );
  }

  return <MessageList uid={user.uid} />;
}
