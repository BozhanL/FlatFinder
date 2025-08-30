import { RedBlackTree } from "data-structure-typed";
import { Group } from "./Group";
import { Message } from "./Message";

export class MessageStatus {
  protected group: Group;
  protected messages = new RedBlackTree<Message>([], {
    specifyComparable: (r: Message) => r.timestamp,
    isReverse: true,
  });

  constructor(group: Group);
  constructor(prev: MessageStatus);
  constructor(groupOrPrev: Group | MessageStatus) {
    if (groupOrPrev instanceof Group) {
      this.group = groupOrPrev;
    } else {
      this.group = groupOrPrev.group;
      // create a new tree to avoid mutating the previous instance's tree
      this.messages.addMany(groupOrPrev.messages);
    }
  }

  getGroup(): Group {
    return this.group;
  }

  addMessage(message: Message) {
    console.log(message);
    this.messages.add(message);
  }

  addMessages(...messages: Message[]) {
    console.log(messages);
    messages.forEach((message) => this.messages.add(message));
  }

  getMessages(groupId: string): Message[] {
    return Array.from(this.messages.values())
      .filter((message) => message.group === groupId)
      .sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1))
      .reverse();
  }

  isEmpty(): boolean {
    return this.messages.size === 0;
  }
}
