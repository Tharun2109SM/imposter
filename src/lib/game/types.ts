export type GameMode = "OFFLINE" | "ONLINE";

export type GamePhase =
  | "LOBBY"
  | "REVEAL"
  | "OFFLINE_DISCUSSION"
  | "CLUE_SUBMISSION"
  | "CLUE_REVIEW"
  | "VOTING"
  | "RESULTS"
  | "ENDED";

export type Player = {
  id: string;
  name: string;
  isHost: boolean;
  status: "CONNECTED" | "DISCONNECTED";
};

export type WordPair = {
  id: string;
  normalWord: string;
  imposterWord: string;
  position: number;
};

export type Assignment = {
  playerId: string;
  isImposter: boolean;
  word: string;
};

export type RoomSettings = {
  mode: GameMode;
  totalPlayers: number;
  imposterCount: number;
  wordPairs: WordPair[];
};

export type RoomSnapshot = {
  code: string;
  phase: GamePhase;
  hostPlayerId: string | null;
  settings: RoomSettings;
  players: Player[];
  roundNumber: number;
  shuffleSeedHash: string | null;
};
