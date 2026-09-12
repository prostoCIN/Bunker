import { Catastrophe } from "@/data/catastrophes";
import { PlayerCharacterCard } from "@/data/characterData";

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  avatarSeed: number;
  joinedAt: number;
  cards?: PlayerCharacterCard[];
  isEliminated?: boolean;
}

export interface GameRoom {
  code: string;
  catastrophe: Catastrophe;
  players: Player[];
  status: "lobby" | "in_game" | "finished";
  createdAt: number;
}
