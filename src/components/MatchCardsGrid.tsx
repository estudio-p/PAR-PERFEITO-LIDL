import React from 'react';
import { GameCard } from '../types';
import { Sparkles, CheckCircle2, Gift, TreePine } from 'lucide-react';

interface MatchCardsGridProps {
  cards: GameCard[];
  onCardClick: (card: GameCard) => void;
  isProcessingTurn: boolean;
  matchedPairsCount: number;
  totalPairs: number;
}

export const MatchCardsGrid: React.FC<MatchCardsGridProps> = ({
  cards,
  onCardClick,
  isProcessingTurn,
  matchedPairsCount,
  totalPairs,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-1 sm:py-2 flex flex-col items-center">
      {/* Top Status Strip */}
      <div className="w-full flex items-center justify-between gap-1 mb-2.5 px-1">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-900/10 border border-red-800/20 text-[11px] sm:text-xs font-bold text-red-900">
          <Gift size={13} className="text-red-700 shrink-0" />
          <span>Pares de Natal: {matchedPairsCount} de {totalPairs}</span>
        </div>

        <div className="text-[10px] sm:text-xs font-semibold text-stone-600 flex items-center gap-1">
          <TreePine size={13} className="text-emerald-700 shrink-0" />
          <span>Liga os produtos à magia da Consoada</span>
        </div>
      </div>

      {/* Responsive 12-Card Grid (3 columns on mobile, 4 columns on tablet & desktop) */}
      <div
        id="cards-grid"
        className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3.5 w-full max-w-3xl"
      >
        {cards.map((card) => {
          const isDeluxe = card.range === 'deluxe';
          const isFavorina = card.range === 'favorina';
          const isMadeira = card.range === 'madeira';
          const isQuebraNozes = card.range === 'quebranozes';

          // Visual front card styling based on range
          let frontBgStyle = 'bg-gradient-to-b from-stone-50 via-white to-stone-100 border-stone-300 text-stone-900';
          let roleBadgeStyle = 'bg-stone-800 text-stone-100';

          if (isDeluxe) {
            frontBgStyle = 'bg-gradient-to-b from-zinc-950 via-stone-900 to-black border-amber-500/60 text-amber-100';
            roleBadgeStyle = 'bg-amber-500/90 text-zinc-950 font-black';
          } else if (isFavorina) {
            frontBgStyle = 'bg-gradient-to-b from-red-950 via-rose-950 to-red-900 border-rose-400/50 text-rose-50';
            roleBadgeStyle = 'bg-rose-600 text-white font-bold';
          } else if (isMadeira) {
            frontBgStyle = 'bg-gradient-to-b from-amber-50/90 via-stone-50 to-orange-50/80 border-amber-300 text-amber-950';
            roleBadgeStyle = 'bg-amber-700 text-amber-50 font-bold';
          } else if (isQuebraNozes) {
            frontBgStyle = 'bg-gradient-to-b from-red-900 via-rose-900 to-zinc-900 border-amber-400 text-white';
            roleBadgeStyle = 'bg-amber-400 text-zinc-950 font-black';
          }

          if (card.isMatched) {
            frontBgStyle = 'bg-gradient-to-b from-amber-50 via-white to-amber-100/90 border-amber-500 text-amber-950 ring-2 ring-amber-400/50 animate-goldPulse';
            roleBadgeStyle = 'bg-amber-600 text-white font-black';
          }

          return (
            <div
              key={card.id}
              className="perspective-1000 w-full aspect-[3/4.2] sm:aspect-[3.5/4.5] min-h-[118px] sm:min-h-[145px]"
            >
              <button
                type="button"
                id={`card-${card.id}`}
                disabled={card.isMatched || card.isFlipped || isProcessingTurn}
                onClick={() => onCardClick(card)}
                aria-label={`${card.categoryLabel}: ${card.title}`}
                className={`w-full h-full relative transform-style-3d transition-transform duration-500 rounded-xl sm:rounded-2xl cursor-pointer select-none focus:outline-hidden focus:ring-2 focus:ring-amber-500/50 ${
                  card.isFlipped || card.isMatched ? 'rotate-y-180' : ''
                } ${
                  card.isMatched
                    ? 'cursor-default'
                    : 'hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {/* BACK OF CARD (Hidden state, Facing Player Initially) */}
                <div
                  className="absolute inset-0 backface-hidden rounded-xl sm:rounded-2xl p-2 sm:p-3 flex flex-col items-center justify-between bg-gradient-to-br from-red-950 via-zinc-950 to-red-900 border sm:border-2 border-amber-400/50 shadow-md text-amber-100/90 overflow-hidden"
                >
                  {/* Subtle Christmas Shimmer & Snowflakes pattern */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-400/20 via-transparent to-black/50 pointer-events-none" />

                  {/* Corner Accent */}
                  <div className="w-full flex justify-between items-center text-[8px] sm:text-[9px] font-mono tracking-widest text-amber-300/80 uppercase">
                    <span>LIDL</span>
                    <span>NATAL</span>
                  </div>

                  {/* Center Emblem: Nutcracker & Christmas Seal */}
                  <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-900 to-amber-950 border border-amber-400/50 flex flex-col items-center justify-center shadow-inner my-auto">
                    <span className="text-base sm:text-xl filter drop-shadow-sm select-none">
                      💂
                    </span>
                  </div>

                  {/* Bottom Text Prompt */}
                  <div className="text-[9px] sm:text-[10px] font-extrabold tracking-wider text-amber-200/90 uppercase flex items-center gap-1">
                    <span>Par Perfeito</span>
                  </div>
                </div>

                {/* FRONT OF CARD (Revealed State, Rotated 180deg) */}
                <div
                  className={`absolute inset-0 backface-hidden rotate-y-180 rounded-xl sm:rounded-2xl p-2 sm:p-3 flex flex-col justify-between items-center text-center shadow-md transition-all duration-300 overflow-hidden border sm:border-2 ${frontBgStyle}`}
                >
                  {/* Top Role Indicator Badge */}
                  <div className="w-full flex items-center justify-between gap-0.5 px-0.5">
                    <span
                      className={`text-[8px] sm:text-[9px] uppercase tracking-tight px-1.5 py-0.5 rounded leading-none truncate whitespace-nowrap max-w-[80%] ${roleBadgeStyle}`}
                    >
                      {card.isMatched ? 'Par Perfeito' : card.categoryLabel}
                    </span>

                    {card.isMatched ? (
                      <CheckCircle2 size={13} className="text-amber-500 shrink-0" />
                    ) : (
                      <Sparkles size={11} className="text-amber-400/90 shrink-0" />
                    )}
                  </div>

                  {/* Icon Representation */}
                  <div className="my-auto flex flex-col items-center">
                    <span className="text-2xl sm:text-3xl filter drop-shadow-sm leading-none select-none">
                      {card.icon}
                    </span>
                  </div>

                  {/* Card Title */}
                  <div className="w-full px-0.5">
                    <p
                      className={`text-[10px] sm:text-xs font-black tracking-tight leading-snug break-words hyphens-auto ${
                        card.isMatched
                          ? 'text-amber-950 font-black'
                          : isDeluxe
                          ? 'text-amber-100'
                          : isFavorina
                          ? 'text-rose-50'
                          : isMadeira
                          ? 'text-amber-950'
                          : 'text-white'
                      }`}
                    >
                      {card.title}
                    </p>
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
