export class Value<T> {
  constructor(name: string, val: T) {
    this.val = val;
    this.name = name;
  }

  public readonly name: string;
  public readonly val: T;
}
