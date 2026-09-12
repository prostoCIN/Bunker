"use client";

import React, { useState } from "react";
import { GameRoom, Player } from "@/types/game";
import { CatastropheCard } from "./CatastropheCard";
import { 
  Copy, 
  Check, 
  Share2, 
  LogOut, 
  CheckCircle2, 
  Clock,
  X 
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
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const readyCount = room.players.filter((p) => p.isReady).length;
  const totalCount = room.players.length;
  
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
      const url = `${window.location.origin}?room=${room.code}`;
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
    <div className="w-full max-w-xl mx-auto flex flex-col justify-between h-full min-h-0 py-3 px-2 overflow-y-auto custom-scrollbar space-y-4">
      {/* Clean Top Bar */}
      <div className="w-full flex items-center justify-between pb-2 border-b border-zinc-800/60">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <h1 className="text-sm font-bold text-white tracking-wide uppercase">
            Лобі бункера
          </h1>
        </div>

        <button
          onClick={() => setShowLeaveConfirm(true)}
          className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Вийти</span>
        </button>
      </div>

      {/* Center Stack */}
      <div className="w-full space-y-4 my-auto">
        <CatastropheCard
          catastrophe={room.catastrophe}
          isHost={isHost}
          onReroll={handleRerollCatastrophe}
        />

        {/* Lobby Code & Players */}
        <div className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-6 shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 block">
                Код кімнати
              </span>
              <span className="text-3xl sm:text-4xl font-mono font-black text-white tracking-wider">
                {room.code}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-all cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Скопійовано" : "Копіювати"}</span>
              </button>

              <button
                onClick={handleCopyInviteLink}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer"
                title="Скопіювати посилання"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Players in lobby */}
          <div className="pt-4 border-t border-zinc-800/60">
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-3">
              <span>Гравці ({totalCount})</span>
              <span>Готові: <b className="text-emerald-400 font-semibold">{readyCount}</b> / {totalCount}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {[...room.players]
                .sort((a, b) => (a.playerNumber ?? 0) - (b.playerNumber ?? 0))
                .map((player) => (
                  <div
                    key={player.id}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs border ${
                      player.isReady
                        ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-300 font-medium"
                        : "bg-zinc-950/40 border-zinc-800/50 text-zinc-400"
                    }`}
                  >
                    <span className="font-mono font-bold text-zinc-400 mr-0.5">
                      #{player.playerNumber ?? 1}
                    </span>
                    <span>{player.name} {player.id === currentPlayer.id && "(Ви)"}</span>
                    {player.isReady ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="w-full space-y-3 pt-2">
        <button
          onClick={onToggleReady}
          className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2.5 transition-all active:scale-98 cursor-pointer shadow-xl ${
            currentPlayer.isReady
              ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40"
              : "bg-zinc-800 hover:bg-zinc-700 text-white"
          }`}
        >
          {currentPlayer.isReady ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-white" />
              <span>Ви готові ({readyCount}/{totalCount})</span>
            </>
          ) : (
            <span>Я готовий ({readyCount}/{totalCount})</span>
          )}
        </button>

        {isHost && (
          <div className="text-center space-y-1.5">
            <button
              onClick={onStartGame}
              disabled={readyCount < totalCount}
              className={`w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all shadow-xl flex items-center justify-center gap-2 ${
                readyCount === totalCount
                  ? "bg-white hover:bg-zinc-200 text-zinc-950 shadow-white/10 cursor-pointer active:scale-98"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-600 cursor-not-allowed"
              }`}
            >
              <span>
                {readyCount === totalCount
                  ? "Почати гру"
                  : `Очікування готовності (${readyCount}/${totalCount})`}
              </span>
            </button>
            <p className="text-xs text-zinc-500">
              {readyCount === totalCount
                ? "Усі учасники готові — можна розпочинати!"
                : "Гра розпочнеться, коли всі учасники натиснуть «Я готовий»"}
            </p>
          </div>
        )}
      </div>

      {/* Leave Lobby Confirmation Modal (Centered on entire screen) */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl text-center relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowLeaveConfirm(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-full bg-zinc-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-2">
              Покинути лобі?
            </h3>

            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
              Ви вийдете з поточної кімнати та повернетеся на головний екран.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setShowLeaveConfirm(false);
                  onLeaveRoom();
                }}
                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all active:scale-98 cursor-pointer"
              >
                Так, вийти
              </button>

              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white font-medium text-xs rounded-xl transition-all cursor-pointer"
              >
                Скасувати
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
