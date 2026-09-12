"use client";

import React, { useState } from "react";
import { GameRoom, Player } from "@/types/game";
import { LogOut, Eye, ArrowLeft, Flame, Users } from "lucide-react";
import { PlayersTable } from "./PlayersTable";
import { CatastropheColumn } from "./CatastropheColumn";

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
  const [spectatorTab, setSpectatorTab] = useState<"table" | "catastrophe">("table");

  const isVotingPhase = room.turnPhase === "voting";

  // If player clicked "Спостерігати за бункером"
  if (isSpectating) {
    return (
      <div className="w-full flex-1 flex flex-col h-full min-h-0 overflow-hidden">
        {/* Modern Spectator Top Bar matching Global Top Bar */}
        <header className="w-full flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 bg-zinc-950/70 border border-zinc-800/70 rounded-2xl mb-2.5 sm:mb-3 shrink-0 backdrop-blur-md shadow-lg">
          {/* Left: Brand + Code + Spectator Tag + Round */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="font-black text-sm sm:text-base tracking-wider text-white uppercase">
              БУНКЕР
            </span>

            <div className="h-3.5 w-px bg-zinc-800" />

            <span className="px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono font-semibold">
              {room.code}
            </span>

            <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-md border text-red-400 bg-red-950/50 border-red-500/40 shrink-0">
              Спостерігач
            </span>

            <span className="hidden sm:inline-flex items-center text-[11px] font-mono text-zinc-400 bg-zinc-900/80 border border-zinc-800/80 px-2 py-0.5 rounded-md">
              Раунд #{room.roundNumber || 1}
            </span>

            <span
              className={`hidden md:inline-flex text-[11px] font-semibold px-2 py-0.5 rounded-md border truncate ${
                isVotingPhase
                  ? "text-purple-300 bg-purple-950/50 border-purple-500/40"
                  : "text-amber-300 bg-amber-950/50 border-amber-500/40"
              }`}
            >
              {isVotingPhase ? "Голосування" : "Виступи"}
            </span>
          </div>

          {/* Right: Back to Expelled Screen + Leave */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsSpectating(false)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Екран вигнання</span>
            </button>

            <button
              onClick={onLeaveRoom}
              title="Покинути гру"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-medium text-zinc-400 hover:text-red-300 bg-zinc-900/90 hover:bg-red-950/30 border border-zinc-800 hover:border-red-500/40 rounded-xl transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="text-xs">Вийти</span>
            </button>
          </div>
        </header>

        {/* Mobile Tab Switcher */}
        <div className="md:hidden grid grid-cols-2 bg-zinc-950/80 border border-zinc-800/60 p-1 rounded-2xl mb-2.5 shadow-inner gap-1 text-center shrink-0">
          <button
            onClick={() => setSpectatorTab("table")}
            className={`py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              spectatorTab === "table"
                ? "bg-zinc-800 text-white font-bold shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Стіл бункера</span>
          </button>
          <button
            onClick={() => setSpectatorTab("catastrophe")}
            className={`py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              spectatorTab === "catastrophe"
                ? "bg-zinc-800 text-white font-bold shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Подія</span>
          </button>
        </div>

        {/* Spectator Content: 2 Columns on Desktop, Switcher on Mobile */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {/* Mobile view */}
          <div className="md:hidden h-full min-h-0 overflow-hidden">
            {spectatorTab === "table" ? (
              <PlayersTable room={room} currentPlayer={currentPlayer} />
            ) : (
              <CatastropheColumn catastrophe={room.catastrophe} />
            )}
          </div>

          {/* Tablet & Desktop: 2-column view */}
          <div className="hidden md:grid md:grid-cols-12 md:gap-4 h-full min-h-0 overflow-hidden">
            <div className="md:col-span-4 h-full min-h-0 overflow-hidden">
              <CatastropheColumn catastrophe={room.catastrophe} />
            </div>
            <div className="md:col-span-8 h-full min-h-0 overflow-hidden">
              <PlayersTable room={room} currentPlayer={currentPlayer} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex-1 flex flex-col items-center justify-center p-6 sm:p-12 bg-zinc-900/60 border border-zinc-800/80 rounded-3xl shadow-2xl backdrop-blur-xl text-center min-h-0 overflow-y-auto">
      <div className="w-full max-w-md flex flex-col items-center justify-center my-auto space-y-8">
        {/* Only heading and description - clean typography, zero graphics */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white uppercase tracking-tight">
            Вас вигнали
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-sm mx-auto">
            Черга до сховища закрита для вас. За підсумками голосування ради бункера ви залишаєтесь на поверхні.
          </p>
        </div>

        {/* Action Buttons: Priority 1: Спостерігати за бункером, Priority 2: Покинути лобі */}
        <div className="w-full space-y-3">
          {/* Primary / Priority Button: Спостерігати за бункером */}
          <button
            onClick={() => setIsSpectating(true)}
            className="w-full py-4 px-6 bg-white hover:bg-zinc-200 text-zinc-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl hover:shadow-2xl transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2.5"
          >
            <Eye className="w-5 h-5 text-zinc-950" />
            <span>Спостерігати за бункером</span>
          </button>

          {/* Secondary Button: Покинути лобі */}
          <button
            onClick={onLeaveRoom}
            className="w-full py-3.5 px-6 bg-zinc-950/60 hover:bg-zinc-800 border border-zinc-800/80 hover:border-zinc-700 text-zinc-400 hover:text-white font-semibold text-xs uppercase tracking-wider rounded-2xl transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4 text-zinc-500" />
            <span>Покинути лобі</span>
          </button>
        </div>
      </div>
    </div>
  );
}
