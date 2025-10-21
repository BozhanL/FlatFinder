/* istanbul ignore file */
// This file contains only type definitions.
// No need to test it in unit tests.
import type { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import type { SwipeAction } from "./SwipeAction";

export type SwipeDoc = {
  uid: string;
  dir: SwipeAction;
  createdAt?: FirebaseFirestoreTypes.Timestamp | null;
};
