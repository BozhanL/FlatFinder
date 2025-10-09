import useIsTyping from "@/hooks/useIsTyping";
import useMessages from "@/hooks/useMessages";
import useOnTyping from "@/hooks/useOnTyping";
import { markMessagesAsReceived, sendMessage } from "@/services/message";
import type { GiftedChatMessage } from "@/types/GiftedChatMessage";
import dayjs from "dayjs";
import "dayjs/locale/en-nz";
import relativeTime from "dayjs/plugin/relativeTime";
import { type JSX, useCallback } from "react";
import {
  ActivityIndicator,
  type StyleProp,
  StyleSheet,
  Text,
  type TextStyle,
  View,
} from "react-native";
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

dayjs.extend(relativeTime);
dayjs.locale("en-nz");

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
  const onTyping = useOnTyping(gid, uid);
  const isTyping = useIsTyping(gid, uid);

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
      renderBubble={useRenderBubble}
      renderDay={useRenderDay}
      renderMessage={useRenderMessage}
      onInputTextChanged={onTyping}
      isTyping={isTyping}
      locale={"en-nz"}
    />
  );
}

function useRenderDay(props: DayProps): JSX.Element {
  return (
    <Day
      {...props}
      wrapperStyle={{ backgroundColor: "transparent" }}
      textStyle={{ color: "#79747E" }}
    />
  );
}

function useRenderBubble(props: BubbleProps<IMessage>): JSX.Element {
  const uid = props.user?._id;
  const tickStyle = props.tickStyle;

  const renderTicks = useRenderTicks(uid, tickStyle);

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
      renderTicks={renderTicks}
    />
  );
}

function useRenderTicks(
  uid?: string | number ,
  tickStyle?: StyleProp<TextStyle>,
): (currentMessage: GiftedChatMessage) => JSX.Element | null {
  function f(currentMessage: GiftedChatMessage): JSX.Element | null {
    if (uid && currentMessage.user._id !== uid) {
      return null;
    } else if (currentMessage.received && currentMessage.seenTimestamp) {
      const timestamp = currentMessage.seenTimestamp;
      const dayJsObject = dayjs(timestamp.toDate());
      const timeStr = dayJsObject.fromNow();
      console.debug("renderTicks seen at", timeStr);

      return (
        <View style={styles.tickView}>
          <Text style={[styles.tick, tickStyle]}>{`Seen: ${timeStr}`}</Text>
        </View>
      );
    } else if (currentMessage.sent) {
      return (
        <View style={styles.tickView}>
          <Text style={[styles.tick, tickStyle]}>{"✓"}</Text>
        </View>
      );
    } else if (currentMessage.pending) {
      return (
        <View style={styles.tickView}>
          <Text style={[styles.tick, tickStyle]}>{"🕓"}</Text>
        </View>
      );
    }

    return null;
  }

  return useCallback(f, [uid, tickStyle]);
}

function useRenderMessage(props: MessageProps<GiftedChatMessage>): JSX.Element {
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

const styles = StyleSheet.create({
  tickView: {
    flexDirection: "row",
    marginRight: 10,
  },
  tick: {
    fontSize: 10,
    backgroundColor: "transparent",
    color: "white",
  },
});
