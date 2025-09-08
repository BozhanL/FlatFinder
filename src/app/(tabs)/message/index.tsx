import HeaderLogo from "@/components/HeaderLogo";
import ChatList from "@/components/message/ChatList";
import { createGroup } from "@/services/message";
import {
  FirebaseAuthTypes,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "@react-native-firebase/auth";
import {
  getMessaging,
  getToken,
  onMessage,
} from "@react-native-firebase/messaging";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
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
  const [groupMembers, setGroupMembers] = useState<string>("");

  useEffect(() => {
    const subscriber = onAuthStateChanged(getAuth(), (user) => {
      setUser(user);
    });
    return subscriber; // unsubscribe on unmount
  }, []);

  useEffect(() => {
    const messaging = getMessaging();
    getToken(messaging).then((token) => {
      console.log("FCM Token: ", token);
    });
    const unsubscribe = onMessage(messaging, async (remoteMessage) => {
      Alert.alert("A new FCM message arrived!", JSON.stringify(remoteMessage));
    });

    return unsubscribe;
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

  async function handleCreateGroup() {
    const groupId = await createGroup(groupMembers.split(","));
    if (groupId) {
      Alert.alert("Group created!", `Group ID: ${groupId}`);
    }
  }

  return (
    <View>
      <MessageList user={user} />
      <Button title="Logout" onPress={handleLogout} />
      <TextInput value={groupMembers} onChangeText={setGroupMembers} />
      <Button title="Create Group" onPress={handleCreateGroup} />
    </View>
  );
}

function MessageList({ user }: { user: FirebaseAuthTypes.User }) {
  return <ChatList user={user} />;
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
