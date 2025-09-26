import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export type Match = {
  id: string; // matchId = sorted(u1,u2).join("_")
  participants: string[];
  createdAt?: FirebaseFirestoreTypes.Timestamp | null;
  lastMessageAt?: FirebaseFirestoreTypes.Timestamp | null;
  lastMessageText?: string;
};

export type Message = {
  id: string;
  from: string;
  text: string;
  createdAt?: FirebaseFirestoreTypes.Timestamp | null;
};
