
import React from 'react';
import { 
  BookOpen, 
  ShieldCheck, 
  Zap, 
  Globe, 
  Users, 
  Cpu, 
  Wallet,
  Briefcase,
  Target,
  ArrowRight,
  Database
} from 'lucide-react';

const OverviewView: React.FC = () => {
  const systemLogo = localStorage.getItem('monte_custom_logo') || 'https://i.ibb.co/LzfNdf7Y/building-logo.png';

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="bg-slate-950 rounded-[4rem] p-12 md:p-20 text-white relative overflow-hidden shadow-2xl border border-white/5">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 backdrop-blur-xl border border-indigo-400/20 px-6 py-2 rounded-full text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-10">
            <BookOpen size={16} /> Ecossistema Corporativo
          </div>
          <div className="w-32 h-32 bg-white rounded-[3rem] p-6 mb-8 shadow-2xl">
            <img src={systemLogo} className="w-full h-full object-contain" alt="Branding" />
          </div>
          <p className="text-slate-400 text-xl md:text-2xl font-medium leading-relaxed italic max-w-2xl">
            "Sincronizando gestão estratégica, ativos imobiliários e manutenção técnica de alta precisão em Moçambique."
          </p>
        </div>
      </div>

      {/* Módulos */}
      <div className="bg-white rounded-[4rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-16 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-slate-50/30">
           <div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Arquitetura v15.0</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2">Módulos Integrados de Gestão</p>
           </div>
           <Zap size={48} className="text-amber-500 animate-pulse" />
        </div>
      </div>

      {/* Final Action */}
      <div className="p-16 bg-slate-900 rounded-[4rem] text-white flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/50 to-transparent"></div>
         <div className="relative z-10 max-w-xl">
           <h3 className="text-3xl font-black mb-4">Visão Tecnológica 2025</h3>
           <p className="text-slate-400 font-medium leading-relaxed">
             Nosso ecossistema cloud garante que cada decisão seja baseada em dados reais e auditoria técnica constante.
           </p>
         </div>
      </div>
    </div>
  );
};

export default OverviewView;
