import { GameRoom, Player, RpsChoice } from "@/types/game";
import { getRandomCatastrophe } from "@/data/catastrophes";
import { generateRoomCode } from "./utils";
import { supabase, isSupabaseConfigured } from "./supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

const STORAGE_PREFIX = "bunker_room_";

export class RoomManager {
  private localChannel: BroadcastChannel | null = null;
  private supabaseChannel: RealtimeChannel | null = null;

  /**
   * Unpack raw room payload from Supabase or localStorage and guarantee that
   * votes, rpsDuel, and lastExpelledName are preserved even across schema boundaries.
   */
  private normalizeRoom(raw: any): GameRoom {
    if (!raw) return raw;

    const catastrophe = raw.catastrophe ? { ...raw.catastrophe } : {};

    // 1. Recover votes from catastrophe metadata and raw.votes
    const votes: Record<string, string> = {
      ...(catastrophe._votes || {}),
      ...(raw.votes || {}),
    };

    // 2. Recover votes from players array if present
    const players: Player[] = Array.isArray(raw.players)
      ? raw.players.map((p: any) => {
          const voterChoice = p.votedFor || votes[p.id];
          if (voterChoice) {
            votes[p.id] = voterChoice;
          }
          return {
            ...p,
            votedFor: voterChoice,
          };
        })
      : [];

    // 3. Recover rpsDuel and lastExpelledName
    const rpsDuel =
      catastrophe._rpsDuel !== undefined ? catastrophe._rpsDuel : raw.rpsDuel;
    const lastExpelledName =
      catastrophe._lastExpelledName !== undefined
        ? catastrophe._lastExpelledName
        : raw.lastExpelledName;

    // Clean internal metadata from catastrophe object so it doesn't pollute UI
    const cleanCatastrophe = { ...catastrophe };
    delete cleanCatastrophe._votes;
    delete cleanCatastrophe._rpsDuel;
    delete cleanCatastrophe._lastExpelledName;

    return {
      ...raw,
      catastrophe: cleanCatastrophe,
      players,
      votes,
      rpsDuel: rpsDuel || undefined,
      lastExpelledName: lastExpelledName || undefined,
    };
  }

