import { GameRoom, Player } from "@/types/game";
import { getRandomCatastrophe } from "@/data/catastrophes";
import { generateRoomCode } from "./utils";
import { supabase, isSupabaseConfigured } from "./supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

const STORAGE_PREFIX = "bunker_room_";

export class RoomManager {
  private localChannel: BroadcastChannel | null = null;
  private supabaseChannel: RealtimeChannel | null = null;

  initChannel(roomCode: string, onUpdate: (room: GameRoom) => void) {
    this.cleanup();

    // 1. Supabase Realtime channel
    if (supabase && isSupabaseConfigured) {
      this.supabaseChannel = supabase
        .channel(`room_${roomCode}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "rooms",
            filter: `code=eq.${roomCode}`,
          },
          (payload) => {
            if (payload.new) {
              const newRoom = payload.new as GameRoom;
              this.saveLocalRoom(newRoom);
              onUpdate(newRoom);
            }
          }
        )
        .subscribe();
    }

    // 2. Local fallback BroadcastChannel (for instant multi-tab sync)
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      this.localChannel = new BroadcastChannel(`bunker_room_${roomCode}`);
      this.localChannel.onmessage = (event) => {
        if (event.data && event.data.code === roomCode) {
          onUpdate(event.data);
        }
      };
    }
  }

  async createRoom(hostPlayer: Player): Promise<GameRoom> {
    const code = generateRoomCode();
    const catastrophe = getRandomCatastrophe();
    const room: GameRoom = {
      code,
      catastrophe,
      players: [{ ...hostPlayer, isHost: true }],
      status: "lobby",
      createdAt: Date.now(),
    };

    // Save locally
    this.saveLocalRoom(room);

    // Save to Supabase
    if (supabase && isSupabaseConfigured) {
      try {
        const { error } = await supabase.from("rooms").insert([
          {
            code: room.code,
            catastrophe: room.catastrophe,
            players: room.players,
            status: room.status,
          },
        ]);
        if (error) {
          console.warn("Supabase insert error (fallback to local):", error.message);
        }
      } catch (err) {
        console.warn("Supabase network error:", err);
      }
    }

    return room;
  }

  async getRoom(code: string): Promise<GameRoom | null> {
    // Try Supabase first
    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("rooms")
          .select("*")
          .eq("code", code)
          .single();

        if (data && !error) {
          const room = data as GameRoom;
          this.saveLocalRoom(room);
          return room;
        }
      } catch (err) {
        console.warn("Supabase fetch error, fallback to local:", err);
      }
    }

    // Fallback to local storage
    return this.getLocalRoom(code);
  }

  async joinRoom(code: string, player: Player): Promise<GameRoom | null> {
    const room = await this.getRoom(code);
    if (!room) return null;

    const existingIndex = room.players.findIndex((p) => p.id === player.id);
    if (existingIndex >= 0) {
      room.players[existingIndex] = { ...room.players[existingIndex], name: player.name };
    } else {
      room.players.push(player);
    }

    await this.updateRoom(room);
    return room;
  }

  async toggleReady(code: string, playerId: string): Promise<GameRoom | null> {
    const room = await this.getRoom(code);
    if (!room) return null;

    room.players = room.players.map((p) =>
      p.id === playerId ? { ...p, isReady: !p.isReady } : p
    );

    await this.updateRoom(room);
    return room;
  }

  async updateRoom(room: GameRoom): Promise<GameRoom | null> {
    this.saveLocalRoom(room);

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase
          .from("rooms")
          .update({
            catastrophe: room.catastrophe,
            players: room.players,
            status: room.status,
          })
          .eq("code", room.code);
      } catch (err) {
        console.warn("Supabase update error:", err);
      }
    }

    return room;
  }

  private getLocalRoom(code: string): GameRoom | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${code}`);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  private saveLocalRoom(room: GameRoom) {
    if (typeof window === "undefined") return;
    localStorage.setItem(`${STORAGE_PREFIX}${room.code}`, JSON.stringify(room));
    if (this.localChannel) {
      this.localChannel.postMessage(room);
    }
  }

  cleanup() {
    if (this.localChannel) {
      this.localChannel.close();
      this.localChannel = null;
    }
    if (this.supabaseChannel && supabase) {
      supabase.removeChannel(this.supabaseChannel);
      this.supabaseChannel = null;
    }
  }
}

export const roomManager = new RoomManager();
