import HeaderLogo from "@/components/HeaderLogo";
import { createGroup } from "@/services/message";
import {
  FirebaseAuthTypes,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "@react-native-firebase/auth";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Text,
  TextInput,
  View,
} from "react-native";

export default function ProfileScreen() {
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

  async function handleCreateGroup() {
    const groupId = await createGroup(groupMembers.split(","));
    if (groupId) {
      Alert.alert("Group created!", `Group ID: ${groupId}`);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <HeaderLogo />
      <Button title="Logout" onPress={handleLogout} />
      <TextInput value={groupMembers} onChangeText={setGroupMembers} />
      <Button title="Create Group" onPress={handleCreateGroup} />
    </View>
  );
}

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
