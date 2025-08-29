import { Group } from "./Group";
import { Message } from "./Message";

export class MessageStatus {
  protected groups: Map<string, Group> = new Map();
  protected messages: Map<string, Message> = new Map();

  constructor();
  constructor(prev: MessageStatus);
  constructor(prev?: MessageStatus) {
    if (prev) {
      this.groups = prev.groups;
      this.messages = prev.messages;
    }
  }

  addGroup(group: Group) {
    this.groups.set(group.id, group);
  }

  addGroups(...groups: Group[]) {
    groups.forEach((group) => this.groups.set(group.id, group));
  }

  getGroup(id: string): Group | undefined {
    return this.groups.get(id);
  }

  removeGroup(id: string): boolean {
    return this.groups.delete(id);
  }

  getGroups(): Group[] {
    return Array.from(this.groups.values());
  }

  addMessage(message: Message) {
    console.log(message);
    this.messages.set(message.id, message);
  }

  addMessages(...messages: Message[]) {
    console.log(messages);
    messages.forEach((message) => this.messages.set(message.id, message));
  }

  getMessage(id: string): Message | undefined {
    return this.messages.get(id);
  }

  getMessages(groupId: string): Message[] {
    return Array.from(this.messages.values())
      .filter((message) => message.group === groupId)
      .sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1))
      .reverse();
  }

  removeMessage(id: string): boolean {
    return this.messages.delete(id);
  }

  isEmpty(): boolean {
    return this.groups.size === 0 && this.messages.size === 0;
  }
}
