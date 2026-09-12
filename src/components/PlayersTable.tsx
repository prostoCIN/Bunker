"use client";

import React from "react";
import { GameRoom, Player } from "@/types/game";

interface PlayersTableProps {
  room: GameRoom;
  currentPlayer: Player;
}

export function PlayersTable({ room, currentPlayer }: PlayersTableProps) {
  return (
    <div className="w-full h-full flex flex-col bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-5 xl:p-6 shadow-xl backdrop-blur-md overflow-hidden">
      {/* Table Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800/60 shrink-0">
        <h2 className="text-base font-bold text-white tracking-wide">
          Стіл бункера
        </h2>
        <span className="text-[11px] font-mono tracking-wider text-zinc-400 bg-zinc-800/60 px-2.5 py-0.5 rounded-full">
          {room.players.length} гравців
        </span>
      </div>

      {/* Players list */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1.5 custom-scrollbar">
        {room.players.map((player) => {
          const isSelf = player.id === currentPlayer.id;
          const cards = player.cards || [];
          const revealedCards = cards.filter((c) => c.isRevealedToAll);
          const hiddenCount = cards.length - revealedCards.length;

          return (
            <div
              key={player.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                isSelf
                  ? "bg-zinc-950/60 border-emerald-500/30"
                  : "bg-zinc-950/40 border-zinc-800/50"
              }`}
            >
              {/* Player Header */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-base text-white">
                    {player.name}
                  </span>
                  {isSelf && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                      Ви
                    </span>
                  )}
                  {player.isHost && (
                    <span className="text-[10px] font-medium text-amber-300 bg-amber-950/40 border border-amber-500/20 px-2 py-0.5 rounded-md">
                      Хост
                    </span>
                  )}
                  {player.isEliminated && (
                    <span className="text-[10px] font-bold text-red-400 bg-red-950/60 border border-red-500/40 px-2 py-0.5 rounded-md uppercase">
                      Вигнано
                    </span>
                  )}
                </div>

                <span className="text-xs font-mono text-zinc-500 shrink-0">
                  {revealedCards.length} / {cards.length}
                </span>
              </div>

              {/* Revealed traits */}
              {revealedCards.length === 0 ? (
                <p className="text-xs text-zinc-500 font-normal py-1">
                  Характеристики ще не відкриті
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2 gap-2">
                  {revealedCards.map((card) => (
                    <div
                      key={card.id}
                      className="bg-zinc-900/50 border border-zinc-800/50 p-2.5 rounded-xl flex items-start gap-2.5"
                    >
                      <span className="text-base shrink-0 mt-0.5">{card.icon}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-zinc-500 text-[10px] font-mono uppercase tracking-wider block">
                          {card.categoryName}
                        </span>
                        <span className="text-zinc-100 font-semibold text-sm leading-snug block break-words">
                          {card.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Hidden count note */}
              {hiddenCount > 0 && revealedCards.length > 0 && (
                <div className="mt-2 text-[11px] text-zinc-500 font-mono">
                  + {hiddenCount} прихованих характеристик
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
