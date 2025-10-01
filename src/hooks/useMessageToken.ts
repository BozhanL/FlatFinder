/* istanbul ignore file */
// This file mainly contains code for IO, and unable to be tested in unit tests.
import useUser from "@/hooks/useUser";
import {
  doc,
  getFirestore,
  serverTimestamp,
  setDoc,
} from "@react-native-firebase/firestore";
import {
  getMessaging,
  getToken,
  onTokenRefresh,
} from "@react-native-firebase/messaging";
import { useEffect } from "react";

export default function useMessageToken() {
  const user = useUser();

  useEffect(() => {
    if (!user) {
      return;
    }

    const uid = user.uid;
    const m = getMessaging();
    void getToken(m).then((token) => registerToken(uid, token));

    return onTokenRefresh(m, (token) => registerToken(uid, token));
  }, [user]);
}

async function registerToken(uid: string, token: string) {
  const db = getFirestore();
  const docRef = doc(db, "notifications", token);
  console.log("Register token:", token, "for user:", uid);
  await setDoc(docRef, {
    uid: uid,
    token: token,
    timestamp: serverTimestamp(),
  });
}
