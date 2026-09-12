"use client";

import React from "react";
import { RpsDuel, RpsChoice, Player } from "@/types/game";
import { Swords, AlertTriangle, Check, Clock, Sparkles } from "lucide-react";

interface RpsDuelModalProps {
  duel: RpsDuel;
  currentPlayer: Player;
  onMakeChoice: (choice: RpsChoice) => void;
}

const CHOICES: { id: RpsChoice; label: string; emoji: string; beats: string }[] = [
  { id: "rock", label: "Камінь", emoji: "🪨", beats: "б'є Ножиці" },
  { id: "scissors", label: "Ножиці", emoji: "✂️", beats: "ріжуть Папір" },
  { id: "paper", label: "Папір", emoji: "📄", beats: "огортає Камінь" },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 animate-modal-backdrop">
      <div className="w-full max-w-md bg-gradient-to-b from-zinc-900 to-zinc-950 border-2 border-amber-500/80 rounded-3xl p-6 text-center shadow-2xl shadow-amber-950/40 relative overflow-hidden animate-modal-sway animate-subtle-sway">
        {/* Top Hazard Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600" />

        {/* Header Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-600 text-red-400 text-xs font-mono font-black uppercase mb-3">
          <Swords className="w-4 h-4 animate-pulse text-amber-400" />
          <span>ДУЕЛЬ ЗА ВИЖИВАННЯ // РАУНД #{duel.roundNumber}</span>
        </div>

        <h2 className="text-2xl font-black text-white tracking-tight leading-tight">
          КАМІНЬ, НОЖИЦІ, ПАПІР
        </h2>

        {/* Opponents Banner */}
        <div className="my-4 p-3 bg-zinc-950/80 border border-zinc-800 rounded-2xl flex items-center justify-around">
          <div className="flex flex-col items-center">
            <span className="font-bold text-sm text-amber-300">
              {duel.player1Number ? `#${duel.player1Number} ` : ""}{duel.player1Name}
            </span>
            <span className="text-[11px] text-zinc-500 font-mono mt-0.5">
              {p1Chosen ? "✅ Зробив вибір" : "⏳ Обирає..."}
            </span>
          </div>

          <span className="text-sm font-black text-red-500 font-mono">VS</span>

          <div className="flex flex-col items-center">
            <span className="font-bold text-sm text-amber-300">
              {duel.player2Number ? `#${duel.player2Number} ` : ""}{duel.player2Name}
            </span>
            <span className="text-[11px] text-zinc-500 font-mono mt-0.5">
              {p2Chosen ? "✅ Зробив вибір" : "⏳ Обирає..."}
            </span>
          </div>
        </div>

        {/* Draw alert if previous round was a tie */}
        {duel.status === "draw" && (
          <div className="mb-4 py-2 px-3 bg-yellow-950/60 border border-yellow-500/60 rounded-xl text-yellow-300 text-xs font-semibold flex items-center justify-center gap-1.5 animate-bounce">
            <AlertTriangle className="w-4 h-4" />
            <span>НІЧИЯ! Обидва обрали однаковий жест. Перегравання!</span>
          </div>
        )}

        <p className="text-xs text-zinc-400 mb-5 leading-relaxed">
          {isDueler
            ? "Голоси за вигнання розділилися порівну! Тільки цей поєдинок вирішить, хто залишиться в бункері, а хто загине назовні."
            : "Голоси розділилися порівну. Спостерігайте за дуеллю — той, хто програє, негайно вибуває!"}
        </p>

        {/* ================= IF CURRENT PLAYER IS A DUELER ================= */}
        {isDueler ? (
          <div>
            {!myChoice ? (
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                {CHOICES.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onMakeChoice(item.id)}
                    className="p-3.5 sm:p-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border-2 border-zinc-700 hover:border-amber-400 hover:-translate-y-2 hover:scale-105 active:scale-90 transition-all duration-200 flex flex-col items-center justify-center gap-2 group cursor-pointer shadow-lg hover:shadow-xl hover:shadow-amber-500/20"
                  >
                    <span className="text-4xl group-hover:scale-125 group-hover:-rotate-6 transition-transform duration-200">
                      {item.emoji}
                    </span>
                    <span className="text-xs font-black text-white uppercase tracking-wider">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {item.beats}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-5 bg-zinc-950/90 border border-emerald-500/50 rounded-2xl text-center animate-pulse">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-950/80 border border-emerald-500 flex items-center justify-center text-emerald-400 mb-2">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">
                  Ваш жест зафіксовано!
                </h4>
                <p className="text-xs text-zinc-400">
                  Очікуємо вибору суперника для розкриття результату...
                </p>
              </div>
            )}
          </div>
        ) : (
          /* ================= SPECTATOR VIEW ================= */
          <div className="p-5 bg-zinc-950/70 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-2">
            <Clock className="w-6 h-6 text-amber-400 animate-spin" />
            <span className="text-xs font-semibold text-zinc-300">
              Гравці обирають жести...
            </span>
            <span className="text-[11px] text-zinc-500">
              Результат оновиться автоматично, щойно обидва натиснуть свій вибір.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
