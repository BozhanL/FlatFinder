/* istanbul ignore file */
// This file contains only type definitions.
// No need to test it in unit tests.
import type { Timestamp } from "@react-native-firebase/firestore";
import type { IMessage } from "react-native-gifted-chat";

export type GiftedChatMessage = IMessage & {
  gid: string;
  seenTimestamp: Timestamp | null;
};
