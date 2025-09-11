import notifee, { AndroidImportance } from "@notifee/react-native";
import {
  FirebaseAuthTypes,
  getAuth,
  onAuthStateChanged,
} from "@react-native-firebase/auth";
import {
  deleteDoc,
  doc,
  getFirestore,
  serverTimestamp,
  setDoc,
} from "@react-native-firebase/firestore";
import {
  FirebaseMessagingTypes,
  getMessaging,
  getToken,
  onMessage,
  onTokenRefresh,
  setBackgroundMessageHandler,
} from "@react-native-firebase/messaging";
import { useEffect, useState } from "react";

export default function useNotification() {
  useEffect(() => {
    notifee.requestPermission();
  }, []);

  useEffect(() => {
    notifee.createChannel({
      id: "messages",
      name: "Messages",
      lights: true,
      vibration: true,
      badge: true,
      importance: AndroidImportance.HIGH,
    });
  }, []);

  useEffect(() => {
    return foregroundMessageHandler();
  }, []);

  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  useEffect(() => {
    const subscriber = onAuthStateChanged(getAuth(), (user) => {
      setUser(user);
    });
    return subscriber; // unsubscribe on unmount
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    const uid = user.uid;
    const m = getMessaging();
    getToken(m).then((token) => {
      console.log("FCM Token:", token);
      registerToken(uid, token);
    });

    return onTokenRefresh(m, (token) => {
      registerToken(uid, token);
    });
  }, [user]);
}

export function backgroundMessageHandler() {
  notifee.onBackgroundEvent(async () => {});

  setBackgroundMessageHandler(getMessaging(), onMessageReceived);
}

function foregroundMessageHandler(): () => void {
  return onMessage(getMessaging(), onMessageReceived);
}

async function onMessageReceived(
  message: FirebaseMessagingTypes.RemoteMessage,
) {
  console.log("FCM Message:", message);
  const m = message.data?.["notifee"];
  if (typeof m === "string") {
    await notifee.displayNotification(JSON.parse(m));
  }
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

export async function deregisterToken() {
  const uid = getAuth().currentUser!.uid;
  const token = await getToken(getMessaging());

  const db = getFirestore();
  const docRef = doc(db, "notifications", token);
  console.log("Deregister token:", token, "for user:", uid);
  await deleteDoc(docRef);
}
