import type { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import type { TicketStatus } from "./TicketStatus";

export type TicketDoc = {
  createdAt?: FirebaseFirestoreTypes.Timestamp | null;
  status?: TicketStatus;
  id?: string;
  name?: string;
  email?: string;
  title?: string;
  message?: string;
};
