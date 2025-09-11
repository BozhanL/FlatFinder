/* istanbul ignore file */
// This file mainly contains code for IO, and unable to be tested in unit tests.
import { foregroundMessageHandler } from "@/services/notification";
import notifee, {
  AndroidImportance,
  Event,
  EventType,
} from "@notifee/react-native";
import { router, usePathname } from "expo-router";
import { useEffect } from "react";

export default function useNotification() {
  const path = usePathname();

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
    return foregroundMessageHandler(path);
  }, [path]);

  useEffect(() => {
    return notifee.onForegroundEvent(foregroundEvent);
  }, []);
}

function foregroundEvent({ type, detail: { notification } }: Event) {
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
