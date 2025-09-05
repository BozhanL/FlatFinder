import { Group } from "@/modules/message/Group";
import { getUserByUidAsync } from "@/modules/message/Helper";
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
  StyleSheet,
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
                data.name = (await getUserByUidAsync(other))?.name || null;
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

  const renderItem = ({ item }: { item: Group }) => (
    <TouchableOpacity
      onPress={() => {
        router.push({
          pathname: "/message/chat",
          params: { gid: item.id, gname: item.name || "" },
        });
      }}
    >
      <View style={styles.card}>
        <Image
          source={require("assets/images/react-logo.png")}
          style={styles.avatar}
        />

        <View style={{ flex: 1 }}>
          <Text style={styles.group_name}>{item.name}</Text>
          <Text style={styles.last_message} numberOfLines={1}>
            {item.lastMessage ||
              `Matched on ${item.lastTimestamp.toDate().toLocaleDateString()}`}
          </Text>
        </View>

        {item.lastTimestamp && (
          <Text style={styles.timestamp}>
            {formatTimestamp(item.lastTimestamp)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View>
      <Text style={[styles.section_header]}>Message</Text>
      <VirtualizedList
        data={sortedGroups}
        renderItem={renderItem}
        getItemCount={(data) => data.length}
        getItem={(data, index) => data[index]}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

function formatTimestamp(timestamp?: FirebaseFirestoreTypes.Timestamp): string {
  if (!timestamp) {
    return "";
  }
  const d = timestamp.toDate();
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 1000 / 60);
  const hours = Math.floor(diff / 1000 / 60 / 60);
  const days = Math.floor(diff / 1000 / 60 / 60 / 24);
  const weeks = Math.floor(diff / 1000 / 60 / 60 / 24 / 7);

  if (weeks > 4) {
    return d.toLocaleDateString();
  } else if (weeks) {
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  } else if (days) {
    return `${days} day${days > 1 ? "s" : ""} ago`;
  } else if (hours) {
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else if (minutes) {
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  } else {
    return "Just now";
  }
}

const styles = StyleSheet.create({
  section_header: {
    fontFamily: "Roboto_500Medium",
    color: "#49454F",
    fontSize: 22,
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 10,
    height: 64,
  },
  group_name: {
    fontFamily: "Roboto_400Regular",
    fontSize: 16,
    color: "#1D1B20",
  },
  last_message: {
    fontFamily: "Roboto_400Regular",
    fontSize: 14,
    color: "#4A4459",
  },
  timestamp: {
    fontFamily: "Roboto_500Medium",
    color: "#4A4459",
    fontSize: 11,
    textAlign: "right",
  },
  avatar: {
    width: 56,
    height: 56,
    backgroundColor: "#FF0",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 0.5,
    borderColor: "#e5e7eb",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 16,
  },
});
