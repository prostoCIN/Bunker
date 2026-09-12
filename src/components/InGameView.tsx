"use client";

import React, { useState, useRef } from "react";
import { GameRoom, Player } from "@/types/game";
import { PlayerCharacterCard } from "@/data/characterData";
import { PlayersTable } from "./PlayersTable";
import { CardViewScreen } from "./CardViewScreen";
import { 
  Users, 
  Layers, 
  ChevronRight, 
  Lock, 
  Flame, 
  ChevronLeft, 
  ArrowRightLeft 
} from "lucide-react";

interface InGameViewProps {
  room: GameRoom;
  currentPlayer: Player;
  onRevealCardToAll: (cardId: string) => void;
}

export function InGameView({
  room,
  currentPlayer,
  onRevealCardToAll,
}: InGameViewProps) {
  // Mobile active tab: "table" (Стіл) or "hand" (Моя рука)
  const [activeTab, setActiveTab] = useState<"table" | "hand">("hand");
  const [selectedCard, setSelectedCard] = useState<PlayerCharacterCard | null>(null);

  // Touch swipe support for mobile
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      // Swiped Left -> switch to "hand" if on "table"
      if (activeTab === "table") setActiveTab("hand");
    } else if (isRightSwipe) {
      // Swiped Right -> switch to "table" if on "hand"
      if (activeTab === "hand") setActiveTab("table");
    }
  };

  const cards = currentPlayer.cards || [];
  const revealedCount = cards.filter((c) => c.isRevealedToAll).length;

  // Hand parameter plates component
  const renderHandContent = () => {
    if (selectedCard) {
      return (
        <div className="w-full h-full flex flex-col">
          <CardViewScreen
            card={selectedCard}
            onBack={() => setSelectedCard(null)}
            onRevealToAll={(cardId) => {
              onRevealCardToAll(cardId);
              // keep local selected card updated
              setSelectedCard((prev) =>
                prev && prev.id === cardId
                  ? { ...prev, isRevealedToAll: true }
                  : prev
              );
            }}
          />
        </div>
      );
    }

    return (
      <div className="w-full flex flex-col h-full bg-zinc-900/90 border border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-2xl backdrop-blur-md">
        {/* Hand Header */}
        <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>ОСОБОВА КАРТКА</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
              Рука: <span className="text-emerald-400">{currentPlayer.name}</span>
            </h2>
          </div>

          <span className="text-xs text-zinc-400 font-mono">
            Відкрито: <b className="text-emerald-400">{revealedCount}</b> / {cards.length}
          </span>
        </div>

        {/* List of Parameter Plates */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => setSelectedCard(card)}
              className={`w-full p-3.5 sm:p-4 rounded-2xl border-2 flex items-center justify-between text-left transition-all active:scale-98 shadow-md cursor-pointer ${
                card.isRevealedToAll
                  ? "bg-zinc-950/80 border-emerald-500/50 hover:border-emerald-400"
                  : "bg-zinc-950/50 border-zinc-800/90 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                <div className="w-11 h-11 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xl shrink-0 shadow-inner">
                  {card.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-semibold tracking-wider text-zinc-400 uppercase">
                      {card.categoryName}
                    </span>
                    {card.isRevealedToAll && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-1.5 rounded-full">
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
                        <span>Приховано (натисніть для перегляду)</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="shrink-0 p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400">
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex-1 flex flex-col">
      {/* ================= MOBILE VIEW (<md): TABS & SWIPE ================= */}
      <div className="md:hidden flex flex-col flex-1">
        {/* Top Segmented Tab Switcher */}
        <div className="w-full flex items-center bg-zinc-950 border border-zinc-800 p-1 rounded-2xl mb-3 shadow-inner">
          <button
            onClick={() => setActiveTab("table")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === "table"
                ? "bg-zinc-800 text-emerald-400 border border-emerald-500/40 shadow-md"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Стіл гравців ({room.players.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("hand")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === "hand"
                ? "bg-zinc-800 text-amber-400 border border-amber-500/40 shadow-md"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Моя рука</span>
          </button>
        </div>

        {/* Swipe hint */}
        <div className="flex items-center justify-center gap-1 text-[11px] text-zinc-500 font-mono mb-2">
          <ArrowRightLeft className="w-3 h-3" />
          <span>Свайпайте вліво / вправо для перемикання</span>
        </div>

        {/* Touch Container */}
        <div
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          className="flex-1 flex flex-col"
        >
          {activeTab === "table" ? (
            <PlayersTable room={room} currentPlayer={currentPlayer} />
          ) : (
            renderHandContent()
          )}
        </div>
      </div>

      {/* ================= DESKTOP VIEW (>=md): TWO COLUMNS SIDE-BY-SIDE ================= */}
      <div className="hidden md:grid md:grid-cols-12 md:gap-6 flex-1 min-h-[85vh]">
        {/* Left Column: Стіл гравців */}
        <div className="md:col-span-5 lg:col-span-5 flex flex-col h-full">
          <PlayersTable room={room} currentPlayer={currentPlayer} />
        </div>

        {/* Right Column: Власна рука гравця (або вибрана картка) */}
        <div className="md:col-span-7 lg:col-span-7 flex flex-col h-full">
          {renderHandContent()}
        </div>
      </div>
    </div>
  );
}
