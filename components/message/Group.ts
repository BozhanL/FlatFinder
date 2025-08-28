export class Group {
  public id: string;
  public name: string | null;
  public members: string[];

  constructor(id: string, name: string | null, members: string[]) {
    this.id = id;
    this.name = name;
    this.members = members;
  }
}