  initChannel(roomCode: string, onUpdate: (room: GameRoom) => void) {
    this.cleanup();
    const cleanCode = roomCode.trim().toUpperCase();

    // 1. Supabase Realtime channel (both Broadcast & Postgres Changes)
    if (supabase && isSupabaseConfigured) {
      this.supabaseChannel = supabase
        .channel(`room_${cleanCode}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "rooms",
            filter: `code=eq.${cleanCode}`,
          },
          (payload) => {
            if (payload.new) {
              const newRoom = this.normalizeRoom(payload.new);
              this.saveLocalRoom(newRoom);
              onUpdate(newRoom);
            }
          }
        )
        .on("broadcast", { event: "room_sync" }, ({ payload }) => {
          if (payload && payload.code === cleanCode) {
            const newRoom = this.normalizeRoom(payload);
            this.saveLocalRoom(newRoom);
            onUpdate(newRoom);
          }
        })
        .subscribe();
    }

    // 2. Local fallback BroadcastChannel (for multi-tab sync on same machine)
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      this.localChannel = new BroadcastChannel(`bunker_room_${cleanCode}`);
      this.localChannel.onmessage = (event) => {
        if (event.data && event.data.code === cleanCode) {
          const newRoom = this.normalizeRoom(event.data);
          onUpdate(newRoom);
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
      votes: {},
    };

    // Save locally
    this.saveLocalRoom(room);

    // Save to Supabase
    if (supabase && isSupabaseConfigured) {
      try {
        const catastropheToSave = {
          ...room.catastrophe,
          _votes: {},
          _rpsDuel: null,
          _lastExpelledName: null,
        };

        const { error } = await supabase.from("rooms").insert([
          {
            code: room.code,
            catastrophe: catastropheToSave,
            players: room.players,
            status: room.status,
          },
        ]);
        if (error) {
          console.error("Supabase insert error:", error.message);
        }
      } catch (err) {
        console.error("Supabase network error:", err);
      }
    }

    return room;
  }

  async getRoom(code: string): Promise<GameRoom | null> {
    const cleanCode = code.trim().toUpperCase();

    // 1. Try Supabase first
    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("rooms")
          .select("*")
          .eq("code", cleanCode)
          .maybeSingle();

        if (data && !error) {
          const room = this.normalizeRoom(data);
          // If room has 0 players, automatically clean it up from DB
          if (!room.players || room.players.length === 0) {
            await this.deleteRoom(cleanCode);
            return null;
          }
          this.saveLocalRoom(room);
          return room;
        } else if (error) {
          console.warn("Supabase getRoom error:", error.message);
        }
      } catch (err) {
        console.warn("Supabase fetch error, fallback to local:", err);
      }
    }

    // 2. Fallback to local storage
    const local = this.getLocalRoom(cleanCode);
    if (local) {
      const room = this.normalizeRoom(local);
      if (!room.players || room.players.length === 0) {
        await this.deleteRoom(cleanCode);
        return null;
      }
      return room;
    }
    return null;
  }

  async leaveRoom(code: string, playerId: string): Promise<void> {
    const cleanCode = code.trim().toUpperCase();
    const room = await this.getRoom(cleanCode);
    if (!room) return;

    const remainingPlayers = room.players.filter((p) => p.id !== playerId);

    // If 0 players remain in room -> automatically DELETE room from database!
    if (remainingPlayers.length === 0) {
      await this.deleteRoom(cleanCode);
      return;
    }

    // If leaving player was host, transfer host to next player
    const wasHost = room.players.find((p) => p.id === playerId)?.isHost;
    if (wasHost && remainingPlayers.length > 0) {
      remainingPlayers[0].isHost = true;
    }

    // Remove leaving player's vote
    if (room.votes && room.votes[playerId]) {
      delete room.votes[playerId];
    }

    room.players = remainingPlayers;
    await this.updateRoom(room);
  }

  async deleteRoom(code: string): Promise<void> {
    const cleanCode = code.trim().toUpperCase();
    this.deleteLocalRoom(cleanCode);

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.from("rooms").delete().eq("code", cleanCode);
      } catch (err) {
        console.error("Supabase delete room error:", err);
      }
    }
  }

  async joinRoom(code: string, player: Player): Promise<GameRoom | null> {
    const cleanCode = code.trim().toUpperCase();
    const room = await this.getRoom(cleanCode);
    if (!room) return null;

    const existingIndex = room.players.findIndex((p) => p.id === player.id);
    if (existingIndex >= 0) {
      room.players[existingIndex] = {
        ...room.players[existingIndex],
        name: player.name,
      };
    } else {
      room.players.push(player);
    }

    await this.updateRoom(room);
    return room;
  }

  async toggleReady(code: string, playerId: string): Promise<GameRoom | null> {
    const cleanCode = code.trim().toUpperCase();
    const room = await this.getRoom(cleanCode);
    if (!room) return null;

    room.players = room.players.map((p) =>
      p.id === playerId ? { ...p, isReady: !p.isReady } : p
    );

    await this.updateRoom(room);
    return room;
  }

  async startGame(code: string): Promise<GameRoom | null> {
    const cleanCode = code.trim().toUpperCase();
    const room = await this.getRoom(cleanCode);
    if (!room) return null;

    const { generateCharacterCards } = await import("@/data/characterData");

    room.players = room.players.map((p) => ({
      ...p,
      cards: p.cards && p.cards.length > 0 ? p.cards : generateCharacterCards(),
      isEliminated: false,
      votedFor: undefined,
    }));
    room.status = "in_game";
    room.votes = {};
    delete room.rpsDuel;
    delete room.lastExpelledName;

    await this.updateRoom(room);
    return room;
  }

  async revealCardToAll(
    code: string,
    playerId: string,
    cardId: string
  ): Promise<GameRoom | null> {
    const cleanCode = code.trim().toUpperCase();
    const room = await this.getRoom(cleanCode);
    if (!room) return null;

    room.players = room.players.map((p) => {
      if (p.id === playerId && p.cards) {
        return {
          ...p,
          cards: p.cards.map((c) =>
            c.id === cardId ? { ...c, isRevealedToAll: true } : c
          ),
        };
      }
      return p;
    });

    await this.updateRoom(room);
    return room;
  }

  async eliminatePlayer(
    code: string,
    targetPlayerId: string
  ): Promise<GameRoom | null> {
    const cleanCode = code.trim().toUpperCase();
    const room = await this.getRoom(cleanCode);
    if (!room) return null;

    room.players = room.players.map((p) =>
      p.id === targetPlayerId ? { ...p, isEliminated: true, votedFor: undefined } : p
    );

    await this.updateRoom(room);
    return room;
  }

  async castVote(
    code: string,
    voterId: string,
    targetPlayerId: string
  ): Promise<GameRoom | null> {
    const cleanCode = code.trim().toUpperCase();
    const room = await this.getRoom(cleanCode);
    if (!room) return null;

    // Active (alive) players
    const activePlayers = room.players.filter((p) => !p.isEliminated);
    const isVoterActive = activePlayers.some((p) => p.id === voterId);
    if (!isVoterActive) return room;

    const votes = { ...(room.votes || {}), [voterId]: targetPlayerId };
    room.votes = votes;
    room.players = room.players.map((p) =>
      p.id === voterId ? { ...p, votedFor: targetPlayerId } : p
    );

    // Check if EVERY active player has cast their vote
    const votedCount = activePlayers.filter((p) => votes[p.id]).length;
    const allVoted = activePlayers.length > 0 && votedCount >= activePlayers.length;

    if (allVoted) {
      // Tally votes
      const tally: Record<string, number> = {};
      for (const p of activePlayers) {
        const target = votes[p.id];
        if (target) {
          tally[target] = (tally[target] || 0) + 1;
        }
      }

      // Find highest vote count
      let maxVotes = -1;
      let topCandidates: string[] = [];
      for (const [candidateId, count] of Object.entries(tally)) {
        if (count > maxVotes) {
          maxVotes = count;
          topCandidates = [candidateId];
        } else if (count === maxVotes) {
          topCandidates.push(candidateId);
        }
      }

      if (topCandidates.length === 1) {
        // Single winner -> direct expulsion
        const expelled = room.players.find((p) => p.id === topCandidates[0]);
        if (expelled) {
          expelled.isEliminated = true;
          expelled.votedFor = undefined;
          room.lastExpelledName = expelled.name;
        }
        // RESET VOTES FOR ALL PLAYERS
        room.votes = {};
        room.players = room.players.map((p) => ({ ...p, votedFor: undefined }));
      } else if (topCandidates.length >= 2) {
        // TIE! Launch Rock-Paper-Scissors duel between tied candidates
        const p1 = room.players.find((p) => p.id === topCandidates[0]);
        const p2 = room.players.find((p) => p.id === topCandidates[1]);
        if (p1 && p2) {
          room.rpsDuel = {
            player1Id: p1.id,
            player2Id: p2.id,
            player1Name: p1.name,
            player2Name: p2.name,
            choices: {},
            status: "choosing",
            roundNumber: 1,
          };
        }
      }
    }

    await this.updateRoom(room);
    return room;
  }

  async makeRpsChoice(
    code: string,
    playerId: string,
    choice: RpsChoice
  ): Promise<GameRoom | null> {
    const cleanCode = code.trim().toUpperCase();
    const room = await this.getRoom(cleanCode);
    if (!room || !room.rpsDuel) return null;

    const duel = room.rpsDuel;
    if (playerId !== duel.player1Id && playerId !== duel.player2Id) {
      return room;
    }

    duel.choices[playerId] = choice;

    const c1 = duel.choices[duel.player1Id];
    const c2 = duel.choices[duel.player2Id];

    // If both have chosen, resolve outcome
    if (c1 && c2) {
      duel.lastChoices = { player1Choice: c1, player2Choice: c2 };

      if (c1 === c2) {
        // DRAW -> Next round
        duel.status = "draw";
        duel.roundNumber += 1;
        duel.choices = {};
      } else {
        const p1Wins =
          (c1 === "rock" && c2 === "scissors") ||
          (c1 === "scissors" && c2 === "paper") ||
          (c1 === "paper" && c2 === "rock");

        const winnerId = p1Wins ? duel.player1Id : duel.player2Id;
        const loserId = p1Wins ? duel.player2Id : duel.player1Id;

        const winner = room.players.find((p) => p.id === winnerId);
        const loser = room.players.find((p) => p.id === loserId);

        if (loser) {
          loser.isEliminated = true;
          loser.votedFor = undefined;
          const choiceMap: Record<RpsChoice, string> = {
            rock: "🪨 Камінь",
            scissors: "✂️ Ножиці",
            paper: "📄 Папір",
          };
          const winChoice = p1Wins ? choiceMap[c1] : choiceMap[c2];
          const loseChoice = p1Wins ? choiceMap[c2] : choiceMap[c1];

          room.lastExpelledName = `${loser.name} (програв дуель: ${winChoice} від ${winner?.name} проти ${loseChoice})`;
        }

        // Reset votes & remove duel
        room.votes = {};
        room.players = room.players.map((p) => ({ ...p, votedFor: undefined }));
        delete room.rpsDuel;
      }
    }

    await this.updateRoom(room);
    return room;
  }

  async clearLastExpelled(code: string): Promise<GameRoom | null> {
    const cleanCode = code.trim().toUpperCase();
    const room = await this.getRoom(cleanCode);
    if (!room) return null;

    delete room.lastExpelledName;
    await this.updateRoom(room);
    return room;
  }

  async updateRoom(room: GameRoom): Promise<GameRoom | null> {
    const normalized = this.normalizeRoom(room);
    this.saveLocalRoom(normalized);

    if (supabase && isSupabaseConfigured) {
      try {
        const catastropheToSave = {
          ...normalized.catastrophe,
          _votes: normalized.votes || {},
          _rpsDuel: normalized.rpsDuel || null,
          _lastExpelledName: normalized.lastExpelledName || null,
        };

        await supabase
          .from("rooms")
          .update({
            catastrophe: catastropheToSave,
            players: normalized.players,
            status: normalized.status,
          })
          .eq("code", normalized.code);

        // Broadcast to all active clients in this room immediately
        if (this.supabaseChannel) {
          this.supabaseChannel.send({
            type: "broadcast",
            event: "room_sync",
            payload: {
              ...normalized,
              catastrophe: catastropheToSave,
            },
          });
        }
      } catch (err) {
        console.error("Supabase update error:", err);
      }
    }

    return normalized;
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

  private deleteLocalRoom(code: string) {
    if (typeof window === "undefined") return;
    localStorage.removeItem(`${STORAGE_PREFIX}${code}`);
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
