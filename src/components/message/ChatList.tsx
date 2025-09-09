import { useMessages } from "@/hooks/useMessages";
import { sendMessage } from "@/services/message";
import {
  Bubble,
  BubbleProps,
  Day,
  DayProps,
  GiftedChat,
  IMessage,
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
}) {
  const { sortedMessages, loading, usercache } = useMessages(gid, gname);

  const insets = useSafeAreaInsets();

  if (loading) {
    return null;
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
        msgs.forEach((m) => sendMessage(m, gid));
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
