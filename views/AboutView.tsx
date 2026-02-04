
import React, { useState, useEffect } from 'react';
import { Target, Users, Heart, History, Sparkles, ChevronLeft, ChevronRight, CheckCircle2, ShieldCheck, Briefcase, MapPin } from 'lucide-react';
import { MOCK_PROJECTS } from '../constants';

const AboutView: React.FC = () => {
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
    <div className="animate-in fade-in duration-700 pb-20">
      {/* Hero Section */}
      <section className="w-full relative h-[250px] md:h-[320px] flex items-center justify-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1600" 
            className="w-full h-full object-cover opacity-40" 
            alt="Monte Headquarters" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-blue-950/20 to-slate-50"></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 px-5 py-2 rounded-full text-blue-300 text-[9px] font-black uppercase tracking-[0.4em] mb-4">
            <Sparkles size={12} className="animate-pulse" /> Ecossistema Monte Imobiliária
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-3 tracking-tighter leading-none">
            A Nossa <span className="text-blue-500">Identidade</span>
          </h1>
          <p className="text-slate-400 text-xs md:text-sm font-medium max-w-xl mx-auto italic">
            "Somos o seu parceiro estratégico integral na Beira."
          </p>
        </div>
      </section>

      {/* História & Missão Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
          
          {/* Coluna de Texto */}
          <div className="lg:col-span-7 bg-white p-10 md:p-14 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                <History size={24} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Trajectória de Sucesso</h2>
            </div>
            
            <div className="space-y-6 text-slate-600 font-medium leading-relaxed text-sm md:text-base">
              <p>
                Fundada no coração estratégico do <span className="text-blue-600 font-black">Bairro Alto da Manga</span>, a Monte Imobiliária nasceu da visão de elevar os padrões do mercado imobiliário em Moçambique. Identificamos a necessidade de um serviço que integrasse consultoria jurídica, precisão em engenharia e uma gestão de activos humanizada.
              </p>
              <p>
                Ao longo dos anos, consolidámo-nos como um hub técnico multidisciplinar. Hoje, não apenas vendemos imóveis; garantimos a integridade estrutural das obras, a rentabilidade de unidades hoteleiras e a transparência total na gestão de condomínios.
              </p>
            </div>
          </div>

          {/* Coluna de Imagem / Estatística */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="rounded-[3rem] overflow-hidden shadow-2xl flex-1 border-8 border-white">
              <img src="https://images.unsplash.com/photo-1577412647305-991150c7d163?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" alt="Office View" />
            </div>
          </div>
        </div>

        {/* SLIDER DE SERVIÇOS REALIZADOS */}
        <section className="mb-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 px-4">
            <div>
              <p className="text-blue-600 font-black text-[10px] uppercase tracking-[0.4em] mb-3">Portfolio Monte</p>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">Projetos & Serviços <br/><span className="text-blue-600">Já Concluídos</span></h2>
            </div>
          </div>

          <div className="relative group rounded-[4rem] overflow-hidden shadow-2xl h-[400px] md:h-[500px]">
            {MOCK_PROJECTS.map((proj, idx) => (
              <div 
                key={proj.id}
                className={`absolute inset-0 transition-all duration-[1200ms] ease-in-out ${idx === currentProject ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-105 translate-x-10'}`}
              >
                <img src={proj.image} className="w-full h-full object-cover" alt={proj.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                
                <div className="absolute bottom-12 left-10 right-10 flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in slide-in-from-bottom-10 duration-1000">
                  <div className="max-w-2xl bg-white/10 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/20 shadow-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1 bg-blue-600 text-white text-[8px] font-black uppercase rounded-lg shadow-lg">Serviço Entregue</span>
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-white/80 uppercase"><MapPin size={12} className="text-blue-400" /> Beira, Moçambique</span>
                    </div>
                    <h3 className="text-2xl md:text-4xl font-black text-white mb-2 tracking-tight uppercase">{proj.name}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Banner de Encerramento CTA */}
      <section className="mt-24 px-4 md:px-8 max-w-7xl mx-auto">
         <div className="bg-blue-600 rounded-[4rem] p-12 md:p-20 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10 max-w-xl text-center md:text-left">
               <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">Confie no Legado Monte Imobiliária</h2>
               <p className="text-blue-100 font-medium text-lg italic opacity-80 leading-relaxed">
                 Estamos prontos para gerir, construir e realizar o seu próximo projecto imobiliário.
               </p>
            </div>
         </div>
      </section>
    </div>
  );
};

export default AboutView;