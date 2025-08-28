import { Message } from "@/components/message/Message";
import { MessageEvent } from "@/components/message/MessageEvent";
import { MessageStatus } from "@/components/message/MessageStatus";
import { getAuth } from "@react-native-firebase/auth";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, VirtualizedList } from "react-native";

export default function DetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [message, setMessage] = useState<MessageStatus>(new MessageStatus());
  const user = getAuth().currentUser!;

  useEffect(() => {
    const me: MessageEvent = new MessageEvent(user.uid);
    me.subscribe(setMessage);
    return () => me.destroy();
  }, [user.uid]);

  if (message.messages.length === 0) {
    return (
      <View style={{ padding: 16 }}>
        <Text>No messages</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>Chat for {id} </Text>
      <VirtualizedList
        data={message.getMessagesByGroupId(id)}
        renderItem={({ item }: { item: Message }) => (
          <Text>{item.message}</Text>
        )}
        getItemCount={(data) => data.length}
        getItem={(data, index) => data[index]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
