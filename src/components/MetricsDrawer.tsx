import React, { useState, useEffect } from 'react';
import { X, Activity, RefreshCw, Terminal, ChevronDown, ChevronUp } from 'lucide-react';
import { MetricEvent } from '../types';
import { getEventHistory, subscribeMetrics } from '../utils/metrics';

interface MetricsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MetricsDrawer: React.FC<MetricsDrawerProps> = ({ isOpen, onClose }) => {
  const [events, setEvents] = useState<MetricEvent[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setEvents(getEventHistory());
    const unsubscribe = subscribeMetrics((newEv) => {
      setEvents((prev) => [newEv, ...prev.slice(0, 49)]);
    });
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex justify-end">
      <div
        id="metrics-drawer-panel"
        className="w-full max-w-md bg-slate-900 text-slate-100 h-full flex flex-col shadow-2xl border-l border-slate-800 animate-slideLeft"
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
              <Terminal size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Console de Métricas Comerciais</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                trackEvent(event, data) Live Stream
              </p>
            </div>
          </div>
          <button
            id="close-metrics-drawer-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Subheader info for Brand pitch */}
        <div className="px-4 py-2.5 bg-slate-800/60 border-b border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
          <span>Total de Eventos: <strong>{events.length}</strong></span>
          <span className="text-sky-400 font-medium">Campanha: TechBrand #EstudioP</span>
        </div>

        {/* Events Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs">
          {events.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Activity className="mx-auto w-8 h-8 opacity-40 mb-2" />
              <p>Nenhum evento registado ainda.</p>
              <p className="text-[10px] mt-1">Interage com o jogo para gerar telemetria.</p>
            </div>
          ) : (
            events.map((ev) => {
              const isExpanded = expandedId === ev.id;
              const isWinOrFinish = ev.event.includes('win') || ev.event.includes('complete');
              const isClue = ev.event.includes('clue');
              const isError = ev.event.includes('wrong') || ev.event.includes('lost');

              const badgeColor = isWinOrFinish
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : isClue
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : isError
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                : 'bg-sky-500/20 text-sky-300 border-sky-500/30';

              return (
                <div
                  key={ev.id}
                  className="bg-slate-950/80 rounded-xl border border-slate-800/80 p-3 hover:border-slate-700 transition-all cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : ev.id)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wide ${badgeColor}`}>
                        {ev.event}
                      </span>
                      <span className="text-slate-400 text-[10px]">
                        {new Date(ev.timestamp).toLocaleTimeString('pt-PT')}
                      </span>
                    </div>
                    <div className="text-slate-500">
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                  </div>

                  {/* Summary preview */}
                  {!isExpanded && (
                    <div className="mt-2 text-[11px] text-slate-400 truncate">
                      {JSON.stringify(ev.data)}
                    </div>
                  )}

                  {/* Expanded JSON inspection */}
                  {isExpanded && (
                    <pre className="mt-2.5 p-2 bg-slate-900 rounded-lg text-[10px] text-sky-200 overflow-x-auto border border-slate-800">
                      {JSON.stringify(ev.data, null, 2)}
                    </pre>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 text-center">
          Os mesmos dados são impressos com estilo no <code>console.log</code> do browser.
        </div>
      </div>
    </div>
  );
};
