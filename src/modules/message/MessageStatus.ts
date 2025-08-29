import { Group } from "./Group";

export class MessageStatus {
  public groups: Group[] = [];

  constructor();
  constructor(prev: MessageStatus);
  constructor(prev?: MessageStatus) {
    if (prev) {
      this.groups = [...prev.groups];
    }
  }

  addGroup(group: Group) {
    this.groups.push(group);
  }

  addGroups(...groups: Group[]) {
    this.groups.push(...groups);
  }
}
