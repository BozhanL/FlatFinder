/* istanbul ignore file */
//temp login page, please move the file outside of (tab) in actual developing
import HeaderLogo from "@/components/HeaderLogo";
import { logout } from "@/services/logout";
import { createGroup } from "@/services/message";
import {
  FirebaseAuthTypes,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "@react-native-firebase/auth";
import { type JSX, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Text,
  TextInput,
  View,
} from "react-native";

export default function ProfileScreen(): JSX.Element {
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

  if (user === undefined) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  } else if (!user) {
    return <Login />;
  }

  async function handleCreateGroup(): Promise<void> {
    const groupId = await createGroup(groupMembers.split(","));
    if (groupId) {
      Alert.alert("Group created!", `Group ID: ${groupId}`);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <HeaderLogo />
      <Button title="Logout" onPress={() => void logout()} />
      <TextInput value={groupMembers} onChangeText={setGroupMembers} />
      <Button title="Create Group" onPress={() => void handleCreateGroup()} />
      <Text>UID: {user.uid}</Text>
      <Text>Email: {user.email}</Text>
    </View>
  );
}

function Login(): JSX.Element {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View>
      <Text>Login</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={(t) => {
          setEmail(t);
        }}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={(newText) => {
          setPassword(newText);
        }}
        secureTextEntry
      />
      <Button title="Login" onPress={() => void handleLogin(email, password)} />
    </View>
  );
}

async function handleLogin(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(getAuth(), email, password);
}
