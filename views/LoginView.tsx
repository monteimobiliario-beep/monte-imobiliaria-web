
import React, { useState, useEffect } from 'react';
import { supabase, db } from '../supabaseClient';
import { Mail, Lock, Zap, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { UserRole } from '../types';
import { useTranslation } from '../src/i18nContext';

interface LoginViewProps {
  onLoginSuccess: (user: any) => void;
  onBack: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onBack }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const DEFAULT_LOGO = 'https://raw.githubusercontent.com/lucide-react/lucide/main/icons/building-2.svg';
  const [systemLogo, setSystemLogo] = useState(localStorage.getItem('monte_custom_logo') || DEFAULT_LOGO);

  useEffect(() => {
    const handleLogoUpdate = (e: any) => {
      if (e.detail) setSystemLogo(e.detail);
    };
    window.addEventListener('monteLogoUpdated', handleLogoUpdate);
    return () => window.removeEventListener('monteLogoUpdated', handleLogoUpdate);
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: authResult, error: authError } = await supabase.auth.signInWithPassword({
        email, password,
      });
      if (authError) throw authError;

      // REMOVED redundant employee fetch here as App.tsx handles it via onAuthStateChange
      onLoginSuccess(null); 
    } catch (err: any) {
      console.error("Erro de Autenticação:", err);
      if (err.message?.includes('Failed to fetch')) {
        setError('Erro de conexão: Não foi possível alcançar o servidor de autenticação. Verifique sua rede e se a URL do Supabase está correta.');
      } else if (err.message?.includes('Lock broken')) {
        setError('Erro de sincronização de sessão. Por favor, tente clicar em entrar novamente.');
      } else {
        setError(err.message === 'Invalid login credentials' ? t('login.error.creds') : err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-market-bg relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-market-blue/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-market-blue/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="relative pointer-events-auto z-10 p-10 md:p-14 rounded-[3rem] border border-slate-100 shadow-2xl bg-white shadow-slate-200/50">
          
          <div className="text-center mb-12">
            <div className="w-32 h-32 flex items-center justify-center mx-auto mb-8 transition-transform hover:scale-105 duration-500">
              <img src={systemLogo} alt="Monte Logo" className="w-full h-full object-contain" />
            </div>
          </div>

          {error && (
            <div className="mb-8 p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-4 text-rose-500 text-xs font-bold animate-in zoom-in duration-300">
              <div className="p-2 bg-rose-500 rounded-lg text-white">
                <AlertCircle size={16} />
              </div>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-6 pointer-events-auto">
            <div className="space-y-2">
              <label htmlFor="email-field" className="text-[10px] font-bold uppercase tracking-widest ml-2 flex items-center gap-2 text-market-slate">
                <Mail size={12} className="text-market-blue" /> {t('login.staff_id')}
              </label>
              <input 
                id="email-field"
                required 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full px-6 py-5 rounded-[1.8rem] border border-slate-200 font-bold text-sm transition-all outline-none focus:ring-4 bg-white text-market-navy placeholder:text-slate-300 focus:ring-market-blue/10 focus:border-market-blue pointer-events-auto relative z-20"
                placeholder="nome@monteimobiliaria.com"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-2">
                <label htmlFor="pass-field" className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-market-slate">
                  <Lock size={12} className="text-market-blue" /> {t('login.security_key')}
                </label>
              </div>
              <input 
                id="pass-field"
                required 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full px-6 py-5 rounded-[1.8rem] border border-slate-200 font-bold text-sm transition-all outline-none focus:ring-4 bg-white text-market-navy placeholder:text-slate-300 focus:ring-market-blue/10 focus:border-market-blue pointer-events-auto relative z-20"
                placeholder="••••••••••••"
              />
            </div>

            <div className="pt-4 space-y-4 relative z-20">
              <button 
                disabled={loading} 
                type="submit" 
                className="market-button market-button-primary w-full py-6 text-xs tracking-[0.3em] flex items-center justify-center gap-4 pointer-events-auto shadow-xl"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={22} />
                ) : (
                  <>
                    {t('login.title')} <Zap size={18} className="fill-white" />
                  </>
                )}
              </button>

              <div className="flex justify-center">
                <button 
                  type="button"
                  onClick={async () => {
                    const email = prompt("E-mail corporativo para cadastro:");
                    const pass = prompt("Defina uma senha (mínimo 6 caracteres):");
                    if (email && pass) {
                      if (pass.length < 6) {
                        alert("A senha deve ter pelo menos 6 caracteres.");
                        return;
                      }
                      setLoading(true);
                      const { error } = await supabase.auth.signUp({ 
                        email, 
                        password: pass,
                        options: { data: { name: email.split('@')[0] } }
                      });
                      setLoading(false);
                      if (error) alert("Erro ao cadastrar: " + error.message);
                      else alert("Cadastro iniciado! Se a confirmação de e-mail estiver ativa, verifique sua caixa de entrada. Caso contrário, tente fazer login.");
                    }
                  }}
                  className="text-[9px] font-bold text-market-blue uppercase tracking-widest hover:underline opacity-60 hover:opacity-100 transition-all"
                >
                  {t('login.register_staff')}
                </button>
              </div>

              <div className="relative py-4 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center px-2">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <span className="relative z-10 bg-white px-4 text-[8px] font-black uppercase tracking-[0.4em] text-slate-300">{t('login.or_cloud')}</span>
              </div>

              <button 
                type="button"
                onClick={async () => {
                  try {
                    await supabase.auth.signInWithOAuth({
                      provider: 'google',
                      options: { redirectTo: window.location.origin }
                    });
                  } catch (err: any) {
                    setError('Erro ao autenticar com Google: ' + err.message);
                  }
                }}
                className="w-full py-5 rounded-[1.8rem] border border-slate-200 bg-white hover:bg-slate-50 transition-all flex items-center justify-center gap-4 text-xs font-bold text-market-navy relative z-20 pointer-events-auto"
              >
                <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                <span>{t('login.google')}</span>
              </button>
            </div>
          </form>

          <div className="mt-12 pt-8 border-t border-dashed border-slate-200 flex flex-col items-center gap-6 text-center">
            <p className="text-[9px] font-bold text-market-slate uppercase tracking-widest leading-relaxed">
              {t('login.monitor')}
            </p>
            
            <button onClick={onBack} className="group text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 transition-colors text-market-slate hover:text-market-blue">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> {t('login.back')}
            </button>
          </div>
        </div>
        <p className="text-center mt-8 text-[9px] font-bold uppercase tracking-[0.5em] text-market-slate/50">
          Business Intelligence • Cloud Network
        </p>
      </div>
    </div>
  );
};

export default LoginView;
