"use client";

import React, { useState } from "react";
import { PlayerCharacterCard } from "@/data/characterData";
import { ArrowLeft, Eye, EyeOff, Users, Check } from "lucide-react";

interface CardViewScreenProps {
  card: PlayerCharacterCard;
  onBack: () => void;
  onRevealToAll: (cardId: string) => void;
}

export function CardViewScreen({
  card,
  onBack,
  onRevealToAll,
}: CardViewScreenProps) {
  // If already revealed to all, card front is visible by default
  const [isFlipped, setIsFlipped] = useState(card.isRevealedToAll);
  const [justRevealed, setJustRevealed] = useState(false);

  const handleRevealToAll = () => {
    setIsFlipped(true);
    onRevealToAll(card.id);
    setJustRevealed(true);
    setTimeout(() => setJustRevealed(false), 2500);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between items-center py-2 px-1 overflow-y-auto">
      {/* Top Bar: Minimal Back Button */}
      <div className="w-full flex items-center justify-start mb-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors text-xs font-semibold cursor-pointer active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад</span>
        </button>
      </div>

      {/* Center: The Minimalist Card */}
      <div className="w-full my-auto flex flex-col items-center">
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className={`w-full max-w-xs sm:max-w-sm aspect-[3/4.2] rounded-3xl p-6 sm:p-7 transition-all duration-300 shadow-2xl flex flex-col justify-between relative border cursor-pointer select-none ${
            isFlipped
              ? "bg-zinc-950 border-zinc-700 shadow-black"
              : "bg-zinc-900 border-zinc-800 shadow-black"
          }`}
        >
          {/* ================= СОРОЧКА КАРТКИ (РУБАШКА) ================= */}
          {!isFlipped ? (
            <div className="h-full flex flex-col justify-between items-center text-center">
              {/* Тип картки зверху */}
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">
                {card.categoryName}
              </span>

              {/* Центральний мінімалістичний символ і назва */}
              <div className="my-auto flex flex-col items-center">
                <span className="text-6xl sm:text-7xl mb-4 block filter grayscale opacity-80">
                  {card.icon}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-zinc-200 tracking-wide">
                  {card.categoryName}
                </h2>
              </div>

              {/* Низ сорочки */}
              <div className="w-8 h-1 bg-zinc-800 rounded-full" />
            </div>
          ) : (
            /* ================= ЛИЦЬОВА СТОРОНА (ВМІСТ) ================= */
            <div className="h-full flex flex-col justify-between text-left animate-in fade-in duration-200">
              {/* Тип картки зверху */}
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400">
                <span className="text-base">{card.icon}</span>
                <span>{card.categoryName}</span>
              </div>

              {/* Вміст картки (Значення + Опис) */}
              <div className="my-auto space-y-3">
                <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  {card.value}
                </h2>

                {card.description && (
                  <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
                    {card.description}
                  </p>
                )}
              </div>

              {/* Чистий низ */}
              <div className="w-8 h-1 bg-zinc-800 rounded-full" />
            </div>
          )}
        </div>

        {/* Feedback alert after revealing */}
        {justRevealed && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-500 px-3 py-1.5 rounded-xl animate-in fade-in slide-in-from-bottom-2">
            <Check className="w-4 h-4" />
            <span>Картку відкрито для всіх гравців!</span>
          </div>
        )}
      </div>

      {/* Bottom: EXACTLY 2 MINIMALIST BUTTONS */}
      <div className="w-full max-w-xs sm:max-w-sm flex flex-col gap-2.5 mt-4">
        {/* Кнопка 1: Показати / Сховати (для себе) */}
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 active:scale-98 transition-all cursor-pointer"
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

        {/* Кнопка 2: Показати усім гравцям */}
        <button
          onClick={handleRevealToAll}
          disabled={card.isRevealedToAll}
          className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer ${
            card.isRevealedToAll
              ? "bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed"
              : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40"
          }`}
        >
          {card.isRevealedToAll ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Відкрито всім</span>
            </>
          ) : (
            <>
              <Users className="w-4 h-4" />
              <span>Показати усім гравцям</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
