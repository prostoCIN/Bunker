"use client";

import React, { useState } from "react";
import { GameRoom, Player } from "@/types/game";
import { UserX, AlertTriangle, X, Check } from "lucide-react";

interface KickModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: GameRoom;
  currentPlayer: Player;
  onKickPlayer: (targetPlayerId: string) => void;
}

export function KickModal({
  isOpen,
  onClose,
  room,
  currentPlayer,
  onKickPlayer,
}: KickModalProps) {
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Players still in queue (not eliminated)
  const candidates = room.players.filter((p) => !p.isEliminated);

  const handleConfirmKick = () => {
    if (selectedTargetId) {
      onKickPlayer(selectedTargetId);
      setSelectedTargetId(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-zinc-900 border-2 border-red-900/60 rounded-3xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-full bg-zinc-800 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-red-950/70 border border-red-800 text-red-400">
            <UserX className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white leading-tight">
              Вигнання з черги
            </h3>
            <p className="text-xs text-zinc-400">
              Оберіть гравця, який залишиться зовні
            </p>
          </div>
        </div>

        {/* Candidates list */}
        <div className="space-y-2 my-4 max-h-56 overflow-y-auto pr-1">
          {candidates.map((player) => (
            <button
              key={player.id}
              onClick={() => setSelectedTargetId(player.id)}
              className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                selectedTargetId === player.id
                  ? "bg-red-950/60 border-red-500 text-white shadow-lg"
                  : "bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:border-zinc-700"
              }`}
            >
              <div>
                <span className="font-bold text-sm block">
                  {player.name} {player.id === currentPlayer.id && "(Ви)"}
                </span>
                <span className="text-[11px] text-zinc-500">
                  Відкрито карток: {(player.cards || []).filter((c) => c.isRevealedToAll).length}
                </span>
              </div>

              {selectedTargetId === player.id && (
                <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-white">
                  <Check className="w-3.5 h-3.5" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Action button */}
        <button
          onClick={handleConfirmKick}
          disabled={!selectedTargetId}
          className="w-full py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-40 disabled:pointer-events-none text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-red-950/50 transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
        >
          <UserX className="w-4 h-4" />
          <span>Підтвердити вигнання</span>
        </button>
      </div>
    </div>
  );
}
