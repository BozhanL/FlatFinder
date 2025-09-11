import { Timestamp } from "@react-native-firebase/firestore";

export type Group = {
  id: string;
  name: string | null;
  members: string[];
  lastTimestamp: Timestamp;
  lastMessage: string;
  lastSender: string;
  lastNotified: Timestamp;
};
