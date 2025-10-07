import type { Group } from "@/types/Group";
import type { Message } from "@/types/Message";
import {
  collection,
  deleteDoc,
  doc,
  FirebaseFirestoreTypes,
  getDoc,
  getFirestore,
  runTransaction,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "@react-native-firebase/firestore";
import type { IMessage, User } from "react-native-gifted-chat";

export async function sendMessage(msg: IMessage, gid: string): Promise<void> {
  const db = getFirestore();

  try {
    await runTransaction(db, (transaction) => {
      const groupRef = doc(db, "groups", gid);
      const docref = doc(collection(db, "messages", gid, "messages"));

      const m: Message = {
        id: docref.id,
        message: msg.text,
        sender: msg.user._id.toString(),
        timestamp: serverTimestamp() as Timestamp,
        received: false,
      };
      transaction.set(docref, m);
      transaction.update(groupRef, {
        lastMessage: msg.text,
        lastSender: msg.user._id,
        lastTimestamp: serverTimestamp(),
      });
      return Promise.resolve();
    });
    console.log("Transaction successfully committed!");
  } catch (e) {
    console.error("Transaction failed: ", e);
  }
}

export async function markMessagesAsReceived(
  gid: string,
  mid: string,
): Promise<void> {
  const db = getFirestore();

  try {
    const docref = doc(db, "messages", gid, "messages", mid);
    await updateDoc(docref, { received: true });
  } catch (e) {
    console.error("Failed to mark message as received: ", e);
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
    const p = await runTransaction<string>(db, (transaction) => {
      const groupRef: FirebaseFirestoreTypes.DocumentReference = doc(
        collection(db, "groups"),
      );

      const g: Group = {
        id: groupRef.id,
        name: gname || null,
        members: uids,
        lastSender: null,
        lastTimestamp: serverTimestamp() as Timestamp,
        lastMessage: null,
        lastNotified: Timestamp.fromMillis(0),
      };
      transaction.set(groupRef, g);
      return Promise.resolve(groupRef.id);
    });
    return p;
  } catch (e) {
    console.error("Transaction failed: ", e);
  }

  return null;
}

export async function deleteGroup(gid: string): Promise<void> {
  const db = getFirestore();
  const docRef = doc(db, "groups", gid);
  await deleteDoc(docRef);
}

export async function getGroup(gid: string): Promise<Group | null> {
  const db = getFirestore();
  const groupDoc = await getDoc(doc(db, "groups", gid));
  if (!groupDoc.exists()) {
    return null;
  }

  const data = groupDoc.data() as Group;
  return data;
}

// TODO: Implement when user profile is available @G2CCC
export async function getUserByUidAsync(uid: string): Promise<User | null> {
  const db = getFirestore();
  const userDoc = await getDoc(doc(db, "message_test_user", uid));
  if (!userDoc.exists()) {
    return null;
  }
  const data = userDoc.data() as { name: string };

  const user: User = {
    _id: uid,
    name: data.name,
    avatar:
      "https://ui-avatars.com/api/?background=0dbc3f&color=FFF&name=" +
      encodeURIComponent(data.name),
  };

  return user;
}
