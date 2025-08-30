export class Message {
  public sender: string;
  public message: string;
  public timestamp: Date;

  constructor(sender: string, message: string, timestamp: Date) {
    this.sender = sender;
    this.message = message;
    this.timestamp = timestamp;
  }

  compareTo(other: Message): number {
    return this.timestamp.getTime() - other.timestamp.getTime();
  }
}
