"use client";

import React, { useState, useEffect } from "react";
import { GameRoom, Player } from "@/types/game";
import { UserX, ShieldAlert, X, Check, Users } from "lucide-react";

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

  useEffect(() => {
    if (isOpen) {
      setSelectedTargetId((room.votes || {})[currentPlayer.id] || null);
    }
  }, [isOpen, room.votes, currentPlayer.id]);

  if (!isOpen) return null;

  // Active players in queue (not eliminated)
  const candidates = room.players.filter((p) => !p.isEliminated);
  const votes = room.votes || {};
  const votedCount = candidates.filter((p) => votes[p.id]).length;
  const totalActive = candidates.length;

  const handleConfirmVote = () => {
    if (selectedTargetId) {
      onCastVote(selectedTargetId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-zinc-900 border-2 border-red-900/60 rounded-3xl p-5 sm:p-6 shadow-2xl relative">
        <button
          onClick={onClose}
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
          ⚖️ Вигнання відбудеться лише тоді, коли **проголосують усі {totalActive} гравців**. Гравець із найбільшою кількістю голосів залишається зовні, а всі голоси скидаються.
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
                  <div className="flex items-center gap-1.5">
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

        {/* Confirm button */}
        <button
          onClick={handleConfirmVote}
          disabled={!selectedTargetId}
          className="w-full py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-40 disabled:pointer-events-none text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-red-950/50 transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
        >
          <UserX className="w-4 h-4" />
          <span>Віддати голос за вигнання</span>
        </button>
      </div>
    </div>
  );
}
