"use client";

import React from "react";
import { GameRoom, Player } from "@/types/game";

interface KickColumnProps {
  room: GameRoom;
  currentPlayer: Player;
  onKickClick: () => void;
  onLeaveRoom?: () => void;
}

export function KickColumn({
  room,
  currentPlayer,
  onKickClick,
}: KickColumnProps) {
  const votes = room.votes || {};
  const activePlayers = room.players.filter(
    (p) => !p.isEliminated && !p.isSpectator && p.cards && p.cards.length > 0
  );
  const votedCount = activePlayers.filter((p) => votes[p.id]).length;
  const totalActive = activePlayers.length;

  const myVoteTargetId = votes[currentPlayer.id];
  const myVoteTargetPlayer = myVoteTargetId
    ? room.players.find((p) => p.id === myVoteTargetId)
    : null;

  const hasVoted = Boolean(myVoteTargetId);

  return (
    <div className="w-full h-full flex flex-col justify-between items-center bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-5 xl:p-6 shadow-xl backdrop-blur-md relative overflow-hidden min-h-0">
      {/* Header */}
      <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-zinc-800/60 shrink-0">
        <h2 className="text-base font-bold text-white tracking-wide">
          Голосування
        </h2>
        <span className="text-[11px] font-mono font-medium text-zinc-400 bg-zinc-800/60 border border-zinc-700/40 px-2.5 py-0.5 rounded-full shrink-0">
          Раунд #{room.roundNumber || 1}
        </span>
      </div>

      {/* Center: Minimalist Flat Vote Stats */}
      <div className="w-full flex-1 flex flex-col justify-center items-center text-center my-4 overflow-y-auto custom-scrollbar min-h-0">
        <div className="text-4xl xl:text-5xl font-mono font-black text-white tracking-tight">
          {votedCount}
          <span className="text-zinc-500 text-2xl font-light ml-1">
            / {totalActive}
          </span>
        </div>

        <span className="text-xs text-zinc-400 font-medium mt-1">
          {votedCount === totalActive ? "Всі проголосували" : "учасників проголосувало"}
        </span>

        {/* Clean Choice Tag */}
        {hasVoted && myVoteTargetPlayer && (
          <div className="mt-5 text-xs text-zinc-400 bg-zinc-950/60 border border-zinc-800/60 px-3.5 py-1.5 rounded-full">
            Ваш голос:{" "}
            <span className="text-white font-semibold">
              {myVoteTargetPlayer.playerNumber ? `#${myVoteTargetPlayer.playerNumber} ` : ""}
              {myVoteTargetPlayer.name}
            </span>
          </div>
        )}
      </div>

      {/* Action */}
      <div className="w-full shrink-0">
        <button
          onClick={onKickClick}
          disabled={currentPlayer.isEliminated || Boolean(currentPlayer.cannotVote)}
          className={`w-full py-3.5 px-4 font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0.5 active:scale-98 ${
            currentPlayer.cannotVote
              ? "bg-zinc-800/50 border border-zinc-800 text-zinc-500 cursor-not-allowed hover:translate-y-0 hover:shadow-none"
              : hasVoted
              ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 hover:border-zinc-600"
              : "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950/40 hover:shadow-red-950/70"
          }`}
        >
          {currentPlayer.cannotVote
            ? "Ви позбавлені права голосу"
            : hasVoted
            ? "Змінити свій голос"
            : "Обрати гравця для вигнання"}
        </button>
      </div>
    </div>
  );
}
