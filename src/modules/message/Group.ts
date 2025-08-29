export class Group {
  public id: string;
  public name: string;
  public members: string[];

  constructor(id: string, name: string, members: string[]) {
    this.id = id;
    this.name = name;
    this.members = members;
  }
}
