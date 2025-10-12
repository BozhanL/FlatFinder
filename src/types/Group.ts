/* istanbul ignore file */
// This file contains only type definitions.
// No need to test it in unit tests.
import type { Timestamp } from "@react-native-firebase/firestore";

export type Group = {
  id: string;
  name: string | null;
  members: string[];
  lastTimestamp: Timestamp;
  lastMessage: string | null;
  lastSender: string | null;
  lastNotified: Timestamp;
  avatar?: string | null;
};
