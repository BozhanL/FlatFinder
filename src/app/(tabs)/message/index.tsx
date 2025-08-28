import HeaderLogo from "@/components/HeaderLogo";
import { MessageEvent } from "@/components/message/MessageEvent";
import { MessageStatus } from "@/components/message/MessageStatus";
import {
  FirebaseAuthTypes,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "@react-native-firebase/auth";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  FlatList,
  Text,
  TextInput,
  View,
} from "react-native";

export default function MessageView() {
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <HeaderLogo />
      <Message />
    </View>
  );
}

function Message() {
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

  if (user === undefined) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  } else if (!user) {
    return <Login />;
  }

  return (
    <View>
      <MessageList user={user} />
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}

function MessageList({ user }: { user: FirebaseAuthTypes.User }) {
  const [message, setMessage] = useState<MessageStatus>(new MessageStatus());

  useEffect(() => {
    const me: MessageEvent = new MessageEvent(user.uid);
    me.subscribe(setMessage);
    return () => me.destroy();
  }, [user.uid]);

  if (message.groups.length === 0) {
    return (
      <View style={{ padding: 16 }}>
        <Text>No groups</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={message.getGroupsByUserId(user.uid)}
      renderItem={({ item }) => (
        <Button
          title={item.name as string}
          onPress={() => {
            router.push({
              pathname: "/message/chats/[id]",
              params: { id: item.id },
            });
          }}
        />
      )}
    />
  );
}

// Removed old getGroupName helper; logic consolidated inside MessageList effects.

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View>
      <Text>Login</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={(t) => setEmail(t)}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={(newText) => setPassword(newText)}
        secureTextEntry
      />
      <Button title="Login" onPress={() => handleLogin(email, password)} />
    </View>
  );
}

async function handleLogin(email: string, password: string) {
  await signInWithEmailAndPassword(getAuth(), email, password);
}

async function handleLogout() {
  await signOut(getAuth());
}
