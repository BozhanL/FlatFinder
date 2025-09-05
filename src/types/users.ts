import { User } from "react-native-gifted-chat";

export interface GetUserByUidSync {
  (uid: string): User | null;
}

export interface GetUserByUidAsync {
  (uid: string): Promise<User | null>;
}
