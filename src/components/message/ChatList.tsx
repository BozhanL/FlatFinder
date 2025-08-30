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
import { RedBlackTree } from "data-structure-typed";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Button, VirtualizedList } from "react-native";

export default function ChatList({ user }: { user: FirebaseAuthTypes.User }) {
  const [groups, setGroups] = useState<RedBlackTree<Group>>(
    new RedBlackTree<Group>([], {
      specifyComparable: (k: Group) =>
        k.lastTimestamp.toDate().toISOString().concat(k.id),
      isReverse: true,
    }),
  );

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
            const updated = Array.from(prev.keys()).filter(
              (g) => g.id !== docs.id,
            );
            updated.push(data);
            return new RedBlackTree<Group>(updated, {
              specifyComparable: prev.specifyComparable!,
              isReverse: prev.isReverse,
            });
          });
        });
      },
    );
  }, [user]);

  console.log(Array.from(groups.keys()));
  return (
    <VirtualizedList
      data={Array.from(groups.keys())}
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
