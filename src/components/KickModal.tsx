"use client";

import React, { useState, useEffect } from "react";
import { GameRoom, Player } from "@/types/game";
import { UserX, ShieldAlert, X, Check, AlertTriangle } from "lucide-react";

interface KickModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: GameRoom;
  currentPlayer: Player;
  onCastVote: (targetPlayerId: string) => void;
}

export function KickModal({
  isOpen,
  onClose,
  room,
  currentPlayer,
  onCastVote,
}: KickModalProps) {
  const currentMyVote = (room.votes || {})[currentPlayer.id] || null;
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(
    currentMyVote
  );
  const [showConfirmPrompt, setShowConfirmPrompt] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedTargetId((room.votes || {})[currentPlayer.id] || null);
      setShowConfirmPrompt(false);
    }
  }, [isOpen, room.votes, currentPlayer.id]);

  if (!isOpen) return null;

  // Active players in queue (not eliminated) sorted by playerNumber
  const candidates = [...room.players]
    .filter((p) => !p.isEliminated)
    .sort((a, b) => (a.playerNumber ?? 0) - (b.playerNumber ?? 0));
  const votes = room.votes || {};
  const votedCount = candidates.filter((p) => votes[p.id]).length;
  const totalActive = candidates.length;

  const targetPlayer = selectedTargetId
    ? room.players.find((p) => p.id === selectedTargetId)
    : null;

  const handleFinalVote = () => {
    if (selectedTargetId) {
      onCastVote(selectedTargetId);
      setShowConfirmPrompt(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-zinc-900 border-2 border-red-900/60 rounded-3xl p-5 sm:p-6 shadow-2xl relative">
        <button
          onClick={() => {
            setShowConfirmPrompt(false);
            onClose();
          }}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-full bg-zinc-800 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-2xl bg-red-950/70 border border-red-800 text-red-400">
            <UserX className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white leading-tight">
              Голосування за вигнання
            </h3>
            <p className="text-xs text-zinc-400">
              Проголосували: <b className="text-amber-400">{votedCount}</b> з {totalActive}
            </p>
          </div>
        </div>

        {/* Voting rule hint */}
        <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-2.5 mb-3 text-[11px] text-zinc-400 leading-tight">
          ⚖️ Вигнання відбудеться, коли <b>проголосують усі {totalActive} гравців</b>. Гравець із найбільшою кількістю голосів залишається зовні бункера.
        </div>

        {/* Candidates list */}
        <div className="space-y-2 my-3 max-h-56 overflow-y-auto pr-1">
          {candidates.map((player) => {
            const isSelf = player.id === currentPlayer.id;
            const isSelected = selectedTargetId === player.id;
            const revealedCards = (player.cards || []).filter(
              (c) => c.isRevealedToAll
            );

            return (
              <button
                key={player.id}
                onClick={() => setSelectedTargetId(player.id)}
                className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  isSelected
                    ? "bg-red-950/60 border-red-500 text-white shadow-lg"
                    : "bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:border-zinc-700"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-lg shrink-0">
                      #{player.playerNumber ?? 1}
                    </span>
                    <span className="font-bold text-sm">
                      {player.name}
                    </span>
                    {isSelf && (
                      <span className="text-[10px] text-zinc-500 font-semibold">
                        (Ви)
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-zinc-500">
                    Відкрито карток: {revealedCards.length}
                  </span>
                </div>

                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-white shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Action Button: Opens confirmation overlay */}
        <button
          onClick={() => setShowConfirmPrompt(true)}
          disabled={!selectedTargetId}
          className="w-full py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-40 disabled:pointer-events-none text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-red-950/50 transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
        >
          <UserX className="w-4 h-4" />
          <span>Віддати голос за вигнання</span>
        </button>

        {/* Confirmation Overlay before final vote */}
        {showConfirmPrompt && targetPlayer && (
          <div className="absolute inset-0 bg-zinc-950/95 rounded-3xl p-5 flex flex-col justify-center items-center text-center animate-in fade-in zoom-in-95 duration-150 z-20">
            <div className="w-14 h-14 rounded-2xl bg-red-950/80 border border-red-600 text-red-400 flex items-center justify-center mb-3 shadow-inner">
              <AlertTriangle className="w-7 h-7 animate-pulse" />
            </div>

            <h4 className="text-base font-black text-white mb-1">
              Підтвердити вигнання?
            </h4>

            <p className="text-xs text-zinc-300 mb-4 px-2 leading-relaxed">
              Ви впевнені, що хочете проголосувати за вигнання гравця{" "}
              <b className="text-red-400 font-bold underline">
                {targetPlayer.playerNumber ? `#${targetPlayer.playerNumber} ` : ""}{targetPlayer.name}
              </b>
              ? Якщо всі гравці завершать голосування, цей голос може вирішити його долю.
            </p>

            <div className="w-full space-y-2">
              <button
                onClick={handleFinalVote}
                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Так, вигнати цього гравця</span>
              </button>

              <button
                onClick={() => setShowConfirmPrompt(false)}
                className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Скасувати (Назад до списку)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
