import HeaderLogo from "@/components/HeaderLogo";
import { getApp } from "@react-native-firebase/app";
import {
  FirebaseAuthTypes,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "@react-native-firebase/auth";
import { getDatabase, onValue, ref } from "@react-native-firebase/database";
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
  const [groups, setGroups] = useState<string[]>([]);

  useEffect(() => {
    const db = getDatabase(
      getApp(),
      "https://flatfinder-5b5c8-default-rtdb.asia-southeast1.firebasedatabase.app/",
    );
    const reference = ref(db, `/users/${user.uid}/groups`);

    const unsubscribe = onValue(reference, (snapshot) => {
      let g: string[] = [];
      snapshot.forEach((child) => {
        const key = child.key;
        if (key === null) {
          return undefined;
        }
        g.push(key);
        return undefined;
      });
      setGroups(g);
    });

    return unsubscribe;
  }, [user]);

  return (
    <View>
      <FlatList
        data={groups}
        renderItem={({ item }) => <Button title={item} onPress={() => {}} />}
      />
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
