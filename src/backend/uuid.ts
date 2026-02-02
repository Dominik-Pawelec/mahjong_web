const usedIds = new Set<string>();
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const ID_LENGTH = 6;

function generateRandomId(): string {
  let result = '';
  for (let i = 0; i < ID_LENGTH; i++) {
    const index = Math.floor(Math.random() * CHARS.length);
    result += CHARS[index];
  }
  return result;
}

export function createUUID(): string {
  let id: string;

  do {
    id = generateRandomId();
  } while (usedIds.has(id));

  usedIds.add(id);
  return id;
}

export function releaseUUID(id: string): void {
  usedIds.delete(id);
}
