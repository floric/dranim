export const compareByName = (a: { name: string }, b: { name: string }) =>
  a.name.localeCompare(b.name);
