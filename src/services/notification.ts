import notifee, { type Event, EventType } from "@notifee/react-native";
import { deleteDoc, doc, getFirestore } from "@react-native-firebase/firestore";
import {
  FirebaseMessagingTypes,
  getMessaging,
  getToken,
  onMessage,
  setBackgroundMessageHandler,
} from "@react-native-firebase/messaging";
import {
  useNavigationContainerRef as getNavigationContainerRef,
  router,
} from "expo-router";

export const NO_PUSH_PATH = ["/message", "/chat"];

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
  notifee.onBackgroundEvent(backgroundEvent);

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

export function foregroundEvent({ type, detail: { notification } }: Event) {
  console.log("Foreground Event:", type, notification);
  if (type === EventType.PRESS) {
    if (notification) {
      console.log("Notification:", notification);

      const gid = notification.data?.["gid"] as string | undefined;
      const gname = notification.data?.["gname"] as string | undefined;
      const uid = notification.data?.["uid"] as string | undefined;

      router.push("/message");
      if (gid) {
        router.push({
          pathname: "/chat",
          params: { gid: gid, uid: uid, gname: gname || "" },
        });
      }
    }
  }
}

export async function backgroundEvent({
  type,
  detail: { notification },
}: Event) {
  console.log("Background Event:", type, notification);

  // I think it is fine to call useNavigationContainerRef here.
  // This is the only way I can find to navigate in background event handler.
  // If this is not correct, please let me know.
  const ref = getNavigationContainerRef();
  if (ref.isReady() && type === EventType.PRESS) {
    if (notification) {
      console.log("Notification:", notification);

      const gid = notification.data?.["gid"] as string | undefined;
      const gname = notification.data?.["gname"] as string | undefined;
      const uid = notification.data?.["uid"] as string | undefined;

      router.push("/message");
      if (gid) {
        router.push({
          pathname: "/chat",
          params: { gid: gid, uid: uid, gname: gname || "" },
        });
      }
    }
  }
}
