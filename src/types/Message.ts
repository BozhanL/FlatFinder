import { Timestamp } from "@react-native-firebase/firestore";

export type Message = {
  id: string;
  sender: string;
  message: string;
  timestamp: Timestamp;
};
