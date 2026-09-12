"use client";

import React, { useState } from "react";
import { GameRoom, Player } from "@/types/game";
import { PlayerCharacterCard } from "@/data/characterData";
import { CatastropheColumn } from "./CatastropheColumn";
import { PlayersTable } from "./PlayersTable";
import { KickColumn } from "./KickColumn";
import { KickModal } from "./KickModal";
import { CardViewScreen } from "./CardViewScreen";
import { 
  Users, 
  Layers, 
  ChevronRight, 
  Lock, 
  Flame, 
  LogOut,
  UserX,
  Skull
} from "lucide-react";

interface InGameViewProps {
  room: GameRoom;
  currentPlayer: Player;
  onRevealCardToAll: (cardId: string) => void;
  onLeaveRoom: () => void;
  onCastVote: (targetPlayerId: string) => void;
  onDismissExpelled: () => void;
}

type TabType = "catastrophe" | "table" | "hand" | "kick";

export function InGameView({
  room,
  currentPlayer,
  onRevealCardToAll,
  onLeaveRoom,
  onCastVote,
  onDismissExpelled,
}: InGameViewProps) {
  // Mobile active tab: "catastrophe" | "table" | "hand" | "kick"
  const [activeTab, setActiveTab] = useState<TabType>("hand");
  const [selectedCard, setSelectedCard] = useState<PlayerCharacterCard | null>(null);
  const [isKickModalOpen, setIsKickModalOpen] = useState(false);

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

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-mono">
              Відкрито: <b className="text-emerald-400">{revealedCount}</b> / {cards.length}
            </span>
            <button
              onClick={onLeaveRoom}
              title="Покинути бункер"
              className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-red-400 active:scale-95 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
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
      {/* ================= MOBILE VIEW (<lg): 4 TABS & SWIPE ================= */}
      <div className="lg:hidden flex flex-col flex-1">
        {/* Top 4-Segment Switcher */}
        <div className="w-full grid grid-cols-4 bg-zinc-950 border border-zinc-800 p-1 rounded-2xl mb-3 shadow-inner gap-1 text-center">
          <button
            onClick={() => setActiveTab("catastrophe")}
            className={`py-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === "catastrophe"
                ? "bg-zinc-800 text-amber-400 border border-amber-500/40 shadow-md"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="truncate">Подія</span>
          </button>

          <button
            onClick={() => setActiveTab("table")}
            className={`py-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === "table"
                ? "bg-zinc-800 text-emerald-400 border border-emerald-500/40 shadow-md"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate">Стіл ({room.players.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("hand")}
            className={`py-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === "hand"
                ? "bg-zinc-800 text-emerald-400 border border-emerald-500/40 shadow-md"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate">Рука</span>
          </button>

          <button
            onClick={() => setActiveTab("kick")}
            className={`py-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === "kick"
                ? "bg-red-950/80 text-red-400 border border-red-500/60 shadow-md"
                : "text-zinc-400 hover:text-red-400"
            }`}
          >
            <UserX className="w-3.5 h-3.5 text-red-400" />
            <span className="truncate">Вигнати</span>
          </button>
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 flex flex-col">
          {activeTab === "catastrophe" && (
            <CatastropheColumn catastrophe={room.catastrophe} />
          )}
          {activeTab === "table" && (
            <PlayersTable room={room} currentPlayer={currentPlayer} />
          )}
          {activeTab === "hand" && renderHandContent()}
          {activeTab === "kick" && (
            <KickColumn
              room={room}
              currentPlayer={currentPlayer}
              onKickClick={() => setIsKickModalOpen(true)}
            />
          )}
        </div>
      </div>

      {/* ================= DESKTOP VIEW (>=lg): 4 COLUMNS FROM LEFT TO RIGHT ================= */}
      <div className="hidden lg:grid lg:grid-cols-12 lg:gap-4 flex-1 min-h-[85vh]">
        {/* 1. Найлівіша колонка: Вся інформація про катастрофу */}
        <div className="lg:col-span-3 flex flex-col h-full">
          <CatastropheColumn catastrophe={room.catastrophe} />
        </div>

        {/* 2. Друга колонка: Стіл бункера */}
        <div className="lg:col-span-4 flex flex-col h-full">
          <PlayersTable room={room} currentPlayer={currentPlayer} />
        </div>

        {/* 3. Третя колонка: Власна рука гравця (або вибрана картка) */}
        <div className="lg:col-span-3 flex flex-col h-full">
          {renderHandContent()}
        </div>

        {/* 4. Найправіша колонка: Кнопка "вигнати з черги до бункера" */}
        <div className="lg:col-span-2 flex flex-col h-full">
          <KickColumn
            room={room}
            currentPlayer={currentPlayer}
            onKickClick={() => setIsKickModalOpen(true)}
          />
        </div>
      </div>

      {/* Modal for casting vote */}
      <KickModal
        isOpen={isKickModalOpen}
        onClose={() => setIsKickModalOpen(false)}
        room={room}
        currentPlayer={currentPlayer}
        onCastVote={onCastVote}
      />

      {/* Announcement Modal: When voting concludes and player is expelled */}
      {room.lastExpelledName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-zinc-900 border-2 border-red-600 rounded-3xl p-6 text-center shadow-2xl relative">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-950/80 border-2 border-red-500 flex items-center justify-center text-red-400 mb-4 shadow-inner">
              <Skull className="w-8 h-8 text-red-400 animate-bounce" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950 border border-red-600 text-red-400 text-xs font-mono font-bold uppercase mb-2">
              РЕЗУЛЬТАТИ ГОЛОСУВАННЯ
            </div>

            <h3 className="text-2xl font-black text-white mb-2">
              {room.lastExpelledName}
            </h3>

            <p className="text-sm text-zinc-300 mb-5 leading-relaxed">
              Більшість проголосувала проти цього кандидата. Гравець залишається за межами бункера на поверхні!
            </p>

            <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-2.5 mb-5 text-xs text-zinc-400">
              ✓ Усі попередні голоси скинуто. Можна переходити до наступного раунду.
            </div>

            <button
              onClick={onDismissExpelled}
              className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl transition-all active:scale-98 cursor-pointer"
            >
              Зрозуміло (Продовжити гру)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
