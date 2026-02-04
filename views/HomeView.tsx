
import React, { useState, useEffect } from 'react';
import { Search, MapPin, ThumbsUp, ArrowRight, Star, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Property } from '../types';

const HERO_CONTENT = [
  { type: 'image', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=1600' },
  { type: 'image', url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=1600' },
  { type: 'image', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1600' }
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
    const { data } = await supabase.from('properties').select('*').eq('featured', true).limit(3);
    setFeaturedProperties(data || []);
    setLoading(false);
  }

  return (
    <div className="animate-in fade-in duration-700 space-y-12">
      {/* Hero Section */}
      <section className="w-full relative h-[300px] md:h-[380px] flex items-center justify-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 z-0">
          {HERO_CONTENT.map((slide, idx) => (
            <div 
              key={idx}
              className={`absolute inset-0 transition-all duration-[1500ms] ${idx === currentSlideIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}
            >
              <img src={slide.url} className="w-full h-full object-cover" alt="" />
              <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/20 to-slate-950/70"></div>
            </div>
          ))}
        </div>

        <div className="relative z-10 w-full max-w-7xl px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-2xl border border-white/20 px-6 py-2 rounded-full text-indigo-300 text-[9px] font-black uppercase tracking-[0.4em] mb-4">
            <Sparkles size={12} className="animate-pulse" /> Monte Imobiliária
          </div>
          
          <h1 className="text-3xl md:text-5xl font-black text-white mb-3 leading-none tracking-tighter">
            Excelência <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">Moçambicana</span>
          </h1>
          
          <p className="text-slate-300 text-xs md:text-sm font-medium max-w-xl mx-auto mb-6 leading-relaxed">
            Imobiliária de luxo e manutenção técnica industrial pela Monte Imobiliária.
          </p>

          <div className="bg-white/95 backdrop-blur-xl p-1.5 rounded-[2rem] shadow-2xl flex flex-col md:flex-row gap-2 max-w-2xl mx-auto border border-white/20">
            <div className="flex-1 flex items-center px-6 py-3 gap-3 md:border-r border-slate-100">
              <MapPin size={18} className="text-indigo-600" />
              <div className="text-left flex-1">
                <input type="text" placeholder="Procurar no catálogo..." className="w-full bg-transparent outline-none text-slate-900 font-bold text-xs" />
              </div>
            </div>
            <button 
              onClick={() => onNavigate('imoveis')} 
              className="bg-indigo-600 hover:bg-slate-900 text-white px-8 py-4 rounded-[1.5rem] font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95"
            >
              <Search size={14} /> Ver Imóveis
            </button>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-8 px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8 text-center md:text-left">
            <div className="max-w-xl">
              <p className="text-indigo-600 font-black text-[10px] uppercase tracking-[0.3em] mb-3">Património Selecionado</p>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Destaques da Semana</h2>
              <p className="text-slate-500 font-medium text-base italic">"Curadoria técnica Monte Imobiliária."</p>
            </div>
            <button onClick={() => onNavigate('imoveis')} className="flex items-center gap-3 text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:translate-x-2 transition-transform">
              Catálogo Completo <ArrowRight size={18} />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {featuredProperties.map((property) => (
                <div 
                  key={property.id} 
                  onClick={() => onViewProperty(property.id)} 
                  className="group cursor-pointer bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-700 overflow-hidden"
                >
                  <div className="h-56 overflow-hidden relative">
                    <img src={property.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms]" alt="" />
                    <div className="absolute top-5 left-5 bg-slate-900/80 backdrop-blur-md text-white text-[8px] font-black uppercase px-3 py-1 rounded-full">
                      {property.dealType}
                    </div>
                  </div>
                  <div className="p-7">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-indigo-600 font-black text-lg tracking-tighter">{property.price.toLocaleString()} MT</p>
                      <div className="flex gap-1">{[1, 2, 3, 4, 5].map(s => <Star key={s} size={8} className="fill-amber-400 text-amber-400" />)}</div>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors truncate">{property.title}</h3>
                    <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase">
                      <MapPin size={10} className="text-indigo-500" /> {property.location}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Corporate Strength */}
      <section className="py-16 bg-slate-50 overflow-hidden relative">
         <div className="max-w-7xl mx-auto px-8 flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-[45%] relative">
               <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl aspect-video ring-1 ring-slate-200">
                  <img src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=1200" alt="Monte Experts" className="w-full h-full object-cover" />
               </div>
               <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-indigo-600 rounded-[2.5rem] p-6 text-white shadow-2xl z-20 hidden lg:block">
                  <ThumbsUp size={24} className="mb-3" />
                  <p className="text-lg font-black leading-tight tracking-tight mb-1">Qualidade <br />Elite</p>
                  <p className="text-[8px] font-black text-indigo-300 uppercase tracking-widest">Selo Monte Imobiliária</p>
               </div>
            </div>
            <div className="lg:w-[55%] space-y-8">
               <div>
                  <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight tracking-tighter mb-4">
                    Liderança Técnica em <br /><span className="text-indigo-600">Gestão de Ativos</span>
                  </h2>
                  <p className="text-base text-slate-500 font-medium leading-relaxed">
                    A Monte Imobiliária une consultoria jurídica, engenharia civil e gestão hoteleira em um só hub técnico na Beira.
                  </p>
               </div>
               <button onClick={() => onNavigate('sobre')} className="px-10 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-[9px] uppercase tracking-[0.3em] hover:bg-indigo-600 transition-all shadow-2xl flex items-center gap-2">
                 Nossa História <ArrowRight size={16} />
               </button>
            </div>
         </div>
      </section>
    </div>
  );
};

export default HomeView;