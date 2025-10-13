/* istanbul ignore file */
// This file contains only type definitions.
// No need to test it in unit tests.
import type { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export type SwipeDoc = {
  uid: string;
  dir: "like" | "pass";
  createdAt?: FirebaseFirestoreTypes.Timestamp | null;
};
