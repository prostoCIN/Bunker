"use client";

import React, { useState } from "react";
import { GameRoom, Player } from "@/types/game";
import { 
  UserX, 
  ShieldAlert, 
  Users, 
  LogOut, 
  AlertTriangle, 
  X, 
  Check 
} from "lucide-react";

interface KickColumnProps {
  room: GameRoom;
  currentPlayer: Player;
  onKickClick: () => void;
  onLeaveRoom: () => void;
}

export function KickColumn({
  room,
  currentPlayer,
  onKickClick,
  onLeaveRoom,
}: KickColumnProps) {
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

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
    <div className="w-full h-full flex flex-col justify-between items-center bg-zinc-900/90 border border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-2xl backdrop-blur-md relative">
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
      <div className="w-full flex-1 flex flex-col justify-center items-center text-center gap-3 my-3">
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

      {/* Buttons Container */}
      <div className="w-full space-y-2.5">
        {/* The Single Expel Vote Action Button */}
        <button
          onClick={onKickClick}
          disabled={currentPlayer.isEliminated}
          className={`w-full py-3.5 px-3 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl border-2 shadow-2xl active:scale-95 transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
            hasVoted
              ? "bg-zinc-800 hover:bg-zinc-700 border-zinc-600 text-zinc-200"
              : "bg-gradient-to-b from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 border-red-400/80 shadow-red-950/60 animate-pulse"
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-red-300" />
          <span className="leading-tight text-center">
            {hasVoted ? "Змінити свій голос" : "Вигнати з черги\nдо бункера"}
          </span>
        </button>

        {/* Leave Lobby Button for every player */}
        <button
          onClick={() => setShowLeaveConfirm(true)}
          className="w-full py-2.5 px-3 bg-zinc-950/90 hover:bg-zinc-800/90 border border-zinc-800 hover:border-red-900/50 text-zinc-400 hover:text-red-400 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Покинути лобі</span>
        </button>

        <p className="text-[10px] text-zinc-500 font-mono text-center leading-tight">
          Вигнання відбудеться, коли проголосують абсолютно всі учасники
        </p>
      </div>

      {/* Leave Confirmation Overlay Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-zinc-900 border-2 border-red-800/80 rounded-3xl p-6 shadow-2xl text-center relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowLeaveConfirm(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-full bg-zinc-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-red-950/80 border border-red-700 text-red-400 flex items-center justify-center mx-auto mb-4 shadow-inner">
              <AlertTriangle className="w-7 h-7 animate-pulse" />
            </div>

            <h3 className="text-lg font-black text-white mb-1.5">
              Покинути лобі?
            </h3>

            <p className="text-xs text-zinc-300 mb-6 leading-relaxed">
              Ви впевнені, що хочете вийти з гри? Вашого персонажа буде видалено з бункера, а ваш слот звільниться для інших.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setShowLeaveConfirm(false);
                  onLeaveRoom();
                }}
                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Так, покинути гру</span>
              </button>

              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Скасувати (Залишитися)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
