import { Group } from "@/modules/message/Group";
import { Message } from "@/modules/message/Message";
import {
  collection,
  FirebaseFirestoreTypes,
  getFirestore,
  onSnapshot,
  query,
  where,
} from "@react-native-firebase/firestore";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Button, FlatList } from "react-native";

export default function MessageList({ uid }: { uid: string }) {
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    const db = getFirestore();
    const chatsRef = collection(db, "chats") as FirebaseFirestoreTypes.CollectionReference<Group>;
    const q = query(chatsRef, where("members", "array-contains", uid));
    const unsubscribe = onSnapshot(
      q,
      (snapshot: FirebaseFirestoreTypes.QuerySnapshot<Group>) => {
        snapshot.forEach((doc) => {
          const data = doc.data();
          setGroups((prevGroups) => {
            prevGroups = prevGroups.filter((g) => g.id !== doc.id);
            const group = new Group(doc.id, data.name, data.members);
            return [...prevGroups, group];
          });
        });
      },
    );
    return () => unsubscribe();
  }, [uid]);
  return (
    <FlatList
      data={groups}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Button
          title={item.groupName ?? item.id}
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
  );
}
