
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Mail, Lock, Zap, Loader2, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import { UserRole } from '../types';

interface LoginViewProps {
  onLoginSuccess: (user: any) => void;
  onBack: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [systemLogo, setSystemLogo] = useState(localStorage.getItem('monte_custom_logo') || 'https://i.ibb.co/LzfNdf7Y/building-logo.png');

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
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email, password,
      });
      if (authError) throw authError;

      const { data: empData } = await supabase
        .from('employees')
        .select('*')
        .eq('email', email)
        .single();

      const userData = {
        id: authData.user?.id,
        name: empData?.name || authData.user?.email?.split('@')[0],
        email: authData.user?.email,
        role: empData?.role || UserRole.EMPLOYEE,
        avatar: empData?.avatar || `https://picsum.photos/seed/${authData.user?.id}/100`,
      };

      onLoginSuccess(userData);
    } catch (err: any) {
      setError(err.message === 'Invalid login credentials' ? 'Credenciais de acesso inválidas.' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md relative animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="relative z-10 p-10 md:p-14 rounded-[4rem] border border-slate-100 shadow-2xl backdrop-blur-3xl bg-white shadow-slate-200/50">
          
          <div className="text-center mb-12">
            <div className="w-32 h-32 rounded-[3rem] flex items-center justify-center mx-auto mb-8 shadow-2xl p-6 group transition-transform hover:scale-110 duration-500 bg-white border border-slate-50 overflow-hidden">
              <img src={systemLogo} alt="Monte Logo" className="w-full h-full object-contain" />
              <div className="absolute -inset-2 bg-indigo-500/5 rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
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

          <form onSubmit={handleSignIn} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest ml-2 flex items-center gap-2 text-slate-400">
                <Mail size={12} className="text-indigo-500" /> Identificador Staff
              </label>
              <input 
                required 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full px-6 py-5 rounded-[1.8rem] border-none font-bold text-sm transition-all outline-none focus:ring-4 bg-slate-50 text-slate-900 placeholder:text-slate-300 focus:ring-indigo-100 shadow-inner"
                placeholder="nome@monte.mz"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-2">
                <label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-slate-400">
                  <Lock size={12} className="text-indigo-500" /> Chave de Segurança
                </label>
              </div>
              <input 
                required 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full px-6 py-5 rounded-[1.8rem] border-none font-bold text-sm transition-all outline-none focus:ring-4 bg-slate-50 text-slate-900 placeholder:text-slate-300 focus:ring-indigo-100 shadow-inner"
                placeholder="••••••••••••"
              />
            </div>

            <div className="pt-4">
              <button 
                disabled={loading} 
                type="submit" 
                className="w-full py-6 bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all shadow-2xl hover:shadow-indigo-500/40 hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:translate-y-0"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={22} />
                ) : (
                  <>
                    Entrar no Ecossistema <Zap size={18} className="fill-white" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-12 pt-8 border-t border-dashed border-slate-700/20 flex flex-col items-center gap-6">
            <button onClick={onBack} className="group text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-colors text-slate-400 hover:text-indigo-600">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Voltar ao Portal Público
            </button>
          </div>
        </div>
        <p className="text-center mt-8 text-[9px] font-bold uppercase tracking-[0.5em] text-slate-300">
          Business Intelligence • Cloud Network
        </p>
      </div>
    </div>
  );
};

export default LoginView;
