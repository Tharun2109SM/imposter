import { createHash, randomBytes, randomInt } from "crypto";

export function createShuffleSeed() {
  return randomBytes(32).toString("hex");
}

export function hashSeed(seed: string) {
  return createHash("sha256").update(seed).digest("hex").slice(0, 16);
}

export function pickSecureIndexes(total: number, count: number) {
  if (count >= total) {
    throw new Error("Imposter count must be lower than total players.");
  }

  const selected = new Set<number>();

  while (selected.size < count) {
    selected.add(randomInt(total));
  }

  return selected;
}
