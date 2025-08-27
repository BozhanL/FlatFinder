import HeaderLogo from "@/components/HeaderLogo";
import { REALTIME_DATABASE_URL } from "@/constants/RealtimeDatabase";
import { getApp } from "@react-native-firebase/app";
import {
  FirebaseAuthTypes,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "@react-native-firebase/auth";
import {
  get,
  getDatabase,
  onValue,
  orderByValue,
  query,
  ref,
} from "@react-native-firebase/database";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
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
  // Raw group id
  const [groupIds, setGroupIds] = useState<string[]>([]);
  // id -> human readable name
  const [nameMap, setNameMap] = useState<Map<string, string>>(new Map());
  const [loadingNames, setLoadingNames] = useState(true);

  // Listen to user group list
  useEffect(() => {
    const db = getDatabase(getApp(), REALTIME_DATABASE_URL);
    const groupRef = ref(db, `/users/${user.uid}/groups`);
    const unsub = onValue(
      query(groupRef, orderByValue()),
      (snapshot) => {
        const ids: string[] = [];
        snapshot.forEach((child) => {
          if (child.key) ids.push(child.key);
          return undefined;
        });
        ids.reverse(); // newest first
        setGroupIds(ids);
      },
      {
        onlyOnce: true,
      },
    );
    return unsub;
  }, [user.uid]);

  // Listen to global groups and resolve names
  useEffect(() => {
    const db = getDatabase(getApp(), REALTIME_DATABASE_URL);
    return onValue(
      ref(db, "/groups"),
      (snap) => {
        const map = new Map<string, string>();
        const ps: Promise<any>[] = [];
        snap.forEach((g) => {
          const id = g.key;
          if (!id) return undefined;
          const name = g.child("name").val();
          if (typeof name === "string" && name) {
            map.set(id, name);
            return undefined;
          }
          const members = g.child("members").val();
          if (Array.isArray(members)) {
            const other = members.find((m) => m !== user.uid);
            if (other)
              ps.push(
                get(ref(db, `/users/${other}`)).then((u) => {
                  const n2 = u.child("name").val();
                  if (typeof n2 === "string" && n2) map.set(id, n2);
                }),
              );
          }
          return undefined;
        });
        Promise.all(ps).finally(() => {
          setNameMap(map);
          setLoadingNames(false);
        });
      },
      {
        onlyOnce: true,
      },
    );
  }, [user.uid]);

  const data: string[] = useMemo(
    () =>
      groupIds.filter((id) => nameMap.has(id)).map((id) => nameMap.get(id)!), // non-null assertion: we just checked has(id)
    [groupIds, nameMap],
  );

  if (loadingNames && data.length === 0) {
    return (
      <View style={{ padding: 16 }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!loadingNames && data.length === 0) {
    return (
      <View style={{ padding: 16 }}>
        <Text>No groups</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      renderItem={({ item }) => (
        <Button
          title={item}
          onPress={() => {
            router.push({
              pathname: "/message/chats/[id]",
              params: { id: item },
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
