import { randomInt } from "crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ";

export function createRoomCode() {
  return Array.from({ length: 4 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
}

export function formatRoomCode(value: string) {
  return value
    .replace(/[^a-z]/gi, "")
    .slice(0, 4)
    .toUpperCase()
    .split("")
    .join("-");
}

export function normalizeRoomCode(value: string) {
  return value.replace(/[^a-z]/gi, "").slice(0, 4).toUpperCase();
}
