
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, MapPin, Building2, Ruler, BedDouble, Bath, Search, Star, Maximize2, ChevronDown, CheckCircle2, ArrowRight } from 'lucide-react';
import { MOCK_PROPERTIES } from '../constants';
import { PropertyCategory } from '../types';

interface PropertyListViewProps {
  onViewProperty: (id: string) => void;
}

import { useBranding } from '../BrandingContext';

const PropertyListView: React.FC<PropertyListViewProps> = ({ onViewProperty }) => {
  const { settings } = useBranding();
  const [dealTypeFilter, setDealTypeFilter] = useState('Todos');
  const [categoryFilter, setCategoryFilter] = useState<PropertyCategory | 'Todas'>('Todas');

  const categories: (PropertyCategory | 'Todas')[] = ['Todas', 'Casa', 'Apartamento', 'Guest House', 'Hotel', 'Condomínio', 'Terreno'];

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
              Explore <span className="text-gradient">Legados Patrimoniais.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-white/40 text-sm font-medium leading-normal"
            >
              Uma coleção rigorosa de ativos selecionados para investidores de elite.
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
                 <h3 className="font-bold text-[10px] text-market-navy uppercase tracking-widest">Filtros</h3>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">Finalidade</label>
                  <div className="flex flex-col gap-0.5">
                    {['Todos', 'Venda', 'Aluguel'].map(type => (
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
                  <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">Categorias</label>
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
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Resultados: <span className="text-market-navy">
                    {MOCK_PROPERTIES
                    .filter(p => (dealTypeFilter === 'Todos' || p.dealType === dealTypeFilter))
                    .filter(p => (categoryFilter === 'Todas' || p.type === categoryFilter)).length} Unidades
                  </span>
               </p>
               <div className="text-[10px] font-bold text-market-navy flex items-center gap-2 cursor-pointer hover:text-market-blue transition-colors">
                  Recentes <ChevronDown size={12} />
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {MOCK_PROPERTIES
                  .filter(p => (dealTypeFilter === 'Todos' || p.dealType === dealTypeFilter))
                  .filter(p => (categoryFilter === 'Todas' || p.type === categoryFilter))
                  .map((property, idx) => (
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
                      <img src={property.image} alt={property.title} referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        <span className="bg-market-navy/90 backdrop-blur-sm text-white text-[8px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                          {property.dealType}
                        </span>
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
                        <div className="text-sm font-black text-market-navy">
                          {property.price.toLocaleString('pt-MZ')} <span className="text-[9px] font-medium opacity-50">MT</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-400">
                           <div className="flex items-center gap-1 text-[10px] font-bold"><BedDouble size={12} /> {property.beds}</div>
                           <div className="flex items-center gap-1 text-[10px] font-bold"><Maximize2 size={12} /> {property.area}</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            {MOCK_PROPERTIES
              .filter(p => (dealTypeFilter === 'Todos' || p.dealType === dealTypeFilter))
              .filter(p => (categoryFilter === 'Todas' || p.type === categoryFilter)).length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-40 bg-white rounded-[5rem] border-2 border-dashed border-slate-100 shadow-2xl"
              >
                 <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 text-slate-300">
                    <Search size={48} strokeWidth={1} />
                 </div>
                 <h4 className="text-3xl font-display font-bold text-market-navy mb-4 tracking-tight">Nenhuma Correspondência</h4>
                 <p className="text-market-slate text-lg font-medium max-w-sm mx-auto mb-12">Não encontramos ativos com estes critérios exatos no momento.</p>
                 <button onClick={() => {setDealTypeFilter('Todos'); setCategoryFilter('Todas');}} className="px-12 py-5 bg-market-navy text-white rounded-full font-display font-bold text-[10px] uppercase tracking-widest hover:bg-market-blue transition-all shadow-2xl">Limpar Todos os Filtros</button>
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
