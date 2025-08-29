import { Group } from "./Group";
import { User } from "./User";

export class Message {
  public group: Group;
  public id: string;
  public sender: User;
  public message: string;
  public timestamp: Date;

  constructor(
    group: Group,
    id: string,
    sender: User,
    message: string,
    timestamp: Date,
  ) {
    this.group = group;
    this.id = id;
    this.sender = sender;
    this.message = message;
    this.timestamp = timestamp;
  }
}
