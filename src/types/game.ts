import { Catastrophe } from "@/data/catastrophes";

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  avatarSeed: number;
  joinedAt: number;
}

export interface GameRoom {
  code: string;
  catastrophe: Catastrophe;
  players: Player[];
  status: "lobby" | "in_game" | "finished";
  createdAt: number;
}
