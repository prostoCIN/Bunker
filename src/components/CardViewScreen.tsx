"use client";

import React, { useState } from "react";
import { PlayerCharacterCard } from "@/data/characterData";
import { 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Users, 
  ShieldCheck, 
  Lock, 
  FileText, 
  Check 
} from "lucide-react";

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
    <div className="w-full flex flex-col justify-between items-center min-h-[90vh] py-3">
      {/* Top Bar */}
      <div className="w-full flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-colors text-xs font-semibold cursor-pointer active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад до списку</span>
        </button>

        <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">
          Картка #{card.id.replace("card_", "")}
        </span>
      </div>

      {/* Center: The Card (Front or Back) */}
      <div className="w-full my-auto flex flex-col items-center perspective-[1000px]">
        <div
          className={`w-full max-w-xs aspect-[3/4.2] rounded-3xl p-6 transition-all duration-500 shadow-2xl flex flex-col justify-between relative overflow-hidden border-2 select-none ${
            isFlipped
              ? "bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 border-amber-500/50 shadow-amber-950/20"
              : "bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 border-zinc-700 shadow-black"
          }`}
        >
          {/* ================= РУБАШКА КАРТКИ ================= */}
          {!isFlipped ? (
            <div className="h-full flex flex-col justify-between items-center text-center relative z-10">
              {/* Card Back Corner Accents */}
              <div className="w-full flex items-center justify-between text-zinc-600 font-mono text-[10px] tracking-widest uppercase">
                <span>[ СХОВИЩЕ ]</span>
                <span>[ СЕКРЕТНО ]</span>
              </div>

              {/* Center Emblem of Card Back */}
              <div className="flex flex-col items-center my-auto">
                <div className="w-24 h-24 rounded-full bg-zinc-900 border-2 border-dashed border-zinc-700 flex items-center justify-center text-5xl mb-4 shadow-inner">
                  {card.icon}
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/50 border border-red-800/60 text-red-400 text-xs font-black tracking-widest uppercase mb-2">
                  <Lock className="w-3.5 h-3.5" />
                  <span>ЦІЛКОМ ТАЄМНО</span>
                </div>

                <h3 className="text-lg font-bold text-white tracking-wide">
                  {card.categoryName}
                </h3>
                <p className="text-[11px] text-zinc-500 mt-1 max-w-[200px]">
                  Особова справа уцілілого. Інформація заблокована.
                </p>
              </div>

              {/* Card Back Bottom watermark */}
              <div className="w-full text-center border-t border-zinc-800 pt-2 text-[10px] font-mono text-zinc-600 uppercase tracking-wider">
                ПРОТОКОЛ БУНКЕР // КАРТКА ПАРАМЕТРА
              </div>
            </div>
          ) : (
            /* ================= ЛИЦЬОВА СТОРОНА КАРТКИ ================= */
            <div className="h-full flex flex-col justify-between relative z-10 animate-in fade-in duration-300">
              {/* Card Front Header */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                    <span className="text-base">{card.icon}</span>
                    <span>{card.categoryName}</span>
                  </div>

                  {card.isRevealedToAll ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                      <Users className="w-3 h-3" />
                      ВІДКРИТО ВСІМ
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded-full">
                      <Eye className="w-3 h-3" />
                      БАЧИТЕ ЛИШЕ ВИ
                    </span>
                  )}
                </div>

                {/* Main Value */}
                <h2 className="text-2xl font-black text-white tracking-tight leading-snug mt-4">
                  {card.value}
                </h2>
              </div>

              {/* Description Body */}
              <div className="my-auto bg-zinc-950/70 border border-zinc-800 rounded-2xl p-4">
                <span className="text-zinc-500 block text-[10px] uppercase font-mono tracking-wider mb-1">
                  Характеристика:
                </span>
                <p className="text-sm font-medium text-zinc-200 leading-relaxed">
                  {card.description}
                </p>
              </div>

              {/* Card Front Footer */}
              <div className="border-t border-zinc-800 pt-2 text-center text-[10px] font-mono text-zinc-500 uppercase">
                {card.isRevealedToAll
                  ? "✓ Ця інформація відома всім у бункері"
                  : "🔒 Тримайте в таємниці або відкрийте іншим"}
              </div>
            </div>
          )}
        </div>

        {/* Feedback alert after revealing */}
        {justRevealed && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-500 px-3 py-1.5 rounded-xl animate-in fade-in slide-in-from-bottom-2">
            <Check className="w-4 h-4" />
            <span>Картку відкрито для всіх гравців у кімнаті!</span>
          </div>
        )}
      </div>

      {/* Bottom: EXACTLY 2 BUTTONS as requested */}
      <div className="w-full max-w-xs flex flex-col gap-3 mt-4">
        {/* Кнопка 1: Показати / Сховати (для себе) */}
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-zinc-700 active:scale-98 transition-all cursor-pointer shadow-md"
        >
          {isFlipped ? (
            <>
              <EyeOff className="w-4 h-4 text-zinc-400" />
              <span>Показати сорочку (сховати)</span>
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 text-amber-400" />
              <span>Показати</span>
            </>
          )}
        </button>

        {/* Кнопка 2: Показати усім гравцям */}
        <button
          onClick={handleRevealToAll}
          disabled={card.isRevealedToAll}
          className={`w-full py-4 px-4 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer shadow-xl ${
            card.isRevealedToAll
              ? "bg-zinc-800/80 border border-zinc-700 text-zinc-500 cursor-not-allowed"
              : "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white border-2 border-emerald-400/80 shadow-emerald-950/40"
          }`}
        >
          {card.isRevealedToAll ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Вже відкрито всім гравцям</span>
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
