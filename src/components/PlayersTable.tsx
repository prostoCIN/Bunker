"use client";

import React from "react";
import { GameRoom, Player } from "@/types/game";
import { Eye } from "lucide-react";

interface PlayersTableProps {
  room: GameRoom;
  currentPlayer: Player;
}

export function PlayersTable({
  room,
  currentPlayer,
}: PlayersTableProps) {
  const alivePlayers = [...room.players]
    .filter((p) => !p.isEliminated && !p.isSpectator && p.cards && p.cards.length > 0)
    .sort((a, b) => (a.playerNumber ?? 0) - (b.playerNumber ?? 0));

  const spectatorCount = room.players.filter(
    (p) => p.isSpectator || !p.cards || p.cards.length === 0
  ).length;

  return (
    <div className="w-full h-full flex flex-col bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-5 xl:p-6 shadow-xl backdrop-blur-md overflow-hidden min-h-0">
      {/* Table Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800/60 shrink-0 gap-2">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <h2 className="text-base font-bold text-white tracking-wide">
            Стіл бункера
          </h2>
          <span className="text-[11px] font-mono font-medium text-zinc-400 bg-zinc-800/60 border border-zinc-700/40 px-2.5 py-0.5 rounded-full shrink-0">
            Раунд #{room.roundNumber || 1}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {spectatorCount > 0 && (
            <span className="text-[11px] font-mono font-medium text-zinc-400 bg-zinc-800/60 border border-zinc-700/40 px-2.5 py-0.5 rounded-full shrink-0 flex items-center gap-1.5">
              <Eye className="w-3 h-3 text-zinc-400" />
              <span>{spectatorCount}</span>
            </span>
          )}
          <span className="text-[11px] font-mono font-medium text-zinc-400 bg-zinc-800/60 border border-zinc-700/40 px-2.5 py-0.5 rounded-full shrink-0">
            {alivePlayers.length} у грі
          </span>
        </div>
      </div>

      {/* Players list */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1.5 custom-scrollbar min-h-0">
        {[...room.players]
          .filter((p) => !p.isSpectator && p.cards && p.cards.length > 0)
          .sort((a, b) => (a.playerNumber ?? 0) - (b.playerNumber ?? 0))
          .map((player) => {
            const isSelf = player.id === currentPlayer.id;
            const cards = player.cards || [];
            const revealedCards = cards.filter((c) => c.isRevealedToAll);

            const isCurrentTurn =
              room.currentTurnPlayerId === player.id &&
              room.turnPhase === "presenting" &&
              !player.isEliminated;

            return (
              <div
                key={player.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 ease-out hover:translate-x-1 hover:shadow-lg hover:shadow-black/30 ${
                  player.isEliminated
                    ? "opacity-50 bg-zinc-950/20 border-zinc-800/30"
                    : isCurrentTurn
                    ? "bg-zinc-900 border-amber-500/80 animate-active-turn"
                    : isSelf
                    ? "bg-zinc-950/60 border-emerald-500/30 hover:border-emerald-500/60"
                    : "bg-zinc-950/40 border-zinc-800/50 hover:border-zinc-700/80"
                }`}
              >
                {/* Player Header */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-zinc-300 bg-zinc-800/80 border border-zinc-700/50 px-2 py-0.5 rounded-lg shrink-0">
                      #{player.playerNumber ?? 1}
                    </span>
                    <span className="font-bold text-base text-white">
                      {player.name}
                    </span>
                    {player.isEliminated && (
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md border text-red-400 bg-red-950/50 border-red-500/30 shrink-0">
                        Вигнано
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] font-mono font-medium text-zinc-400 bg-zinc-800/60 border border-zinc-700/40 px-2.5 py-0.5 rounded-full shrink-0">
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
                        className="bg-zinc-900/50 border border-zinc-800/50 p-2.5 rounded-xl flex items-start gap-2.5 transition-all duration-150 hover:scale-[1.015] hover:border-zinc-700/70 hover:bg-zinc-900/80 hover:shadow-sm"
                      >
                        <span className="text-base shrink-0 mt-0.5">{card.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
                              {card.categoryName}
                            </span>
                            {card.category === "special" && (
                              <span
                                className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md border shrink-0 ${
                                  card.isUsed
                                    ? "text-zinc-400 bg-zinc-800/60 border-zinc-700/40"
                                    : "text-amber-300 bg-amber-950/50 border-amber-500/30"
                                }`}
                              >
                                {card.isUsed ? "Застосовано" : "Спецдія"}
                              </span>
                            )}
                          </div>
                          <span className="text-zinc-100 font-semibold text-sm leading-snug block break-words mt-0.5">
                            {card.value}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
