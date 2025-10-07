import useMessages from "@/hooks/useMessages";
import { markMessagesAsReceived, sendMessage } from "@/services/message";
import type { GiftedChatMessage } from "@/types/GiftedChatMessage";
import type { JSX } from "react";
import { ActivityIndicator, View } from "react-native";
import {
  Bubble,
  type BubbleProps,
  Day,
  type DayProps,
  GiftedChat,
  type IMessage,
  Message,
  type MessageProps,
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
      renderMessage={renderMessage}
    />
  );
}

function renderDay(props: DayProps): JSX.Element {
  return (
    <Day
      {...props}
      wrapperStyle={{ backgroundColor: "transparent" }}
      textStyle={{ color: "#79747E" }}
    />
  );
}

function renderBubble(props: BubbleProps<IMessage>): JSX.Element {
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
}

function renderMessage(props: MessageProps<GiftedChatMessage>): JSX.Element {
  if (
    props.currentMessage.received !== true &&
    props.currentMessage.user._id !== props.user._id
  ) {
    void markMessagesAsReceived(
      props.currentMessage.gid,
      props.currentMessage._id.toString(),
    );
  }

  return <Message {...props} />;
}
