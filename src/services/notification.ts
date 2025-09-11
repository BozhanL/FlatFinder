import notifee from "@notifee/react-native";
import { deleteDoc, doc, getFirestore } from "@react-native-firebase/firestore";
import {
  FirebaseMessagingTypes,
  getMessaging,
  getToken,
  onMessage,
  setBackgroundMessageHandler,
} from "@react-native-firebase/messaging";

const NO_PUSH_PATH = ["/message", "/chat"];

export async function deregisterToken() {
  const token = await getToken(getMessaging());

  const db = getFirestore();
  const docRef = doc(db, "notifications", token);
  console.log("Deregister token:", token);
  await deleteDoc(docRef);
}

export function foregroundMessageHandler(path: string) {
  return onMessage(getMessaging(), (message) =>
    onMessageReceived(message, path),
  );
}

export function backgroundMessageHandler() {
  notifee.onBackgroundEvent(async () => {});

  setBackgroundMessageHandler(getMessaging(), onMessageReceived);
}

export async function onMessageReceived(
  message: FirebaseMessagingTypes.RemoteMessage,
  currentPathname?: string,
) {
  console.log("FCM Message:", message);

  if (currentPathname && NO_PUSH_PATH.includes(currentPathname)) {
    return;
  }

  const m = message.data?.["notifee"];
  if (typeof m === "string") {
    await notifee.displayNotification(JSON.parse(m));
  }
}
