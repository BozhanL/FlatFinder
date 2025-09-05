import { Group } from "@/modules/message/Group";
import { getUserByUidAsync } from "@/modules/message/Helper";
import { Message } from "@/modules/message/Message";
import { getAuth } from "@react-native-firebase/auth";
import {
  collection,
  doc,
  FirebaseFirestoreTypes,
  getFirestore,
  onSnapshot,
  runTransaction,
  serverTimestamp,
} from "@react-native-firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { GiftedChat, IMessage, User } from "react-native-gifted-chat";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MessageList({
  gid,
  gname,
}: {
  gid: string;
  gname: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [usercache, setUserCache] = useState<Map<string, User>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getFirestore();
    const groupRef = doc(db, "groups", gid);
    return onSnapshot(
      groupRef,
      (doc: FirebaseFirestoreTypes.DocumentSnapshot) => {
        const data = doc.data() as Group;
        Promise.all(
          data.members.map(async (m) => {
            if (!usercache.has(m)) {
              const userDoc = await getUserByUidAsync(m);
              if (userDoc) {
                setUserCache((prev) => new Map(prev).set(m, userDoc));
              }
            }
          }),
        ).finally(() => setLoading(false));
      },
    );
  }, [gid]);

  useEffect(() => {
    const db = getFirestore();
    const messagesRef = collection(
      db,
      "messages",
      gid,
      "messages",
    ) as FirebaseFirestoreTypes.CollectionReference<Message>;

    return onSnapshot(
      messagesRef,
      (snapshot: FirebaseFirestoreTypes.QuerySnapshot<Message>) => {
        const newMessages: Message[] = [];

        snapshot.forEach(async (docs) => {
          const data = docs.data();

          newMessages.push(data);
        });

        setMessages(newMessages);
      },
    );
  }, [gid]);

  const sendMessage = async (msg: IMessage) => {
    const db = getFirestore();
    const sender = getAuth().currentUser!.uid;

    try {
      await runTransaction(db, async (transaction) => {
        const groupRef = doc(db, "groups", gid);
        const docref = doc(collection(db, "messages", gid, "messages"));
        transaction.set(docref, {
          id: docref.id,
          message: msg.text,
          sender: sender,
          timestamp: serverTimestamp(),
        });
        transaction.update(groupRef, {
          lastMessage: msg.text,
          lastSender: sender,
          lastTimestamp: serverTimestamp(),
        });
      });
      console.log("Transaction successfully committed!");
    } catch (e) {
      console.log("Transaction failed: ", e);
    }
  };

  const sortedMessages = useMemo(() => {
    const m = messages
      .map((msg) => ({
        _id: msg.id,
        text: msg.message,
        createdAt: msg.timestamp ? msg.timestamp.toDate() : new Date(),
        name: gname,
        user: usercache.get(msg.sender) || { _id: msg.sender },
      }))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return m;
  }, [messages, gname, usercache]);

  const insets = useSafeAreaInsets();
  const uid = getAuth().currentUser!.uid;

  if (loading) {
    return null;
  }

  return (
    <GiftedChat
      messages={sortedMessages}
      onSend={(msgs) => {
        msgs.forEach((m) => sendMessage(m));
      }}
      renderAvatarOnTop={true}
      user={usercache.get(uid) || { _id: uid }}
      inverted={true}
      bottomOffset={-insets.bottom}
    />
  );
}
