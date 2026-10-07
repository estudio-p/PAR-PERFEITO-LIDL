import React, { useState } from 'react';
import { ShieldCheck, LogIn, LogOut, Check, AlertCircle } from 'lucide-react';
import { auth, googleProvider, db } from '../lib/firebase';
import { signInWithPopup, signOut, User } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface GoogleAuthButtonProps {
  user: User | null;
  onUserChange?: (user: User | null) => void;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({ user }) => {
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [consentEstudioP, setConsentEstudioP] = useState(true);
  const [consentMarketing, setConsentMarketing] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartLogin = () => {
    setErrorMsg(null);
    setShowConsentModal(true);
  };

  const handleProceedGoogleSignIn = async () => {
    if (!consentEstudioP) {
      setErrorMsg('É obrigatório consentir o tratamento de dados pelo Estúdio P.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const signedUser = result.user;

      // Persist user consent in Firestore
      if (signedUser) {
        await setDoc(
          doc(db, 'users', signedUser.uid),
          {
            uid: signedUser.uid,
            displayName: signedUser.displayName,
            email: signedUser.email,
            photoURL: signedUser.photoURL,
            rgpdConsentEstudioP: consentEstudioP,
            rgpdConsentMarketing: consentMarketing,
            consentTimestamp: new Date().toISOString(),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      }

      setShowConsentModal(false);
    } catch (err: unknown) {
      console.error('Google Sign-In Error:', err);
      setErrorMsg(
        err instanceof Error ? err.message : 'Falha na autenticação com a Google.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign-out error:', err);
    }
  };

  return (
    <>
      {user ? (
        <div className="flex items-center gap-2 bg-white border border-slate-200/80 rounded-full pl-1.5 pr-2.5 py-1 shadow-xs">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'Jogador'}
              className="w-6 h-6 rounded-full object-cover border border-slate-200"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
              {user.displayName?.charAt(0) || 'U'}
            </div>
          )}
          <div className="flex flex-col text-left">
            <span className="text-[11px] font-bold text-slate-800 leading-tight truncate max-w-[80px] sm:max-w-[110px]">
              {user.displayName?.split(' ')[0] || 'Jogador'}
            </span>
            <span className="text-[9px] text-emerald-600 font-medium leading-none">
              RGPD Ativo
            </span>
          </div>
          <button
            onClick={handleSignOut}
            title="Terminar Sessão"
            className="p-1 text-slate-400 hover:text-slate-700 rounded-full transition-colors ml-0.5"
            aria-label="Terminar Sessão"
          >
            <LogOut size={13} />
          </button>
        </div>
      ) : (
        <button
          id="google-login-trigger-btn"
          onClick={handleStartLogin}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs hover:border-slate-300 transition-all active:scale-98"
        >
          {/* Google 4-color "G" icon */}
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span className="hidden sm:inline">Entrar com Google</span>
          <span className="sm:hidden">Entrar</span>
        </button>
      )}

      {/* RGPD Consent & Google Login Modal */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            id="rgpd-consent-modal"
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn"
          >
            {/* Modal Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-sky-400">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight text-white">
                    Consentimento RGPD & Estúdio P
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Tratamento de dados e comunicações
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowConsentModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                Cancelar
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs text-slate-600">
              <p className="leading-relaxed">
                Ao autenticar-te através da tua conta Google para registo no Leaderboard
                oficial do <strong>"P, de Palavra"</strong>, solicitamos o teu consentimento informado
                nos termos do Regulamento Geral sobre a Proteção de Dados (RGPD):
              </p>

              {/* Consent Item 1 (Mandatory) */}
              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition-colors">
                <input
                  type="checkbox"
                  checked={consentEstudioP}
                  onChange={(e) => setConsentEstudioP(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <div className="flex-1">
                  <span className="font-bold text-slate-900 block mb-0.5">
                    Tratamento de Dados pelo Estúdio P *
                  </span>
                  <span className="text-[11px] text-slate-500 leading-snug block">
                    Consinto que os meus dados identificativos (nome e endereço de e-mail)
                    sejam tratados pelo <strong>Estúdio P</strong> com a finalidade de gestão
                    de pontuações, identificação no Leaderboard e segurança do passatempo.
                  </span>
                </div>
              </label>

              {/* Consent Item 2 (Marketing / Comms) */}
              <label className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/60 border border-amber-200 cursor-pointer hover:bg-amber-100/60 transition-colors">
                <input
                  type="checkbox"
                  checked={consentMarketing}
                  onChange={(e) => setConsentMarketing(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-amber-300"
                />
                <div className="flex-1">
                  <span className="font-bold text-slate-900 block mb-0.5">
                    Comunicações por E-mail & Ações de Marketing
                  </span>
                  <span className="text-[11px] text-slate-600 leading-snug block">
                    Consinto a receção de eventuais comunicações por e-mail, novidades
                    exclusivas e futuras ações de marketing promovidas pelo <strong>Estúdio P</strong>{' '}
                    e parceiros comerciais deste projeto.
                  </span>
                </div>
              </label>

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2 text-xs">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <p className="text-[10px] text-slate-400">
                Podes revogar o teu consentimento de marketing a qualquer momento através de
                contacto direto com o Estúdio P.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowConsentModal(false)}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Voltar
              </button>

              <button
                id="confirm-google-login-btn"
                type="button"
                disabled={!consentEstudioP || isLoading}
                onClick={handleProceedGoogleSignIn}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-98"
              >
                {isLoading ? (
                  <span>A autenticar...</span>
                ) : (
                  <>
                    <LogIn size={14} />
                    <span>Concordar e Entrar com Google</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
