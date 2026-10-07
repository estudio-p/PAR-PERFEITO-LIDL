import React from 'react';
import { Play, Sparkles, Gift, Heart, Award } from 'lucide-react';
import nutcrackerImg from '../assets/images/lidl_nutcracker_mascot_1790775845665.jpg';
import heroShowcaseImg from '../assets/images/lidl_christmas_hero_showcase_1790775859269.jpg';

interface StartScreenProps {
  onStartGame: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStartGame }) => {
  return (
    <div className="flex-1 flex flex-col justify-center items-center max-w-4xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-6 animate-fadeIn">
      {/* Main Feature Container Card */}
      <div
        id="start-screen-card"
        className="w-full bg-white/95 backdrop-blur-md rounded-3xl border border-red-900/15 shadow-xl overflow-hidden p-5 sm:p-8 relative"
      >
        {/* Subtle festive decorative corner accents */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-radial from-red-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-radial from-amber-500/10 via-transparent to-transparent pointer-events-none" />

        {/* Mascot Speech Intro Bar */}
        <div className="mb-5 p-3 rounded-2xl bg-gradient-to-r from-red-950 via-zinc-950 to-red-950 text-white flex items-center gap-3 border border-amber-500/30 shadow-sm">
          <img
            src={nutcrackerImg}
            alt="Mascote Quebra-Nozes Lidl"
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border-2 border-amber-400 shrink-0 shadow-xs"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-300">
                O Quebra-Nozes Lidl Apresenta
              </span>
              <span className="text-[9px] bg-red-800 text-amber-100 px-1.5 py-0.2 rounded font-bold">
                Mascote Oficial
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-200 font-medium leading-snug truncate sm:whitespace-normal">
              «Bem-vindo à ceia de Natal mais mágica de sempre! Aceitas o desafio de encontrar os pares perfeitos?»
            </p>
          </div>
        </div>

        {/* Responsive Grid: Narrative & Visual Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">
          {/* Left Column: Game Title & Editorial Storytelling */}
          <div className="md:col-span-7 space-y-4 text-left">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 uppercase tracking-widest mb-1">
                <Sparkles size={13} className="text-amber-600" />
                Edição Especial de Natal
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-900 tracking-tight leading-tight">
                <span className="bg-gradient-to-r from-red-900 via-rose-800 to-amber-700 bg-clip-text text-transparent">
                  Par Perfeito LIDL
                </span>
              </h2>
            </div>

            {/* Thematic Storytelling Text */}
            <p className="text-sm text-stone-600 leading-relaxed font-normal">
              No Natal o LIDL traz à mesa a excelência gastronómica da gama <strong>Deluxe</strong>, a doçura tradicional da gama <strong>Favorina</strong> e a nostalgia inesquecível dos <strong>Brinquedos de Madeira</strong>.
            </p>
            <p className="text-sm text-stone-600 leading-relaxed font-normal">
              Vira as cartas, põe à prova a tua memória e encontra as combinações lógicas que unem cada produto à magia da Consoada.
            </p>

            {/* Key Ranges Showcase Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              {/* Deluxe Range Pill */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-900 text-amber-100 border border-amber-400/30 text-xs shadow-2xs">
                <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                  <Award size={13} />
                </div>
                <div className="min-w-0">
                  <span className="font-bold block text-white text-[11px] leading-tight">Gama Deluxe</span>
                  <span className="text-[10px] text-amber-300/80 truncate block">Gourmet & Requinte</span>
                </div>
              </div>

              {/* Favorina Range Pill */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-900 text-rose-100 border border-red-700/50 text-xs shadow-2xs">
                <div className="w-6 h-6 rounded-lg bg-red-800 text-rose-200 flex items-center justify-center shrink-0">
                  <Heart size={13} />
                </div>
                <div className="min-w-0">
                  <span className="font-bold block text-white text-[11px] leading-tight">Favorina</span>
                  <span className="text-[10px] text-rose-200/90 truncate block">Doces de Natal</span>
                </div>
              </div>

              {/* Brinquedos de Madeira Pill */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 text-amber-950 border border-amber-300 text-xs shadow-2xs">
                <div className="w-6 h-6 rounded-lg bg-amber-200/80 text-amber-800 flex items-center justify-center shrink-0">
                  <Gift size={13} />
                </div>
                <div className="min-w-0">
                  <span className="font-bold block text-amber-950 text-[11px] leading-tight">Brinquedos</span>
                  <span className="text-[10px] text-amber-700 truncate block">Madeira & Magia</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-stone-400 italic pt-1">
              Dica: memoriza os sabores e brinquedos para bater o recorde com o menor número de cliques!
            </p>
          </div>

          {/* Right Column: Festive Showcase Visual */}
          <div className="md:col-span-5 flex justify-center items-center">
            <div
              id="christmas-showcase-preview"
              className="relative w-full max-w-[280px] sm:max-w-[320px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border-2 border-red-900/20 bg-zinc-950 group"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <img
                  src={heroShowcaseImg}
                  alt="Mesa de Natal LIDL com Quebra-Nozes, Deluxe, Favorina e Brinquedos de Madeira"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                {/* Bottom title overlay */}
                <div className="absolute bottom-3 left-3 right-3 text-center">
                  <span className="inline-block text-xs font-black text-amber-300 tracking-wide drop-shadow-md">
                    O Quebra-Nozes &bull; O Natal é no LIDL
                  </span>
                  <span className="block text-[10px] text-stone-200 font-medium">
                    12 Cartas &bull; 6 Pares Lógicos de Natal
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA Action Button */}
        <div className="mt-7 pt-5 border-t border-stone-100 flex flex-col items-center">
          <button
            id="start-game-btn"
            type="button"
            onClick={onStartGame}
            className="w-full sm:w-auto min-w-[280px] py-3.5 sm:py-4 px-8 bg-gradient-to-r from-red-700 via-rose-700 to-red-800 hover:from-red-800 hover:to-rose-800 active:scale-98 text-white font-black text-base sm:text-lg rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-red-800/25 border border-amber-400/40 cursor-pointer"
          >
            <Play size={20} className="fill-white" />
            <span>Começar o Desafio de Natal</span>
          </button>
          <span className="text-[11px] text-stone-400 mt-2 font-medium">
            Clica para virar as cartas e desvendar todos os pares natalícios
          </span>
        </div>
      </div>
    </div>
  );
};
