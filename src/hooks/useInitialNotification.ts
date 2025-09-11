import notifee from "@notifee/react-native";
import { router } from "expo-router";
import { useEffect } from "react";

export default function useInitialNotification() {
  useEffect(() => {
    bootstrap().catch(console.error);
  }, []);
}

async function bootstrap() {
  const initialNotification = await notifee.getInitialNotification();

  if (initialNotification) {
    console.log("Initial Notification:", initialNotification);

    const gid = initialNotification.notification.data?.["gid"] as
      | string
      | undefined;
    const gname = initialNotification.notification.data?.["gname"] as
      | string
      | undefined;
    const uid = initialNotification.notification.data?.["uid"] as
      | string
      | undefined;

    router.push("/message");
    if (gid) {
      router.push({
        pathname: "/chat",
        params: { gid: gid, uid: uid, gname: gname || "" },
      });
    }
  }
}
