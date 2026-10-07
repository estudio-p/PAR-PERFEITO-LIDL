import React, { useState, useEffect, useCallback } from 'react';
import {
  Trophy,
  RotateCcw,
  CheckCircle2,
  Loader2,
  LogOut,
  Share2,
  Send,
  Copy,
  Check,
  Lock,
  Clock,
  Layers,
  Flame,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { LeaderboardEntry } from '../types';
import {
  getLeaderboardFromDB,
  saveScoreToDB,
  extractFirstAndLastName,
  calculateScore,
} from '../utils/storage';
import { trackEvent } from '../utils/metrics';
import { User, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider, db } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import nutcrackerImg from '../assets/images/lidl_nutcracker_mascot_1790775845665.jpg';

interface EndGameModalProps {
  timeSeconds: number; // Total seconds taken
  attempts: number; // Total clicks / attempts
  onPlayAgain: () => void;
  currentUser: User | null;
}

export const EndGameModal: React.FC<EndGameModalProps> = ({
  timeSeconds,
  attempts,
  onPlayAgain,
  currentUser,
}) => {
  const calculatedScore = calculateScore(timeSeconds, attempts);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [playerRank, setPlayerRank] = useState<number | null>(null);
  const [marketingConsent, setMarketingConsent] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const firstAndLastName = currentUser
    ? extractFirstAndLastName(currentUser.displayName)
    : 'Jogador de Natal';

  const shareText = `Descobri todos os pares de Natal no LIDL com o Quebra-Nozes em ${attempts} tentativas (${calculatedScore} pts)! #NatalLidl #Deluxe #Favorina #EstudioP`;

  // Load latest scores from DB
  useEffect(() => {
    let isMounted = true;
    getLeaderboardFromDB().then((entries) => {
      if (isMounted) {
        setLeaderboard(entries);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Save score strictly for Google user
  const submitScore = useCallback(
    async (googleUser: User) => {
      if (hasSubmitted || isSubmitting) return;
      setIsSubmitting(true);
      const cleanName = extractFirstAndLastName(googleUser.displayName || 'Jogador de Natal');

      try {
        const result = await saveScoreToDB(cleanName, timeSeconds, attempts, {
          userId: googleUser.uid,
          userEmail: googleUser.email || undefined,
          photoURL: googleUser.photoURL || undefined,
          rgpdConsentMarketing: marketingConsent,
        });

        setLeaderboard(result.entries);
        setPlayerRank(result.rank);
        setHasSubmitted(true);

        trackEvent('leaderboard_save', {
          playerName: cleanName,
          score: result.score,
          timeSeconds,
          attempts,
          rank: result.rank,
          isTop5: result.rank <= 5,
          userId: googleUser.uid,
          rgpdConsentMarketing: marketingConsent,
        });
      } catch (err) {
        console.error('Error saving score:', err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [attempts, hasSubmitted, isSubmitting, marketingConsent, timeSeconds]
  );

  // If already authenticated with Google, auto-save score
  useEffect(() => {
    if (currentUser && !hasSubmitted && !isSubmitting) {
      submitScore(currentUser);
    }
  }, [currentUser, hasSubmitted, isSubmitting, submitScore]);

  // Google sign in action
  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const signedUser = result.user;

      if (signedUser) {
        const fullName = extractFirstAndLastName(signedUser.displayName);
        // Persist consent and user profile in Firestore
        await setDoc(
          doc(db, 'users', signedUser.uid),
          {
            uid: signedUser.uid,
            displayName: signedUser.displayName,
            firstAndLastName: fullName,
            email: signedUser.email,
            photoURL: signedUser.photoURL,
            rgpdConsentEstudioP: true,
            rgpdConsentMarketing: marketingConsent,
            consentTimestamp: new Date().toISOString(),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );

        await submitScore(signedUser);
      }
    } catch (err: unknown) {
      console.error('Google Sign-In Error:', err);
      setLoginError(
        'Não foi possível concluir o início de sessão com o Google. Por favor tenta novamente.'
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setHasSubmitted(false);
      setPlayerRank(null);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // Social Share Handlers
  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Natal LIDL | Par Perfeito - Estúdio P',
          text: shareText,
          url: window.location.href,
        });
        trackEvent('social_share', { platform: 'web_share', attempts, timeSeconds });
      } catch {
        // user cancelled share
      }
    } else {
      handleCopyText();
    }
  };

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      `${shareText} ${window.location.href}`
    )}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    trackEvent('social_share', { platform: 'whatsapp', attempts, timeSeconds });
  };

  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText
    )}&url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    trackEvent('social_share', { platform: 'twitter_x', attempts, timeSeconds });
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(`${shareText} ${window.location.href}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
    trackEvent('social_share', { platform: 'clipboard_copy', attempts, timeSeconds });
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div
        id="endgame-modal"
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-red-900/20 overflow-hidden my-auto transition-all"
      >
        {/* Header Hero Banner (Festive Natal LIDL & Nutcracker) */}
        <div className="p-5 sm:p-6 text-center text-white relative bg-gradient-to-br from-red-950 via-zinc-950 to-red-900 overflow-hidden">
          {/* Subtle Golden Christmas Sparkle Background */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-400/20 via-transparent to-black/40 pointer-events-none" />

          {/* Nutcracker Mascot Avatar in Victory Ring */}
          <div className="relative inline-flex items-center justify-center mb-2">
            <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-lg ring-4 ring-amber-400/20">
              <img
                src={nutcrackerImg}
                alt="Quebra-Nozes LIDL"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-amber-500 text-zinc-950 shadow-md">
              <Trophy size={14} />
            </div>
          </div>

          <div className="relative">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 block mb-0.5">
              O Quebra-Nozes Celebra Contigo!
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Parabéns! Match de Natal Perfeito!
            </h2>
          </div>

          <p className="relative text-xs sm:text-sm text-stone-200 mt-1 max-w-sm mx-auto font-medium">
            Desvendaste todos os 6 pares das gamas <strong>Deluxe</strong>, <strong>Favorina</strong> e <strong>Brinquedos de Madeira</strong>.
          </p>

          {/* Key Metrics Strip */}
          <div className="relative mt-3.5 inline-flex items-center gap-3 sm:gap-4 bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-amber-400/30 text-xs font-mono">
            <div className="text-center">
              <span className="text-amber-200/80 block text-[9px] uppercase font-sans font-bold flex items-center justify-center gap-1">
                <Clock size={10} /> Tempo
              </span>
              <span className="text-white font-black text-xs sm:text-sm">
                {formatTime(timeSeconds)}
              </span>
            </div>
            <div className="w-px h-5 bg-amber-400/30" />
            <div className="text-center">
              <span className="text-amber-200/80 block text-[9px] uppercase font-sans font-bold flex items-center justify-center gap-1">
                <Layers size={10} /> Cliques
              </span>
              <span className="text-white font-black text-xs sm:text-sm">
                {attempts}
              </span>
            </div>
            <div className="w-px h-5 bg-amber-400/30" />
            <div className="text-center">
              <span className="text-amber-200/80 block text-[9px] uppercase font-sans font-bold flex items-center justify-center gap-1">
                <Flame size={10} className="text-amber-400" /> Score
              </span>
              <span className="text-amber-300 font-black text-xs sm:text-sm">
                {calculatedScore} pts
              </span>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[68vh] overflow-y-auto">
          {/* Section 1: Authentication Gating Block */}
          <div id="player-identification-block">
            {currentUser ? (
              /* Authenticated User Status - Verified & Registered */
              <div className="bg-red-50/70 border border-red-200 rounded-2xl p-3.5 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt={firstAndLastName}
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded-full border border-red-300 shrink-0 object-cover"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-red-800 text-white font-bold text-sm flex items-center justify-center shrink-0">
                        {firstAndLastName.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-stone-900 text-sm truncate">
                          {firstAndLastName}
                        </span>
                        <span className="text-[10px] bg-red-200 text-red-950 font-bold px-1.5 py-0.2 rounded border border-red-300 shrink-0">
                          Google Verificado
                        </span>
                      </div>
                      <span className="text-[11px] text-stone-500 truncate block">
                        {currentUser.email}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    title="Terminar Sessão"
                    className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0 cursor-pointer"
                  >
                    <LogOut size={14} />
                  </button>
                </div>

                <div className="pt-1.5 text-xs text-red-900 font-medium flex items-center gap-1.5 border-t border-red-200/60">
                  <CheckCircle2 size={15} className="text-red-700 shrink-0" />
                  <span>
                    {hasSubmitted ? (
                      <>
                        Gravado no Ranking com{' '}
                        <strong className="text-red-950 font-bold">
                          {calculatedScore} pts
                        </strong>
                        ! Posição conquistada:{' '}
                        <strong className="text-red-950 font-bold">
                          #{playerRank || 1}
                        </strong>
                        .
                      </>
                    ) : (
                      <span>A gravar pontuação no ranking oficial de Natal...</span>
                    )}
                  </span>
                </div>
              </div>
            ) : (
              /* Unauthenticated: Clean Google-Only Login Block */
              <div className="bg-stone-50 border border-stone-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
                <div className="text-center space-y-1">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-100 text-red-900 mb-1 border border-red-300">
                    <ShieldCheck size={20} />
                  </div>
                  <h4 className="text-sm font-black text-stone-900">
                    Certifica a tua pontuação de Natal
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed max-w-xs mx-auto">
                    Inicia sessão com a tua conta Google para gravar o teu resultado e desbloquear o acesso ao <strong>Leaderboard Oficial de Natal</strong>.
                  </p>
                </div>

                {/* Google Sign In CTA Button */}
                <button
                  type="button"
                  id="google-login-modal-btn"
                  onClick={handleGoogleLogin}
                  disabled={isLoggingIn}
                  className="w-full flex items-center justify-center gap-2.5 py-3 px-4 bg-white hover:bg-stone-100 active:scale-98 border-2 border-stone-300 hover:border-stone-400 rounded-xl font-bold text-xs sm:text-sm text-stone-800 shadow-xs transition-all cursor-pointer"
                >
                  {isLoggingIn ? (
                    <Loader2 className="w-4 h-4 text-red-700 animate-spin" />
                  ) : (
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span>Entrar com o Google</span>
                </button>

                {/* RGPD Consent Checkbox */}
                <label className="flex items-start gap-2 pt-1 cursor-pointer select-none text-[11px] text-stone-600">
                  <input
                    type="checkbox"
                    checked={marketingConsent}
                    onChange={(e) => setMarketingConsent(e.target.checked)}
                    className="mt-0.5 rounded border-stone-300 text-red-700 focus:ring-red-500"
                  />
                  <span>
                    Autorizo o tratamento de dados segundo o RGPD pelo Estúdio P para registo de pontuação no jogo de Natal LIDL.
                  </span>
                </label>

                {loginError && (
                  <p className="text-xs text-rose-600 font-medium text-center">
                    {loginError}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Gated Leaderboard */}
          {currentUser ? (
            /* Unlocked Official Leaderboard */
            <div className="space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                  <Trophy size={14} className="text-amber-600" />
                  <span>Leaderboard Oficial de Natal (Top 5)</span>
                </h4>
                <span className="text-[10px] text-stone-500 font-medium">
                  Classificação Oficial
                </span>
              </div>

              <div
                id="leaderboard-list"
                className="space-y-1.5 bg-stone-50 p-2 rounded-2xl border border-stone-200"
              >
                {leaderboard.slice(0, 5).map((entry, index) => {
                  const isCurrentPlayer =
                    (currentUser && entry.userId === currentUser.uid) ||
                    (hasSubmitted &&
                      entry.name.toLowerCase() === firstAndLastName.toLowerCase() &&
                      entry.score === calculatedScore);

                  const medalColor =
                    index === 0
                      ? 'bg-amber-400 text-amber-950 font-black shadow-2xs'
                      : index === 1
                      ? 'bg-stone-300 text-stone-800 font-bold'
                      : index === 2
                      ? 'bg-amber-700/60 text-white font-bold'
                      : 'bg-stone-200 text-stone-600 font-semibold';

                  return (
                    <div
                      key={entry.id || index}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                        isCurrentPlayer
                          ? 'bg-red-100/80 border border-red-300 font-bold text-red-950 shadow-2xs'
                          : 'bg-white border border-stone-200/80 text-stone-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${medalColor}`}
                        >
                          {index + 1}
                        </span>
                        <span className="font-bold text-stone-900 truncate max-w-[120px] sm:max-w-[180px]">
                          {entry.name}
                        </span>
                        {isCurrentPlayer && (
                          <span className="text-[9px] bg-red-700 text-white uppercase px-1.5 py-0.2 rounded font-bold shrink-0">
                            Tu
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className="text-stone-500 text-[10px] font-mono">
                          {entry.timeSeconds}s &bull; {entry.attempts} tent.
                        </span>
                        <span className="font-mono font-black text-red-900 text-xs">
                          {entry.score} pts
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Locked Leaderboard Teaser */
            <div
              id="locked-leaderboard-teaser"
              className="p-4 bg-stone-50/80 rounded-2xl border border-stone-200 text-center space-y-2"
            >
              <div className="w-9 h-9 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center mx-auto">
                <Lock size={16} />
              </div>
              <h4 className="text-xs font-black uppercase tracking-wider text-stone-700">
                Leaderboard Bloqueado
              </h4>
              <p className="text-[11px] text-stone-500 max-w-xs mx-auto">
                O ranking dos melhores tempos e a tua classificação no Natal LIDL só são revelados após iniciares sessão com a tua conta Google.
              </p>
            </div>
          )}

          {/* Section 3: Social Sharing Module */}
          <div
            id="social-share-module"
            className="p-3 bg-gradient-to-br from-red-50/60 to-amber-50/60 rounded-2xl border border-red-200/80 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-red-950 flex items-center gap-1.5">
                <Share2 size={13} className="text-red-700" />
                Partilhar Desafio de Natal
              </span>
              <span className="text-[10px] text-red-800 font-medium">
                #NatalLidl #EstudioP
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* WhatsApp Button */}
              <button
                type="button"
                id="share-whatsapp-btn"
                onClick={handleWhatsAppShare}
                className="flex items-center justify-center gap-1.5 py-2 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer"
                title="Partilhar no WhatsApp"
              >
                <Send size={12} />
                <span>WhatsApp</span>
              </button>

              {/* X / Twitter Button */}
              <button
                type="button"
                id="share-twitter-btn"
                onClick={handleTwitterShare}
                className="flex items-center justify-center gap-1.5 py-2 px-2 bg-zinc-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer"
                title="Partilhar no X (Twitter)"
              >
                <span className="font-mono text-xs font-black">𝕏</span>
                <span>Partilhar</span>
              </button>

              {/* Web Share / Copy Button */}
              <button
                type="button"
                id="share-copy-btn"
                onClick={handleWebShare}
                className="flex items-center justify-center gap-1.5 py-2 px-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer"
                title="Copiar ou Partilhar"
              >
                {copiedLink ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedLink ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Action Footer: Play Again */}
          <div className="pt-1">
            <button
              id="play-again-btn"
              onClick={onPlayAgain}
              className="w-full py-3.5 bg-gradient-to-r from-red-700 via-rose-700 to-red-800 hover:from-red-800 hover:to-rose-800 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer border border-amber-400/30"
            >
              <RotateCcw size={15} />
              <span>Jogar Novamente</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
