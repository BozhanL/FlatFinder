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
import { RedBlackTree } from "data-structure-typed";
import { useEffect, useState } from "react";
import {
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
  VirtualizedList,
} from "react-native";

export default function MessageList({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const [messages, setMessages] = useState<RedBlackTree<Message>>(
    new RedBlackTree<Message>([], {
      specifyComparable: (k) => k.timestamp.toMillis(),
      isReverse: true,
    }),
  );
  const [text, setText] = useState("");

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
        const newMessages = new RedBlackTree<Message>([], {
          specifyComparable: (k) => k.timestamp.toMillis(),
          isReverse: true,
        });

        snapshot.forEach(async (docs) => {
          const data = docs.data();

          newMessages.add(data);
        });

        setMessages(newMessages);
      },
    );
  }, [id]);

  const sendMessage = async () => {
    const db = getFirestore();
    const sender = getAuth().currentUser!.uid;

    try {
      await runTransaction(db, async (transaction) => {
        const groupRef = doc(db, "groups", id);
        const docref = doc(collection(db, "messages", id, "messages"));
        transaction.set(docref, {
          id: docref.id,
          message: text,
          sender: sender,
          timestamp: serverTimestamp(),
        });
        transaction.update(groupRef, {
          lastMessage: text,
          lastSender: sender,
          lastTimestamp: serverTimestamp(),
        });
      });
      console.log("Transaction successfully committed!");
    } catch (e) {
      console.log("Transaction failed: ", e);
    }
    setText("");
  };

  return (
    <View style={styles.container}>
      <Text>Chat for {name} </Text>
      <VirtualizedList
        data={Array.from(messages.keys())}
        renderItem={({ item }: { item: Message }) => (
          <Text>{item.message}</Text>
        )}
        getItemCount={(data) => data.length}
        getItem={(data, index) => data[index]}
      />
      <Text>End of chat</Text>
      <TextInput
        style={styles.input}
        placeholder="Type here to translate!"
        onChangeText={(newText) => setText(newText)}
        defaultValue={text}
      />
      <Button onPress={sendMessage} title="Send message" />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "blue", // Sets the border color to blue
    padding: 10,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
