import { getAuth } from "@react-native-firebase/auth";
import {
  collection,
  doc,
  getFirestore,
  runTransaction,
  serverTimestamp,
} from "@react-native-firebase/firestore";
import { IMessage } from "react-native-gifted-chat";

export async function sendMessage(msg: IMessage, gid: string) {
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
}

// Create a new group with given user IDs and optional group name
// Returns the new group's ID
// If no group name is provided, it will be set to one other member's name when displaying
export async function createGroup(
  uids: string[],
  gname?: string,
): Promise<string | null> {
  const db = getFirestore();

  try {
    const p = await runTransaction<string>(db, async (transaction) => {
      const groupRef = doc(collection(db, "groups"));
      await transaction.set(groupRef, {
        id: groupRef.id,
        name: gname || null,
        members: uids,
        lastSender: "",
        lastTimestamp: serverTimestamp(),
      });
      return groupRef.id;
    });
    return p;
  } catch (e) {
    console.log("Transaction failed: ", e);
  }

  return null;
}
