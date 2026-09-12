"use client";

import React, { useState } from "react";
import { GameRoom, Player } from "@/types/game";
import { PlayerCharacterCard } from "@/data/characterData";
import { CatastropheCard } from "./CatastropheCard";
import { 
  ChevronRight, 
  Lock, 
  Eye, 
  Users, 
  AlertTriangle, 
  ShieldCheck, 
  Flame, 
  Radio 
} from "lucide-react";

interface PlayerHandProps {
  room: GameRoom;
  currentPlayer: Player;
  onSelectCard: (card: PlayerCharacterCard) => void;
}

export function PlayerHand({
  room,
  currentPlayer,
  onSelectCard,
}: PlayerHandProps) {
  const [showCatastropheModal, setShowCatastropheModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);

  const cards = currentPlayer.cards || [];
  const revealedCount = cards.filter((c) => c.isRevealedToAll).length;

  return (
    <div className="w-full flex flex-col items-center min-h-[90vh] py-2">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>БУНКЕР // ГРА ТРИВАЄ</span>
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">
            Рука гравця: <span className="text-emerald-400">{currentPlayer.name}</span>
          </h1>
        </div>

        {/* Quick Disaster Pill */}
        <button
          onClick={() => setShowCatastropheModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold hover:bg-amber-500/20 active:scale-95 transition-all cursor-pointer"
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Подія</span>
        </button>
      </div>

      {/* Progress / Status banner */}
      <div className="w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3 mb-4 flex items-center justify-between text-xs">
        <span className="text-zinc-400">
          Відкрито характеристик: <b className="text-emerald-400">{revealedCount}</b> з {cards.length}
        </span>
        <button
          onClick={() => setShowTableModal(true)}
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
        >
          <Users className="w-3.5 h-3.5" />
          <span>Стіл гравців ({room.players.length})</span>
        </button>
      </div>

      {/* Wide Full-Width Parameter Plates (Широкими на весь екран плашками вишикувані донизу) */}
      <div className="w-full flex flex-col gap-3 flex-1">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => onSelectCard(card)}
            className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between text-left transition-all active:scale-98 shadow-md cursor-pointer ${
              card.isRevealedToAll
                ? "bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-900 border-emerald-500/50 hover:border-emerald-400"
                : "bg-gradient-to-r from-zinc-900 to-zinc-950 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-2">
              {/* Category Icon */}
              <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                {card.icon}
              </div>

              {/* Title & Preview info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold tracking-wider text-zinc-400 uppercase">
                    {card.categoryName}
                  </span>
                  {card.isRevealedToAll && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-1.5 py-0.2 rounded-full">
                      ВІДКРИТО
                    </span>
                  )}
                </div>

                <div className="mt-0.5">
                  {card.isRevealedToAll ? (
                    <p className="text-sm font-bold text-white truncate">
                      {card.value}
                    </p>
                  ) : (
                    <p className="text-xs font-medium text-zinc-500 flex items-center gap-1.5">
                      <Lock className="w-3 h-3 text-zinc-600" />
                      <span>Приховано (натисніть, щоб відкрити)</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Arrow */}
            <div className="shrink-0 p-2 rounded-xl bg-zinc-800/60 border border-zinc-700/60 text-zinc-400">
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        ))}
      </div>

      {/* Modal: Catastrophe Review */}
      {showCatastropheModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm max-h-[90vh] overflow-y-auto space-y-3">
            <CatastropheCard catastrophe={room.catastrophe} />
            <button
              onClick={() => setShowCatastropheModal(false)}
              className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm uppercase rounded-xl transition-all cursor-pointer"
            >
              Закрити
            </button>
          </div>
        </div>
      )}

      {/* Modal: Other Players & Revealed Traits Table */}
      {showTableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm max-h-[85vh] flex flex-col bg-zinc-900 border border-zinc-700 rounded-3xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <span>Учасники бункера</span>
              </h3>
              <button
                onClick={() => setShowTableModal(false)}
                className="text-xs text-zinc-400 hover:text-white px-2 py-1 bg-zinc-800 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {room.players.map((p) => {
                const pRevealed = (p.cards || []).filter((c) => c.isRevealedToAll);
                return (
                  <div
                    key={p.id}
                    className="p-3 bg-zinc-950/70 border border-zinc-800 rounded-2xl"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-white">
                        {p.name} {p.id === currentPlayer.id && "(Ви)"}
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        Відкрито: {pRevealed.length}
                      </span>
                    </div>

                    {pRevealed.length === 0 ? (
                      <p className="text-xs text-zinc-500 italic">
                        Ще не відкрив жодної характеристики
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {pRevealed.map((c) => (
                          <div
                            key={c.id}
                            className="flex items-center gap-2 text-xs bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800"
                          >
                            <span>{c.icon}</span>
                            <span className="text-zinc-400 font-medium">
                              {c.categoryName}:
                            </span>
                            <span className="text-emerald-300 font-semibold truncate">
                              {c.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowTableModal(false)}
              className="w-full mt-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase rounded-xl cursor-pointer"
            >
              Повернутися до моєї руки
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
