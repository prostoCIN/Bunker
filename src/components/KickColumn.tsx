"use client";

import React from "react";
import { GameRoom, Player } from "@/types/game";
import { UserX, ShieldAlert, CheckCircle2, Users, Clock } from "lucide-react";

interface KickColumnProps {
  room: GameRoom;
  currentPlayer: Player;
  onKickClick: () => void;
}

export function KickColumn({
  room,
  currentPlayer,
  onKickClick,
}: KickColumnProps) {
  const votes = room.votes || {};
  const activePlayers = room.players.filter((p) => !p.isEliminated);
  const votedCount = activePlayers.filter((p) => votes[p.id]).length;
  const totalActive = activePlayers.length;

  const myVoteTargetId = votes[currentPlayer.id];
  const myVoteTargetPlayer = myVoteTargetId
    ? room.players.find((p) => p.id === myVoteTargetId)
    : null;

  const hasVoted = Boolean(myVoteTargetId);

  return (
    <div className="w-full h-full flex flex-col justify-between items-center bg-zinc-900/90 border border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="w-full text-center pb-3 border-b border-zinc-800">
        <span className="text-[10px] font-mono tracking-widest text-red-400 uppercase font-black">
          [ РАДА БУНКЕРА ]
        </span>
        <h3 className="text-sm font-bold text-white mt-0.5">
          Голосування за вигнання
        </h3>
      </div>

      {/* Center status info */}
      <div className="w-full flex-1 flex flex-col justify-center items-center text-center gap-3 my-4">
        <div className="w-14 h-14 rounded-2xl bg-red-950/50 border border-red-800/60 flex items-center justify-center text-red-400 shadow-inner">
          <UserX className="w-7 h-7" />
        </div>

        {/* Voting Progress counter */}
        <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl px-3 py-2 w-full max-w-[190px]">
          <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 mb-1">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>Проголосували:</span>
          </div>
          <span className="text-xl font-mono font-black text-amber-400">
            {votedCount} / {totalActive}
          </span>
          <p className="text-[10px] text-zinc-500 mt-0.5">
            {votedCount === totalActive
              ? "Усі проголосували!"
              : "Очікуємо голоси всіх учасників"}
          </p>
        </div>

        {/* My current choice indicator */}
        {hasVoted && myVoteTargetPlayer && (
          <div className="text-[11px] text-zinc-400 bg-zinc-950 px-2.5 py-1.5 rounded-xl border border-zinc-800">
            Ваш голос:{" "}
            <b className="text-red-400 font-bold">
              {myVoteTargetPlayer.name}
            </b>
          </div>
        )}
      </div>

      {/* The Single Action Button */}
      <div className="w-full space-y-2">
        <button
          onClick={onKickClick}
          disabled={currentPlayer.isEliminated}
          className={`w-full py-4 px-3 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl border-2 shadow-2xl active:scale-95 transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
            hasVoted
              ? "bg-zinc-800 hover:bg-zinc-700 border-zinc-600 text-zinc-200"
              : "bg-gradient-to-b from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 border-red-400/80 shadow-red-950/60 animate-pulse"
          }`}
        >
          <ShieldAlert className="w-5 h-5 text-red-300" />
          <span className="leading-tight text-center">
            {hasVoted ? "Змінити свій голос" : "Вигнати з черги\nдо бункера"}
          </span>
        </button>

        <p className="text-[10px] text-zinc-500 font-mono text-center leading-tight">
          Вигнання відбудеться, коли проголосують абсолютно всі учасники
        </p>
      </div>
    </div>
  );
}
