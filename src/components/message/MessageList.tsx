import useGroups from "@/hooks/useGroups";
import type { Group } from "@/types/Group";
import dayjs from "dayjs";
import "dayjs/locale/en-nz";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import { router } from "expo-router";
import type { JSX } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

dayjs.extend(relativeTime);
dayjs.extend(LocalizedFormat);
dayjs.locale("en-nz");

export default function MessageList({ uid }: { uid: string }): JSX.Element {
  const sortedGroups = useGroups(uid);

  return (
    <View style={{ flex: 1 }}>
      <Text style={[styles.section_header]}>Message</Text>
      <FlatList
        data={sortedGroups}
        renderItem={({ item }) => renderItem(item, uid)}
      />
    </View>
  );
}

function renderItem(item: Group, uid: string): JSX.Element {
  return (
    <TouchableOpacity
      onPress={() => {
        router.push({
          pathname: "/chat",
          params: { gid: item.id, gname: item.name || "", uid: uid },
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
              `Matched on ${dayjs(item.lastTimestamp.toDate()).format("L")}`}
          </Text>
        </View>

        <Text style={styles.timestamp}>
          {dayjs(item.lastTimestamp.toDate()).fromNow()}
        </Text>
      </View>
    </TouchableOpacity>
  );
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
});

export const __test__ = { renderItem };
