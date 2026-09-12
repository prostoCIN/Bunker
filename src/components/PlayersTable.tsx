"use client";

import React from "react";
import { GameRoom, Player } from "@/types/game";

interface PlayersTableProps {
  room: GameRoom;
  currentPlayer: Player;
}

export function PlayersTable({
  room,
  currentPlayer,
}: PlayersTableProps) {
  const alivePlayers = [...room.players]
    .filter((p) => !p.isEliminated)
    .sort((a, b) => (a.playerNumber ?? 0) - (b.playerNumber ?? 0));

  const currentTurnIdx = alivePlayers.findIndex(
    (p) => p.id === room.currentTurnPlayerId
  );

  // Find the index of the next player who has unrevealed cards
  let nextTurnIdx = -1;
  if (currentTurnIdx !== -1) {
    for (let i = currentTurnIdx + 1; i < alivePlayers.length; i++) {
      const p = alivePlayers[i];
      if (p.cards && p.cards.some((c) => !c.isRevealedToAll)) {
        nextTurnIdx = i;
        break;
      }
    }
  }

  return (
    <div className="w-full h-full flex flex-col bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-5 xl:p-6 shadow-xl backdrop-blur-md overflow-hidden min-h-0">
      {/* Table Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800/60 shrink-0 gap-2">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <h2 className="text-base font-bold text-white tracking-wide">
            Стіл бункера
          </h2>
          <span className="text-[11px] font-mono tracking-wider text-zinc-400 bg-zinc-800/60 px-2 py-0.5 rounded-full shrink-0">
            Раунд #{room.roundNumber || 1}
          </span>
          {room.turnPhase === "presenting" ? (
            <span className="text-[10px] font-mono font-semibold text-amber-300 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded-full shrink-0">
              Черга виступів
            </span>
          ) : (
            <span className="text-[10px] font-mono font-semibold text-purple-300 bg-purple-950/40 border border-purple-500/30 px-2 py-0.5 rounded-full shrink-0">
              Голосування
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-mono text-zinc-500">
            {alivePlayers.length} у грі
          </span>
        </div>
      </div>

      {/* Players list */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1.5 custom-scrollbar min-h-0">
        {[...room.players]
          .sort((a, b) => (a.playerNumber ?? 0) - (b.playerNumber ?? 0))
          .map((player) => {
            const isSelf = player.id === currentPlayer.id;
            const cards = player.cards || [];
            const revealedCards = cards.filter((c) => c.isRevealedToAll);
            const hiddenCount = cards.length - revealedCards.length;

            const isCurrentTurn =
              room.currentTurnPlayerId === player.id &&
              room.turnPhase === "presenting" &&
              !player.isEliminated;

            const playerAliveIdx = alivePlayers.findIndex((p) => p.id === player.id);
            const hasAlreadyPresented =
              room.turnPhase === "presenting" &&
              !player.isEliminated &&
              currentTurnIdx !== -1 &&
              playerAliveIdx !== -1 &&
              playerAliveIdx < currentTurnIdx;

            const isNextTurn =
              room.turnPhase === "presenting" &&
              !player.isEliminated &&
              playerAliveIdx === nextTurnIdx;

            const allRevealed =
              Boolean(player.cards &&
              player.cards.length > 0 &&
              player.cards.every((c) => c.isRevealedToAll));

            return (
              <div
                key={player.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isCurrentTurn
                    ? "bg-zinc-900 border-amber-500/70"
                    : isSelf
                    ? "bg-zinc-950/60 border-emerald-500/30"
                    : "bg-zinc-950/40 border-zinc-800/50"
                }`}
              >
                {/* Player Header */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-lg shrink-0">
                      #{player.playerNumber ?? 1}
                    </span>
                    <span className="font-bold text-base text-white">
                      {player.name}
                    </span>

                  {/* Turn progression badge in table */}
                  {isCurrentTurn && (
                    <span className="text-[10px] font-bold text-amber-300 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded-md">
                      🎯 Зараз ходить
                    </span>
                  )}

                  {hasAlreadyPresented && (
                    <span className="text-[10px] font-medium text-emerald-400/90 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                      ✓ Виступив
                    </span>
                  )}

                  {isNextTurn && !allRevealed && (
                    <span className="text-[10px] font-medium text-amber-400/80 bg-zinc-900 border border-amber-500/20 px-2 py-0.5 rounded-md">
                      ⏳ Наступний
                    </span>
                  )}

                  {allRevealed && !player.isEliminated && (
                    <span className="text-[10px] font-medium text-zinc-400 bg-zinc-800/70 border border-zinc-700/60 px-2 py-0.5 rounded-md">
                      ✓ Все відкрито
                    </span>
                  )}
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
                  {player.hasImmunity && (
                    <span className="text-[10px] font-bold text-blue-400 bg-blue-950/60 border border-blue-500/40 px-2 py-0.5 rounded-md">
                      🛡️ Імунітет
                    </span>
                  )}
                  {player.hasDoubleVote && (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded-md">
                      ⚡ 2x Голос
                    </span>
                  )}
                  {player.cannotVote && !player.isEliminated && (
                    <span className="text-[10px] font-bold text-zinc-400 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded-md">
                      🚫 Без голосу
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
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-zinc-500 text-[10px] font-mono uppercase tracking-wider block">
                            {card.categoryName}
                          </span>
                          {card.category === "special" && (
                            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                              card.isUsed
                                ? "bg-zinc-800 text-zinc-400 border-zinc-700"
                                : "bg-amber-950/80 text-amber-300 border-amber-500/40"
                            }`}>
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
