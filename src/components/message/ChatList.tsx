import useMessages from "@/hooks/useMessages";
import { sendMessage } from "@/services/message";
import type { JSX } from "react";
import { ActivityIndicator, View } from "react-native";
import {
  Bubble,
  type BubbleProps,
  Day,
  type DayProps,
  GiftedChat,
  type IMessage,
} from "react-native-gifted-chat";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ChatList({
  gid,
  gname,
  uid,
}: {
  gid: string;
  gname: string;
  uid: string;
}): JSX.Element {
  const { sortedMessages, loading, usercache } = useMessages(gid, gname);

  const insets = useSafeAreaInsets();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator accessibilityHint="loading" />
      </View>
    );
  }

  const renderBubble = (props: BubbleProps<IMessage>) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: "#4A4459",
          },
          left: {
            backgroundColor: "#DADADA",
          },
        }}
      />
    );
  };

  const renderDay = (props: DayProps) => {
    return (
      <Day
        {...props}
        wrapperStyle={{ backgroundColor: "transparent" }}
        textStyle={{ color: "#79747E" }}
      />
    );
  };

  return (
    <GiftedChat
      messages={sortedMessages}
      onSend={(msgs) => {
        msgs.forEach((m) => void sendMessage(m, gid));
      }}
      renderAvatarOnTop={true}
      showUserAvatar={true}
      user={usercache.get(uid) || { _id: uid }}
      inverted={true}
      bottomOffset={-insets.bottom}
      renderBubble={renderBubble}
      renderDay={renderDay}
    />
  );
}
