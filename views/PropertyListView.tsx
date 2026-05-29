
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, MapPin, Building2, Ruler, BedDouble, Bath, Search, Star, Maximize2, ChevronDown, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { supabase, db } from '../supabaseClient';
import { Property, PropertyCategory } from '../types';
import { useBranding } from '../BrandingContext';
import { useTranslation } from '../src/i18nContext';

import { useNavigate, useLocation } from 'react-router-dom';

interface PropertyListViewProps {
  // Props no longer needed
}

const PropertyListView: React.FC<PropertyListViewProps> = () => {
  const { t } = useTranslation();
  const { settings } = useBranding();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [dealTypeFilter, setDealTypeFilter] = useState(t('props.filter.todos'));
  const [categoryFilter, setCategoryFilter] = useState<string>(t('props.filter.all'));
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  
  const navigate = useNavigate();
  const { search } = useLocation();

  const onViewProperty = (id: string) => {
    navigate(`/imovel/${id}`);
  };

  const categories: string[] = [t('props.filter.all'), t('type.house'), t('type.apartment'), t('type.guesthouse'), t('type.hotel'), t('type.condo'), t('type.land')];

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(search);
    const qSearch = queryParams.get('search') || '';
    const qCity = queryParams.get('city') || '';
    if (qSearch) setSearchTerm(qSearch);
    if (qCity) setCityFilter(qCity);
  }, [search]);

  useEffect(() => {
    // Reset filters when language changes to match new translation strings if needed
    // But better to use internal keys. For now, let's just make sure they match.
    setDealTypeFilter(t('props.filter.todos'));
    setCategoryFilter(t('props.filter.all'));
  }, [t]);

  async function fetchProperties() {
    setLoading(true);
    try {
      const { data, error } = await db.catalog('properties').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setProperties((data || []).map((p: any) => {
        const mc = p.map_coords ? (typeof p.map_coords === 'string' ? JSON.parse(p.map_coords) : p.map_coords) : {};
        return {
          ...p,
          is_active: p.is_active !== undefined && p.is_active !== null ? p.is_active : (mc.is_active !== undefined ? mc.is_active : true),
          is_promo: p.is_promo !== undefined && p.is_promo !== null ? !!p.is_promo : (mc.is_promo !== undefined ? !!mc.is_promo : false),
          old_price: p.old_price !== undefined && p.old_price !== null ? Number(p.old_price) : (mc.old_price !== undefined && mc.old_price !== null ? Number(mc.old_price) : undefined)
        };
      }));
    } catch (err) {
      console.error("Erro ao carregar imóveis:", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredProperties = properties
    .filter(p => p.is_active !== false)
    .filter(p => (dealTypeFilter === t('props.filter.todos') || p.deal_type === dealTypeFilter))
    .filter(p => (categoryFilter === t('props.filter.all') || p.type === categoryFilter))
    .filter(p => {
      if (!cityFilter) return true;
      return p.location?.toLowerCase().includes(cityFilter.toLowerCase());
    })
    .filter(p => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        p.title?.toLowerCase().includes(term) ||
        p.location?.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term) ||
        p.type?.toLowerCase().includes(term)
      );
    });

  return (
    <div className="bg-[#FDFCFB]">
      {/* Search & Breadcrumb Header */}
      <section className="bg-market-navy py-12 px-6 md:px-12 relative overflow-hidden border-b border-white/5">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-market-blue/5 to-transparent pointer-events-none"></div>
        <div className="max-w-[1500px] mx-auto relative z-10">
          <div className="max-w-xl space-y-3">
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-market-blue font-display font-bold text-[9px] uppercase tracking-[0.4em]"
            >
              {settings.legacyTitle}
            </motion.p>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-display font-black text-white tracking-tight"
            >
              {t('props.hero.title')} <span className="text-gradient">{t('props.hero.subtitle')}</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-white/40 text-sm font-medium leading-normal"
            >
              {t('props.hero.desc')}
            </motion.p>
          </div>
        </div>
      </section>

      <div className="py-12 px-6 md:px-12 lg:px-16 max-w-[1800px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 xl:gap-12 text-[13px]">
          {/* Minimalist Sidebar */}
          <aside className="w-full lg:w-40 xl:w-48 shrink-0">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6 sticky top-28 py-4"
            >
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                 <Filter size={12} className="text-market-blue" />
                 <h3 className="font-bold text-[10px] text-market-navy uppercase tracking-widest">{t('props.filter.title')}</h3>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">{t('props.filter.deal')}</label>
                  <div className="flex flex-col gap-0.5">
                    {[t('props.filter.todos'), t('deal.sale'), t('deal.rent')].map(type => (
                      <button 
                        key={type}
                        onClick={() => setDealTypeFilter(type)}
                        className={`text-left py-1 rounded text-[10px] font-medium transition-all ${
                          dealTypeFilter === type ? 'text-market-blue font-bold px-1 border-l-2 border-market-blue' : 'text-slate-500 hover:text-market-navy'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">{t('props.filter.category')}</label>
                  <div className="flex flex-col gap-0.5">
                    {categories.map(cat => (
                      <button 
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`text-left py-1 rounded text-[10px] font-medium transition-all ${
                          categoryFilter === cat ? 'text-market-blue font-bold px-1 border-l-2 border-market-blue' : 'text-slate-500 hover:text-market-navy'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </aside>

          {/* High Density Grid Section */}
          <div className="flex-1 space-y-8">
            {/* Search and Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex-1 w-full flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                <Search size={16} className="text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Pesquisar por bairro, condomínio ou palavra-chave..."
                  className="w-full bg-transparent outline-none text-xs font-semibold text-slate-700 placeholder:text-slate-400"
                />
              </div>
              
              <div className="w-full sm:w-56 flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 relative">
                <MapPin size={16} className="text-market-blue shrink-0" />
                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="w-full bg-transparent outline-none text-xs font-semibold text-slate-700 cursor-pointer appearance-none pr-8"
                >
                  <option value="">Todas as Cidades</option>
                  <option value="Beira">Beira</option>
                  <option value="Maputo">Maputo</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {t('props.results')}: <span className="text-market-navy">
                    {filteredProperties.length} {t('props.units')}
                  </span>
               </p>
               <div className="text-[10px] font-bold text-market-navy flex items-center gap-2 cursor-pointer hover:text-market-blue transition-colors">
                  {t('props.recent')} <ChevronDown size={12} />
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {loading ? (
                <div className="col-span-full py-20 flex flex-col items-center gap-4">
                  <Loader2 className="animate-spin text-market-blue" size={32} />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('props.loading')}</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredProperties.map((property, idx) => (
                  <motion.div 
                    key={property.id} 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => onViewProperty(property.id)}
                    className="group cursor-pointer bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img src={property.image || undefined} alt={property.title} referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                        <span className="bg-market-navy/90 backdrop-blur-sm text-white text-[8px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md w-fit">
                          {property.deal_type}
                        </span>
                        {property.is_promo && (
                          <span className="bg-rose-600 backdrop-blur-sm text-white text-[8px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md animate-pulse w-fit">
                            % Promoção
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[9px] font-bold text-market-blue uppercase tracking-widest">
                           {property.type}
                        </div>
                        <h3 className="text-sm font-bold text-market-navy tracking-tight line-clamp-1 group-hover:text-market-blue transition-colors">{property.title}</h3>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1">
                          <MapPin size={10} /> {property.location}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                        <div>
                          {property.is_promo && property.old_price && (
                            <div className="flex items-center gap-1.5 mb-1">
                              <p className="text-[9px] line-through text-slate-400 font-semibold leading-none">{property.old_price.toLocaleString('pt-MZ')} MT</p>
                              {property.old_price > property.price && (
                                <span className="bg-rose-500/10 text-rose-600 text-[8px] font-black px-1.5 py-0.5 rounded-full leading-none">
                                  -{Math.round(((property.old_price - property.price) / property.old_price) * 100)}%
                                </span>
                              )}
                            </div>
                          )}
                          <div className="text-sm font-black text-market-navy">
                            {property.price.toLocaleString('pt-MZ')} <span className="text-[9px] font-medium opacity-50">MT</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-slate-400">
                           <div className="flex items-center gap-1 text-[10px] font-bold"><BedDouble size={12} /> {property.bedrooms}</div>
                           <div className="flex items-center gap-1 text-[10px] font-bold"><Maximize2 size={12} /> {property.area}</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
            
            {!loading && filteredProperties.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-40 bg-white rounded-[5rem] border-2 border-dashed border-slate-100 shadow-2xl"
              >
                 <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 text-slate-300">
                    <Search size={48} strokeWidth={1} />
                 </div>
                 <h4 className="text-3xl font-display font-bold text-market-navy mb-4 tracking-tight">{t('props.empty.title')}</h4>
                 <p className="text-market-slate text-lg font-medium max-w-sm mx-auto mb-12">{t('props.empty.desc')}</p>
                 <button onClick={() => {setDealTypeFilter(t('props.filter.todos')); setCategoryFilter(t('props.filter.all'));}} className="px-12 py-5 bg-market-navy text-white rounded-full font-display font-bold text-[10px] uppercase tracking-widest hover:bg-market-blue transition-all shadow-2xl">{t('props.empty.button')}</button>
              </motion.div>
            )}
            
            {/* Pagination Placeholder High Density */}
            <div className="flex items-center justify-center gap-2 py-12">
               {[1, 2, 3].map(i => (
                 <div key={i} className={`h-1.5 rounded-full transition-all ${i === 1 ? 'w-8 bg-market-blue' : 'w-4 bg-slate-100 hover:bg-market-navy cursor-pointer'}`}></div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyListView;
