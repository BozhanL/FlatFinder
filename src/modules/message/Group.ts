import { Timestamp } from "@react-native-firebase/firestore";

export class Group {
  public id: string;
  public name: string | null;
  public members: string[];
  public lastTimestamp: Timestamp;
  public lastMessage: string;
  public lastSender: string;
  public lastNotified: Timestamp;

  constructor(
    id: string,
    name: string | null,
    members: string[],
    lastTimestamp: Timestamp,
    lastMessage: string,
    lastSender: string,
    lastNotified: Timestamp = Timestamp.fromMillis(0),
  ) {
    this.id = id;
    this.name = name;
    this.members = members;
    this.lastTimestamp = lastTimestamp;
    this.lastMessage = lastMessage;
    this.lastSender = lastSender;
    this.lastNotified = lastNotified;
  }
}
