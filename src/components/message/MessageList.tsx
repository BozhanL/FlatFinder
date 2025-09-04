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
import { GiftedChat, IMessage } from "react-native-gifted-chat";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MessageList({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const db = getFirestore();
    const messagesRef = collection(
      db,
      "messages",
      id,
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
  }, [id]);

  const sendMessage = async (msg: IMessage) => {
    const db = getFirestore();
    const sender = getAuth().currentUser!.uid;

    try {
      await runTransaction(db, async (transaction) => {
        const groupRef = doc(db, "groups", id);
        const docref = doc(collection(db, "messages", id, "messages"));
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
        name: name,
        user: {
          _id: msg.sender,
        },
      }))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return m;
  }, [messages, name]);
  const insets = useSafeAreaInsets();
  return (
    <GiftedChat
      messages={sortedMessages}
      onSend={(msgs) => {
        const first = msgs[0];
        if (first) {
          sendMessage(first);
        }
      }}
      user={{
        _id: getAuth().currentUser?.uid ?? 1,
      }}
      inverted={true}
      bottomOffset={-insets.bottom}
    />
  );
}
