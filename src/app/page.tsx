"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { GameRoom, Player } from "@/types/game";
import { PlayerCharacterCard } from "@/data/characterData";
import { LobbyScreen } from "@/components/LobbyScreen";
import { InGameView } from "@/components/InGameView";
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
  const [selectedCard, setSelectedCard] = useState<PlayerCharacterCard | null>(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize player identity
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

    const joinCode = searchParams.get("join");
    if (joinCode) {
      handleJoinByCode(joinCode.toUpperCase(), player);
    }
  }, [searchParams]);

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

  const handleRoomSync = (updatedRoom: GameRoom) => {
    setCurrentRoom(updatedRoom);
    if (currentPlayer) {
      const updatedSelf = updatedRoom.players.find((p) => p.id === currentPlayer.id);
      if (updatedSelf) {
        setCurrentPlayer(updatedSelf);
        if (selectedCard && updatedSelf.cards) {
          const freshCard = updatedSelf.cards.find((c) => c.id === selectedCard.id);
          if (freshCard) {
            setSelectedCard(freshCard);
          }
        }
      }
    }
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
          `Лобі з кодом "${code}" не знайдено. Перевірте код або створіть нове.`
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

  // Leave Room
  const handleLeaveRoom = () => {
    roomManager.cleanup();
    setCurrentRoom(null);
    setSelectedCard(null);
    if (currentPlayer) {
      setCurrentPlayer({ ...currentPlayer, isHost: false, isReady: false });
    }
  };

  // Update room (e.g. reroll catastrophe)
  const handleUpdateRoom = async (updatedFields: Partial<GameRoom>) => {
    if (!currentRoom) return;
    const updated = { ...currentRoom, ...updatedFields };
    await roomManager.updateRoom(updated);
    handleRoomSync(updated);
  };

  // ================= RENDER LOGIC =================

  // 1. If in room and game is IN PROGRESS:
  if (currentRoom && currentPlayer && currentRoom.status === "in_game") {
    return (
      <InGameView
        room={currentRoom}
        currentPlayer={currentPlayer}
        onRevealCardToAll={handleRevealToAll}
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
    <div className="w-full flex-1 flex flex-col justify-between items-center py-6 min-h-[90vh]">
      {/* Brand Header */}
      <div className="w-full flex flex-col items-center text-center mt-4">
        {/* Network indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400 mb-3">
          {isSupabaseConfigured ? (
            <>
              <Wifi className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">МЕРЕЖА: ОНЛАЙН (SUPABASE)</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-amber-400" />
              <span className="text-amber-400">МЕРЕЖА: ЛОКАЛЬНИЙ РЕЖИМ</span>
            </>
          )}
        </div>

        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white uppercase drop-shadow-md">
          БУНКЕР
        </h1>
        <p className="text-sm text-zinc-400 mt-2 max-w-xs leading-relaxed">
          Соціально-дискусійна гра на виживання. Доведіть іншим, що саме ви гідні потрапити всередину.
        </p>
      </div>

      {/* Center: Player Name Card */}
      <div className="w-full max-w-sm my-6 bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 shadow-2xl backdrop-blur-sm">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
          Ваш позивний у сховищі:
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={playerName}
            maxLength={20}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Введіть ваше ім'я..."
            className="flex-1 py-3 px-4 bg-zinc-950 border border-zinc-700 focus:border-amber-400 rounded-xl text-white font-medium text-sm outline-none transition-colors"
          />
          <button
            onClick={handleRandomizeName}
            title="Згенерувати ім'я"
            className="p-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-zinc-300 hover:text-amber-400 transition-colors active:scale-95 cursor-pointer"
          >
            <Dices className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom: The Two Main Action Buttons */}
      <div className="w-full max-w-sm flex flex-col gap-3.5 mb-4">
        {/* Create Lobby Button */}
        <button
          onClick={handleCreateLobby}
          disabled={isLoading}
          className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:opacity-50 text-zinc-950 font-black text-base uppercase tracking-wider rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-amber-950/40 transform active:scale-98 transition-all cursor-pointer"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <PlusCircle className="w-5 h-5 stroke-[2.5]" />
              <span>Створити лобі</span>
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
          className="w-full py-4 px-6 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 border-2 border-zinc-700 text-white font-bold text-base uppercase tracking-wider rounded-2xl flex items-center justify-center gap-3 shadow-md transform active:scale-98 transition-all cursor-pointer"
        >
          <LogIn className="w-5 h-5 text-amber-400 stroke-[2.5]" />
          <span>Приєднатись</span>
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
