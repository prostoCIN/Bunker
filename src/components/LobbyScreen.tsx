"use client";

import React, { useState } from "react";
import { GameRoom, Player } from "@/types/game";
import { CatastropheCard } from "./CatastropheCard";
import { 
  Copy, 
  Check, 
  Users, 
  Share2, 
  ShieldCheck, 
  LogOut, 
  CheckCircle2, 
  Clock,
  Play,
  Flame,
  Sparkles
} from "lucide-react";
import { getRandomCatastrophe } from "@/data/catastrophes";

interface LobbyScreenProps {
  room: GameRoom;
  currentPlayer: Player;
  onToggleReady: () => void;
  onLeaveRoom: () => void;
  onUpdateRoom: (updated: Partial<GameRoom>) => void;
  onStartGame?: () => void;
}

export function LobbyScreen({
  room,
  currentPlayer,
  onToggleReady,
  onLeaveRoom,
  onUpdateRoom,
  onStartGame,
}: LobbyScreenProps) {
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const readyCount = room.players.filter((p) => p.isReady).length;
  const totalCount = room.players.length;
  
  // Robust check for host: either isHost flag or first player in room
  const isHost =
    currentPlayer.isHost ||
    (room.players.length > 0 && room.players[0].id === currentPlayer.id);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(room.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleCopyInviteLink = async () => {
    try {
      const url = `${window.location.origin}?join=${room.code}`;
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleRerollCatastrophe = () => {
    const newCatastrophe = getRandomCatastrophe();
    onUpdateRoom({ catastrophe: newCatastrophe });
  };

  return (
    <div className="w-full flex flex-col items-center justify-between min-h-[90vh] py-2">
      {/* Top Bar / Status */}
      <div className="w-full flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-mono font-semibold tracking-wider text-emerald-400 uppercase">
            ШЛЮЗ ВІДКРИТО // ОЧІКУВАННЯ
          </span>
        </div>

        <button
          onClick={onLeaveRoom}
          className="text-xs text-zinc-400 hover:text-red-400 flex items-center gap-1 transition-colors px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800"
        >
          <LogOut className="w-3.5 h-3.5" />
          Вийти
        </button>
      </div>

      {/* Center: Catastrophe Card */}
      <div className="w-full my-auto flex flex-col items-center">
        <CatastropheCard
          catastrophe={room.catastrophe}
          isHost={isHost}
          onReroll={handleRerollCatastrophe}
        />

        {/* Lobby Code Plate */}
        <div className="w-full mt-4 bg-zinc-900/90 border-2 border-emerald-500/30 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase">
                Код для під&apos;єднання
              </span>
              <span className="text-3xl font-mono font-black text-emerald-400 tracking-wider">
                {room.code}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 active:scale-95 transition-all text-xs font-semibold cursor-pointer"
                title="Скопіювати код"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Скопійовано!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Копіювати код</span>
                  </>
                )}
              </button>

              <button
                onClick={handleCopyInviteLink}
                className="p-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white active:scale-95 transition-all cursor-pointer"
                title="Скопіювати посилання-запрошення"
              >
                {copiedLink ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Players List & Status */}
          <div className="pt-3 border-t border-zinc-800">
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-2 font-medium">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>У бункері: <b className="text-white">{totalCount}</b></span>
              </div>
              <div className="text-zinc-400">
                Готові: <b className="text-emerald-400">{readyCount}</b> / {totalCount}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto pr-1">
              {room.players.map((player) => (
                <div
                  key={player.id}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border ${
                    player.isReady
                      ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                      : "bg-zinc-800/60 border-zinc-700/60 text-zinc-400"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  <span className="font-medium truncate max-w-[120px]">
                    {player.name} {player.id === currentPlayer.id && "(Ви)"}
                  </span>
                  {(player.isHost || player.id === room.players[0]?.id) && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1 rounded font-semibold">
                      Хост
                    </span>
                  )}
                  {player.isReady ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 ml-0.5" />
                  ) : (
                    <Clock className="w-3 h-3 text-zinc-500 ml-0.5" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="w-full mt-5 space-y-3">
        {/* Main "Ready" Button for current player */}
        <button
          onClick={onToggleReady}
          className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all transform active:scale-98 shadow-xl cursor-pointer ${
            currentPlayer.isReady
              ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-emerald-900/40 border-2 border-emerald-400"
              : "bg-gradient-to-r from-zinc-800 to-zinc-700 text-zinc-100 hover:from-zinc-700 hover:to-zinc-600 border border-zinc-600"
          }`}
        >
          {currentPlayer.isReady ? (
            <>
              <CheckCircle2 className="w-6 h-6 text-white animate-bounce" />
              <span>ГОТОВИЙ ({readyCount}/{totalCount})</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <span>Я ГОТОВИЙ ({readyCount}/{totalCount})</span>
            </>
          )}
        </button>

        {/* Host Start Game Button - DISABLED UNTIL ALL PLAYERS ARE READY */}
        {isHost && (
          <div className="text-center pt-1 space-y-1.5">
            <button
              onClick={onStartGame}
              disabled={readyCount < totalCount}
              className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-xl flex items-center justify-center gap-2 ${
                readyCount === totalCount
                  ? "bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 border-2 border-yellow-300 shadow-amber-950/40 cursor-pointer active:scale-98 animate-pulse"
                  : "bg-zinc-800/60 border border-zinc-700/60 text-zinc-500 cursor-not-allowed opacity-60"
              }`}
            >
              <Flame className="w-5 h-5 fill-current" />
              <span>
                {readyCount === totalCount
                  ? "Зачинити гермодвері & Почати гру"
                  : `Очікування готовності (${readyCount}/${totalCount})`}
              </span>
            </button>
            <p className="text-[11px] text-zinc-400">
              {readyCount === totalCount
                ? "Усі учасники готові — можна зачиняти бункер!"
                : "Старт заблоковано, доки всі учасники лобі не натиснуть «ГОТОВИЙ»"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
