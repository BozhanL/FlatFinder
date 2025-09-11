/* istanbul ignore file */
// This file mainly contains code for IO, and unable to be tested in unit tests.
import { Group } from "@/modules/message/Group";
import { getUserByUidAsync } from "@/modules/message/Helper";
import { Message } from "@/modules/message/Message";
import {
  FirebaseFirestoreTypes,
  collection,
  doc,
  getFirestore,
  onSnapshot,
} from "@react-native-firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { IMessage, User } from "react-native-gifted-chat";

export default function useMessages(
  gid: string,
  gname: string,
): {
  sortedMessages: IMessage[];
  loading: boolean;
  usercache: Map<string, User>;
} {
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
  }, [gid, usercache]);

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

        snapshot.forEach((docs) => {
          const data = docs.data();
          newMessages.push(data);
        });

        setMessages(newMessages);
      },
    );
  }, [gid]);

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

  return { sortedMessages, loading, usercache };
}
