import { useMessages } from "@/hooks/useMessages";
import { sendMessage } from "@/services/message";
import { GiftedChat } from "react-native-gifted-chat";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MessageList({
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

  return (
    <GiftedChat
      messages={sortedMessages}
      onSend={(msgs) => {
        msgs.forEach((m) => sendMessage(m, gid));
      }}
      renderAvatarOnTop={true}
      user={usercache.get(uid) || { _id: uid }}
      inverted={true}
      bottomOffset={-insets.bottom}
    />
  );
}
