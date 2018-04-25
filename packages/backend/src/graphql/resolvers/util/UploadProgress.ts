export class UploadProgress {
  private invalid = 0;
  private valid = 0;
  public increaseValidEntries() {
    this.valid++;
  }

  public increaseInvalidEntries() {
    this.invalid++;
  }

  public get invalidEntries() {
    return this.invalid;
  }

  public get validEntries() {
    return this.valid;
  }
}
