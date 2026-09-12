"use client";

import React from "react";
import { GameRoom, Player } from "@/types/game";
import { Users, Lock } from "lucide-react";

interface PlayersTableProps {
  room: GameRoom;
  currentPlayer: Player;
}

export function PlayersTable({ room, currentPlayer }: PlayersTableProps) {
  return (
    <div className="w-full h-full flex flex-col bg-zinc-900/90 border border-zinc-800 rounded-3xl p-4 xl:p-5 shadow-2xl backdrop-blur-md overflow-hidden">
      {/* Table Header */}
      <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm xl:text-base font-bold text-white leading-tight">
              Стіл бункера
            </h2>
            <p className="text-[11px] text-zinc-400">
              Учасників: <b className="text-emerald-400">{room.players.length}</b>
            </p>
          </div>
        </div>
      </div>

      {/* Players list */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1.5 custom-scrollbar">
        {room.players.map((player) => {
          const isSelf = player.id === currentPlayer.id;
          const cards = player.cards || [];
          const revealedCards = cards.filter((c) => c.isRevealedToAll);
          const hiddenCount = cards.length - revealedCards.length;

          return (
            <div
              key={player.id}
              className={`p-3.5 xl:p-4 rounded-2xl border transition-all ${
                isSelf
                  ? "bg-zinc-950/80 border-emerald-500/40 shadow-emerald-950/20"
                  : "bg-zinc-950/50 border-zinc-800/90"
              }`}
            >
              {/* Player info header */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  <span className="font-bold text-sm text-white truncate">
                    {player.name}
                  </span>
                  {isSelf && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-1.5 py-0.5 rounded-full">
                      Ви
                    </span>
                  )}
                  {player.isHost && (
                    <span className="text-[10px] font-semibold text-amber-300 bg-amber-950/60 border border-amber-500/30 px-1.5 py-0.5 rounded-full">
                      Хост
                    </span>
                  )}
                  {player.isEliminated && (
                    <span className="text-[10px] font-bold text-red-400 bg-red-950/80 border border-red-500/60 px-2 py-0.5 rounded-full uppercase">
                      💀 Вигнано
                    </span>
                  )}
                </div>

                <span className="text-[11px] font-mono text-zinc-400 shrink-0">
                  Відкрито: <b className="text-emerald-400">{revealedCards.length}</b>/{cards.length}
                </span>
              </div>

              {/* Revealed traits - Adaptive flex/grid */}
              {revealedCards.length === 0 ? (
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 italic py-1.5 bg-zinc-900/40 px-2.5 rounded-xl border border-zinc-800/40">
                  <Lock className="w-3 h-3 text-zinc-600 shrink-0" />
                  <span>Ще не відкрив жодного параметра</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2 gap-1.5">
                  {revealedCards.map((card) => (
                    <div
                      key={card.id}
                      className="flex items-start gap-2 text-xs bg-zinc-900/90 border border-zinc-800 p-2 rounded-xl shadow-sm"
                    >
                      <span className="text-base shrink-0 mt-0.5">{card.icon}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-zinc-400 text-[10px] font-mono uppercase tracking-wider block truncate">
                          {card.categoryName}:
                        </span>
                        <span className="text-zinc-100 font-bold block leading-snug break-words">
                          {card.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Hidden cards indicator */}
              {hiddenCount > 0 && revealedCards.length > 0 && (
                <div className="mt-2 text-[11px] text-zinc-500 font-mono flex items-center gap-1 px-1">
                  <Lock className="w-2.5 h-2.5 shrink-0" />
                  <span>Ще {hiddenCount} прихованих характеристик</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
