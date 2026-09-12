"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { GameRoom, Player } from "@/types/game";
import { LobbyScreen } from "@/components/LobbyScreen";
import { JoinModal } from "@/components/JoinModal";
import { roomManager } from "@/lib/roomManager";
import { generateRandomName } from "@/lib/utils";
import { 
  ShieldAlert, 
  LogIn, 
  PlusCircle, 
  Dices, 
  Sparkles, 
  Users 
} from "lucide-react";

function GameApp() {
  const searchParams = useSearchParams();
  const [playerName, setPlayerName] = useState<string>("");
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  // Initialize player identity
  useEffect(() => {
    const savedId = localStorage.getItem("bunker_player_id") || "p_" + Math.random().toString(36).substring(2, 9);
    localStorage.setItem("bunker_player_id", savedId);

    const savedName = localStorage.getItem("bunker_player_name") || generateRandomName();
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

    // Check if query params have ?join=CODE
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

  // Create Lobby
  const handleCreateLobby = () => {
    if (!currentPlayer) return;
    const host: Player = { ...currentPlayer, name: playerName || "Хост", isHost: true, isReady: false };
    const room = roomManager.createRoom(host);
    setCurrentPlayer(host);
    setCurrentRoom(room);

    roomManager.initChannel(room.code, (updatedRoom) => {
      setCurrentRoom(updatedRoom);
    });
  };

  // Join Lobby
  const handleJoinByCode = (code: string, activePlayer?: Player) => {
    const playerToJoin = activePlayer || (currentPlayer ? { ...currentPlayer, name: playerName } : null);
    if (!playerToJoin) return;

    const room = roomManager.getRoom(code);
    if (!room) {
      setJoinError(`Лобі з кодом "${code}" не знайдено. Перевірте код або створіть нове.`);
      return;
    }

    const updatedRoom = roomManager.joinRoom(code, playerToJoin);
    if (updatedRoom) {
      setCurrentRoom(updatedRoom);
      setIsJoinModalOpen(false);
      setJoinError(null);

      roomManager.initChannel(code, (syncedRoom) => {
        setCurrentRoom(syncedRoom);
      });
    }
  };

  // Toggle Ready
  const handleToggleReady = () => {
    if (!currentRoom || !currentPlayer) return;
    const updated = roomManager.toggleReady(currentRoom.code, currentPlayer.id);
    if (updated) {
      setCurrentRoom(updated);
      const updatedSelf = updated.players.find((p) => p.id === currentPlayer.id);
      if (updatedSelf) {
        setCurrentPlayer(updatedSelf);
      }
    }
  };

  // Leave Room
  const handleLeaveRoom = () => {
    roomManager.cleanup();
    setCurrentRoom(null);
    if (currentPlayer) {
      setCurrentPlayer({ ...currentPlayer, isHost: false, isReady: false });
    }
  };

  // Update room (e.g. reroll catastrophe)
  const handleUpdateRoom = (updatedFields: Partial<GameRoom>) => {
    if (!currentRoom) return;
    const updated = { ...currentRoom, ...updatedFields };
    roomManager.saveRoom(updated);
    setCurrentRoom(updated);
  };

  // Render Lobby Screen if inside room
  if (currentRoom && currentPlayer) {
    return (
      <LobbyScreen
        room={currentRoom}
        currentPlayer={currentPlayer}
        onToggleReady={handleToggleReady}
        onLeaveRoom={handleLeaveRoom}
        onUpdateRoom={handleUpdateRoom}
      />
    );
  }

  // First Screen (Home)
  return (
    <div className="w-full flex-1 flex flex-col justify-between items-center py-6 min-h-[90vh]">
      {/* Brand Header */}
      <div className="w-full flex flex-col items-center text-center mt-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-semibold tracking-wider uppercase mb-4">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>СХОВИЩЕ ОСТАННЬОЇ НАДІЇ</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white uppercase drop-shadow-md">
          БУНКЕР
        </h1>
        <p className="text-sm text-zinc-400 mt-2 max-w-xs leading-relaxed">
          Соціально-дискусійна гра на виживання. Доведіть іншим, що саме ви гідні потрапити всередину.
        </p>
      </div>

      {/* Center: Player Name Card */}
      <div className="w-full max-w-sm my-8 bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 shadow-2xl backdrop-blur-sm">
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
      <div className="w-full max-w-sm flex flex-col gap-3.5 mb-6">
        {/* Create Lobby Button */}
        <button
          onClick={handleCreateLobby}
          className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 font-black text-base uppercase tracking-wider rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-amber-950/40 transform active:scale-98 transition-all cursor-pointer"
        >
          <PlusCircle className="w-5 h-5 stroke-[2.5]" />
          <span>Створити лобі</span>
        </button>

        {/* Join Lobby Button */}
        <button
          onClick={() => {
            setJoinError(null);
            setIsJoinModalOpen(true);
          }}
          className="w-full py-4 px-6 bg-zinc-900 hover:bg-zinc-800 border-2 border-zinc-700 text-white font-bold text-base uppercase tracking-wider rounded-2xl flex items-center justify-center gap-3 shadow-md transform active:scale-98 transition-all cursor-pointer"
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
    <Suspense fallback={<div className="text-zinc-500 text-center py-20">Завантаження протоколу...</div>}>
      <GameApp />
    </Suspense>
  );
}
