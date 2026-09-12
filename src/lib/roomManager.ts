import { GameRoom, Player } from "@/types/game";
import { getRandomCatastrophe } from "@/data/catastrophes";
import { generateRoomCode } from "./utils";

const STORAGE_PREFIX = "bunker_room_";

export class LocalRoomManager {
  private channel: BroadcastChannel | null = null;
  private onRoomUpdateCallback: ((room: GameRoom) => void) | null = null;
  private currentRoomCode: string | null = null;

  initChannel(roomCode: string, onUpdate: (room: GameRoom) => void) {
    this.currentRoomCode = roomCode;
    this.onRoomUpdateCallback = onUpdate;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      this.channel = new BroadcastChannel(`bunker_room_${roomCode}`);
      this.channel.onmessage = (event) => {
        if (event.data && event.data.code === roomCode) {
          onUpdate(event.data);
        }
      };
    }
  }

  createRoom(hostPlayer: Player): GameRoom {
    const code = generateRoomCode();
    const catastrophe = getRandomCatastrophe();
    const room: GameRoom = {
      code,
      catastrophe,
      players: [{ ...hostPlayer, isHost: true }],
      status: "lobby",
      createdAt: Date.now(),
    };

    this.saveRoom(room);
    return room;
  }

  getRoom(code: string): GameRoom | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${code}`);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  saveRoom(room: GameRoom) {
    if (typeof window === "undefined") return;
    localStorage.setItem(`${STORAGE_PREFIX}${room.code}`, JSON.stringify(room));
    if (this.channel) {
      this.channel.postMessage(room);
    }
  }

  joinRoom(code: string, player: Player): GameRoom | null {
    const room = this.getRoom(code);
    if (!room) return null;

    // Check if player already in room
    const existingIndex = room.players.findIndex((p) => p.id === player.id);
    if (existingIndex >= 0) {
      room.players[existingIndex] = { ...room.players[existingIndex], name: player.name };
    } else {
      room.players.push(player);
    }

    this.saveRoom(room);
    return room;
  }

  toggleReady(code: string, playerId: string): GameRoom | null {
    const room = this.getRoom(code);
    if (!room) return null;

    room.players = room.players.map((p) =>
      p.id === playerId ? { ...p, isReady: !p.isReady } : p
    );

    this.saveRoom(room);
    return room;
  }

  cleanup() {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
  }
}

export const roomManager = new LocalRoomManager();
