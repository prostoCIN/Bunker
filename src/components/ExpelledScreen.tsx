"use client";

import React, { useState } from "react";
import { GameRoom, Player } from "@/types/game";
import { 
  Skull, 
  LogOut, 
  Flame, 
  AlertTriangle, 
  Eye, 
  ArrowLeft, 
  ShieldX, 
  DoorClosed,
  Layers
} from "lucide-react";
import { PlayersTable } from "./PlayersTable";

interface ExpelledScreenProps {
  room: GameRoom;
  currentPlayer: Player;
  onLeaveRoom: () => void;
}

export function ExpelledScreen({
  room,
  currentPlayer,
  onLeaveRoom,
}: ExpelledScreenProps) {
  const [isSpectating, setIsSpectating] = useState(false);

  const cards = currentPlayer.cards || [];
  const revealedCards = cards.filter((c) => c.isRevealedToAll);

  // If player clicked "Спостерігати за бункером"
  if (isSpectating) {
    return (
      <div className="w-full flex-1 flex flex-col h-full min-h-0 gap-3 overflow-hidden">
        {/* Spectator top bar */}
        <div className="w-full bg-red-950/80 border border-red-800/80 rounded-2xl px-4 py-2.5 flex items-center justify-between shadow-lg backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <div>
              <span className="text-xs font-mono font-bold text-red-300 uppercase tracking-wider">
                Режим спостерігача
              </span>
              <p className="text-[11px] text-zinc-400">
                Вас вигнано з черги бункера
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSpectating(false)}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-bold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Екран вигнання</span>
            </button>

            <button
              onClick={onLeaveRoom}
              className="px-3 py-1.5 rounded-xl bg-red-900 hover:bg-red-800 border border-red-600 text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Покинути лобі</span>
            </button>
          </div>
        </div>

        {/* Players table */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <PlayersTable room={room} currentPlayer={currentPlayer} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center py-4 px-3 sm:px-4 max-w-xl mx-auto h-full min-h-0 overflow-y-auto custom-scrollbar">
      <div className="w-full bg-zinc-900/95 border-2 border-red-600/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-red-950/60 backdrop-blur-xl relative overflow-hidden text-center">
        {/* Top ambient red hazard glow */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-red-600" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-48 bg-red-600/15 blur-3xl rounded-full pointer-events-none" />

        {/* Status Chip */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/90 border border-red-700/80 text-red-400 text-xs font-mono font-black uppercase tracking-widest mb-5 shadow-inner">
          <ShieldX className="w-4 h-4 text-red-400" />
          <span>[ ДОСТУП СКАСОВАНО ]</span>
        </div>

        {/* Icon & Heading */}
        <div className="relative mb-4 inline-block">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-b from-red-950/80 to-zinc-950 border-2 border-red-600 flex items-center justify-center text-red-400 shadow-xl shadow-red-950/80 mx-auto">
            <DoorClosed className="w-10 h-10 sm:w-12 sm:h-12 text-red-400 animate-pulse" />
          </div>
          <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-red-600 text-white shadow-md">
            <Skull className="w-4 h-4" />
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight mb-2">
          Вас вигнали
        </h1>

        <p className="text-sm sm:text-base text-zinc-300 max-w-md mx-auto leading-relaxed mb-6">
          Черга до сховища закрита для вас. За підсумками голосування ради бункера ви залишаєтесь на поверхні.
        </p>

        {/* Catastrophe context */}
        <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4 text-left mb-6 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase font-bold">
              <Flame className="w-3.5 h-3.5" />
              <span>На поверхні лютує:</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-950 border border-red-800 text-red-400 font-bold">
              ЗАГРОЗА: {room.catastrophe.badge}
            </span>
          </div>

          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <span>{room.catastrophe.emoji}</span>
            <span>{room.catastrophe.title}</span>
          </h3>

          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
            {room.catastrophe.description}
          </p>
        </div>

        {/* Character cards quick summary */}
        {cards.length > 0 && (
          <div className="bg-zinc-950/50 border border-zinc-800/80 rounded-2xl p-3.5 text-left mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono uppercase text-zinc-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-zinc-500" />
                <span>
                  Ваша особова справа ({currentPlayer.playerNumber ? `#${currentPlayer.playerNumber} ` : ""}
                  {currentPlayer.name}):
                </span>
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                Відкрито {revealedCards.length} з {cards.length}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {cards.slice(0, 6).map((c) => (
                <div
                  key={c.id}
                  className="bg-zinc-900/80 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs truncate"
                >
                  <span className="text-[10px] text-zinc-500 block uppercase font-mono truncate">
                    {c.categoryName}
                  </span>
                  <span className="text-white font-medium truncate block">
                    {c.isRevealedToAll ? c.value : "🔒 Приховано"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Main required button: Покинути лобі */}
          <button
            onClick={onLeaveRoom}
            className="w-full py-4 px-4 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-red-950/60 transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            <span>Покинути лобі</span>
          </button>

          {/* Secondary button: Спостерігати за грою */}
          <button
            onClick={() => setIsSpectating(true)}
            className="w-full py-3 px-4 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4 text-zinc-400" />
            <span>Спостерігати за бункером</span>
          </button>
        </div>
      </div>
    </div>
  );
}
