import { Timestamp } from "@react-native-firebase/firestore";

export class Message {
  public id: string;
  public sender: string;
  public message: string;
  public timestamp: Timestamp;

  constructor(
    id: string,
    sender: string,
    message: string,
    timestamp: Timestamp,
  ) {
    this.id = id;
    this.sender = sender;
    this.message = message;
    this.timestamp = timestamp;
  }
}
