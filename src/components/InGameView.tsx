"use client";

import React, { useState } from "react";
import { GameRoom, Player, RpsChoice } from "@/types/game";
import { PlayerCharacterCard } from "@/data/characterData";
import { CatastropheColumn } from "./CatastropheColumn";
import { PlayersTable } from "./PlayersTable";
import { KickColumn } from "./KickColumn";
import { KickModal } from "./KickModal";
import { RpsDuelModal } from "./RpsDuelModal";
import { CardViewScreen } from "./CardViewScreen";
import { 
  Users, 
  Layers, 
  ChevronRight, 
  Lock, 
  Flame, 
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
  onMakeRpsChoice: (choice: RpsChoice) => void;
}

type TabType = "catastrophe" | "table" | "hand" | "kick";

export function InGameView({
  room,
  currentPlayer,
  onRevealCardToAll,
  onLeaveRoom,
  onCastVote,
  onDismissExpelled,
  onMakeRpsChoice,
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
      <div className="w-full flex flex-col h-full bg-zinc-900/90 border border-zinc-800 rounded-3xl p-4 xl:p-5 shadow-2xl backdrop-blur-md overflow-hidden">
        {/* Hand Header */}
        <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-zinc-800 shrink-0">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>ОСОБОВА КАРТКА</span>
            </div>
            <h2 className="text-sm xl:text-base font-black text-white tracking-tight truncate">
              Рука: <span className="text-emerald-400">{currentPlayer.name}</span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] xl:text-xs text-zinc-400 font-mono shrink-0">
              Відкрито: <b className="text-emerald-400">{revealedCount}</b> / {cards.length}
            </span>
          </div>
        </div>

        {/* List of Parameter Plates with responsive flex grid */}
        <div className="flex-1 overflow-y-auto pr-1.5 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2 gap-2">
            {cards.map((card) => (
              <button
                key={card.id}
                onClick={() => setSelectedCard(card)}
                className={`w-full p-3 xl:p-3.5 rounded-2xl border-2 flex items-center justify-between text-left transition-all active:scale-98 shadow-md cursor-pointer ${
                  card.isRevealedToAll
                    ? "bg-zinc-950/80 border-emerald-500/50 hover:border-emerald-400"
                    : "bg-zinc-950/50 border-zinc-800/90 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center gap-2.5 xl:gap-3 flex-1 min-w-0 pr-2">
                  <div className="w-10 h-10 xl:w-11 xl:h-11 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-lg xl:text-xl shrink-0 shadow-inner">
                    {card.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] xl:text-xs font-mono font-semibold tracking-wider text-zinc-400 uppercase truncate">
                        {card.categoryName}
                      </span>
                      {card.isRevealedToAll && (
                        <span className="text-[9px] xl:text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-1.5 py-0.2 rounded-full">
                          ВІДКРИТО
                        </span>
                      )}
                    </div>

                    <div className="mt-0.5">
                      {card.isRevealedToAll ? (
                        <p className="text-xs xl:text-sm font-bold text-white truncate">
                          {card.value}
                        </p>
                      ) : (
                        <p className="text-[11px] xl:text-xs font-medium text-zinc-500 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-zinc-600 shrink-0" />
                          <span className="truncate">Приховано</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 p-1 xl:p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400">
                  <ChevronRight className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex-1 flex flex-col">
      {/* ================= 1. MOBILE VIEW (<md, <768px): 4 TABS ================= */}
      <div className="md:hidden flex flex-col flex-1">
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
              onLeaveRoom={onLeaveRoom}
            />
          )}
        </div>
      </div>

      {/* ================= 2. TABLET VIEW (md to <lg, 768px-1023px): 2x2 GRID ================= */}
      <div className="hidden md:grid lg:hidden md:grid-cols-2 md:gap-3.5 flex-1 w-full min-h-[85vh]">
        {/* Row 1, Col 1: Catastrophe */}
        <div className="h-[46vh] min-h-[380px] flex flex-col min-h-0">
          <CatastropheColumn catastrophe={room.catastrophe} />
        </div>

        {/* Row 1, Col 2: Bunker Table */}
        <div className="h-[46vh] min-h-[380px] flex flex-col min-h-0">
          <PlayersTable room={room} currentPlayer={currentPlayer} />
        </div>

        {/* Row 2, Col 1: Hand */}
        <div className="h-[46vh] min-h-[380px] flex flex-col min-h-0">
          {renderHandContent()}
        </div>

        {/* Row 2, Col 2: Kick & Leave */}
        <div className="h-[46vh] min-h-[380px] flex flex-col min-h-0">
          <KickColumn
            room={room}
            currentPlayer={currentPlayer}
            onKickClick={() => setIsKickModalOpen(true)}
            onLeaveRoom={onLeaveRoom}
          />
        </div>
      </div>

      {/* ================= 3. LAPTOP & DESKTOP VIEW (>=lg, 1024px+): 4 COLUMNS 100% WIDTH ================= */}
      <div className="hidden lg:grid lg:grid-cols-12 lg:gap-3 xl:gap-4 flex-1 w-full min-h-[700px] lg:h-[calc(100vh-2rem)]">
        {/* 1. Catastrophe: 3 / 12 cols (25%) */}
        <div className="lg:col-span-3 flex flex-col h-full min-h-0">
          <CatastropheColumn catastrophe={room.catastrophe} />
        </div>

        {/* 2. Bunker Table: 4 / 12 cols (33.3%) */}
        <div className="lg:col-span-4 flex flex-col h-full min-h-0">
          <PlayersTable room={room} currentPlayer={currentPlayer} />
        </div>

        {/* 3. Player Hand: 3 / 12 cols (25%) */}
        <div className="lg:col-span-3 flex flex-col h-full min-h-0">
          {renderHandContent()}
        </div>

        {/* 4. Kick & Leave: 2 / 12 cols (16.7%) */}
        <div className="lg:col-span-2 flex flex-col h-full min-h-0">
          <KickColumn
            room={room}
            currentPlayer={currentPlayer}
            onKickClick={() => setIsKickModalOpen(true)}
            onLeaveRoom={onLeaveRoom}
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

      {/* Rock Paper Scissors Duel Modal on Tied Votes */}
      {room.rpsDuel && (
        <RpsDuelModal
          duel={room.rpsDuel}
          currentPlayer={currentPlayer}
          onMakeChoice={onMakeRpsChoice}
        />
      )}

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

            <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
              {room.lastExpelledName}
            </h3>

            <p className="text-xs sm:text-sm text-zinc-300 mb-5 leading-relaxed">
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
