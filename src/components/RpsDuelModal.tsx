"use client";

import React from "react";
import { RpsDuel, RpsChoice, Player } from "@/types/game";
import { Check, Loader2 } from "lucide-react";

interface RpsDuelModalProps {
  duel: RpsDuel;
  currentPlayer: Player;
  onMakeChoice: (choice: RpsChoice) => void;
}

const CHOICES: { id: RpsChoice; label: string; emoji: string }[] = [
  { id: "rock", label: "Камінь", emoji: "🪨" },
  { id: "scissors", label: "Ножиці", emoji: "✂️" },
  { id: "paper", label: "Папір", emoji: "📄" },
];

export function RpsDuelModal({
  duel,
  currentPlayer,
  onMakeChoice,
}: RpsDuelModalProps) {
  const isDueler =
    currentPlayer.id === duel.player1Id || currentPlayer.id === duel.player2Id;
  const myChoice = duel.choices[currentPlayer.id];

  const p1Chosen = Boolean(duel.choices[duel.player1Id]);
  const p2Chosen = Boolean(duel.choices[duel.player2Id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-modal-backdrop">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-center shadow-2xl relative animate-modal-sway animate-gentle-float">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800/60">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Камінь, ножиці, папір
          </h3>
          <span className="text-[11px] font-mono font-medium text-zinc-400 bg-zinc-800/60 border border-zinc-700/40 px-2 py-0.5 rounded-full shrink-0">
            Раунд #{duel.roundNumber}
          </span>
        </div>

        {/* Players status */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div
            className={`p-3 rounded-2xl border text-center transition-colors ${
              p1Chosen
                ? "bg-zinc-950/60 border-emerald-500/30 text-zinc-200"
                : "bg-zinc-950/40 border-zinc-800 text-zinc-400"
            }`}
          >
            <span className="text-xs font-bold truncate block">
              {duel.player1Number ? `#${duel.player1Number} ` : ""}
              {duel.player1Name}
            </span>
            <span
              className={`text-[10px] font-mono block mt-1 ${
                p1Chosen ? "text-emerald-400" : "text-zinc-500"
              }`}
            >
              {p1Chosen ? "Готово" : "Обирає..."}
            </span>
          </div>

          <div
            className={`p-3 rounded-2xl border text-center transition-colors ${
              p2Chosen
                ? "bg-zinc-950/60 border-emerald-500/30 text-zinc-200"
                : "bg-zinc-950/40 border-zinc-800 text-zinc-400"
            }`}
          >
            <span className="text-xs font-bold truncate block">
              {duel.player2Number ? `#${duel.player2Number} ` : ""}
              {duel.player2Name}
            </span>
            <span
              className={`text-[10px] font-mono block mt-1 ${
                p2Chosen ? "text-emerald-400" : "text-zinc-500"
              }`}
            >
              {p2Chosen ? "Готово" : "Обирає..."}
            </span>
          </div>
        </div>

        {/* Draw alert if tie */}
        {duel.status === "draw" && (
          <div className="mb-4 py-2 px-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-amber-300 text-xs font-mono font-medium text-center">
            Нічия — перегравання раунду
          </div>
        )}

        {/* ================= IF CURRENT PLAYER IS A DUELER ================= */}
        {isDueler ? (
          <div>
            {!myChoice ? (
              <div className="grid grid-cols-3 gap-2">
                {CHOICES.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onMakeChoice(item.id)}
                    className="py-3 px-2 rounded-2xl bg-zinc-950/60 hover:bg-zinc-800/60 border border-zinc-800 hover:border-zinc-700 hover:scale-[0.985] active:scale-[0.95] transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5"
                  >
                    <span className="text-3xl select-none">{item.emoji}</span>
                    <span className="text-xs font-bold text-white tracking-wide">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-4 px-3 bg-zinc-950/50 border border-zinc-800/80 rounded-2xl flex items-center justify-center gap-2 text-xs text-zinc-300 font-medium">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Вибір зроблено. Очікуємо суперника...</span>
              </div>
            )}
          </div>
        ) : (
          /* ================= SPECTATOR VIEW ================= */
          <div className="py-4 px-3 bg-zinc-950/50 border border-zinc-800/80 rounded-2xl flex items-center justify-center gap-2 text-xs text-zinc-400 font-medium">
            <Loader2 className="w-4 h-4 animate-spin text-zinc-500 shrink-0" />
            <span>Гравці роблять вибір...</span>
          </div>
        )}
      </div>
    </div>
  );
}
