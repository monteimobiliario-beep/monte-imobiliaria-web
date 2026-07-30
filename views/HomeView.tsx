
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Search, MapPin, ArrowRight, ShieldCheck, Waves,
  BedDouble, Maximize2, Building2, MessageCircle, Sparkles
} from 'lucide-react';
import { db } from '../supabaseClient';
import { Property } from '../types';
import { useBranding } from '../BrandingContext';
import { useTranslation } from '../src/i18nContext';
import { useNavigate } from 'react-router-dom';

const HomeView: React.FC = () => {
  const { settings } = useBranding();
  const { t } = useTranslation();
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search state
  const [dealType, setDealType] = useState('Venda'); // Comprar | Arrendar
  const [searchQuery, setSearchQuery] = useState('');
  
  const navigate = useNavigate();

  const onViewProperty = (id: string) => navigate(`/imovel/${id}`);
  const onNavigate = (path: string) => navigate(path.startsWith('/') ? path : `/${path}`);

  const handleSearchSubmit = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('search', searchQuery.trim());
    if (dealType) params.append('deal', dealType);
    navigate(`/imoveis?${params.toString()}`);
  };

  const handleWhatsApp = () => {
    window.open('https://wa.me/258840000000', '_blank');
  };

  useEffect(() => {
    fetchFeatured();
  }, []);

  async function fetchFeatured() {
    try {
      const { data, error } = await db.catalog('properties').select('*').eq('featured', true).limit(10);
      if (error) throw error;
      const activeFeatured = (data || [])
        .map((p: any) => {
          let mc: any = {};
          try {
            mc = p.map_coords ? (typeof p.map_coords === 'string' ? JSON.parse(p.map_coords) : p.map_coords) : {};
          } catch(e) {}
          return {
            ...p,
            is_active: p.is_active !== undefined && p.is_active !== null ? p.is_active : (mc.is_active !== undefined ? mc.is_active : true),
            is_promo: p.is_promo !== undefined && p.is_promo !== null ? !!p.is_promo : (mc.is_promo !== undefined ? !!mc.is_promo : false),
            old_price: p.old_price !== undefined && p.old_price !== null ? Number(p.old_price) : (mc.old_price !== undefined && mc.old_price !== null ? Number(mc.old_price) : undefined)
          };
        })
        .filter((p: any) => p.is_active !== false)
        .slice(0, 4);
      setFeaturedProperties(activeFeatured);
    } catch (err: any) {
      console.error("Erro ao carregar destaques:", err?.message || err);
    } finally { setLoading(false); }
  }

  return (
    <div className="selection:bg-market-blue/10 bg-market-bg">
      
      {/* 1. Fast, Direct Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 px-6 md:px-12 overflow-hidden bg-white">
        {/* Background Image - Modern & Bright */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover object-center" 
            alt="Imóvel em Moçambique" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-market-navy/95 via-market-navy/80 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto flex flex-col md:flex-row items-center gap-12">
          
          {/* Text Content */}
          <div className="flex-1 space-y-8">
            <div className="space-y-4">
              <span className="inline-block bg-market-blue text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg">
                Monte Imobiliária
              </span>
              <h1 className="text-4xl md:text-6xl font-display font-black text-white leading-[1.1] tracking-tight max-w-xl">
                Encontre o Seu Espaço Ideal em Moçambique
              </h1>
              <p className="text-white/80 text-lg md:text-xl font-medium max-w-lg leading-relaxed">
                Somos especialistas em gestão imobiliária, vendas e arrendamentos. A sua parceira de confiança para um excelente negócio.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <button 
                onClick={handleWhatsApp}
                className="w-full sm:w-auto bg-[#25D366] hover:bg-[#1DA851] text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                <MessageCircle size={20} />
                Falar no WhatsApp
              </button>
              
              <button 
                onClick={() => onNavigate('imoveis')}
                className="w-full sm:w-auto bg-white hover:bg-slate-50 text-market-navy px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                <Search size={20} className="text-market-blue" />
                Ver Imóveis
              </button>
            </div>
          </div>

          {/* Search Box / Filter Box on Desktop */}
          <div className="w-full md:w-[450px] shrink-0">
            <div className="bg-white/95 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-2xl border border-white/50">
              <h3 className="text-xl font-black text-market-navy mb-6">O que procura?</h3>
              
              {/* Type selector */}
              <div className="grid grid-cols-2 gap-2 mb-6">
                {['Venda', 'Aluguel'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setDealType(type)}
                    className={`py-3 rounded-xl font-bold text-sm transition-all ${dealType === type ? 'bg-market-navy text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                  >
                    {type === 'Venda' ? 'Comprar' : 'Arrendar'}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 mb-6">
                {['Casa', 'Terreno', 'Apartamento', 'Comercial'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      const params = new URLSearchParams();
                      params.append('category', cat);
                      navigate(`/imoveis?${params.toString()}`);
                    }}
                    className="py-2.5 rounded-xl font-semibold text-xs border border-slate-200 text-slate-600 hover:border-market-blue hover:text-market-blue transition-all"
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="space-y-4">
                <div className="relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Palavra-chave, cidade, bairro..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 text-sm font-medium outline-none focus:border-market-blue focus:ring-2 focus:ring-market-blue/10 transition-all"
                    onKeyDown={e => { if (e.key === 'Enter') handleSearchSubmit(); }}
                  />
                </div>

                <button 
                  onClick={handleSearchSubmit}
                  className="w-full bg-market-blue hover:bg-blue-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-market-blue/20"
                >
                  Pesquisar
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Properties */}
      <section className="py-24 px-6 md:px-12 bg-market-bg">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="space-y-4">
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
                <div className="w-12 h-px bg-market-blue"></div>
                <span className="text-market-blue font-bold text-[11px] uppercase tracking-[0.3em]">{t('home.featured.label')}</span>
              </motion.div>
              <h2 className="text-3xl md:text-5xl font-display font-black text-market-navy tracking-tight">
                {t('home.featured.title')}
              </h2>
            </div>
            
            <button 
              onClick={() => onNavigate('imoveis')} 
              className="group flex items-center gap-3 text-market-navy font-bold text-xs uppercase tracking-widest hover:text-market-blue transition-all bg-white px-6 py-3 rounded-full border border-slate-200 hover:border-market-blue/30 shadow-sm"
            >
              {t('home.featured.viewall')} 
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProperties.map((property, idx) => (
              <motion.div 
                key={property.id} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => onViewProperty(property.id)} 
                className="group cursor-pointer bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 flex flex-col"
              >
                <div className="relative h-60 overflow-hidden">
                  <div className="absolute inset-0 bg-market-navy/10 group-hover:bg-transparent z-10 transition-colors duration-500"></div>
                  <img src={property.image || undefined} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 ease-out" alt={property.title} />
                  
                  <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                    <span className="bg-market-navy/90 backdrop-blur-md text-white px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] shadow-lg">
                      {property.deal_type}
                    </span>
                    {property.is_promo && (
                      <span className="bg-market-accent/90 backdrop-blur-md text-white px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] shadow-lg flex items-center gap-1 animate-pulse">
                        <Sparkles size={10} /> Promoção
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 size={14} className="text-market-blue" />
                    <span className="text-[10px] font-bold text-market-slate uppercase tracking-widest">{property.type}</span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-market-navy leading-snug mb-2 group-hover:text-market-blue transition-colors line-clamp-2">
                    {property.title}
                  </h3>
                  
                  <p className="text-sm text-slate-500 mb-6 flex-1 flex items-start gap-1">
                    <MapPin size={14} className="min-w-[14px] mt-1 text-slate-400" />
                    <span className="line-clamp-1">{property.location}</span>
                  </p>
                  
                  <div className="pt-5 border-t border-slate-100 flex items-end justify-between">
                    <div>
                      {property.is_promo && property.old_price && (
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-xs line-through text-slate-400 font-medium">
                            {property.old_price.toLocaleString()} MT
                          </p>
                        </div>
                      )}
                      <p className="text-xl font-black text-market-navy tracking-tight">
                        {property.price.toLocaleString()} <span className="text-xs text-market-slate font-medium">MT</span>
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center gap-1 text-slate-600">
                        <BedDouble size={16} /> 
                        <span className="text-[10px] font-bold">{property.bedrooms}</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 text-slate-600">
                        <Maximize2 size={16} /> 
                        <span className="text-[10px] font-bold">{property.area}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Core Values & Philosophy */}
      <section className="py-24 bg-market-navy relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-market-blue/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-market-accent/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3"></div>
        
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-10">
              <div className="space-y-4">
                <span className="inline-block border border-white/20 text-white/80 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.3em]">
                  {t('home.philosophy.tag')}
                </span>
                <h2 className="text-4xl md:text-5xl font-display font-black text-white tracking-tight leading-[1.1]">
                  {t('home.philosophy.title')}
                </h2>
              </div>
              <p className="text-white/60 text-lg font-light leading-relaxed max-w-md">
                {t('home.philosophy.desc')}
              </p>
                              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-white/10">
                {[
                  { icon: ShieldCheck, title: t('home.curation.title'), desc: t('home.curation.desc') },
                  { icon: Waves, title: t('home.engineering.title'), desc: t('home.engineering.desc') },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <item.icon className="text-market-gold" size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1.5">{item.title}</h4>
                      <p className="text-white/50 text-xs leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-market-blue to-market-accent rounded-[2.5rem] transform rotate-3 scale-105 opacity-20 blur-xl"></div>
              <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl aspect-[4/5] lg:aspect-square">
                <img 
                  loading="lazy" 
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1200" 
                  className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-[2000ms] ease-out" 
                  alt="Consultoria Exclusive" 
                />
                <div className="absolute inset-0 bg-market-navy/20 hover:bg-transparent transition-colors duration-700"></div>
              </div>
            </motion.div>
            
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomeView;
