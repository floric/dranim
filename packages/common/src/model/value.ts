export class Value {
  constructor(name: string, val: string) {
    this.val = val;
    this.name = name;
  }

  public readonly name: string;
  public readonly val: string;
}
