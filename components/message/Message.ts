export class Message {
  public group: string;
  public id: string;
  public uid: string;
  public message: string;
  public timestamp: Date;

  constructor(
    group: string,
    id: string,
    uid: string,
    message: string,
    timestamp: Date,
  ) {
    this.group = group;
    this.id = id;
    this.uid = uid;
    this.message = message;
    this.timestamp = timestamp;
  }
}
