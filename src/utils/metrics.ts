/**
 * Commercial Telemetry & Metrics System
 * Automatically synchronizes game events to the Firebase Firestore database
 * and logs to structured developer console.
 */

import { MetricEvent } from '../types';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

type MetricsListener = (event: MetricEvent) => void;
const listeners: Set<MetricsListener> = new Set();
const eventHistory: MetricEvent[] = [];

export function subscribeMetrics(listener: MetricsListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getEventHistory(): MetricEvent[] {
  return [...eventHistory];
}

/**
 * Mandatory commercial telemetry function.
 * Dispatches to internal memory, console and persists to Firestore.
 */
export function trackEvent(event: string, data: Record<string, unknown> = {}): void {
  const timestamp = new Date().toISOString();
  const timeFormatted = new Date().toLocaleTimeString('pt-PT', { hour12: false });
  const currentUser = auth.currentUser;
  
  const clientSessionId =
    typeof window !== 'undefined'
      ? (window as unknown as { __sessId?: string }).__sessId || 'sess_estudiop'
      : 'sess_estudiop';

  const metricRecord: MetricEvent = {
    id: Math.random().toString(36).substring(2, 9),
    timestamp,
    event,
    data: {
      ...data,
      clientSessionId,
      campaign: 'P_De_Palavra_Titanium_Launch',
      brand: 'Sponsor',
    }
  };

  eventHistory.unshift(metricRecord);
  if (eventHistory.length > 50) eventHistory.pop();

  // Distinctive styled console log for brand audits
  console.groupCollapsed(
    `%c[ESTÚDIO P TELEMETRY]%c ${event.toUpperCase()} %c@ ${timeFormatted}`,
    'background: #09090b; color: #38bdf8; font-weight: 700; padding: 3px 6px; border-radius: 3px 0 0 3px;',
    'background: #D6001C; color: #ffffff; font-weight: 600; padding: 3px 8px;',
    'background: #18181b; color: #a1a1aa; font-size: 11px; padding: 3px 6px; border-radius: 0 3px 3px 0;'
  );
  console.log('%cEvent ID:%c ' + metricRecord.id, 'color: #a1a1aa; font-weight: bold;', 'color: #cbd5e1;');
  console.log('%cPayload:%c', 'color: #a1a1aa; font-weight: bold;', '', data);
  console.groupEnd();

  // Notify UI subscribers asynchronously (avoiding React state-in-render conflict)
  if (listeners.size > 0) {
    setTimeout(() => {
      listeners.forEach((fn) => {
        try {
          fn(metricRecord);
        } catch (err) {
          console.error('Metrics subscriber error:', err);
        }
      });
    }, 0);
  }

  // Asynchronously push to Firestore database
  try {
    const metricsCol = collection(db, 'metrics_events');
    addDoc(metricsCol, {
      event,
      timestamp,
      clientSessionId,
      userId: currentUser?.uid || null,
      userEmail: currentUser?.email || null,
      data,
      createdAt: serverTimestamp(),
    }).catch((err) => {
      console.warn('[Firestore Metrics] Async log warning:', err.message);
    });
  } catch (err) {
    console.warn('[Firestore Metrics] Execution error:', err);
  }
}

// Initialize session ID
if (typeof window !== 'undefined') {
  (window as unknown as { __sessId?: string }).__sessId =
    Math.random().toString(36).substring(2, 10);
  (window as unknown as { trackEvent?: typeof trackEvent }).trackEvent = trackEvent;
}
