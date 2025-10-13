import type { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export type SwipeDoc = {
  uid: string;
  dir: "like" | "pass";
  createdAt?: FirebaseFirestoreTypes.Timestamp | null;
};
