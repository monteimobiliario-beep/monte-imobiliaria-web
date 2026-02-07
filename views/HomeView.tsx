
import React, { useState, useEffect } from 'react';
import { Search, MapPin, ThumbsUp, ArrowRight, Star, Loader2, Sparkles, TrendingUp, Building2, ShieldCheck, Waves, CheckCircle2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Property } from '../types';

const HERO_CONTENT = [
  { type: 'image', url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1600' },
  { type: 'image', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1600' },
  { type: 'image', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1600' }
];

interface HomeViewProps {
  onNavigate: (path: string) => void;
  onViewProperty: (id: string) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onViewProperty }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % HERO_CONTENT.length);
    }, 6000);
    fetchFeatured();
    return () => clearInterval(interval);
  }, []);

  async function fetchFeatured() {
    try {
      const { data, error } = await supabase.from('properties').select('*').eq('featured', true).limit(4);
      if (error) throw error;
      setFeaturedProperties(data || []);
    } catch (err) {
      console.error("Erro ao carregar destaques:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-in fade-in duration-1000 space-y-0">
      
      {/* Hero Section - Clean top without ticker */}
      <section className="w-full relative h-[400px] md:h-[500px] flex items-center justify-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 z-0">
          {HERO_CONTENT.map((slide, idx) => (
            <div 
              key={idx}
              className={`absolute inset-0 transition-all duration-[2000ms] ${idx === currentSlideIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}
            >
              <img src={slide.url} className="w-full h-full object-cover" alt="Luxury House" />
              <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950/80"></div>
            </div>
          ))}
        </div>

        <div className="relative z-10 w-full max-w-7xl px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.4em] mb-6 shadow-2xl shadow-indigo-500/20">
            <Sparkles size={10} /> Exclusividade Monte
          </div>
          
          <h1 className="text-3xl md:text-6xl font-black text-white mb-4 leading-none tracking-tighter">
            Definindo o <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Padrão de Ouro</span>
          </h1>
          
          <p className="text-slate-300 text-xs md:text-base font-medium max-w-xl mx-auto mb-10 leading-relaxed drop-shadow-lg">
            Curadoria de imóveis extraordinários e gestão de ativos com rigor técnico internacional em Moçambique.
          </p>

          <div className="bg-white/90 backdrop-blur-3xl p-1.5 rounded-[2rem] shadow-2xl flex flex-col md:flex-row gap-2 max-w-2xl mx-auto border border-white/30 transform hover:-translate-y-1 transition-all duration-500">
            <div className="flex-1 flex items-center px-8 py-4 gap-4 md:border-r border-slate-200/50">
              <Search size={20} className="text-indigo-600" />
              <input type="text" placeholder="Procurar investimento..." className="w-full bg-transparent outline-none text-slate-900 font-bold text-sm placeholder:text-slate-400" />
            </div>
            <button 
              onClick={() => onNavigate('imoveis')} 
              className="bg-slate-900 hover:bg-indigo-600 text-white px-10 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl"
            >
              Ver Catálogo <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 px-8 bg-slate-50">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-14 gap-8">
            <div className="max-w-xl text-center md:text-left">
              <div className="flex items-center gap-2 text-indigo-600 font-black text-[9px] uppercase tracking-[0.5em] mb-4">
                 <TrendingUp size={14} /> Investimentos em Alta
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter mb-4">Selecção Privada</h2>
              <p className="text-slate-500 font-medium text-lg italic opacity-80 leading-relaxed">"Engenharia de ponta e o melhor estilo de vida da Beira."</p>
            </div>
            <button onClick={() => onNavigate('imoveis')} className="group flex items-center gap-4 text-slate-900 font-black text-[10px] uppercase tracking-widest hover:text-indigo-600 transition-colors">
              Explorar Completo <div className="p-3 bg-white rounded-full shadow-sm group-hover:shadow-md group-hover:bg-indigo-50 transition-all"><ArrowRight size={16} /></div>
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-24"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProperties.map((property) => (
                <div 
                  key={property.id} 
                  onClick={() => onViewProperty(property.id)} 
                  className="group cursor-pointer bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-700 overflow-hidden relative"
                >
                  <div className="h-60 overflow-hidden relative">
                    <img src={property.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms]" alt={property.title} />
                    <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-md text-slate-900 text-[8px] font-black uppercase px-3 py-1 rounded-lg shadow-lg">
                      {property.dealType}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-indigo-600 font-black text-xl tracking-tighter">{property.price.toLocaleString()} MT</p>
                      <div className="flex gap-0.5">{[1, 2, 3, 4, 5].map(s => <Star key={s} size={7} className="fill-amber-400 text-amber-400" />)}</div>
                    </div>
                    <h3 className="text-[13px] font-black text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors uppercase tracking-tight truncate">{property.title}</h3>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                      <MapPin size={12} className="text-indigo-600" /> {property.location}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Service Ecosystem */}
      <section className="py-24 bg-slate-950 text-white relative overflow-hidden">
         <div className="max-w-[1400px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative hidden lg:block">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4 pt-10">
                     <div className="rounded-[2.5rem] overflow-hidden aspect-square ring-4 ring-white/5 shadow-2xl">
                        <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" alt="" />
                     </div>
                     <div className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-2xl">
                        <Star className="text-white mb-4" size={24} />
                        <p className="text-2xl font-black italic">Excelência <br/>Certificada</p>
                     </div>
                  </div>
                  <div className="space-y-4">
                     <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 border-dashed">
                        <Building2 className="text-indigo-400 mb-4" size={24} />
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Património Sob Gestão</p>
                        <p className="text-3xl font-black tracking-tighter mt-1">+2.4B MT</p>
                     </div>
                     <div className="rounded-[2.5rem] overflow-hidden aspect-square ring-4 ring-white/5 shadow-2xl">
                        <img src="https://images.unsplash.com/photo-1600607687940-4e524cb35297?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" alt="" />
                     </div>
                  </div>
               </div>
            </div>
            
            <div className="space-y-10">
               <div>
                  <span className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.5em] mb-4 block">Monte Intelligence</span>
                  <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none mb-6">A Ciência por trás da <span className="italic text-indigo-400">Valorização</span></h2>
                  <p className="text-slate-400 text-lg font-medium leading-relaxed italic">
                    Utilizamos inteligência técnica para garantir que o seu imóvel seja um ativo financeiro resiliente no mercado moçambicano.
                  </p>
               </div>
               
               <div className="space-y-6">
                  {[
                    { title: "Manutenção Preditiva", sub: "Evite surpresas com vistorias técnicas mensais." },
                    { title: "Assessoria Fiscal", sub: "Otimização tributária completa para o seu portfólio." },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-5 group bg-white/5 p-6 rounded-[2rem] border border-white/5">
                       <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg">
                          <CheckCircle2 size={20} />
                       </div>
                       <div>
                          <h4 className="text-lg font-black tracking-tight">{item.title}</h4>
                          <p className="text-sm text-slate-500 font-medium">{item.sub}</p>
                       </div>
                    </div>
                  ))}
               </div>
               
               <button onClick={() => onNavigate('sobre')} className="group flex items-center gap-6 bg-white text-slate-950 px-10 py-5 rounded-[2.5rem] font-black text-[11px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-2xl active:scale-95">
                  Conheça a Nossa História <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
               </button>
            </div>
         </div>
      </section>
    </div>
  );
};

export default HomeView;
