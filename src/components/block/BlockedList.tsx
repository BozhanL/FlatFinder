import useBlocked from "@/hooks/useBlocked";
import useUser from "@/hooks/useUser";
import useUserMap from "@/hooks/useUserMap";
import { unblockUser } from "@/services/swipe";
import type { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import dayjs from "dayjs";
import { useMemo, type JSX } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from "react-native";

export type blockedUserItem = {
  uid: string;
  name: string;
  avatar: ImageSourcePropType | null;
  blockedAt: FirebaseFirestoreTypes.Timestamp | null;
};

export default function BlockedList(): JSX.Element | null {
  const user = useUser();
  const blocked = useBlocked();
  const userList = useUserMap();

  const blockedUserList: blockedUserItem[] = useMemo(
    () =>
      blocked.map((b) => {
        const user = userList.get(b.uid);
        return {
          uid: b.uid,
          name: user?.name || "Unknown",
          avatar: user?.avatar ?? { uri: user?.avatarUrl },
          blockedAt: b.createdAt ?? null,
        };
      }),
    [blocked, userList],
  );

  if (!user) {
    return null;
  }

  return (
    <FlatList
      data={blockedUserList}
      renderItem={({ item }) => renderItem(item, user.uid)}
    />
  );
}

function renderItem(item: blockedUserItem, uid: string): JSX.Element {
  return (
    <View style={styles.card}>
      <Image source={item.avatar ?? undefined} style={styles.avatar} />

      <View style={{ flex: 1 }}>
        <Text style={styles.user_name}>{item.name}</Text>
        {item.blockedAt && (
          <Text style={styles.block_date} numberOfLines={1}>
            {`Blocked at ${dayjs(item.blockedAt.toDate()).format("L")}`}
          </Text>
        )}
      </View>

      <Pressable
        style={styles.unblock}
        onPress={() => {
          void unblockUser(uid, item.uid);
        }}
      >
        <Text>Unblock</Text>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  user_name: {
    fontFamily: "Roboto_400Regular",
    fontSize: 16,
    color: "#1D1B20",
  },
  block_date: {
    fontFamily: "Roboto_400Regular",
    fontSize: 14,
    color: "#4A4459",
  },
  avatar: {
    width: 56,
    height: 56,
    backgroundColor: "#FF0",
    borderRadius: 10,
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
  unblock: { borderColor: "#f00", borderWidth: 1, padding: 8, borderRadius: 8 },
});
