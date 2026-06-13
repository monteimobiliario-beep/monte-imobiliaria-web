
import React, { useState, useEffect } from 'react';
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
  const DEFAULT_LOGO = '/logo.svg';
  const [systemLogo, setSystemLogo] = useState(() => {
    const saved = localStorage.getItem('monte_custom_logo');
    if (!saved || saved.includes('building-2.svg') || saved.includes('monteimobiliaria.co.mz')) {
      return DEFAULT_LOGO;
    }
    return saved;
  });

  useEffect(() => {
    const handleLogoUpdate = (e: any) => {
      if (e.detail) setSystemLogo(e.detail);
    };
    window.addEventListener('monteLogoUpdated', handleLogoUpdate);
    return () => window.removeEventListener('monteLogoUpdated', handleLogoUpdate);
  }, []);

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="bg-market-navy rounded-[4rem] p-12 md:p-20 text-white relative overflow-hidden shadow-2xl border border-white/5">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-market-blue/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-market-blue/20 backdrop-blur-xl border border-market-blue/20 px-6 py-2 rounded-full text-market-blue text-[10px] font-bold uppercase tracking-[0.3em] mb-10">
            <BookOpen size={16} /> Ecossistema Corporativo
          </div>
          <div className="w-32 h-32 bg-white rounded-[3rem] p-6 mb-8 shadow-2xl flex items-center justify-center overflow-hidden">
            <img src={systemLogo} className="w-full h-full object-contain" alt="Branding" />
          </div>
          <p className="text-white/70 text-xl md:text-2xl font-medium leading-relaxed italic max-w-2xl">
            "Sincronizando gestão estratégica, ativos imobiliários e manutenção técnica de alta precisão em Moçambique."
          </p>
        </div>
      </div>

      <div className="market-card overflow-hidden">
        <div className="p-16 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-slate-50/30">
           <div>
              <h2 className="text-4xl font-bold text-market-navy tracking-tighter">Arquitetura v15.0</h2>
              <p className="text-[10px] font-bold text-market-slate uppercase tracking-[0.4em] mt-2">Módulos Integrados de Gestão</p>
           </div>
           <Zap size={48} className="text-market-accent animate-pulse" />
        </div>
      </div>

      {/* Final Action */}
      <div className="p-16 bg-market-navy rounded-[4rem] text-white flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-r from-market-blue/20 to-transparent"></div>
         <div className="relative z-10 max-w-xl">
           <h3 className="text-3xl font-bold mb-4">Visão Tecnológica 2025</h3>
           <p className="text-white/60 font-medium leading-relaxed">
             Nosso ecossistema cloud garante que cada decisão seja baseada em dados reais e auditoria técnica constante.
           </p>
         </div>
         <div className="relative z-10">
            <div className="w-20 h-20 bg-market-blue rounded-2xl flex items-center justify-center shadow-2xl shadow-market-blue/20">
               <Database size={32} className="text-white" />
            </div>
         </div>
      </div>
    </div>
  );
};

export default OverviewView;
