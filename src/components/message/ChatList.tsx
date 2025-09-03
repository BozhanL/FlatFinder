import { Group } from "@/modules/message/Group";
import { getUserNameFromId } from "@/modules/message/Helper";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import {
  collection,
  FirebaseFirestoreTypes,
  getFirestore,
  onSnapshot,
  query,
  where,
} from "@react-native-firebase/firestore";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Button, VirtualizedList } from "react-native";

export default function ChatList({ user }: { user: FirebaseAuthTypes.User }) {
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    const db = getFirestore();
    const groupsRef = collection(
      db,
      "groups",
    ) as FirebaseFirestoreTypes.CollectionReference<Group>;

    return onSnapshot(
      query(groupsRef, where("members", "array-contains", user.uid)),
      (snapshot: FirebaseFirestoreTypes.QuerySnapshot<Group>) => {
        snapshot.forEach(async (docs) => {
          const data = docs.data();

          if (data.name === null) {
            const other = data.members.find((m) => m !== user.uid);
            if (other) {
              data.name = await getUserNameFromId(other);
            }
          }

          setGroups((prev) => {
            const updated = prev.filter((g) => g.id !== data.id);
            updated.push(data);
            return updated;
          });
        });
      },
    );
  }, [user]);

  const sortedGroups = useMemo(() => {
    return groups.sort((a, b) => {
      return b.lastTimestamp.toMillis() - a.lastTimestamp.toMillis();
    });
  }, [groups]);

  return (
    <VirtualizedList
      data={sortedGroups}
      renderItem={({ item }: { item: Group }) => (
        <Button
          title={item.name || ""}
          onPress={() => {
            router.push({
              pathname: "/message/chats/[id]",
              params: { id: item.id, name: item.name || "" },
            });
          }}
        />
      )}
      getItemCount={(data) => data.length}
      getItem={(data, index) => data[index]}
      keyExtractor={(item) => item.id}
    />
  );
}
