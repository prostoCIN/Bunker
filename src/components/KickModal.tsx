"use client";

import React, { useState } from "react";
import { GameRoom, Player } from "@/types/game";
import { X, Check } from "lucide-react";

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

  if (!isOpen) return null;

  const candidates = [...room.players]
    .filter((p) => !p.isEliminated)
    .sort((a, b) => (a.playerNumber ?? 0) - (b.playerNumber ?? 0));

  const handleVote = (playerId: string) => {
    setSelectedTargetId(playerId);
    onCastVote(playerId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative animate-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-full bg-zinc-800 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-base font-bold text-white mb-0.5">
          Голосування
        </h3>
        <p className="text-xs text-zinc-400 mb-4">
          Оберіть гравця для вигнання
        </p>

        {/* Candidates flat list */}
        <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
          {candidates.map((player) => {
            const isSelf = player.id === currentPlayer.id;
            const isVoted = (room.votes || {})[currentPlayer.id] === player.id;
            const isSelected = selectedTargetId === player.id;
            const revealedCards = (player.cards || []).filter(
              (c) => c.isRevealedToAll
            );

            return (
              <button
                key={player.id}
                onClick={() => handleVote(player.id)}
                className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  isVoted || isSelected
                    ? "bg-red-950/40 border-red-500/70 text-white"
                    : "bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="font-mono font-bold text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-lg shrink-0">
                    #{player.playerNumber ?? 1}
                  </span>
                  <span className="font-semibold text-sm truncate">
                    {player.name}
                  </span>
                  {isSelf && (
                    <span className="text-[10px] text-zinc-500 font-medium shrink-0">
                      (Ви)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-mono text-zinc-500">
                    {revealedCards.length} відкр.
                  </span>
                  {(isVoted || isSelected) && (
                    <Check className="w-4 h-4 text-red-400" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
