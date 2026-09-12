"use client";

import React, { useState } from "react";
import { GameRoom, Player } from "@/types/game";
import { LogOut, X, Lock } from "lucide-react";

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

  const isVotingPhase = room.turnPhase === "voting";
  const currentTurnPlayer = room.currentTurnPlayerId
    ? room.players.find((p) => p.id === room.currentTurnPlayerId)
    : null;

  const myVoteTargetId = votes[currentPlayer.id];
  const myVoteTargetPlayer = myVoteTargetId
    ? room.players.find((p) => p.id === myVoteTargetId)
    : null;

  const hasVoted = Boolean(myVoteTargetId);

  return (
    <div className="w-full h-full flex flex-col justify-between items-center bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-5 xl:p-6 shadow-xl backdrop-blur-md relative overflow-hidden">
      {/* Clean Header */}
      <div className="w-full text-center pb-4 border-b border-zinc-800/60 shrink-0">
        <h2 className="text-base font-bold text-white tracking-wide">
          Голосування
        </h2>
      </div>

      {/* Spacious Status Info */}
      <div className="w-full flex-1 flex flex-col justify-center items-center text-center my-6">
        {!isVotingPhase ? (
          <div className="flex flex-col items-center max-w-xs px-2 animate-in fade-in duration-200">
            <div className="w-12 h-12 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-amber-400 flex items-center justify-center mb-3 shadow-inner">
              <Lock className="w-6 h-6 text-amber-400" />
            </div>
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold mb-1">
              Раунд #{room.roundNumber || 1} // Черга ходів
            </span>
            <h3 className="text-sm font-semibold text-white mb-2">
              Голосування заблоковано
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {currentTurnPlayer ? (
                <>Зараз черга виступу: <b className="text-zinc-200">#{currentTurnPlayer.playerNumber} {currentTurnPlayer.name}</b>. Голосування відкриється, коли всі завершать хід.</>
              ) : (
                "Гравці роблять ходи по черзі. Голосування відкриється після завершення кола виступів."
              )}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center animate-in fade-in duration-200">
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
        )}
      </div>

      {/* Actions */}
      <div className="w-full space-y-2.5 shrink-0">
        <button
          onClick={onKickClick}
          disabled={currentPlayer.isEliminated || !isVotingPhase || Boolean(currentPlayer.cannotVote)}
          className={`w-full py-3.5 px-4 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg ${
            !isVotingPhase || Boolean(currentPlayer.cannotVote)
              ? "bg-zinc-800/50 border border-zinc-800 text-zinc-500 cursor-not-allowed"
              : hasVoted
              ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
              : "bg-red-600 hover:bg-red-500 shadow-red-950/40"
          }`}
        >
          {!isVotingPhase
            ? "Очікування завершення черги"
            : currentPlayer.cannotVote
            ? "Ви позбавлені права голосу"
            : hasVoted
            ? "Змінити свій голос"
            : "Вигнати з черги"}
        </button>

        <button
          onClick={() => setShowLeaveConfirm(true)}
          className="w-full py-2.5 px-4 bg-zinc-950/40 hover:bg-zinc-800/60 border border-zinc-800/60 text-zinc-400 hover:text-white rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Покинути лобі</span>
        </button>
      </div>

      {/* Leave Confirmation Overlay Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl text-center relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowLeaveConfirm(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-full bg-zinc-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-2">
              Покинути гру?
            </h3>

            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
              Вашого персонажа буде видалено з бункера, а сесію завершено.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setShowLeaveConfirm(false);
                  onLeaveRoom();
                }}
                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all active:scale-98 cursor-pointer"
              >
                Так, вийти
              </button>

              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white font-medium text-xs rounded-xl transition-all cursor-pointer"
              >
                Скасувати
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
