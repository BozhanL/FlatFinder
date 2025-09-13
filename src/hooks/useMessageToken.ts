/* istanbul ignore file */
// This file mainly contains code for IO, and unable to be tested in unit tests.
import {
  FirebaseAuthTypes,
  getAuth,
  onAuthStateChanged,
} from "@react-native-firebase/auth";
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
import { useEffect, useState } from "react";

export default function useMessageToken() {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  useEffect(() => {
    return onAuthStateChanged(getAuth(), setUser);
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    const uid = user.uid;
    const m = getMessaging();
    getToken(m).then((token) => {
      registerToken(uid, token);
    });

    return onTokenRefresh(m, (token) => {
      registerToken(uid, token);
    });
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
