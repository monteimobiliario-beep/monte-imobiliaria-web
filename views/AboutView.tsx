
import React, { useState, useEffect } from 'react';
import { Target, Users, Heart, History, Sparkles, ChevronLeft, ChevronRight, CheckCircle2, ShieldCheck, Briefcase, MapPin, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MOCK_PROJECTS } from '../constants';
import { useBranding } from '../BrandingContext';
import { useTranslation } from '../src/i18nContext';

const AboutView: React.FC = () => {
  const { t } = useTranslation();
  const { settings } = useBranding();
  const navigate = useNavigate();
  const [currentProject, setCurrentProject] = useState(0);

  // Auto-slide para o portfólio de projetos realizados
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentProject((prev) => (prev + 1) % MOCK_PROJECTS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextProject = () => setCurrentProject((prev) => (prev + 1) % MOCK_PROJECTS.length);
  const prevProject = () => setCurrentProject((prev) => (prev - 1 + MOCK_PROJECTS.length) % MOCK_PROJECTS.length);

  return (
    <div className="animate-in fade-in duration-1000 pb-24">
      {/* Hero Section - Compact & Professional */}
      <section className="w-full relative h-[250px] md:h-[300px] flex items-center justify-center overflow-hidden bg-market-navy">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1600" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-20" 
            alt="Monte Headquarters" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-market-navy/80 via-market-navy/40 to-market-navy/95"></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-market-blue/10 backdrop-blur-md border border-white/5 px-4 py-1.5 rounded-full text-market-blue text-[9px] font-bold uppercase tracking-[0.4em] mb-4">
            <TrendingUp size={12} /> {t('about.hero.tag')}
          </div>
          <h1 className="text-2xl md:text-4xl font-display font-black text-white tracking-tight">
            {t('about.hero.title')} <span className="text-market-blue">{settings.companyName}</span>
          </h1>
          <p className="text-white/30 text-xs md:text-sm max-w-lg mx-auto mt-4 font-medium italic">
            {t('about.hero.subtitle')}
          </p>
        </div>
      </section>

      {/* História & Missão Grid - Modern Layout */}
      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-24">
          
          {/* Coluna de Texto - Modern Card */}
          <div className="lg:col-span-12 bg-white p-10 md:p-16 rounded-3xl border border-slate-200 shadow-xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-slate-50 text-market-blue rounded-2xl flex items-center justify-center shadow-inner">
                <History size={28} />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-market-navy tracking-tight">{t('about.history.title')}</h2>
            </div>
            
            <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
              <p>
                {t('about.history.p1')}
              </p>
              <p>
                {t('about.history.p2')}
              </p>
            </div>
          </div>

          {/* Coluna de Imagem - Removida para layout mais leve */}
        </div>

        {/* SLIDER DE SERVIÇOS REALIZADOS - Modern Experience */}
        <section className="mb-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-market-blue font-bold text-xs uppercase tracking-widest mb-3">{t('about.portfolio.tag')}</p>
              <h2 className="text-3xl md:text-5xl font-bold text-market-navy tracking-tight leading-tight">{t('about.portfolio.title')} <br/><span className="text-market-blue">{t('about.portfolio.subtitle')}</span></h2>
            </div>
            <div className="flex gap-4">
               <button onClick={prevProject} className="p-4 rounded-xl border border-slate-200 hover:bg-market-blue hover:text-white transition-all active:scale-95"><ChevronLeft size={24} /></button>
               <button onClick={nextProject} className="p-4 rounded-xl border border-slate-200 hover:bg-market-blue hover:text-white transition-all active:scale-95"><ChevronRight size={24} /></button>
            </div>
          </div>

          <div className="relative group rounded-[2.5rem] overflow-hidden shadow-xl h-[400px] md:h-[600px] border border-slate-200">
            {MOCK_PROJECTS.map((proj, idx) => (
              <div 
                key={proj.id}
                className={`absolute inset-0 transition-all duration-1000 ease-in-out ${idx === currentProject ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
              >
                <img src={proj.image} className="w-full h-full object-cover" alt={proj.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-market-navy via-transparent to-transparent"></div>
                
                <div className="absolute bottom-12 left-8 right-8 flex flex-col md:flex-row md:items-end justify-between gap-8">
                  <div className="max-w-2xl bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 shadow-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1 bg-market-blue text-white text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-lg">{t('about.portfolio.delivered')}</span>
                      <span className="flex items-center gap-2 text-[11px] font-bold text-white/80 uppercase tracking-widest"><MapPin size={14} className="text-market-blue" /> Beira, MZ</span>
                    </div>
                    <h3 className="text-2xl md:text-4xl font-bold text-white tracking-tight leading-tight">{proj.name}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Banner de Encerramento CTA - Modern Blue */}
      <section className="mt-24 px-6 max-w-7xl mx-auto">
         <div className="bg-market-blue rounded-[2.5rem] p-12 md:p-20 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl">
            <div className="relative z-10 max-w-2xl text-center md:text-left">
               <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight mb-6">{t('about.cta.title')}</h2>
               <p className="text-white/80 text-lg md:text-xl leading-relaxed">
                 {t('about.cta.desc')}
               </p>
            </div>
            <div className="relative z-10 shrink-0">
               <button onClick={() => navigate('/contato')} className="px-12 py-4 bg-market-navy text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl hover:bg-white hover:text-market-navy transition-all flex items-center gap-3 active:scale-95">
                  {t('about.cta.button')} <ChevronRight size={20} />
               </button>
            </div>
         </div>
      </section>
    </div>
  );
};

export default AboutView;