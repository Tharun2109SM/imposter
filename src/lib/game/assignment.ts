import type { Assignment, Player, WordPair } from "./types";
import { pickSecureIndexes } from "./random";

export function assignWords(params: {
  players: Player[];
  imposterCount: number;
  wordPair: WordPair;
}): Assignment[] {
  const { players, imposterCount, wordPair } = params;
  const imposterIndexes = pickSecureIndexes(players.length, imposterCount);

  return players.map((player, index) => {
    const isImposter = imposterIndexes.has(index);

    return {
      playerId: player.id,
      isImposter,
      word: isImposter ? wordPair.imposterWord : wordPair.normalWord
    };
  });
}
