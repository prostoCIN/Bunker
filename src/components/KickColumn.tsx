"use client";

import React, { useState } from "react";
import { GameRoom, Player } from "@/types/game";
import { LogOut, Lock, Scale, Radio, Clock, SkipForward } from "lucide-react";

interface KickColumnProps {
  room: GameRoom;
  currentPlayer: Player;
  onKickClick: () => void;
  onLeaveRoom: () => void;
  onSkipTurn?: () => void;
  onEndTurn?: () => void;
}

export function KickColumn({
  room,
  currentPlayer,
  onKickClick,
  onLeaveRoom,
  onSkipTurn,
  onEndTurn,
}: KickColumnProps) {
  const votes = room.votes || {};
  const activePlayers = room.players.filter((p) => !p.isEliminated);
  const votedCount = activePlayers.filter((p) => votes[p.id]).length;
  const totalActive = activePlayers.length;

  const isVotingPhase = room.turnPhase === "voting";
  const currentTurnPlayer = room.currentTurnPlayerId
    ? room.players.find((p) => p.id === room.currentTurnPlayerId)
    : null;
  const isMyTurn = currentPlayer.id === room.currentTurnPlayerId;

  const myVoteTargetId = votes[currentPlayer.id];
  const myVoteTargetPlayer = myVoteTargetId
    ? room.players.find((p) => p.id === myVoteTargetId)
    : null;

  const hasVoted = Boolean(myVoteTargetId);

  return (
    <div className="w-full h-full flex flex-col justify-between items-center bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-5 xl:p-6 shadow-xl backdrop-blur-md relative overflow-hidden min-h-0">
      {/* Clean Header with Round Indicator */}
      <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-zinc-800/60 shrink-0">
        <h2 className="text-base font-bold text-white tracking-wide">
          Голосування
        </h2>
        <span className="text-[11px] font-mono font-bold tracking-wider text-zinc-400 bg-zinc-800/80 border border-zinc-700/60 px-2.5 py-0.5 rounded-full">
          Раунд #{room.roundNumber || 1}
        </span>
      </div>

      {/* Top Turn / Phase Status Card */}
      <div
        className={`w-full p-3.5 rounded-2xl border mb-3 shrink-0 flex flex-col gap-1.5 text-left transition-all ${
          isVotingPhase
            ? "bg-purple-950/30 border-purple-500/40 text-purple-200"
            : isMyTurn
            ? "bg-emerald-950/35 border-emerald-500/50 text-emerald-200 shadow-md shadow-emerald-950/30"
            : "bg-zinc-950/50 border-zinc-800/70 text-zinc-300"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            {isVotingPhase ? (
              <Scale className="w-4 h-4 text-purple-400 shrink-0" />
            ) : isMyTurn ? (
              <Radio className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
            ) : (
              <Clock className="w-4 h-4 text-zinc-400 shrink-0" />
            )}
            <span className="text-xs font-bold truncate">
              {isVotingPhase
                ? "Фаза голосування"
                : isMyTurn
                ? "Ваш хід (презентація)"
                : `Хід: #${currentTurnPlayer?.playerNumber ?? "?"} ${currentTurnPlayer?.name ?? "Гравець"}`}
            </span>
          </div>

          <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-black/40 border border-white/10 shrink-0">
            {isVotingPhase ? "Вигнання" : "Черга"}
          </span>
        </div>

        <p className="text-[11px] leading-relaxed opacity-75">
          {isVotingPhase
            ? "Всі виступи завершено. Оберіть кандидата для вигнання."
            : isMyTurn
            ? "Відкрийте характеристику в руці — хід завершиться автоматично."
            : "Очікуйте завершення виступу гравця."}
        </p>

        {/* Host action to skip turn */}
        {!isVotingPhase && !isMyTurn && currentPlayer.isHost && onSkipTurn && (
          <button
            onClick={onSkipTurn}
            title="Хост може передати хід наступному, якщо гравець не відповідає"
            className="w-full mt-1 py-1.5 px-2.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[11px] font-medium border border-zinc-700/60 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <SkipForward className="w-3.5 h-3.5 text-amber-400" />
            <span>Пропустити хід гравця</span>
          </button>
        )}
      </div>

      {/* Spacious Status Info */}
      <div className="w-full flex-1 flex flex-col justify-center items-center text-center my-2 sm:my-4 overflow-y-auto custom-scrollbar min-h-0">
        {!isVotingPhase ? (
          <div className="flex flex-col items-center max-w-xs px-2 animate-in fade-in duration-200">
            <div className="w-11 h-11 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-amber-400/80 flex items-center justify-center mb-2.5 shadow-inner">
              <Lock className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="text-xs font-semibold text-white mb-1">
              Голосування ще не почалося
            </h3>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Кнопки вигнання розблокуються автоматично після виступів усіх живих учасників.
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
          onClick={onLeaveRoom}
          className="w-full py-2.5 px-4 bg-zinc-950/40 hover:bg-zinc-800/60 border border-zinc-800/60 text-zinc-400 hover:text-white rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Покинути лобі</span>
        </button>
      </div>
    </div>
  );
}
