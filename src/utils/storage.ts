import { LeaderboardEntry } from '../types';
import { db } from '../lib/firebase';
import {
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';

const LOCAL_STORAGE_KEY = 'visualmatch_leaderboard_estudiop';

export function calculateScore(timeSeconds: number, attempts: number): number {
  const safeTime = Math.max(1, timeSeconds);
  const safeAttempts = Math.max(6, attempts);
  // Formula rewarding fast time and fewer attempts (minimum 6 clicks for 6 pairs)
  return Math.max(50, Math.round(12000 / (safeTime * 0.7 + safeAttempts * 2.5)));
}

const DEFAULT_BENCHMARKS: LeaderboardEntry[] = [
  { id: 'bm_1', name: 'Mariana Silva', score: 345, timeSeconds: 16, attempts: 12, date: 'Hoje, 11:20' },
  { id: 'bm_2', name: 'Tiago Santos', score: 290, timeSeconds: 21, attempts: 14, date: 'Hoje, 10:45' },
  { id: 'bm_3', name: 'Beatriz Costa', score: 245, timeSeconds: 27, attempts: 16, date: 'Hoje, 09:12' },
  { id: 'bm_4', name: 'Carlos Ferreira', score: 205, timeSeconds: 34, attempts: 18, date: 'Ontem, 18:30' },
  { id: 'bm_5', name: 'Inês Rocha', score: 170, timeSeconds: 42, attempts: 22, date: 'Ontem, 16:15' },
];

/**
 * Extracts only the first and last name from a full name string.
 * Example: "Mariana Filipa Santos Silva" -> "Mariana Silva"
 */
export function extractFirstAndLastName(fullName?: string | null): string {
  if (!fullName || !fullName.trim()) return 'Jogador Barista';
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1]}`;
}

/**
 * Get the current leaderboard from Firestore with fallback to LocalStorage/Defaults
 */
export async function getLeaderboardFromDB(): Promise<LeaderboardEntry[]> {
  try {
    const q = query(
      collection(db, 'leaderboard'),
      orderBy('score', 'desc'),
      limit(10)
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
      const items: LeaderboardEntry[] = [];
      snap.forEach((doc) => {
        const d = doc.data();
        items.push({
          id: doc.id,
          name: d.name || 'Barista Anónimo',
          score: d.score ?? 0,
          timeSeconds: d.timeSeconds ?? 30,
          attempts: d.attempts ?? 16,
          date: d.date || 'Recente',
          userId: d.userId,
          userEmail: d.userEmail,
          photoURL: d.photoURL,
          rgpdConsentMarketing: d.rgpdConsentMarketing,
        });
      });
      // Cache locally
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items.slice(0, 5)));
      return items.slice(0, 5);
    }
  } catch (err) {
    console.warn('[Firestore Leaderboard] Read error, fallback to local:', err);
  }

  // Fallback to local
  return getLocalLeaderboard();
}

export function getLocalLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_BENCHMARKS));
      return DEFAULT_BENCHMARKS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.sort((a, b) => b.score - a.score).slice(0, 5);
    }
    return DEFAULT_BENCHMARKS;
  } catch {
    return DEFAULT_BENCHMARKS;
  }
}

/**
 * Save score to both Firestore and LocalStorage
 */
export async function saveScoreToDB(
  name: string,
  timeSeconds: number,
  attempts: number,
  extra: {
    userId?: string;
    userEmail?: string;
    photoURL?: string;
    rgpdConsentMarketing?: boolean;
  } = {}
): Promise<{ entries: LeaderboardEntry[]; rank: number; score: number }> {
  const cleanName = extractFirstAndLastName(name);
  const score = calculateScore(timeSeconds, attempts);
  const now = new Date();
  const dateStr = `Hoje, ${now.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}`;

  const newEntry: LeaderboardEntry = {
    id: 'entry_' + Date.now(),
    name: cleanName,
    score,
    timeSeconds,
    attempts,
    date: dateStr,
    userId: extra.userId,
    userEmail: extra.userEmail,
    photoURL: extra.photoURL,
    rgpdConsentMarketing: extra.rgpdConsentMarketing,
  };

  // 1. Update local cache immediately
  const localList = getLocalLeaderboard();
  const combined = [...localList.filter((e) => e.id !== newEntry.id), newEntry].sort(
    (a, b) => b.score - a.score
  );
  const userRank = combined.findIndex((e) => e.id === newEntry.id) + 1;
  const top5 = combined.slice(0, 5);
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(top5));
  } catch {
    // ignore
  }

  // 2. Persist to Firestore
  try {
    await addDoc(collection(db, 'leaderboard'), {
      name: cleanName,
      score,
      timeSeconds,
      attempts,
      date: dateStr,
      userId: extra.userId || null,
      userEmail: extra.userEmail || null,
      photoURL: extra.photoURL || null,
      rgpdConsentMarketing: !!extra.rgpdConsentMarketing,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('[Firestore Leaderboard] Save error:', err);
  }

  return { entries: top5, rank: userRank, score };
}

