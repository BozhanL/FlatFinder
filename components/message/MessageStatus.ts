import { Group } from "./Group";
import { Message } from "./Message";
import { User } from "./User";

export class MessageStatus {
  public users: User[] = [];
  public groups: Group[] = [];
  public messages: Message[] = [];

  constructor();
  constructor(prev: MessageStatus);
  constructor(prev?: MessageStatus) {
    if (prev) {
      this.users = [...prev.users];
      this.groups = [...prev.groups];
    }
  }

  public addUser(user: User) {
    this.users.push(user);
  }

  public addUsers(...users: User[]) {
    this.users.push(...users);
  }

  public clearUsers() {
    this.users = [];
  }

  public addGroup(group: Group) {
    this.groups.push(group);
  }

  public addGroups(...groups: Group[]) {
    this.groups.push(...groups);
  }

  public clearGroups() {
    this.groups = [];
  }

  public addMessage(message: Message) {
    this.messages.push(message);
  }

  public addMessages(...messages: Message[]) {
    this.messages.push(...messages);
    this.messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  public clearMessages() {
    this.messages = [];
  }

  public getMessagesByGroupId(groupId: string): Message[] {
    return this.messages.filter((message) => message.group === groupId);
  }

  public getLastMessagesByGroupId(groupId: string): Message | undefined {
    return this.messages.findLast((message) => message.group === groupId);
  }

  public getGroupsByUserId(userId: string): Group[] {
    return this.groups
      .filter((group) => group.members.includes(userId))
      .map((g) => {
        if (!g.name) {
          const other = g.members.find((m) => m !== userId);
          g.name = this.users.find((u) => u.id === other)?.name || "Unknown";
        }
        return g;
      })
      .sort((a, b) => {
        const lastA =
          this.getLastMessagesByGroupId(a.id)?.timestamp.getTime() ?? 0;
        const lastB =
          this.getLastMessagesByGroupId(b.id)?.timestamp.getTime() ?? 0;
        return lastA - lastB;
      })
      .reverse();
  }
}
