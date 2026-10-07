import React from 'react';
import { Volume2, VolumeX, Clock, Sparkles } from 'lucide-react';
import { EstudioPLogo } from './EstudioPLogo';
import { GoogleAuthButton } from './GoogleAuthButton';
import { User } from 'firebase/auth';

interface HeaderProps {
  elapsedSeconds: number;
  attempts: number;
  isGamePlaying: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  currentUser: User | null;
  clientLogoSrc?: string;
  clientLogoAlt?: string;
  showAdminMetrics?: boolean;
  onOpenMetrics?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  elapsedSeconds,
  attempts,
  isMuted,
  onToggleMute,
  currentUser,
  clientLogoSrc = '/lidl-logo.svg',
  clientLogoAlt = 'LIDL Portugal - Natal',
}) => {
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b border-red-900/15 sticky top-0 z-30 transition-all shadow-xs">
      {/* Topmost Brand & Sponsor Banner in Lidl Christmas Red / Deluxe Black */}
      <div className="bg-gradient-to-r from-red-950 via-zinc-950 to-red-950 border-b border-amber-500/20 py-1.5 px-3 sm:px-4 text-xs text-amber-100">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          {/* Client Sponsor: Lidl Official Logo + Natal Lidl Branding */}
          <div className="flex items-center gap-2 shrink min-w-0">
            <span className="text-[10px] font-bold tracking-wider text-amber-300 uppercase shrink-0 flex items-center gap-1">
              <Sparkles size={11} className="text-amber-400" />
              Especial Natal
            </span>
            <div
              id="client-sponsor-container"
              className="inline-flex items-center h-6 sm:h-7 px-1.5 py-0.5 rounded-md bg-white border border-amber-400/40 shadow-xs shrink-0"
              title="LIDL Portugal - Mais para si"
            >
              <img
                id="client-logo-img"
                src={clientLogoSrc}
                alt={clientLogoAlt}
                className="h-4 sm:h-5 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="hidden sm:inline text-[11px] text-amber-200/90 font-medium">
              Deluxe &bull; Favorina
            </span>
          </div>

          {/* RGPD Compliance Badge & Google Account */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="hidden md:inline-block text-[10px] text-amber-200/80 font-medium bg-red-900/60 px-2 py-0.5 rounded-full border border-amber-500/30">
              RGPD Compliance
            </span>
            <GoogleAuthButton user={currentUser} />
          </div>
        </div>
      </div>

      {/* Main App Bar: Title and Counters */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-2">
        {/* Game Title and Estúdio P Identity */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
          <div
            id="estudiop-logo-container"
            className="flex items-center shrink-0 pr-2 border-r border-stone-200"
            title="Estúdio P - Branded Content"
          >
            <EstudioPLogo className="h-5 sm:h-6 w-auto max-w-[65px] sm:max-w-none" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-lg font-black text-stone-900 tracking-tight whitespace-nowrap leading-none">
                <span className="bg-gradient-to-r from-red-800 via-rose-700 to-amber-700 bg-clip-text text-transparent">
                  Par Perfeito LIDL
                </span>
              </h1>
              <span className="text-[10px] bg-red-100 text-red-900 font-extrabold px-1.5 py-0.2 rounded border border-red-200 shrink-0">
                Natal
              </span>
            </div>
            <p className="text-[10px] text-stone-500 font-medium truncate hidden sm:block mt-0.5">
              Descobre as combinações Deluxe, Favorina e Brinquedos de Madeira
            </p>
          </div>
        </div>

        {/* Live Counters & Controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Elapsed Timer Counter */}
          <div
            id="timer-container"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-red-200 bg-red-50/90 shadow-2xs shrink-0"
            title={`Tempo decorrido: ${elapsedSeconds}s`}
          >
            <Clock size={12} className="text-red-700 shrink-0" />
            <span className="text-[11px] font-mono font-black text-red-950 leading-none">
              {formatTime(elapsedSeconds)}
            </span>
          </div>

          {/* Attempts Counter */}
          <div
            id="attempts-container"
            className="flex items-center px-2.5 py-1 rounded-full border border-stone-200 bg-stone-50 shadow-2xs shrink-0"
            title={`Tentativas efetuadas: ${attempts}`}
          >
            <span className="text-[11px] font-mono font-black text-stone-900 leading-none">
              {attempts} tent.
            </span>
          </div>

          {/* Sound Mute/Unmute */}
          <button
            id="sound-toggle-btn"
            onClick={onToggleMute}
            title={isMuted ? 'Ativar Som' : 'Desativar Som'}
            className="p-1.5 text-stone-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200 shrink-0 cursor-pointer"
            aria-label={isMuted ? 'Ativar Som' : 'Desativar Som'}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
};
