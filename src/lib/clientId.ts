export function newClientId(prefix: string): string {
  const rand = Math.random().toString(16).slice(2, 10);
  return `${prefix}_${rand}`;
}
