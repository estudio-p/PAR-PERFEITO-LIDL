/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { StartScreen } from './components/StartScreen';
import { MatchCardsGrid } from './components/MatchCardsGrid';
import { EndGameModal } from './components/EndGameModal';
import { GameCard, GameStatus } from './types';
import { generateShuffledCards, LIDL_NATAL_PAIRS } from './data/pairs';
import { trackEvent } from './utils/metrics';
import { sounds } from './utils/audio';
import { calculateScore } from './utils/storage';
import { auth } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { CheckCircle2 } from 'lucide-react';
import nutcrackerImg from './assets/images/lidl_nutcracker_mascot_1790775845665.jpg';

export default function App() {
  const [cards, setCards] = useState<GameCard[]>(() => generateShuffledCards());
  const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [attempts, setAttempts] = useState<number>(0);
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [isProcessingTurn, setIsProcessingTurn] = useState<boolean>(false);
  const [lastMatchedStory, setLastMatchedStory] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Accurate timer reference
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auth observer
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  // Initial load event
  useEffect(() => {
    trackEvent('app_load', {
      app: 'lidl_natal_visual_match',
      theme: 'deluxe_favorina_quebranozes',
      timestamp: new Date().toISOString(),
    });
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Timer loop when game is active
  useEffect(() => {
    if (gameStatus !== 'playing') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameStatus]);

  // Start new game
  const startGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    const freshCards = generateShuffledCards();
    setCards(freshCards);
    setElapsedSeconds(0);
    setAttempts(0);
    setSelectedCardIds([]);
    setIsProcessingTurn(false);
    setLastMatchedStory(null);
    setGameStatus('playing');

    sounds.playCardFlip();
    trackEvent('game_start', {
      totalCards: 12,
      totalPairs: 6,
      theme: 'lidl_natal_deluxe_favorina',
      timestamp: new Date().toISOString(),
    });
  }, []);

  // Handle card click
  const handleCardClick = useCallback(
    (clickedCard: GameCard) => {
      if (
        gameStatus !== 'playing' ||
        isProcessingTurn ||
        clickedCard.isFlipped ||
        clickedCard.isMatched ||
        selectedCardIds.includes(clickedCard.id)
      ) {
        return;
      }

      sounds.playCardFlip();

      // Reveal clicked card in state
      setCards((prevCards) =>
        prevCards.map((c) => (c.id === clickedCard.id ? { ...c, isFlipped: true } : c))
      );

      // Case 1: First card of the turn
      if (selectedCardIds.length === 0) {
        setSelectedCardIds([clickedCard.id]);
        return;
      }

      // Case 2: Second card of the turn
      if (selectedCardIds.length === 1) {
        const firstCardId = selectedCardIds[0];
        const firstCard = cards.find((c) => c.id === firstCardId);
        if (!firstCard) return;

        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        // Check logical match (same pairId)
        if (firstCard.pairId === clickedCard.pairId) {
          // MATCH!
          sounds.playMatchSuccess();

          const pairDef = LIDL_NATAL_PAIRS.find((p) => p.id === clickedCard.pairId);
          const explanation = pairDef ? pairDef.storyExplanation : clickedCard.pairName;
          setLastMatchedStory(explanation);

          // Mark both cards as matched
          setCards((prevCards) => {
            const updated = prevCards.map((c) => {
              if (c.id === firstCard.id || c.id === clickedCard.id) {
                return { ...c, isFlipped: true, isMatched: true };
              }
              return c;
            });

            // Check if all cards are now matched
            const allMatched = updated.every((c) => c.isMatched);
            if (allMatched) {
              if (timerRef.current) clearInterval(timerRef.current);
              setGameStatus('won');
              sounds.playVictory();

              trackEvent('game_complete', {
                timeSeconds: elapsedSeconds,
                attempts: newAttempts,
                score: calculateScore(elapsedSeconds, newAttempts),
                result: 'all_pairs_matched',
              });
            }

            return updated;
          });

          setSelectedCardIds([]);

          trackEvent('pair_matched', {
            pairId: clickedCard.pairId,
            pairName: clickedCard.pairName,
            range: clickedCard.range,
            attemptsSoFar: newAttempts,
            timeElapsed: elapsedSeconds,
          });
        } else {
          // MISMATCH - wait 1 second and flip back
          sounds.playMismatch();
          setIsProcessingTurn(true);
          setSelectedCardIds([firstCardId, clickedCard.id]);

          setTimeout(() => {
            setCards((prevCards) =>
              prevCards.map((c) => {
                if (c.id === firstCardId || c.id === clickedCard.id) {
                  return { ...c, isFlipped: false };
                }
                return c;
              })
            );
            setSelectedCardIds([]);
            setIsProcessingTurn(false);
          }, 1000);
        }
      }
    },
    [attempts, cards, elapsedSeconds, gameStatus, isProcessingTurn, selectedCardIds]
  );

  // Sound toggle
  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sounds.isMuted = next;
  };

  const matchedPairsCount = Math.floor(cards.filter((c) => c.isMatched).length / 2);

  return (
    <div className="min-h-screen bg-stone-100 text-stone-800 flex flex-col justify-between selection:bg-red-700 selection:text-white font-sans relative overflow-x-hidden">
      {/* Top Header with Lidl Natal Branding */}
      <Header
        elapsedSeconds={elapsedSeconds}
        attempts={attempts}
        isGamePlaying={gameStatus === 'playing'}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        currentUser={currentUser}
        clientLogoSrc="/lidl-logo.svg"
        clientLogoAlt="LIDL Portugal"
      />

      {/* Main Stage */}
      {gameStatus === 'idle' ? (
        <StartScreen onStartGame={startGame} />
      ) : (
        <main className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full px-2 sm:px-4 py-2 sm:py-3 space-y-3">
          {/* Dynamic Story Toast when a pair is found */}
          {lastMatchedStory && (
            <div className="w-full max-w-2xl mx-auto px-2 animate-fadeIn">
              <div className="p-3 bg-gradient-to-r from-red-950 via-zinc-950 to-red-950 text-white rounded-2xl border border-amber-400/40 shadow-lg flex items-center gap-3 text-xs">
                <img
                  src={nutcrackerImg}
                  alt="Quebra-Nozes Lidl"
                  className="w-10 h-10 rounded-xl object-cover border border-amber-400 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0">
                  <span className="font-bold text-amber-300 block text-[11px] uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 size={13} className="text-amber-400" />
                    Par de Natal Descoberto!
                  </span>
                  <p className="text-stone-200 leading-snug mt-0.5">
                    {lastMatchedStory}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 12 Cards Grid */}
          <MatchCardsGrid
            cards={cards}
            onCardClick={handleCardClick}
            isProcessingTurn={isProcessingTurn}
            matchedPairsCount={matchedPairsCount}
            totalPairs={6}
          />
        </main>
      )}

      {/* End Game Modal */}
      {gameStatus === 'won' && (
        <EndGameModal
          timeSeconds={elapsedSeconds}
          attempts={attempts}
          onPlayAgain={startGame}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}
