import { User } from "./User";

export class Group {
  public id: string;
  public name: string;
  public members: User[];

  constructor(id: string, name: string, members: User[]) {
    this.id = id;
    this.name = name;
    this.members = members;
  }
}
