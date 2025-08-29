export class Message {
  public id: string;
  public group: string;
  public sender: string;
  public message: string;
  public timestamp: Date;

  constructor(
    id: string,
    group: string,
    sender: string,
    message: string,
    timestamp: Date,
  ) {
    this.id = id;
    this.group = group;
    this.sender = sender;
    this.message = message;
    this.timestamp = timestamp;
  }
}
