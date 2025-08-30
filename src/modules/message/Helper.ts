import { doc, getDoc, getFirestore } from "@react-native-firebase/firestore";

export async function getUserNameFromId(id: string): Promise<string> {
  const db = getFirestore();
  const userDoc = await getDoc(doc(db, "message_test_user", id));
  return userDoc.exists()
    ? (userDoc.data() as { name: string }).name
    : "Unknown";
}
