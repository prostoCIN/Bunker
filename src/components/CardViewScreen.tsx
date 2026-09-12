"use client";

import React, { useState } from "react";
import { PlayerCharacterCard, isTargetedSpecialAction } from "@/data/characterData";
import { GameRoom, Player } from "@/types/game";
import { 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Users, 
  Check, 
  Sparkles, 
  AlertTriangle, 
  X,
  Target,
  Zap
} from "lucide-react";

interface CardViewScreenProps {
  card: PlayerCharacterCard;
  room?: GameRoom;
  currentPlayer?: Player;
  isMyTurn?: boolean;
  isVotingPhase?: boolean;
  onBack: () => void;
  onRevealToAll: (cardId: string) => void;
  onApplySpecialAction?: (
    cardId: string,
    targetPlayerId?: string
  ) => Promise<{ peekedCard?: PlayerCharacterCard } | void>;
}

export function CardViewScreen({
  card,
  room,
  currentPlayer,
  isMyTurn = false,
  isVotingPhase = false,
  onBack,
  onRevealToAll,
  onApplySpecialAction,
}: CardViewScreenProps) {
  const isSpecial = card.category === "special";
  const [isFlipped, setIsFlipped] = useState(card.isRevealedToAll || isSpecial);
  const [isApplying, setIsApplying] = useState(false);

  // Modals state for special action
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [peekedCard, setPeekedCard] = useState<{
    targetName: string;
    targetNumber?: number;
    card: PlayerCharacterCard;
  } | null>(null);

  const isTargeted = isSpecial && isTargetedSpecialAction(card.value);

  // Available target players
  const availableTargets = (room?.players || []).filter((p) => {
    if (p.isEliminated) return false;
    // For healing serum, player can choose themselves too
    if (card.value.includes("Лікувальна сироватка")) return true;
    // For other targeted actions, exclude oneself
    return p.id !== currentPlayer?.id;
  });

  const canReveal = Boolean(isMyTurn) && !isVotingPhase && !card.isRevealedToAll;
  const canApplySpecial = Boolean(isMyTurn) && !isVotingPhase && !card.isUsed;

  const handleRevealToAll = () => {
    if (!canReveal) return;
    setIsFlipped(true);
    onRevealToAll(card.id);
  };

  const handleStartApply = () => {
    if (!canApplySpecial) return;
    setIsFlipped(true);
    if (isTargeted) {
      setShowTargetModal(true);
    } else {
      setShowConfirmModal(true);
    }
  };

  const handleConfirmApply = async () => {
    if (!onApplySpecialAction) return;
    setIsApplying(true);
    try {
      const result = await onApplySpecialAction(card.id, selectedTargetId || undefined);
      setShowConfirmModal(false);
      setShowTargetModal(false);

      if (result && result.peekedCard && selectedTargetId) {
        const target = room?.players.find((p) => p.id === selectedTargetId);
        setPeekedCard({
          targetName: target?.name || "Гравець",
          targetNumber: target?.playerNumber,
          card: result.peekedCard,
        });
      }
    } finally {
      setIsApplying(false);
    }
  };

  const selectedTargetPlayer = room?.players.find((p) => p.id === selectedTargetId);

  return (
    <div className="w-full h-full flex flex-col justify-between items-center relative min-h-0 overflow-hidden">
      {/* Top Bar: Minimal Back Button */}
      <div className="w-full flex items-center justify-between pb-2 shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white hover:scale-[0.985] active:scale-[0.95] transition-all text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад</span>
        </button>

        {isSpecial && (
          <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md border shrink-0 ${
            card.isUsed
              ? "bg-zinc-800/60 border-zinc-700/40 text-zinc-400"
              : isMyTurn && !isVotingPhase
              ? "bg-amber-950/50 border-amber-500/30 text-amber-300 animate-pulse"
              : "bg-zinc-800/40 border-zinc-700/30 text-zinc-500"
          }`}>
            {card.isUsed ? "✓ Використано" : isMyTurn && !isVotingPhase ? "⚡ Готова до застосування" : "Спецдія"}
          </span>
        )}
      </div>

      {/* Center: The Minimalist 3D Card (Dynamically adapts to available column height) */}
      <div className="w-full flex-1 min-h-0 my-auto flex items-center justify-center perspective-1000 py-1 overflow-hidden">
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className={`h-full max-h-[440px] w-auto max-w-full aspect-[3/4.2] relative cursor-pointer select-none transform-style-3d transition-all duration-500 ease-out hover:scale-[0.985] active:scale-[0.95] ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          {/* ================= СОРОЧКА КАРТКИ (РУБАШКА) ================= */}
          <div className="absolute inset-0 w-full h-full rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col justify-between border bg-zinc-900 border-zinc-800 hover:border-zinc-700 backface-hidden">
            <div className="h-full flex flex-col justify-between items-center text-center">
              {/* Тип картки зверху */}
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-zinc-500 shrink-0">
                {card.categoryName}
              </span>

              {/* Велика іконка по центру */}
              <div className="my-auto flex flex-col items-center gap-2 sm:gap-3">
                <span className="text-4xl sm:text-5xl lg:text-6xl drop-shadow-md">
                  {card.icon}
                </span>
                <span className="text-[10px] sm:text-xs font-mono text-zinc-500 uppercase tracking-wider">
                  Натисніть для перегляду
                </span>
              </div>

              {/* Чистий низ */}
              <div className="w-8 h-1 bg-zinc-800 rounded-full shrink-0" />
            </div>
          </div>

          {/* ================= ЛИЦЬОВА СТОРОНА (ВМІСТ) ================= */}
          <div
            className={`absolute inset-0 w-full h-full rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col justify-between border backface-hidden rotate-y-180 ${
              isSpecial
                ? "bg-zinc-950 border-amber-500/60 shadow-amber-950/20 hover:border-amber-400"
                : "bg-zinc-950 border-zinc-700 shadow-black hover:border-zinc-500"
            }`}
          >
            <div className="h-full flex flex-col justify-between text-left">
              {/* Тип картки зверху */}
              <div className="flex items-center justify-between shrink-0">
                <div className={`flex items-center gap-2 text-[10px] sm:text-xs font-mono uppercase tracking-wider ${
                  isSpecial ? "text-amber-400" : "text-emerald-400"
                }`}>
                  <span className="text-sm sm:text-base">{card.icon}</span>
                  <span>{card.categoryName}</span>
                </div>

                {isSpecial && card.isUsed && (
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md border shrink-0 bg-zinc-800/60 border-zinc-700/40 text-zinc-400">
                    Використано
                  </span>
                )}
              </div>

              {/* Вміст картки (Значення + Опис) */}
              <div className="my-auto space-y-1.5 sm:space-y-2 overflow-y-auto custom-scrollbar py-1 min-h-0">
                <h2 className="text-lg sm:text-xl 2xl:text-2xl font-black text-white leading-tight">
                  {card.value}
                </h2>

                {card.description && (
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
                    {card.description}
                  </p>
                )}
              </div>

              {/* Чистий низ */}
              <div className="w-8 h-1 bg-zinc-800 rounded-full shrink-0" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: ACTION BUTTONS (Always visible without scrolling) */}
      <div className="w-full max-w-xs sm:max-w-sm flex flex-col gap-2 pt-2 shrink-0">
        {/* Кнопка 1: Перевернути картку (сорочка/вміст) */}
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="w-full py-2.5 sm:py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-700 hover:scale-[0.985] text-zinc-200 border border-zinc-800 active:scale-[0.95] transition-all cursor-pointer shadow-sm"
        >
          {isFlipped ? (
            <>
              <EyeOff className="w-4 h-4 text-zinc-400" />
              <span>Показати сорочку</span>
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 text-zinc-300" />
              <span>Показати вміст</span>
            </>
          )}
        </button>

        {/* ================= SPECIAL ACTION CARD LOGIC ================= */}
        {isSpecial ? (
          <button
            onClick={handleStartApply}
            disabled={!canApplySpecial || isApplying}
            className={`w-full py-2.5 sm:py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
              card.isUsed
                ? "bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed"
                : !canApplySpecial
                ? "bg-zinc-900/60 border border-zinc-800 text-zinc-600 cursor-not-allowed"
                : "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-zinc-950 shadow-amber-950/50 hover:shadow-amber-500/20 hover:scale-[0.985] active:scale-[0.95]"
            }`}
          >
            {card.isUsed ? (
              <>
                <Check className="w-4 h-4 text-zinc-500" />
                <span>Дію вже застосовано</span>
              </>
            ) : !isMyTurn ? (
              <>
                <Sparkles className="w-4 h-4 text-zinc-600" />
                <span>Зараз не ваш хід</span>
              </>
            ) : isVotingPhase ? (
              <>
                <Sparkles className="w-4 h-4 text-zinc-600" />
                <span>Йде голосування</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Застосувати дію</span>
              </>
            )}
          </button>
        ) : (
          /* ================= REGULAR CARD: REVEAL TO ALL ================= */
          <button
            onClick={handleRevealToAll}
            disabled={!canReveal}
            className={`w-full py-2.5 sm:py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              card.isRevealedToAll
                ? "bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed"
                : !canReveal
                ? "bg-zinc-900/60 border border-zinc-800 text-zinc-600 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40 hover:shadow-emerald-950/60 hover:scale-[0.985] active:scale-[0.95]"
            }`}
          >
            {card.isRevealedToAll ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Відкрито всім</span>
              </>
            ) : !isMyTurn ? (
              <>
                <Users className="w-4 h-4 text-zinc-600" />
                <span>Зараз не ваш хід</span>
              </>
            ) : isVotingPhase ? (
              <>
                <Users className="w-4 h-4 text-zinc-600" />
                <span>Йде голосування</span>
              </>
            ) : (
              <>
                <Users className="w-4 h-4" />
                <span>Показати усім гравцям</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* ================= MODAL 1: SELECT TARGET PLAYER ================= */}
      {showTargetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-modal-backdrop">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-2xl relative text-left animate-modal-sway animate-gentle-float">
            <button
              onClick={() => setShowTargetModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 cursor-pointer active:scale-95 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2 text-amber-400">
              <Target className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">
                Оберіть ціль для дії
              </h3>
            </div>

            <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
              «{card.value}»: виберіть гравця, на якого буде спрямовано дію картки.
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto p-1 pr-1.5 custom-scrollbar mb-5">
              {availableTargets.map((target) => (
                <button
                  key={target.id}
                  onClick={() => setSelectedTargetId(target.id)}
                  className={`w-full p-3 rounded-2xl border text-left transition-all duration-150 cursor-pointer flex items-center justify-between hover:scale-[0.985] active:scale-[0.95] ${
                    selectedTargetId === target.id
                      ? "bg-amber-950/60 border-amber-500 text-white shadow-md shadow-amber-950/30"
                      : "bg-zinc-950/60 border-zinc-800/80 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300">
                      #{target.playerNumber ?? "?"}
                    </span>
                    <span className="font-semibold text-sm">
                      {target.name}
                      {target.id === currentPlayer?.id ? " (Ви)" : ""}
                    </span>
                  </div>

                  {selectedTargetId === target.id && (
                    <Check className="w-4 h-4 text-amber-400" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowTargetModal(false);
                  setShowConfirmModal(true);
                }}
                disabled={!selectedTargetId}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg hover:scale-[0.985] active:scale-[0.95]"
              >
                Далі (Підтвердження)
              </button>
              <button
                onClick={() => setShowTargetModal(false)}
                className="py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer hover:scale-[0.985] active:scale-[0.95]"
              >
                Скасувати
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: CONFIRMATION BEFORE APPLYING ================= */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-modal-backdrop">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl relative text-center animate-modal-sway animate-gentle-float">
            <div className="w-14 h-14 rounded-2xl bg-amber-950/80 border border-amber-500/80 text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Zap className="w-7 h-7 animate-pulse" />
            </div>

            <h3 className="text-base font-black text-white mb-2">
              Застосувати спецдію?
            </h3>

            <p className="text-xs text-zinc-300 mb-5 leading-relaxed">
              Ви збираєтесь використати картку{" "}
              <b className="text-amber-400 font-bold">«{card.value}»</b>
              {selectedTargetPlayer ? (
                <>
                  {" "}до гравця{" "}
                  <b className="text-white font-bold underline">
                    #{selectedTargetPlayer.playerNumber ?? "?"} {selectedTargetPlayer.name}
                  </b>
                </>
              ) : null}
              . Картка буде застосована, а її дія відкриється усім гравцям за столом.
            </p>

            <div className="space-y-2">
              <button
                onClick={handleConfirmApply}
                disabled={isApplying}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0.5"
              >
                <Check className="w-4 h-4" />
                <span>{isApplying ? "Застосування..." : "Так, виконати дію"}</span>
              </button>

              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  if (isTargeted) setShowTargetModal(true);
                }}
                disabled={isApplying}
                className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer active:scale-98"
              >
                Скасувати
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: PEEKED CARD POPUP (ШПИГУНСЬКИЙ ПОГЛЯД) ================= */}
      {peekedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-modal-backdrop">
          <div className="w-full max-w-sm bg-zinc-900 border-2 border-indigo-500/80 rounded-3xl p-6 shadow-2xl relative text-center animate-modal-sway animate-gentle-float">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-500 text-indigo-300 text-xs font-mono font-bold uppercase mb-3">
              <Eye className="w-3.5 h-3.5" />
              <span>Шпигунський погляд</span>
            </div>

            <h3 className="text-base font-bold text-white mb-1">
              Таємно підглянута карта!
            </h3>

            <p className="text-xs text-zinc-400 mb-4">
              Прихована характеристика гравця{" "}
              <b className="text-white">
                {peekedCard.targetNumber ? `#${peekedCard.targetNumber} ` : ""}
                {peekedCard.targetName}
              </b>:
            </p>

            {/* Revealed Card Mockup */}
            <div className="p-4 bg-zinc-950 border border-indigo-500/40 rounded-2xl text-left space-y-2 mb-5">
              <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 uppercase">
                <span>{peekedCard.card.icon}</span>
                <span>{peekedCard.card.categoryName}</span>
              </div>
              <h4 className="text-base font-bold text-white leading-snug">
                {peekedCard.card.value}
              </h4>
              {peekedCard.card.description && (
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {peekedCard.card.description}
                </p>
              )}
            </div>

            <button
              onClick={() => setPeekedCard(null)}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 hover:-translate-y-0.5 active:translate-y-0.5 active:scale-98 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-950/50"
            >
              Зрозуміло (Закрити)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
