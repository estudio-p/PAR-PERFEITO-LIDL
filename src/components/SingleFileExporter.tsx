import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, Download, Code2, Sparkles } from 'lucide-react';

interface SingleFileExporterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SingleFileExporter: React.FC<SingleFileExporterProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = async () => {
    try {
      const resp = await fetch('/word-master.html');
      const text = await resp.text();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/word-master.html';
    link.download = 'p-de-palavra.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div
        id="single-file-modal"
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[88vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-900">
              <Code2 size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">
                Single-File HTML (Visual Match &bull; Par Perfeito)
              </h3>
              <p className="text-xs text-stone-500 font-mono">
                100% autossuficiente &bull; Vanilla JS &bull; Tailwind CDN
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-800 rounded-lg hover:bg-stone-200/60 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs text-amber-950 flex items-start gap-3">
            <Sparkles size={18} className="text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-950 mb-1">
                Ficheiro Único de Entrega Comercial
              </p>
              <p className="text-stone-600 leading-relaxed">
                Versão <strong>Single-File HTML</strong> do jogo <strong>Par Perfeito LIDL (Especial de Natal)</strong> com o Quebra-Nozes, gamas Deluxe e Favorina,
                Tailwind CSS via CDN, motor de correspondência de 12 cartas em Vanilla JavaScript,
                animações de viragem 3D, telemetria de eventos comerciais (<code>game_start</code>, <code>pair_matched</code>, <code>game_complete</code>),
                ranking em <code>localStorage</code> com input de nome e botões de partilha social (WhatsApp, X, Web Share).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {copied ? <Check size={14} className="text-amber-400" /> : <Copy size={14} />}
              <span>{copied ? 'Código Copiado!' : 'Copiar Código HTML Integral'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Download size={14} />
              <span>Descarregar visual-match.html</span>
            </button>


            <a
              href="/word-master.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl border border-slate-300 transition-colors"
            >
              <ExternalLink size={14} />
              <span>Abrir num Novo Separador</span>
            </a>
          </div>

          <div className="border border-stone-200 rounded-2xl overflow-hidden">
            <div className="px-3 py-1.5 bg-stone-100 border-b border-stone-200 text-[11px] font-mono text-stone-600 flex justify-between">
              <span>public/word-master.html</span>
              <span>Single-File HTML &bull; Visual Match</span>
            </div>
            <div className="p-3 bg-stone-900 text-stone-300 font-mono text-[11px] h-48 overflow-y-auto leading-relaxed">
              <pre className="whitespace-pre">{`<!DOCTYPE html>
<html lang="pt-PT">
<head>
  <meta charset="UTF-8">
  <title>Par Perfeito | Visual Match - Estúdio P</title>
  <!-- Tailwind CSS via CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
...
  <script>
    // 6 Pares Lógicos: Funcionalidade <-> Benefício Barista
    // Grelha de 12 cartas com flip 3D
    // Ranking em localStorage e Google Auth
    // Social share: WhatsApp, X e Web Share API
    // Telemetria: game_start, pair_matched, game_complete
  </script>
</body>
</html>`}</pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs rounded-xl transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
