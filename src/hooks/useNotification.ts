/* istanbul ignore file */
// This file mainly contains code for IO, and unable to be tested in unit tests.
// react-native-firebase does not work in jest unit test environment.
// Mocking it is possible, but it may not represent real world situation.
import {
  foregroundEvent,
  foregroundMessageHandler,
} from "@/services/notification";
import notifee, { AndroidImportance } from "@notifee/react-native";
import { usePathname } from "expo-router";
import { useEffect } from "react";

export default function useNotification(): void {
  const path = usePathname();

  useEffect(() => {
    void notifee.requestPermission();
  }, []);

  useEffect(() => {
    void notifee.createChannel({
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
