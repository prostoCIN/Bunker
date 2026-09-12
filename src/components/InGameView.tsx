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
  Flame, 
  UserX,
  Skull,
  Zap,
  X
} from "lucide-react";

interface InGameViewProps {
  room: GameRoom;
  currentPlayer: Player;
  onRevealCardToAll: (cardId: string) => void;
  onLeaveRoom: () => void;
  onCastVote: (targetPlayerId: string) => void;
  onDismissExpelled: () => void;
  onMakeRpsChoice: (choice: RpsChoice) => void;
  onApplySpecialAction?: (
    cardId: string,
    targetPlayerId?: string
  ) => Promise<{ peekedCard?: PlayerCharacterCard } | void>;
  onDismissActionMessage?: () => void;
  onEndTurn?: () => void;
  onSkipTurn?: () => void;
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
  onApplySpecialAction,
  onDismissActionMessage,
  onEndTurn,
  onSkipTurn,
}: InGameViewProps) {
  // Mobile active tab: "catastrophe" | "table" | "hand" | "kick"
  const [activeTab, setActiveTab] = useState<TabType>("hand");
  const [selectedCard, setSelectedCard] = useState<PlayerCharacterCard | null>(null);
  const [isKickModalOpen, setIsKickModalOpen] = useState(false);

  const currentTurnPlayer = room.players.find(
    (p) => p.id === room.currentTurnPlayerId
  );
  const isMyTurn = currentPlayer.id === room.currentTurnPlayerId;
  const isVotingPhase = room.turnPhase === "voting";

  const cards = currentPlayer.cards || [];
  const revealedCount = cards.filter((c) => c.isRevealedToAll).length;

  // Hand parameter plates component
  const renderHandContent = () => {
    if (selectedCard) {
      return (
        <div className="w-full h-full flex flex-col min-h-0 overflow-hidden">
          <CardViewScreen
            card={selectedCard}
            room={room}
            currentPlayer={currentPlayer}
            onBack={() => setSelectedCard(null)}
            onRevealToAll={(cardId) => {
              onRevealCardToAll(cardId);
              setSelectedCard((prev) =>
                prev && prev.id === cardId
                  ? { ...prev, isRevealedToAll: true }
                  : prev
              );
            }}
            onApplySpecialAction={async (cardId, targetPlayerId) => {
              if (onApplySpecialAction) {
                const res = await onApplySpecialAction(cardId, targetPlayerId);
                setSelectedCard((prev) =>
                  prev && prev.id === cardId
                    ? { ...prev, isRevealedToAll: true, isUsed: true }
                    : prev
                );
                return res;
              }
            }}
          />
        </div>
      );
    }

    return (
      <div className="w-full flex flex-col h-full bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-5 xl:p-6 shadow-xl backdrop-blur-md overflow-hidden min-h-0">
        {/* Hand Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800/60 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300">
              #{currentPlayer.playerNumber ?? 1}
            </span>
            <h2 className="text-base font-bold text-white tracking-wide">
              {currentPlayer.name}
            </h2>
            {isMyTurn && !isVotingPhase && (
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-md animate-pulse">
                🎯 Ваш хід
              </span>
            )}
          </div>

          <span className="text-[11px] font-mono tracking-wider text-zinc-400 bg-zinc-800/60 px-2.5 py-0.5 rounded-full">
            {revealedCount} / {cards.length} відкрито
          </span>
        </div>

        {/* List of Parameter Plates with clean flex grid */}
        <div className="flex-1 overflow-y-auto pr-1.5 custom-scrollbar min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2 gap-2.5">
            {cards.map((card) => (
              <button
                key={card.id}
                onClick={() => setSelectedCard(card)}
                className={`w-full p-4 rounded-2xl border transition-all active:scale-98 cursor-pointer flex items-center justify-between text-left ${
                  card.isRevealedToAll
                    ? "bg-zinc-950/60 border-emerald-500/30 hover:border-emerald-500/50"
                    : "bg-zinc-950/40 border-zinc-800/50 hover:border-zinc-700/60"
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0 pr-2">
                  <span className="text-xl xl:text-2xl shrink-0 opacity-80">
                    {card.icon}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 truncate">
                        {card.categoryName}
                      </span>
                      {card.isRevealedToAll && (
                        <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                          відкрито
                        </span>
                      )}
                    </div>

                    <div className="mt-0.5">
                      {card.isRevealedToAll ? (
                        <p className="text-sm font-semibold text-white truncate">
                          {card.value}
                        </p>
                      ) : (
                        <p className="text-xs text-zinc-500 truncate font-normal">
                          Приховано
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-zinc-600 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex-1 flex flex-col h-full min-h-0 overflow-hidden">
      {/* ================= 1. MOBILE VIEW (<md, <768px): 4 TABS ================= */}
      <div className="md:hidden flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Top 4-Segment Switcher */}
        <div className="w-full grid grid-cols-4 bg-zinc-950/80 border border-zinc-800/60 p-1 rounded-2xl mb-2.5 shadow-inner gap-1 text-center shrink-0">
          <button
            onClick={() => setActiveTab("catastrophe")}
            className={`py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === "catastrophe"
                ? "bg-zinc-800 text-white font-bold shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span className="truncate">Подія</span>
          </button>

          <button
            onClick={() => setActiveTab("table")}
            className={`py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === "table"
                ? "bg-zinc-800 text-white font-bold shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span className="truncate">Стіл</span>
          </button>

          <button
            onClick={() => setActiveTab("hand")}
            className={`py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === "hand"
                ? "bg-zinc-800 text-white font-bold shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="truncate">Рука</span>
          </button>

          <button
            onClick={() => setActiveTab("kick")}
            className={`py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === "kick"
                ? "bg-zinc-800 text-white font-bold shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <UserX className="w-3.5 h-3.5" />
            <span className="truncate">Вигнати</span>
          </button>
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
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
              onSkipTurn={onSkipTurn}
              onEndTurn={onEndTurn}
            />
          )}
        </div>
      </div>

      {/* ================= 2. TABLET VIEW (md to <lg, 768px-1023px): 2x2 GRID ================= */}
      <div className="hidden md:grid lg:hidden md:grid-cols-2 md:grid-rows-2 md:gap-3 flex-1 w-full min-h-0 h-full overflow-hidden">
        <div className="h-full min-h-0 flex flex-col overflow-hidden">
          <CatastropheColumn catastrophe={room.catastrophe} />
        </div>
        <div className="h-full min-h-0 flex flex-col overflow-hidden">
          <PlayersTable room={room} currentPlayer={currentPlayer} />
        </div>
        <div className="h-full min-h-0 flex flex-col overflow-hidden">
          {renderHandContent()}
        </div>
        <div className="h-full min-h-0 flex flex-col overflow-hidden">
          <KickColumn
            room={room}
            currentPlayer={currentPlayer}
            onKickClick={() => setIsKickModalOpen(true)}
            onLeaveRoom={onLeaveRoom}
            onSkipTurn={onSkipTurn}
            onEndTurn={onEndTurn}
          />
        </div>
      </div>

      {/* ================= 3. LAPTOP & DESKTOP VIEW (>=lg, 1024px+): 4 COLUMNS 100% WIDTH ================= */}
      <div className="hidden lg:grid lg:grid-cols-12 lg:gap-4 flex-1 w-full min-h-0 h-full overflow-hidden">
        <div className="lg:col-span-3 flex flex-col h-full min-h-0 overflow-hidden">
          <CatastropheColumn catastrophe={room.catastrophe} />
        </div>
        <div className="lg:col-span-4 flex flex-col h-full min-h-0 overflow-hidden">
          <PlayersTable room={room} currentPlayer={currentPlayer} />
        </div>
        <div className="lg:col-span-3 flex flex-col h-full min-h-0 overflow-hidden">
          {renderHandContent()}
        </div>
        <div className="lg:col-span-2 flex flex-col h-full min-h-0 overflow-hidden">
          <KickColumn
            room={room}
            currentPlayer={currentPlayer}
            onKickClick={() => setIsKickModalOpen(true)}
            onLeaveRoom={onLeaveRoom}
            onSkipTurn={onSkipTurn}
            onEndTurn={onEndTurn}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-center shadow-2xl relative">
            <h3 className="text-xl font-bold text-white mb-2">
              {room.lastExpelledName}
            </h3>

            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
              Більшість проголосувала проти цього кандидата. Гравець залишається за межами бункера.
            </p>

            <button
              onClick={onDismissExpelled}
              className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition-all active:scale-98 cursor-pointer"
            >
              Продовжити гру
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
