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
import { getDatabase, onValue, ref } from "@react-native-firebase/database";
import { router } from "expo-router";
import * as SQLite from "expo-sqlite";
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

export const chats = SQLite.openDatabaseSync(":memory:");
chats.execSync(
  `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS groups (
    id TEXT PRIMARY KEY,
    name TEXT
  );

  CREATE TABLE IF NOT EXISTS joined_groups (
    uid TEXT,
    group_id TEXT NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    uid TEXT REFERENCES users(id) NOT NULL,
    group_id TEXT REFERENCES groups(id) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL
  );
  `,
);

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
  const [groups, setGroups] = useState<{ name: string; id: string }[]>([]);

  useEffect(() => {
    const me = new MessageEvent(user.uid);
    const update = () => {
      const g = chats.getAllSync<{ name: string; id: string }>(
        `
        SELECT
          COALESCE(
        g.name,
        (
          SELECT u2.name
          FROM joined_groups j2
          JOIN users u2 ON u2.id = j2.uid
          WHERE j2.group_id = g.id
            AND u2.id != ?
        )
          ) AS name, g.id AS id
        FROM groups g
        JOIN joined_groups j ON j.group_id = g.id
        WHERE j.uid = ?
        GROUP BY g.id
        `,
        user.uid,
        user.uid,
      );
      console.log(chats.getAllSync("SELECT * FROM users"));
      console.log(chats.getAllSync("SELECT * FROM groups"));
      console.log(chats.getAllSync("SELECT * FROM joined_groups"));
      setGroups(g);
    };
    const unsubscribe = me.subscribe(update);
    update();
    return unsubscribe;
  }, [user.uid]);

  if (groups.length === 0) {
    return (
      <View style={{ padding: 16 }}>
        <Text>No groups</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={groups}
      renderItem={({ item }) => (
        <Button
          title={item.name}
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

class MessageEvent {
  public destroy: () => void;
  public subscription: (() => void)[] = [];

  constructor(public id: string) {
    this.id = id;
    const db = getDatabase(getApp(), REALTIME_DATABASE_URL);

    const f1 = onValue(ref(db, `/users`), (snap) => {
      snap.forEach((child) => {
        const id = child.key;
        if (!id) return undefined;
        const name = child.child("name").val() as string;
        const f = async () => {
          await chats.runAsync(`DELETE FROM users WHERE id = ?`, id);
          await chats.runAsync(
            `
          INSERT INTO users (id, name) VALUES (?, ?)
          `,
            id,
            name,
          );

          for (const sub of this.subscription) {
            sub();
          }
        };
        f();
      });
    });

    const f2 = onValue(ref(db, "/groups"), (snap) => {
      snap.forEach((g) => {
        const id = g.key;
        if (!id) return undefined;
        const name = g.child("name").val() as string | null;
        const memberUids = g.child("members").val() as string[];

        const f = async () => {
          await chats.runAsync(
            `DELETE FROM joined_groups WHERE group_id = ?`,
            id,
          );
          await chats.runAsync(`DELETE FROM groups WHERE id = ?`, id);
          await chats.runAsync(
            "INSERT INTO groups (id, name) VALUES (?, ?)",
            id,
            name,
          );
          for (const uid of memberUids) {
            await chats.runAsync(
              "INSERT INTO joined_groups (uid, group_id) VALUES (?, ?)",
              uid,
              id,
            );
          }

          for (const sub of this.subscription) {
            sub();
          }
        };
        f();

        return undefined;
      });
    });

    this.destroy = () => {
      chats.execSync(
        "DELETE FROM users; DELETE FROM groups; DELETE FROM joined_groups;",
      );
      f1();
      f2();
    };
  }

  subscribe(callback: () => void): () => void {
    this.subscription.push(callback);
    return this.destroy;
  }
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
