import { Catastrophe } from "@/data/catastrophes";
import { PlayerCharacterCard } from "@/data/characterData";

export type RpsChoice = "rock" | "scissors" | "paper";

export interface RpsDuel {
  player1Id: string;
  player2Id: string;
  player1Name: string;
  player2Name: string;
  player1Number?: number;
  player2Number?: number;
  choices: Record<string, RpsChoice>;
  status: "choosing" | "draw" | "resolved";
  roundNumber: number;
  lastChoices?: {
    player1Choice: RpsChoice;
    player2Choice: RpsChoice;
  };
}

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  avatarSeed: number;
  joinedAt: number;
  cards?: PlayerCharacterCard[];
  isEliminated?: boolean;
  votedFor?: string;
  playerNumber?: number;
}

export interface GameRoom {
  code: string;
  catastrophe: Catastrophe;
  players: Player[];
  status: "lobby" | "in_game" | "finished";
  createdAt: number;
  votes?: Record<string, string>; // voterId -> targetPlayerId
  lastExpelledName?: string;
  rpsDuel?: RpsDuel;
}
