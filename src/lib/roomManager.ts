import { GameRoom, Player, RpsChoice } from "@/types/game";
import { getRandomCatastrophe } from "@/data/catastrophes";
import { PlayerCharacterCard } from "@/data/characterData";
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
      ? raw.players.map((p: any, idx: number) => {
          const voterChoice = p.votedFor || votes[p.id];
          if (voterChoice) {
            votes[p.id] = voterChoice;
          }
          const isSpectator = Boolean(p.isSpectator);
          return {
            ...p,
            isSpectator,
            playerNumber: isSpectator
              ? undefined
              : typeof p.playerNumber === "number"
              ? p.playerNumber
              : idx + 1,
            votedFor: voterChoice,
          };
        })
      : [];

    // 3. Recover rpsDuel, lastExpelledName, lastActionMessage, doorsLocked, extraBunkerSpots
    const rpsDuel =
      catastrophe._rpsDuel !== undefined ? catastrophe._rpsDuel : raw.rpsDuel;
    const lastExpelledName =
      catastrophe._lastExpelledName !== undefined
        ? catastrophe._lastExpelledName
        : raw.lastExpelledName;
    const lastActionMessage =
      catastrophe._lastActionMessage !== undefined
        ? catastrophe._lastActionMessage
        : raw.lastActionMessage;
    const doorsLocked =
      catastrophe._doorsLocked !== undefined
        ? catastrophe._doorsLocked
        : raw.doorsLocked;
    const extraBunkerSpots =
      catastrophe._extraBunkerSpots !== undefined
        ? catastrophe._extraBunkerSpots
        : raw.extraBunkerSpots;
    const roundNumber =
      catastrophe._roundNumber !== undefined
        ? catastrophe._roundNumber
        : raw.roundNumber;
    const currentTurnPlayerId =
      catastrophe._currentTurnPlayerId !== undefined
        ? catastrophe._currentTurnPlayerId
        : raw.currentTurnPlayerId;
    const turnPhase =
      catastrophe._turnPhase !== undefined
        ? catastrophe._turnPhase
        : raw.turnPhase;
    const hasRevealedCardInTurn =
      catastrophe._hasRevealedCardInTurn !== undefined
        ? catastrophe._hasRevealedCardInTurn
        : raw.hasRevealedCardInTurn;
    const roundPresentedPlayerIds =
      catastrophe._roundPresentedPlayerIds !== undefined
        ? catastrophe._roundPresentedPlayerIds
        : raw.roundPresentedPlayerIds || [];

    // Clean internal metadata from catastrophe object so it doesn't pollute UI
    const cleanCatastrophe = { ...catastrophe };
    delete cleanCatastrophe._votes;
    delete cleanCatastrophe._rpsDuel;
    delete cleanCatastrophe._lastExpelledName;
    delete cleanCatastrophe._lastActionMessage;
    delete cleanCatastrophe._doorsLocked;
    delete cleanCatastrophe._extraBunkerSpots;
    delete cleanCatastrophe._roundNumber;
    delete cleanCatastrophe._currentTurnPlayerId;
    delete cleanCatastrophe._turnPhase;
    delete cleanCatastrophe._hasRevealedCardInTurn;
    delete cleanCatastrophe._roundPresentedPlayerIds;

    return {
      ...raw,
      catastrophe: cleanCatastrophe,
      players,
      votes,
      rpsDuel: rpsDuel || undefined,
      lastExpelledName: lastExpelledName || undefined,
      lastActionMessage: lastActionMessage || undefined,
      doorsLocked: doorsLocked || undefined,
      extraBunkerSpots: extraBunkerSpots || undefined,
      roundNumber: typeof roundNumber === "number" ? roundNumber : 1,
      currentTurnPlayerId: currentTurnPlayerId || undefined,
      turnPhase: turnPhase || "presenting",
      hasRevealedCardInTurn: Boolean(hasRevealedCardInTurn),
      roundPresentedPlayerIds: Array.isArray(roundPresentedPlayerIds)
        ? roundPresentedPlayerIds
        : [],
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
    const host: Player = {
      ...hostPlayer,
      isHost: true,
      playerNumber: 1,
    };
    const room: GameRoom = {
      code,
      catastrophe,
      players: [host],
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

    const leavingPlayer = room.players.find((p) => p.id === playerId);
    const remainingPlayers = room.players.filter((p) => p.id !== playerId);

    // If 0 players remain in room -> automatically DELETE room from database!
    if (remainingPlayers.length === 0) {
      await this.deleteRoom(cleanCode);
      return;
    }

    // If leaving player was host, transfer host to next player
    const wasHost = leavingPlayer?.isHost;
    if (wasHost && remainingPlayers.length > 0) {
      const nextHost = remainingPlayers.find((p) => !p.isSpectator) || remainingPlayers[0];
      nextHost.isHost = true;
    }

    // Remove leaving player's vote
    if (room.votes && room.votes[playerId]) {
      delete room.votes[playerId];
    }

    room.players = remainingPlayers;

    // IF GAME IS IN PROGRESS: Recalculate turns and voting!
    if (room.status === "in_game") {
      // 1. If the leaving player was the one taking the turn, advance immediately so game never hangs
      if (room.currentTurnPlayerId === playerId) {
        const turnRes = this.advanceTurn(room);
        let skipNote = "";
        if (turnRes.skippedPlayerNames.length > 0) {
          skipNote = ` (у ${turnRes.skippedPlayerNames.join(", ")} все відкрито — пропущено)`;
        }
        if (turnRes.phaseChangedToVoting) {
          room.lastActionMessage = `👋 ${leavingPlayer?.name || "Гравець"} покинув гру. Усі гравці виступили в Раунді ${room.roundNumber || 1}! Починається голосування.${skipNote}`;
        } else if (turnRes.nextPlayer) {
          room.lastActionMessage = `👋 ${leavingPlayer?.name || "Гравець"} покинув гру. Черга перейшла до #${turnRes.nextPlayer.playerNumber} ${turnRes.nextPlayer.name}!${skipNote}`;
        }
      }

      // 2. If in voting phase, check if all remaining eligible voters have voted
      if (room.turnPhase === "voting") {
        this.resolveVoting(room);
      }
    }

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
      const existing = room.players[existingIndex];
      room.players[existingIndex] = {
        ...existing,
        name: player.name,
      };
      await this.updateRoom(room);
      return room;
    }

    // If game is in progress, new player joins strictly as a SPECTATOR so balance & turns aren't broken!
    if (room.status === "in_game") {
      const spectatorPlayer: Player = {
        ...player,
        isHost: false,
        isReady: false,
        isSpectator: true,
        isEliminated: true,
        cannotVote: true,
        cards: [],
        playerNumber: undefined,
      };
      room.players.push(spectatorPlayer);
      await this.updateRoom(room);
      return room;
    }

    const existingNumbers = new Set(
      room.players
        .map((p) => p.playerNumber)
        .filter((n): n is number => typeof n === "number")
    );
    let nextNum = 1;
    while (existingNumbers.has(nextNum)) {
      nextNum++;
    }
    room.players.push({
      ...player,
      playerNumber: nextNum,
    });

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

    room.players = room.players.map((p, idx) => ({
      ...p,
      playerNumber: typeof p.playerNumber === "number" ? p.playerNumber : (idx + 1),
      cards: p.cards && p.cards.length > 0 ? p.cards : generateCharacterCards(),
      isEliminated: false,
      isSpectator: false,
      votedFor: undefined,
      hasDoubleVote: false,
      hasImmunity: false,
      isQuarantined: false,
      cannotVote: false,
      hasMirrorShield: false,
      hasGoldPass: false,
      hasDiplomaticImmunity: false,
      hasSecondChanceDuel: false,
      hasLastBullet: false,
    }));

    room.status = "in_game";
    room.roundNumber = 1;
    room.turnPhase = "presenting";
    room.votes = {};
    room.roundPresentedPlayerIds = [];
    delete room.rpsDuel;
    delete room.lastExpelledName;
    delete room.doorsLocked;
    delete room.extraBunkerSpots;

    const turnRes = this.advanceTurn(room);
    if (turnRes.nextPlayer) {
      let skipNote = "";
      if (turnRes.skippedPlayerNames.length > 0) {
        skipNote = ` (у ${turnRes.skippedPlayerNames.join(", ")} все відкрито — пропущено)`;
      }
      room.lastActionMessage = `🏁 Гра розпочалася! Раунд 1. Першим ходить #${turnRes.nextPlayer.playerNumber} ${turnRes.nextPlayer.name}.${skipNote}`;
    } else {
      room.lastActionMessage = `🏁 Гра розпочалася! Раунд 1. Усі характеристики вже відкрито — перехід до голосування.`;
    }

    await this.updateRoom(room);
    return room;
  }

  /**
   * Advances turn to the next alive player in deterministic order.
   * Tracks players who have presented this round in roundPresentedPlayerIds.
   * If all alive players have presented (or have all cards revealed), transitions to "voting".
   */
  advanceTurn(
    room: GameRoom,
    fromPlayerId?: string
  ): {
    nextPlayer?: Player;
    phaseChangedToVoting: boolean;
    skippedPlayerNames: string[];
  } {
    const presented = new Set(room.roundPresentedPlayerIds || []);
    if (fromPlayerId) {
      presented.add(fromPlayerId);
    }
    room.roundPresentedPlayerIds = Array.from(presented);

    const alivePlayers = room.players
      .filter((p) => !p.isEliminated && !p.isSpectator && p.cards && p.cards.length > 0)
      .sort((a, b) => (a.playerNumber || 0) - (b.playerNumber || 0));

    if (alivePlayers.length === 0) {
      room.currentTurnPlayerId = undefined;
      return { phaseChangedToVoting: false, skippedPlayerNames: [] };
    }

    const skippedPlayerNames: string[] = [];
    let nextPlayer: Player | undefined = undefined;

    for (const p of alivePlayers) {
      if (presented.has(p.id)) {
        continue;
      }
      const hasUnrevealedCards =
        p.cards && p.cards.some((c) => !c.isRevealedToAll);
      if (hasUnrevealedCards) {
        nextPlayer = p;
        break;
      } else {
        // Player has no unrevealed cards left -> mark as presented and skip
        presented.add(p.id);
        room.roundPresentedPlayerIds = Array.from(presented);
        skippedPlayerNames.push(`#${p.playerNumber ?? "?"} ${p.name}`);
      }
    }

    if (nextPlayer) {
      room.turnPhase = "presenting";
      room.currentTurnPlayerId = nextPlayer.id;
      room.hasRevealedCardInTurn = false;
      return { nextPlayer, phaseChangedToVoting: false, skippedPlayerNames };
    } else {
      room.turnPhase = "voting";
      room.currentTurnPlayerId = undefined;
      room.hasRevealedCardInTurn = false;
      return { phaseChangedToVoting: true, skippedPlayerNames };
    }
  }

  async revealCardToAll(
    code: string,
    playerId: string,
    cardId: string
  ): Promise<GameRoom | null> {
    const cleanCode = code.trim().toUpperCase();
    const room = await this.getRoom(cleanCode);
    if (!room) return null;

    let revealedCategory = "";
    let revealedValue = "";

    room.players = room.players.map((p) => {
      if (p.id === playerId && p.cards) {
        return {
          ...p,
          cards: p.cards.map((c) => {
            if (c.id === cardId) {
              revealedCategory = c.categoryName || "";
              revealedValue = c.value;
              return { ...c, isRevealedToAll: true };
            }
            return c;
          }),
        };
      }
      return p;
    });

    // If it was this player's turn, auto-complete their turn and pass to next eligible player!
    if (room.status === "in_game" && room.currentTurnPlayerId === playerId) {
      const actingPlayer = room.players.find((p) => p.id === playerId);
      const actorTag = actingPlayer
        ? `#${actingPlayer.playerNumber ?? "?"} ${actingPlayer.name}`
        : "Гравець";

      const turnResult = this.advanceTurn(room, playerId);

      let skipNote = "";
      if (turnResult.skippedPlayerNames.length > 0) {
        skipNote = ` (у ${turnResult.skippedPlayerNames.join(", ")} все відкрито — пропущено)`;
      }

      if (turnResult.phaseChangedToVoting) {
        room.lastActionMessage = `👁️ ${actorTag} відкрив «${revealedCategory}: ${revealedValue}». Усі гравці виступили в Раунді ${room.roundNumber || 1}! Починається голосування.${skipNote}`;
      } else if (turnResult.nextPlayer) {
        room.lastActionMessage = `👁️ ${actorTag} відкрив «${revealedCategory}: ${revealedValue}». Черга перейшла до #${turnResult.nextPlayer.playerNumber} ${turnResult.nextPlayer.name}!${skipNote}`;
      }
    }

    await this.updateRoom(room);
    return room;
  }

  async endTurn(code: string, playerId: string): Promise<GameRoom | null> {
    const cleanCode = code.trim().toUpperCase();
    const room = await this.getRoom(cleanCode);
    if (!room || room.status !== "in_game" || room.currentTurnPlayerId !== playerId) {
      return room;
    }

    const currentP = room.players.find((p) => p.id === playerId);
    const actorTag = currentP ? `#${currentP.playerNumber ?? "?"} ${currentP.name}` : "Гравець";

    const turnResult = this.advanceTurn(room, playerId);

    let skipNote = "";
    if (turnResult.skippedPlayerNames.length > 0) {
      skipNote = ` (у ${turnResult.skippedPlayerNames.join(", ")} все відкрито — пропущено)`;
    }

    if (turnResult.phaseChangedToVoting) {
      room.lastActionMessage = `🎯 ${actorTag} завершив хід. Усі гравці виступили в Раунді ${room.roundNumber || 1}! Відкривається голосування.${skipNote}`;
    } else if (turnResult.nextPlayer) {
      room.lastActionMessage = `🎯 ${actorTag} завершив хід. Черга перейшла до #${turnResult.nextPlayer.playerNumber} ${turnResult.nextPlayer.name}!${skipNote}`;
    }

    await this.updateRoom(room);
    return room;
  }

  async skipTurn(code: string): Promise<GameRoom | null> {
    const cleanCode = code.trim().toUpperCase();
    const room = await this.getRoom(cleanCode);
    if (!room || room.status !== "in_game" || !room.currentTurnPlayerId) return null;

    const currentId = room.currentTurnPlayerId;
    const currentP = room.players.find((p) => p.id === currentId);
    const actorTag = currentP ? `#${currentP.playerNumber ?? "?"} ${currentP.name}` : "Гравця";

    const turnResult = this.advanceTurn(room, currentId);

    let skipNote = "";
    if (turnResult.skippedPlayerNames.length > 0) {
      skipNote = ` (у ${turnResult.skippedPlayerNames.join(", ")} все відкрито — пропущено)`;
    }

    if (turnResult.phaseChangedToVoting) {
      room.lastActionMessage = `⏩ Хід ${actorTag} пропущено хостом. Усі гравці виступили в Раунді ${room.roundNumber || 1} — починається голосування!${skipNote}`;
    } else if (turnResult.nextPlayer) {
      room.lastActionMessage = `⏩ Хід ${actorTag} пропущено хостом. Черга перейшла до #${turnResult.nextPlayer.playerNumber} ${turnResult.nextPlayer.name}!${skipNote}`;
    }

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

  resolveVoting(room: GameRoom): void {
    const activePlayers = room.players.filter(
      (p) => !p.isEliminated && !p.isSpectator && p.cards && p.cards.length > 0
    );
    const eligibleVoters = activePlayers.filter((p) => !p.cannotVote);
    const votes = room.votes || {};
    const votedCount = eligibleVoters.filter((p) => votes[p.id]).length;
    const allVoted = eligibleVoters.length > 0 && votedCount >= eligibleVoters.length;

    if (!allVoted) return;

    // Tally votes considering double vote and mirror shield
    const tally: Record<string, number> = {};
    for (const p of eligibleVoters) {
      let target = votes[p.id];
      if (target) {
        const targetPlayer = room.players.find((tp) => tp.id === target);
        if (targetPlayer?.hasMirrorShield && targetPlayer.id !== p.id) {
          target = p.id; // Bounces back
        }
        const weight = p.hasDoubleVote ? 2 : 1;
        tally[target] = (tally[target] || 0) + weight;
      }
    }

    // If doors are locked:
    if (room.doorsLocked) {
      room.lastExpelledName = "🚪 Броньовані двері заблоковано! У цьому раунді нікого не буде вигнано.";
      delete room.doorsLocked;
      room.votes = {};
      room.players = room.players.map((p) => ({ ...p, votedFor: undefined }));
      room.roundPresentedPlayerIds = [];

      const nextRound = (room.roundNumber || 1) + 1;
      room.roundNumber = nextRound;
      room.turnPhase = "presenting";
      this.advanceTurn(room);
      return;
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
      // Single winner -> check immunity or gold pass
      const expelled = room.players.find((p) => p.id === topCandidates[0]);
      if (expelled) {
        if (expelled.hasImmunity) {
          delete expelled.hasImmunity;
          room.lastExpelledName = `🛡️ #${expelled.playerNumber ?? "?"} ${expelled.name} захищений імунітетом від вигнання!`;
        } else if (expelled.hasGoldPass && maxVotes < Math.ceil(eligibleVoters.length / 2)) {
          delete expelled.hasGoldPass;
          room.lastExpelledName = `🎟️ #${expelled.playerNumber ?? "?"} ${expelled.name} захищений Золотим пропуском!`;
        } else {
          expelled.isEliminated = true;
          expelled.votedFor = undefined;
          room.lastExpelledName = `${expelled.playerNumber ? `#${expelled.playerNumber} ` : ""}${expelled.name}`;
        }
      }
      // RESET VOTES FOR ALL PLAYERS AND START NEXT ROUND
      room.votes = {};
      room.players = room.players.map((p) => ({ ...p, votedFor: undefined }));
      room.roundPresentedPlayerIds = [];

      const nextRound = (room.roundNumber || 1) + 1;
      room.roundNumber = nextRound;
      room.turnPhase = "presenting";
      const turnRes = this.advanceTurn(room);
      let skipNote = "";
      if (turnRes.skippedPlayerNames.length > 0) {
        skipNote = ` (у ${turnRes.skippedPlayerNames.join(", ")} всі карти відкриті — пропущено)`;
      }
      if (turnRes.phaseChangedToVoting) {
        room.lastActionMessage = `⚖️ Раунд ${nextRound}: Усіх характеристик уже відкрито — одразу відкрито голосування!`;
      } else if (turnRes.nextPlayer) {
        room.lastActionMessage = `🎯 Початок Раунду ${nextRound}! Черга ходу: #${turnRes.nextPlayer.playerNumber} ${turnRes.nextPlayer.name}.${skipNote}`;
      }
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
          player1Number: p1.playerNumber,
          player2Number: p2.playerNumber,
          choices: {},
          status: "choosing",
          roundNumber: 1,
        };
      }
    }
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
    const activePlayers = room.players.filter(
      (p) => !p.isEliminated && !p.isSpectator && p.cards && p.cards.length > 0
    );
    const voter = activePlayers.find((p) => p.id === voterId);
    if (!voter || voter.cannotVote) return room;

    const votes = { ...(room.votes || {}), [voterId]: targetPlayerId };
    room.votes = votes;
    room.players = room.players.map((p) =>
      p.id === voterId ? { ...p, votedFor: targetPlayerId } : p
    );

    this.resolveVoting(room);

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

          const loserLabel = loser.playerNumber ? `#${loser.playerNumber} ${loser.name}` : loser.name;
          const winnerLabel = winner?.playerNumber ? `#${winner.playerNumber} ${winner.name}` : (winner?.name ?? "");

          room.lastExpelledName = `${loserLabel} (програв дуель: ${winChoice} від ${winnerLabel} проти ${loseChoice})`;
        }

        // Reset votes & remove duel, advance round
        room.votes = {};
        room.players = room.players.map((p) => ({ ...p, votedFor: undefined }));
        room.roundPresentedPlayerIds = [];
        delete room.rpsDuel;

        const nextRound = (room.roundNumber || 1) + 1;
        room.roundNumber = nextRound;
        room.turnPhase = "presenting";
        const turnRes = this.advanceTurn(room);
        let skipNote = "";
        if (turnRes.skippedPlayerNames.length > 0) {
          skipNote = ` (у ${turnRes.skippedPlayerNames.join(", ")} всі карти відкриті — пропущено)`;
        }
        if (turnRes.phaseChangedToVoting) {
          room.lastActionMessage = `⚖️ Раунд ${nextRound}: Усіх характеристик уже відкрито — перехід до голосування!`;
        } else if (turnRes.nextPlayer) {
          room.lastActionMessage = `🎯 Початок Раунду ${nextRound}! Черга ходу: #${turnRes.nextPlayer.playerNumber} ${turnRes.nextPlayer.name}.${skipNote}`;
        }
      }
    }

    await this.updateRoom(room);
    return room;
  }

  async applySpecialAction(
    code: string,
    playerId: string,
    cardId: string,
    targetPlayerId?: string
  ): Promise<{ room: GameRoom; peekedCard?: PlayerCharacterCard } | null> {
    const cleanCode = code.trim().toUpperCase();
    const room = await this.getRoom(cleanCode);
    if (!room) return null;

    const actingPlayer = room.players.find((p) => p.id === playerId);
    if (!actingPlayer || !actingPlayer.cards) return null;

    const specialCard = actingPlayer.cards.find((c) => c.id === cardId);
    if (!specialCard) return null;

    // If already used, do not re-apply
    if (specialCard.isUsed) return { room };

    const targetPlayer = targetPlayerId
      ? room.players.find((p) => p.id === targetPlayerId)
      : undefined;

    let peekedCard: PlayerCharacterCard | undefined = undefined;
    let actionLog = "";

    const cardVal = specialCard.value;
    const actorNum = actingPlayer.playerNumber ? `#${actingPlayer.playerNumber} ` : "";
    const targetNum = targetPlayer?.playerNumber ? `#${targetPlayer.playerNumber} ` : "";

    // 1. "Право другого голосу"
    if (cardVal.includes("Право другого голосу")) {
      actingPlayer.hasDoubleVote = true;
      actionLog = `⚡ ${actorNum}${actingPlayer.name} активував картку «Право другого голосу» — його голос тепер рахується за два!`;
    }
    // 2. "Обмін багажем"
    else if (cardVal.includes("Обмін багажем") && targetPlayer && targetPlayer.cards) {
      const myLuggageIdx = actingPlayer.cards.findIndex((c) => c.category === "luggage");
      const targetLuggageIdx = targetPlayer.cards.findIndex((c) => c.category === "luggage");
      if (myLuggageIdx !== -1 && targetLuggageIdx !== -1) {
        const temp = { ...actingPlayer.cards[myLuggageIdx] };
        actingPlayer.cards[myLuggageIdx] = {
          ...targetPlayer.cards[targetLuggageIdx],
          id: "card_luggage",
        };
        targetPlayer.cards[targetLuggageIdx] = {
          ...temp,
          id: "card_luggage",
        };
        actionLog = `⚡ ${actorNum}${actingPlayer.name} обмінявся карткою багажу з ${targetNum}${targetPlayer.name}!`;
      }
    }
    // 3. "Шпигунський погляд"
    else if (cardVal.includes("Шпигунський погляд") && targetPlayer && targetPlayer.cards) {
      const unrevealed = targetPlayer.cards.filter((c) => !c.isRevealedToAll && c.category !== "special");
      const pool = unrevealed.length > 0 ? unrevealed : targetPlayer.cards;
      peekedCard = pool[Math.floor(Math.random() * pool.length)];
      actionLog = `👁️ ${actorNum}${actingPlayer.name} застосував «Шпигунський погляд» і таємно підглянув закриту карту гравця ${targetNum}${targetPlayer.name}!`;
    }
    // 4. "Лікувальна сироватка"
    else if (cardVal.includes("Лікувальна сироватка")) {
      const recipient = targetPlayer || actingPlayer;
      if (recipient.cards) {
        const healthIdx = recipient.cards.findIndex((c) => c.category === "health");
        if (healthIdx !== -1) {
          recipient.cards[healthIdx] = {
            ...recipient.cards[healthIdx],
            value: "Абсолютно здоровий",
            description: "Повністю зцілено за допомогою Лікувальної сироватки.",
          };
          const recNum = recipient.playerNumber ? `#${recipient.playerNumber} ` : "";
          actionLog = `💉 ${actorNum}${actingPlayer.name} застосував «Лікувальну сироватку» на ${recNum}${recipient.name} — усі хвороби зцілено!`;
        }
      }
    }
    // 5. "Герметичний шлюз (+1 місце)"
    else if (cardVal.includes("Герметичний шлюз")) {
      room.extraBunkerSpots = (room.extraBunkerSpots || 0) + 1;
      actionLog = `🏗️ ${actorNum}${actingPlayer.name} розширив «Герметичний шлюз»: місткість бункера збільшено на +1 особу!`;
    }
    // 6. "Імунітет від вигнання"
    else if (cardVal.includes("Імунітет від вигнання")) {
      actingPlayer.hasImmunity = true;
      if (room.votes) {
        for (const [voterId, targetId] of Object.entries(room.votes)) {
          if (targetId === actingPlayer.id) {
            delete room.votes[voterId];
          }
        }
        room.players = room.players.map((p) =>
          p.votedFor === actingPlayer.id ? { ...p, votedFor: undefined } : p
        );
      }
      actionLog = `🛡️ ${actorNum}${actingPlayer.name} активував «Імунітет від вигнання»: його неможливо вигнати в цьому раунді!`;
    }
    // 7. "Переголосування раунду"
    else if (cardVal.includes("Переголосування раунду")) {
      room.votes = {};
      room.players = room.players.map((p) => ({ ...p, votedFor: undefined }));
      actionLog = `🔄 ${actorNum}${actingPlayer.name} оголосив «Переголосування раунду»: усі попередні голоси анульовано!`;
    }
    // 8. "Обмін здоров'ям"
    else if (cardVal.includes("Обмін здоров'ям") && targetPlayer && targetPlayer.cards) {
      const myHIdx = actingPlayer.cards.findIndex((c) => c.category === "health");
      const targetHIdx = targetPlayer.cards.findIndex((c) => c.category === "health");
      if (myHIdx !== -1 && targetHIdx !== -1) {
        const temp = { ...actingPlayer.cards[myHIdx] };
        actingPlayer.cards[myHIdx] = { ...targetPlayer.cards[targetHIdx], id: "card_health" };
        targetPlayer.cards[targetHIdx] = { ...temp, id: "card_health" };
        actionLog = `⚡ ${actorNum}${actingPlayer.name} обмінявся станом здоров'я з ${targetNum}${targetPlayer.name}!`;
      }
    }
    // 9. "Дзеркальний щит"
    else if (cardVal.includes("Дзеркальний щит")) {
      actingPlayer.hasMirrorShield = true;
      actionLog = `🪞 ${actorNum}${actingPlayer.name} підняв «Дзеркальний щит»: голоси проти нього будуть відбиті!`;
    }
    // 10. "Допит з пристрастю"
    else if (cardVal.includes("Допит з пристрастю") && targetPlayer && targetPlayer.cards) {
      const hidden = targetPlayer.cards.filter((c) => !c.isRevealedToAll);
      if (hidden.length > 0) {
        hidden[0].isRevealedToAll = true;
        actionLog = `🔍 ${actorNum}${actingPlayer.name} провів «Допит з пристрастю»: ${targetNum}${targetPlayer.name} відкрив карту «${hidden[0].categoryName}: ${hidden[0].value}»!`;
      } else {
        actionLog = `🔍 ${actorNum}${actingPlayer.name} провів «Допит з пристрастю»: у гравця ${targetNum}${targetPlayer.name} уже всі карти були відкриті!`;
      }
    }
    // 11. "Крадіжка професії"
    else if (cardVal.includes("Крадіжка професії") && targetPlayer && targetPlayer.cards) {
      const targetProf = targetPlayer.cards.find((c) => c.category === "profession");
      const myProfIdx = actingPlayer.cards.findIndex((c) => c.category === "profession");
      if (targetProf && myProfIdx !== -1) {
        actingPlayer.cards[myProfIdx] = {
          ...actingPlayer.cards[myProfIdx],
          value: targetProf.value,
          description: targetProf.description,
        };
        actionLog = `⚡ ${actorNum}${actingPlayer.name} перейняв професію «${targetProf.value}» у ${targetNum}${targetPlayer.name}!`;
      }
    }
    // 12. "Другий шанс (Дуель)"
    else if (cardVal.includes("Другий шанс")) {
      actingPlayer.hasSecondChanceDuel = true;
      actionLog = `⚔️ ${actorNum}${actingPlayer.name} підготував «Другий шанс»: право на поєдинок у разі спроби вигнання!`;
    }
    // 13. "Сплячий агент (Переродження)"
    else if (cardVal.includes("Сплячий агент")) {
      const { BIOLOGY } = await import("@/data/characterData");
      const newBio = BIOLOGY[Math.floor(Math.random() * BIOLOGY.length)];
      const bioIdx = actingPlayer.cards.findIndex((c) => c.category === "biology");
      if (bioIdx !== -1) {
        actingPlayer.cards[bioIdx] = {
          ...actingPlayer.cards[bioIdx],
          value: newBio.value,
          description: newBio.description,
        };
      }
      actionLog = `🧬 ${actorNum}${actingPlayer.name} активував протокол «Сплячий агент» і отримав нову біологію: «${newBio.value}»!`;
    }
    // 14. "Вето старійшини"
    else if (cardVal.includes("Вето старійшини") && targetPlayer) {
      targetPlayer.cannotVote = true;
      if (room.votes && room.votes[targetPlayer.id]) {
        delete room.votes[targetPlayer.id];
      }
      targetPlayer.votedFor = undefined;
      actionLog = `🚫 ${actorNum}${actingPlayer.name} наклав «Вето старійшини»: гравець ${targetNum}${targetPlayer.name} позбавлений права голосу на цей раунд!`;
    }
    // 15. "Карантинний бокс"
    else if (cardVal.includes("Карантинний бокс") && targetPlayer) {
      targetPlayer.isQuarantined = true;
      targetPlayer.cannotVote = true;
      if (room.votes && room.votes[targetPlayer.id]) {
        delete room.votes[targetPlayer.id];
      }
      targetPlayer.votedFor = undefined;
      actionLog = `☣️ ${actorNum}${actingPlayer.name} ізолював гравця ${targetNum}${targetPlayer.name} в карантинному боксі!`;
    }
    // 16. "Обмін хобі"
    else if (cardVal.includes("Обмін хобі") && targetPlayer && targetPlayer.cards) {
      const myHIdx = actingPlayer.cards.findIndex((c) => c.category === "hobby");
      const targetHIdx = targetPlayer.cards.findIndex((c) => c.category === "hobby");
      if (myHIdx !== -1 && targetHIdx !== -1) {
        const temp = { ...actingPlayer.cards[myHIdx] };
        actingPlayer.cards[myHIdx] = { ...targetPlayer.cards[targetHIdx], id: "card_hobby" };
        targetPlayer.cards[targetHIdx] = { ...temp, id: "card_hobby" };
        actionLog = `🎯 ${actorNum}${actingPlayer.name} обмінявся хобі з ${targetNum}${targetPlayer.name}!`;
      }
    }
    // 17. "Інспекція рюкзаків"
    else if (cardVal.includes("Інспекція рюкзаків")) {
      for (const p of room.players) {
        if (p.cards) {
          const lug = p.cards.find((c) => c.category === "luggage");
          if (lug) lug.isRevealedToAll = true;
        }
      }
      actionLog = `🎒 ${actorNum}${actingPlayer.name} провів «Інспекцію рюкзаків»: багаж усіх гравців відкрито!`;
    }
    // 18. "Санітарна обробка"
    else if (cardVal.includes("Санітарна обробка")) {
      for (const p of room.players) {
        if (p.cards) {
          const h = p.cards.find((c) => c.category === "health");
          if (h) {
            h.value = "Абсолютно здоровий";
            h.description = "Очищено під час загальної санітарної обробки.";
          }
        }
      }
      actionLog = `✨ ${actorNum}${actingPlayer.name} провів «Санітарну обробку»: хвороби всіх гравців вилікувано!`;
    }
    // 19. "Броньовані двері"
    else if (cardVal.includes("Броньовані двері")) {
      room.doorsLocked = true;
      actionLog = `🚪 ${actorNum}${actingPlayer.name} заблокував «Броньовані двері»: цього раунду ніхто не вибуває!`;
    }
    // 20. "Обмін біографічним фактом"
    else if (cardVal.includes("Обмін біографічним фактом") && targetPlayer && targetPlayer.cards) {
      const myFIdx = actingPlayer.cards.findIndex((c) => c.category === "fact");
      const targetFIdx = targetPlayer.cards.findIndex((c) => c.category === "fact");
      if (myFIdx !== -1 && targetFIdx !== -1) {
        const temp = { ...actingPlayer.cards[myFIdx] };
        actingPlayer.cards[myFIdx] = { ...targetPlayer.cards[targetFIdx], id: "card_fact" };
        targetPlayer.cards[targetFIdx] = { ...temp, id: "card_fact" };
        actionLog = `📜 ${actorNum}${actingPlayer.name} обмінявся фактом біографії з ${targetNum}${targetPlayer.name}!`;
      }
    }
    // 21. "Саботаж голосування"
    else if (cardVal.includes("Саботаж голосування")) {
      if (room.votes) {
        const voterKeys = Object.keys(room.votes);
        if (voterKeys.length > 0) {
          const victimVoter = voterKeys[Math.floor(Math.random() * voterKeys.length)];
          delete room.votes[victimVoter];
          const victimP = room.players.find((p) => p.id === victimVoter);
          if (victimP) victimP.votedFor = undefined;
        }
      }
      actionLog = `💣 ${actorNum}${actingPlayer.name} здійснив «Саботаж голосування»: один із голосів було викрадено!`;
    }
    // 22. "Повна сповідь"
    else if (cardVal.includes("Повна сповідь") && targetPlayer && targetPlayer.cards) {
      for (const c of targetPlayer.cards) {
        c.isRevealedToAll = true;
      }
      actionLog = `📜 ${actorNum}${actingPlayer.name} змусив гравця ${targetNum}${targetPlayer.name} розкрити ВСІ свої карти перед бункером!`;
    }
    // 23. "Останній патрон"
    else if (cardVal.includes("Останній патрон")) {
      actingPlayer.hasLastBullet = true;
      actionLog = `💥 ${actorNum}${actingPlayer.name} зарядив «Останній патрон»: право забрати кривдника назовні при вигнанні!`;
    }
    // 24. "Золотий пропуск"
    else if (cardVal.includes("Золотий пропуск")) {
      actingPlayer.hasGoldPass = true;
      actionLog = `🎟️ ${actorNum}${actingPlayer.name} пред'явив «Золотий пропуск»: гарантована недоторканність!`;
    }
    // 25. "Дипломатичний захист"
    else if (cardVal.includes("Дипломатичний захист")) {
      actingPlayer.hasDiplomaticImmunity = true;
      actionLog = `🕊️ ${actorNum}${actingPlayer.name} отримав «Дипломатичний захист» від примусового розкриття карт!`;
    }
    // 26. "Зміна катастрофи (Нова загроза)"
    else if (cardVal.includes("Зміна катастрофи")) {
      const { CATASTROPHES } = await import("@/data/catastrophes");
      const others = CATASTROPHES.filter((c) => c.id !== room.catastrophe.id);
      const newCat = others.length > 0 ? others[Math.floor(Math.random() * others.length)] : CATASTROPHES[0];
      room.catastrophe = newCat;
      actionLog = `⚠️ ${actorNum}${actingPlayer.name} викликав зміну катастрофи: нова загроза — «${newCat.title}»!`;
    }
    // 27. "Амнезія суперника"
    else if (cardVal.includes("Амнезія суперника") && targetPlayer && targetPlayer.cards) {
      const targetSpecial = targetPlayer.cards.find((c) => c.category === "special");
      if (targetSpecial) {
        targetSpecial.isUsed = true;
        targetSpecial.description = `[ЗАБЛОКОВАНО АМНЕЗІЄЮ] ${targetSpecial.description}`;
      }
      actionLog = `🧠 ${actorNum}${actingPlayer.name} застосував «Амнезію» на ${targetNum}${targetPlayer.name}: його спецдію заблоковано!`;
    }
    else {
      actionLog = `⚡ ${actorNum}${actingPlayer.name} застосував спеціальну дію «${specialCard.value}»!`;
    }

    // Mark card as revealed and used
    specialCard.isRevealedToAll = true;
    specialCard.isUsed = true;
    room.lastActionMessage = actionLog;

    // If it was this player's turn, auto-complete their turn and pass to next eligible player!
    if (room.status === "in_game" && room.currentTurnPlayerId === playerId) {
      const turnResult = this.advanceTurn(room, playerId);

      let skipNote = "";
      if (turnResult.skippedPlayerNames.length > 0) {
        skipNote = ` (у ${turnResult.skippedPlayerNames.join(", ")} все відкрито — пропущено)`;
      }

      if (turnResult.phaseChangedToVoting) {
        room.lastActionMessage = `${actionLog} Усі гравці виступили в Раунді ${room.roundNumber || 1}! Починається голосування.${skipNote}`;
      } else if (turnResult.nextPlayer) {
        room.lastActionMessage = `${actionLog} Черга перейшла до #${turnResult.nextPlayer.playerNumber} ${turnResult.nextPlayer.name}!${skipNote}`;
      }
    }

    await this.updateRoom(room);
    return { room, peekedCard };
  }

  async clearLastExpelled(code: string): Promise<GameRoom | null> {
    const cleanCode = code.trim().toUpperCase();
    const room = await this.getRoom(cleanCode);
    if (!room) return null;

    delete room.lastExpelledName;
    await this.updateRoom(room);
    return room;
  }

  async clearLastActionMessage(code: string): Promise<GameRoom | null> {
    const cleanCode = code.trim().toUpperCase();
    const room = await this.getRoom(cleanCode);
    if (!room) return null;

    delete room.lastActionMessage;
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
          _lastActionMessage: normalized.lastActionMessage || null,
          _doorsLocked: normalized.doorsLocked || false,
          _extraBunkerSpots: normalized.extraBunkerSpots || 0,
          _roundNumber: normalized.roundNumber || 1,
          _currentTurnPlayerId: normalized.currentTurnPlayerId || null,
          _turnPhase: normalized.turnPhase || "presenting",
          _hasRevealedCardInTurn: normalized.hasRevealedCardInTurn || false,
          _roundPresentedPlayerIds: normalized.roundPresentedPlayerIds || [],
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
