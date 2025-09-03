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
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  VirtualizedList,
} from "react-native";

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
      async (snapshot: FirebaseFirestoreTypes.QuerySnapshot<Group>) => {
        const groupsData = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data();
            if (data.name === null) {
              const other = data.members.find((m) => m !== user.uid);
              if (other) {
                data.name = await getUserNameFromId(other);
              }
            }
            return data;
          }),
        );

        setGroups(groupsData);
      },
    );
  }, [user]);

  const sortedGroups = useMemo(() => {
    return groups.sort((a, b) => {
      const aTime = a.lastTimestamp?.toMillis?.() ?? 0;
      const bTime = b.lastTimestamp?.toMillis?.() ?? 0;
      return bTime - aTime;
    });
  }, [groups]);

  return (
    <VirtualizedList
      data={sortedGroups}
      renderItem={({ item }: { item: Group }) => (
        <TouchableOpacity
          style={{
            padding: 8,
            marginVertical: 4,
            backgroundColor: "transparent",
            borderRadius: 8,
          }}
          onPress={() => {
            router.push({
              pathname: "/message/chats/[id]",
              params: { id: item.id, name: item.name || "" },
            });
          }}
        >
          <View style={{ flexDirection: "row" }}>
            <Image source={require("assets/images/react-logo.png")} />
            <View>
              <Text>{item.name || ""}</Text>
              <Text>{item.lastMessage || ""}</Text>
            </View>
            <Text>{item.lastTimestamp?.toDate().toLocaleString() || ""}</Text>
          </View>
        </TouchableOpacity>
      )}
      getItemCount={(data) => data.length}
      getItem={(data, index) => data[index]}
      keyExtractor={(item) => item.id}
    />
  );
}
