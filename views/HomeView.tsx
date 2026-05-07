
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Search, MapPin, ThumbsUp, ArrowRight, Star, Loader2, 
  Sparkles, TrendingUp, Building2, ShieldCheck, Waves, 
  CheckCircle2, BedDouble, Maximize2, Trophy, Users, 
  Briefcase, ArrowUpRight
} from 'lucide-react';
import { supabase, db } from '../supabaseClient';
import { UserRole, Property } from '../types';
import { useBranding } from '../BrandingContext';

interface HomeViewProps {
  onNavigate: (path: string) => void;
  onViewProperty: (id: string) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onViewProperty }) => {
  const { settings } = useBranding();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Convert settings to compatible hero content
  const HERO_CONTENT = [
    { type: 'image', url: settings.heroBgUrl },
    { type: 'image', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1600' },
    { type: 'image', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1600' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % HERO_CONTENT.length);
    }, 6000);
    fetchFeatured();
    return () => clearInterval(interval);
  }, []);

  async function fetchFeatured() {
    try {
      const { data, error } = await db.catalog('properties').select('*').eq('featured', true).limit(4);
      if (error) throw error;
      setFeaturedProperties(data || []);
    } catch (err) {
      console.error("Erro ao carregar destaques:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="selection:bg-market-blue/10">
      
      {/* Cinematic Hero - Scaled Down for Professional Density */}
      <section className="relative h-[60vh] md:h-[75vh] flex items-center justify-center overflow-hidden bg-market-navy">
        <div className="absolute inset-0 z-0">
          {HERO_CONTENT.map((slide, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: idx === currentSlideIndex ? 0.3 : 0, 
              }}
              transition={{ duration: 2 }}
              className="absolute inset-0"
            >
              <img src={slide.url} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt="Real Estate Market" />
            </motion.div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-market-navy/80 via-market-navy/40 to-market-navy/95"></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl px-8 md:px-12 text-center md:text-left">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-md text-market-blue px-5 py-2 rounded-full text-[9px] font-bold uppercase tracking-[0.4em] mb-6 border border-white/5 shadow-xl"
          >
            <Sparkles size={12} className="text-market-gold" /> {settings.legacyTitle}
          </motion.div>
          
          <div className="max-w-2xl space-y-4">
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-5xl font-display font-black text-white leading-tight tracking-tight"
            >
              {settings.heroTitle}
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-white/40 text-sm md:text-base max-w-lg font-medium leading-relaxed"
            >
              {settings.heroDescription}
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 bg-white/5 backdrop-blur-3xl p-2 rounded-[2rem] shadow-2xl flex flex-col md:flex-row gap-0 max-w-2xl border border-white/5"
          >
            <div className="flex-[2] flex items-center px-6 py-3 gap-3 md:border-r border-white/5 group">
              <Search size={18} className="text-market-blue" />
              <input type="text" placeholder="Imagine o seu endereço..." className="w-full bg-transparent outline-none text-white font-medium text-sm placeholder:text-white/20 italic" />
            </div>
            <div className="flex-1 flex items-center px-6 py-3 gap-3">
              <MapPin size={18} className="text-market-gold" />
              <select className="w-full bg-transparent outline-none text-white font-bold text-sm cursor-pointer appearance-none bg-market-navy">
                <option value="">Beira Exclusive</option>
                <option value="">Maputo Prime</option>
              </select>
            </div>
            <button 
              onClick={() => onNavigate('imoveis')} 
              className="bg-market-blue hover:bg-white hover:text-market-navy text-white px-8 py-3 rounded-[1.5rem] font-display font-bold text-[10px] uppercase tracking-widest transition-all shadow-xl"
            >
              Consultar
            </button>
          </motion.div>
        </div>
      </section>

      {/* Featured Properties Section - High Density */}
      <section className="py-16 px-6 md:px-12 bg-[#FDFCFB]">
        <div className="max-w-[1500px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-xl space-y-3">
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="flex items-center gap-3">
                <div className="w-8 h-px bg-market-blue"></div>
                <span className="text-market-blue font-bold text-[9px] uppercase tracking-[0.4em]">Destaques</span>
              </motion.div>
              <h2 className="text-2xl md:text-3xl font-display font-black text-market-navy tracking-tight">Imóveis de <span className="italic font-serif font-light text-market-gold">Referência.</span></h2>
            </div>
            <button onClick={() => onNavigate('imoveis')} className="group flex items-center gap-3 text-market-navy font-bold text-[10px] uppercase tracking-widest hover:text-market-blue transition-all">
              Ver Tudo 
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProperties.map((property, idx) => (
              <motion.div 
                key={property.id} 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => onViewProperty(property.id)} 
                className="group cursor-pointer bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
              >
                <div className="relative h-44 overflow-hidden">
                  <img src={property.image} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={property.title} />
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    <span className="bg-market-navy/90 backdrop-blur-sm text-white px-3 py-1 rounded-md text-[8px] font-bold uppercase tracking-wider">
                      {property.dealType}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-market-blue uppercase tracking-widest">{property.type}</p>
                    <h3 className="text-[13px] font-bold text-market-navy line-clamp-1 group-hover:text-market-blue transition-colors">{property.title}</h3>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                    <p className="text-sm font-black text-market-navy">{property.price.toLocaleString()} <span className="text-[8px] opacity-40">MT</span></p>
                    <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                      <div className="flex items-center gap-1"><BedDouble size={12} /> {property.beds}</div>
                      <div className="flex items-center gap-1"><Maximize2 size={12} /> {property.area}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Section - Narrative Focus */}
      <section className="py-24 bg-market-navy relative overflow-hidden">
         <div className="max-w-[1200px] mx-auto px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
               <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="space-y-8">
                  <div className="space-y-4">
                     <span className="text-market-blue font-bold text-[10px] uppercase tracking-[0.4em]">Monte Hub</span>
                     <h2 className="text-3xl md:text-5xl font-display font-black text-white tracking-tight leading-tight">Transformando <span className="text-gradient">Posses</span> em <span className="italic font-serif font-light text-market-gold">Legados.</span></h2>
                  </div>
                  <p className="text-white/30 text-sm font-medium leading-relaxed max-w-md">
                    A nossa abordagem transcende o imobiliário convencional. Unimos consultoria estratégica e gestão de ativos de elite.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                     {[
                       { icon: ShieldCheck, title: "Curadoria", desc: "Seleção rigorosa." },
                       { icon: Waves, title: "Engenharia", desc: "Soluções técnicas." },
                     ].map((item, i) => (
                       <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5">
                          <item.icon className="text-market-blue mb-3" size={24} />
                          <h4 className="text-xs font-bold text-white mb-1">{item.title}</h4>
                          <p className="text-white/20 text-[10px]">{item.desc}</p>
                       </div>
                     ))}
                  </div>
               </motion.div>

               <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} className="relative">
                  <div className="rounded-[3rem] overflow-hidden border-8 border-white/5 oval-mask">
                     <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1200" referrerPolicy="no-referrer" className="w-full aspect-square object-cover grayscale opacity-50 transition-all duration-[2000ms] hover:grayscale-0 hover:opacity-100" alt="Consultoria Exclusive" />
                  </div>
               </motion.div>
            </div>
         </div>
      </section>

      {/* Quick Access Grid - Functional */}
      <section className="py-16 px-6 md:px-12 bg-white">
        <div className="max-w-[1200px] mx-auto">
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: 'Oportunidades', title: 'Explorar Portfólio', path: 'imoveis', color: 'bg-market-blue' },
                { label: 'Serviços', title: 'Consultoria Estratégica', path: 'servicos', color: 'bg-market-navy' },
                { label: 'Gestão', title: 'Administração', path: 'login', color: 'bg-market-accent' },
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -5 }}
                  onClick={() => onNavigate(item.path)}
                  className={`${item.color} p-8 rounded-[2rem] text-white cursor-pointer group shadow-lg transition-all`}
                >
                   <p className="text-[9px] font-bold uppercase tracking-[0.4em] opacity-50 mb-4">{item.label}</p>
                   <h3 className="text-xl font-display font-black tracking-tight">{item.title}</h3>
                </motion.div>
              ))}
           </div>
        </div>
      </section>
    </div>
  );
};

export default HomeView;
