"use client";

import React, { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { GameRoom, Player, RpsChoice } from "@/types/game";
import { LobbyScreen } from "@/components/LobbyScreen";
import { InGameView } from "@/components/InGameView";
import { ExpelledScreen } from "@/components/ExpelledScreen";
import { JoinModal } from "@/components/JoinModal";
import { roomManager } from "@/lib/roomManager";
import { generateRandomName } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/supabase";
import { 
  LogIn, 
  PlusCircle, 
  Dices, 
  Wifi, 
  WifiOff, 
  Loader2 
} from "lucide-react";

function GameApp() {
  const searchParams = useSearchParams();
  const [playerName, setPlayerName] = useState<string>("");
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoomSync = useCallback((updatedRoom: GameRoom) => {
    // If room was deleted or has 0 players, return to home
    if (!updatedRoom || !updatedRoom.players || updatedRoom.players.length === 0) {
      setCurrentRoom(null);
      localStorage.removeItem("bunker_active_room_code");
      window.history.replaceState(null, "", "/");
      return;
    }

    setCurrentRoom(updatedRoom);
    setCurrentPlayer((prev) => {
      if (!prev) return prev;
      const updatedSelf = updatedRoom.players.find((p) => p.id === prev.id);
      return updatedSelf || prev;
    });
  }, []);

  const restoreSession = useCallback(
    async (code: string, activePlayer: Player) => {
      setIsLoading(true);
      try {
        const room = await roomManager.getRoom(code);
        if (!room) {
          // Room deleted or empty
          localStorage.removeItem("bunker_active_room_code");
          window.history.replaceState(null, "", "/");
          return;
        }

        const existingPlayer = room.players.find((p) => p.id === activePlayer.id);
        if (existingPlayer) {
          setCurrentPlayer(existingPlayer);
          setCurrentRoom(room);
          localStorage.setItem("bunker_active_room_code", room.code);
          window.history.replaceState(null, "", `?room=${room.code}`);
          roomManager.initChannel(room.code, handleRoomSync);
        } else {
          // New player connecting via URL code
          const updated = await roomManager.joinRoom(code, activePlayer);
          if (updated) {
            const selfInRoom = updated.players.find((p) => p.id === activePlayer.id);
            if (selfInRoom) setCurrentPlayer(selfInRoom);
            setCurrentRoom(updated);
            localStorage.setItem("bunker_active_room_code", updated.code);
            window.history.replaceState(null, "", `?room=${updated.code}`);
            roomManager.initChannel(updated.code, handleRoomSync);
          }
        }
      } catch (err) {
        console.error("Session restore error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [handleRoomSync]
  );

  // Initialize player identity & auto-restore session on refresh
  useEffect(() => {
    const savedId =
      localStorage.getItem("bunker_player_id") ||
      "p_" + Math.random().toString(36).substring(2, 9);
    localStorage.setItem("bunker_player_id", savedId);

    const savedName =
      localStorage.getItem("bunker_player_name") || generateRandomName();
    setPlayerName(savedName);

    const player: Player = {
      id: savedId,
      name: savedName,
      isHost: false,
      isReady: false,
      avatarSeed: Math.floor(Math.random() * 1000),
      joinedAt: Date.now(),
    };
    setCurrentPlayer(player);

    const activeCode =
      searchParams.get("room") ||
      searchParams.get("join") ||
      localStorage.getItem("bunker_active_room_code");

    if (activeCode) {
      restoreSession(activeCode.toUpperCase(), player);
    }
  }, [searchParams, restoreSession]);

  // Sync player name changes
  const handleNameChange = (newName: string) => {
    setPlayerName(newName);
    localStorage.setItem("bunker_player_name", newName);
    if (currentPlayer) {
      setCurrentPlayer({ ...currentPlayer, name: newName });
    }
  };

  const handleRandomizeName = () => {
    const random = generateRandomName();
    handleNameChange(random);
  };

  // Create Lobby
  const handleCreateLobby = async () => {
    if (!currentPlayer) return;
    setIsLoading(true);
    try {
      const host: Player = {
        ...currentPlayer,
        name: playerName || "Хост",
        isHost: true,
        isReady: false,
      };
      const room = await roomManager.createRoom(host);
      setCurrentPlayer(host);
      setCurrentRoom(room);

      localStorage.setItem("bunker_active_room_code", room.code);
      window.history.replaceState(null, "", `?room=${room.code}`);

      roomManager.initChannel(room.code, handleRoomSync);
    } finally {
      setIsLoading(false);
    }
  };

  // Join Lobby
  const handleJoinByCode = async (code: string, activePlayer?: Player) => {
    const playerToJoin =
      activePlayer ||
      (currentPlayer ? { ...currentPlayer, name: playerName } : null);
    if (!playerToJoin) return;

    setIsLoading(true);
    setJoinError(null);

    try {
      const room = await roomManager.getRoom(code);
      if (!room) {
        setJoinError(
          `Лобі з кодом "${code}" не знайдено або вже видалено.`
        );
        return;
      }

      const updatedRoom = await roomManager.joinRoom(code, playerToJoin);
      if (updatedRoom) {
        setCurrentRoom(updatedRoom);
        setIsJoinModalOpen(false);
        setJoinError(null);

        const selfInRoom = updatedRoom.players.find((p) => p.id === playerToJoin.id);
        if (selfInRoom) setCurrentPlayer(selfInRoom);

        localStorage.setItem("bunker_active_room_code", updatedRoom.code);
        window.history.replaceState(null, "", `?room=${updatedRoom.code}`);

        roomManager.initChannel(code, handleRoomSync);
      }
    } catch {
      setJoinError("Помилка підключення до лобі. Спробуйте ще раз.");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle Ready
  const handleToggleReady = async () => {
    if (!currentRoom || !currentPlayer) return;
    const updated = await roomManager.toggleReady(
      currentRoom.code,
      currentPlayer.id
    );
    if (updated) {
      handleRoomSync(updated);
    }
  };

  // Start Game
  const handleStartGame = async () => {
    if (!currentRoom) return;
    setIsLoading(true);
    try {
      const updated = await roomManager.startGame(currentRoom.code);
      if (updated) {
        handleRoomSync(updated);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Reveal Card to All
  const handleRevealToAll = async (cardId: string) => {
    if (!currentRoom || !currentPlayer) return;
    const updated = await roomManager.revealCardToAll(
      currentRoom.code,
      currentPlayer.id,
      cardId
    );
    if (updated) {
      handleRoomSync(updated);
    }
  };

  // Leave Room (with automatic 0-player deletion and zero-flicker instant reset)
  const handleLeaveRoom = async () => {
    const roomCode = currentRoom?.code;
    const playerId = currentPlayer?.id;

    // 1. Immediately cleanup channels and reset local state to prevent any view flash
    roomManager.cleanup();
    localStorage.removeItem("bunker_active_room_code");
    window.history.replaceState(null, "", "/");
    setCurrentRoom(null);
    if (currentPlayer) {
      setCurrentPlayer({
        ...currentPlayer,
        isHost: false,
        isReady: false,
        isEliminated: false,
      });
    }

    // 2. Perform backend leave in background
    if (roomCode && playerId) {
      try {
        await roomManager.leaveRoom(roomCode, playerId);
      } catch (err) {
        console.error("Error leaving room:", err);
      }
    }
  };

  // Update room (e.g. reroll catastrophe)
  // Update room (e.g. reroll catastrophe)
  const handleUpdateRoom = async (updatedFields: Partial<GameRoom>) => {
    if (!currentRoom) return;
    const updated = { ...currentRoom, ...updatedFields };
    await roomManager.updateRoom(updated);
    handleRoomSync(updated);
  };

  // Cast Vote for expulsion
  const handleCastVote = async (targetPlayerId: string) => {
    if (!currentRoom || !currentPlayer) return;
    const updated = await roomManager.castVote(
      currentRoom.code,
      currentPlayer.id,
      targetPlayerId
    );
    if (updated) {
      handleRoomSync(updated);
    }
  };

  // Dismiss Expelled Announcement
  const handleDismissExpelled = async () => {
    if (!currentRoom) return;
    const updated = await roomManager.clearLastExpelled(currentRoom.code);
    if (updated) {
      handleRoomSync(updated);
    }
  };

  // Rock Paper Scissors Choice
  const handleMakeRpsChoice = async (choice: RpsChoice) => {
    if (!currentRoom || !currentPlayer) return;
    const updated = await roomManager.makeRpsChoice(
      currentRoom.code,
      currentPlayer.id,
      choice
    );
    if (updated) {
      handleRoomSync(updated);
    }
  };

  // Apply Special Action
  const handleApplySpecialAction = async (cardId: string, targetPlayerId?: string) => {
    if (!currentRoom || !currentPlayer) return;
    const result = await roomManager.applySpecialAction(
      currentRoom.code,
      currentPlayer.id,
      cardId,
      targetPlayerId
    );
    if (result && result.room) {
      handleRoomSync(result.room);
      return { peekedCard: result.peekedCard };
    }
  };

  // Dismiss Action Message Banner
  const handleDismissActionMessage = async () => {
    if (!currentRoom) return;
    const updated = await roomManager.clearLastActionMessage(currentRoom.code);
    if (updated) {
      handleRoomSync(updated);
    }
  };

  // End Turn
  const handleEndTurn = async () => {
    if (!currentRoom || !currentPlayer) return;
    const updated = await roomManager.endTurn(
      currentRoom.code,
      currentPlayer.id
    );
    if (updated) {
      handleRoomSync(updated);
    }
  };

  // Skip Turn (Host force)
  const handleSkipTurn = async () => {
    if (!currentRoom) return;
    const updated = await roomManager.skipTurn(currentRoom.code);
    if (updated) {
      handleRoomSync(updated);
    }
  };

  // ================= RENDER LOGIC =================

  // 1. If in room and game is IN PROGRESS:
  if (currentRoom && currentPlayer && currentRoom.status === "in_game") {
    const playerInRoom = currentRoom.players?.find((p) => p.id === currentPlayer.id);
    const isPlayerEliminated = Boolean(
      currentPlayer.isEliminated ||
      currentPlayer.isSpectator ||
      playerInRoom?.isEliminated ||
      playerInRoom?.isSpectator
    );

    // If this player was expelled or joined as spectator:
    if (isPlayerEliminated) {
      return (
        <ExpelledScreen
          room={currentRoom}
          currentPlayer={playerInRoom || currentPlayer}
          onLeaveRoom={handleLeaveRoom}
        />
      );
    }

    return (
      <InGameView
        room={currentRoom}
        currentPlayer={currentPlayer}
        onRevealCardToAll={handleRevealToAll}
        onLeaveRoom={handleLeaveRoom}
        onCastVote={handleCastVote}
        onDismissExpelled={handleDismissExpelled}
        onMakeRpsChoice={handleMakeRpsChoice}
        onApplySpecialAction={handleApplySpecialAction}
        onDismissActionMessage={handleDismissActionMessage}
        onEndTurn={handleEndTurn}
      />
    );
  }

  // 2. If in room and game is in LOBBY:
  if (currentRoom && currentPlayer) {
    return (
      <LobbyScreen
        room={currentRoom}
        currentPlayer={currentPlayer}
        onToggleReady={handleToggleReady}
        onLeaveRoom={handleLeaveRoom}
        onUpdateRoom={handleUpdateRoom}
        onStartGame={handleStartGame}
      />
    );
  }

  // 3. First Screen (Home)
  return (
    <div className="w-full max-w-sm mx-auto flex-1 flex flex-col justify-between items-center py-4 sm:py-6 h-full min-h-0 overflow-y-auto custom-scrollbar">
      {/* Brand Header */}
      <div className="w-full flex flex-col items-center text-center mt-2 sm:mt-4">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white uppercase">
          БУНКЕР
        </h1>
        <p className="text-sm text-zinc-400 mt-2.5 max-w-xs leading-relaxed">
          Гра на виживання та переконання. Доведіть, що саме ви гідні потрапити у сховище.
        </p>
      </div>

      {/* Center: Player Name Card */}
      <div className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-6 shadow-xl my-auto space-y-3">
        <label className="text-xs font-mono uppercase tracking-wider text-zinc-500 block">
          Ваше ім&apos;я
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={playerName}
            maxLength={20}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Введіть ім'я..."
            className="flex-1 py-3 px-4 bg-zinc-950/60 border border-zinc-800 focus:border-zinc-500 rounded-xl text-white font-medium text-sm outline-none transition-colors"
          />
          <button
            onClick={handleRandomizeName}
            title="Згенерувати випадкове ім'я"
            className="p-3 bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 rounded-xl text-zinc-300 hover:text-white transition-colors active:scale-95 cursor-pointer"
          >
            <Dices className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom: The Two Main Action Buttons */}
      <div className="w-full flex flex-col gap-3 mb-4">
        {/* Create Lobby Button */}
        <button
          onClick={handleCreateLobby}
          disabled={isLoading}
          className="w-full py-4 px-6 bg-white hover:bg-zinc-200 disabled:opacity-50 text-zinc-950 font-bold text-sm uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all cursor-pointer"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <PlusCircle className="w-5 h-5" />
              <span>Створити нову гру</span>
            </>
          )}
        </button>

        {/* Join Lobby Button */}
        <button
          onClick={() => {
            setJoinError(null);
            setIsJoinModalOpen(true);
          }}
          disabled={isLoading}
          className="w-full py-4 px-6 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 border border-zinc-800 text-white font-semibold text-sm uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
        >
          <LogIn className="w-5 h-5 text-zinc-400" />
          <span>Увійти за кодом</span>
        </button>
      </div>

      {/* Join Modal */}
      <JoinModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onJoin={handleJoinByCode}
        error={joinError}
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="text-zinc-500 text-center py-20">
          Завантаження протоколу...
        </div>
      }
    >
      <GameApp />
    </Suspense>
  );
}
