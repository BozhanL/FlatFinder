import HeaderLogo from "@/components/HeaderLogo";
import MessageList from "@/components/message/MessageList";
import {
  FirebaseAuthTypes,
  getAuth,
  onAuthStateChanged,
} from "@react-native-firebase/auth";
import { JSX, useEffect, useState } from "react";
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
  const [user, setUser] = useState<FirebaseAuthTypes.User | null | undefined>(
    undefined,
  );

  useEffect(() => {
    const subscriber = onAuthStateChanged(getAuth(), (user) => {
      setUser(user);
    });
    return subscriber; // unsubscribe on unmount
  }, []);

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator accessibilityHint="loading" />
      </View>
    );
  }

  return <MessageList uid={user.uid} />;
}
