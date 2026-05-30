import { z } from "zod";

export const playerNameSchema = z
  .string()
  .trim()
  .min(2, "Use at least 2 characters.")
  .max(24, "Keep names under 24 characters.");

export const wordPairSchema = z
  .object({
    id: z.string().optional(),
    normalWord: z.string().trim().min(1).max(32),
    imposterWord: z.string().trim().min(1).max(32),
    position: z.number().int().min(0)
  })
  .refine(
    (pair) => pair.normalWord.toLowerCase() !== pair.imposterWord.toLowerCase(),
    "Words must differ to maintain the mystery."
  );

export const roomSettingsSchema = z
  .object({
    mode: z.enum(["OFFLINE", "ONLINE"]),
    totalPlayers: z.number().int().min(3).max(16),
    imposterCount: z.number().int().min(1).max(4),
    wordPairs: z.array(wordPairSchema).min(1)
  })
  .refine(
    (settings) => settings.imposterCount < settings.totalPlayers - 1,
    "Needs at least two normal players."
  );

export const clueSchema = z
  .string()
  .trim()
  .min(2)
  .max(15)
  .regex(/^[a-zA-Z]+$/, "Single words only.");
