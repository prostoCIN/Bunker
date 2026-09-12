"use client";

import React, { useState } from "react";
import { GameRoom, Player } from "@/types/game";
import { LogOut, Eye, ArrowLeft } from "lucide-react";
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
    <div className="w-full h-full flex-1 flex flex-col items-center justify-center p-6 sm:p-12 bg-zinc-900/60 border border-zinc-800/80 rounded-3xl shadow-2xl backdrop-blur-xl text-center min-h-0 overflow-y-auto">
      <div className="w-full max-w-md flex flex-col items-center justify-center my-auto space-y-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Only heading and description - no graphics */}
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
