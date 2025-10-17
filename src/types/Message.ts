/* istanbul ignore file */
// This file contains only type definitions.
// No need to test it in unit tests.
import { Timestamp } from "@react-native-firebase/firestore";

export type Message = {
  id: string;
  sender: string;
  message: string;
  timestamp: Timestamp;
};
