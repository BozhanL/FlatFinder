import { doc, getDoc, getFirestore } from "@react-native-firebase/firestore";
import { User } from "react-native-gifted-chat";

// export async function getUserNameFromId(id: string): Promise<string> {
//   const db = getFirestore();
//   const userDoc = await getDoc(doc(db, "message_test_user", id));
//   return userDoc.exists()
//     ? (userDoc.data() as { name: string }).name
//     : "Unknown";
// }

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
