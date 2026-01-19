
import React, { useState } from 'react';
import { Filter, MapPin, Building2, Ruler, BedDouble, Bath, Search } from 'lucide-react';
import { MOCK_PROPERTIES } from '../constants';
import { PropertyCategory } from '../types';

interface PropertyListViewProps {
  onViewProperty: (id: string) => void;
}

const PropertyListView: React.FC<PropertyListViewProps> = ({ onViewProperty }) => {
  const [dealTypeFilter, setDealTypeFilter] = useState('Todos');
  const [categoryFilter, setCategoryFilter] = useState<PropertyCategory | 'Todas'>('Todas');

  const categories: (PropertyCategory | 'Todas')[] = ['Todas', 'Casa', 'Apartamento', 'Guest House', 'Hotel', 'Condomínio', 'Terreno'];

  return (
    <div className="py-12 px-4 md:px-8 max-w-7xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">Explore o nosso Catálogo</h1>
        <p className="text-slate-500 text-sm">Encontre desde hotéis para investimento a apartamentos para o dia a dia.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-64 shrink-0 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm sticky top-24">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-sm">
              <Filter size={16} className="text-blue-600" /> Filtros Rápidos
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-3">Finalidade</label>
                <div className="flex flex-col gap-1">
                  {['Todos', 'Venda', 'Aluguel'].map(type => (
                    <button 
                      key={type}
                      onClick={() => setDealTypeFilter(type)}
                      className={`text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                        dealTypeFilter === type ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-3">Categorias</label>
                <div className="flex flex-col gap-1">
                  {categories.map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                        categoryFilter === cat ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {MOCK_PROPERTIES
              .filter(p => (dealTypeFilter === 'Todos' || p.dealType === dealTypeFilter))
              .filter(p => (categoryFilter === 'Todas' || p.type === categoryFilter))
              .map(property => (
              <div 
                key={property.id} 
                onClick={() => onViewProperty(property.id)}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="relative h-48 overflow-hidden">
                  <img src={property.image} alt={property.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-3 left-3 bg-blue-600 text-white text-[9px] font-black px-2 py-1 rounded shadow">
                    {property.dealType}
                  </div>
                  <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md text-blue-600 font-black px-3 py-1.5 rounded-lg text-xs shadow-lg">
                    {property.price.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN', minimumFractionDigits: 0 })}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-blue-600 font-bold text-[9px] uppercase tracking-widest mb-2">
                    <Building2 size={12} /> {property.type}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1 leading-snug group-hover:text-blue-600 transition-colors">{property.title}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mb-4">
                    <MapPin size={12} /> {property.location}
                  </p>
                  
                  <div className="mt-auto grid grid-cols-3 gap-2 text-slate-500 border-t border-slate-50 pt-3">
                    <div className="flex flex-col items-center">
                      <BedDouble size={14} className="text-slate-300 mb-0.5" />
                      <span className="text-[9px] font-bold">{property.beds} Qtos</span>
                    </div>
                    <div className="flex flex-col items-center border-x border-slate-50">
                      <Bath size={14} className="text-slate-300 mb-0.5" />
                      <span className="text-[9px] font-bold">{property.baths} WCs</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Ruler size={14} className="text-slate-300 mb-0.5" />
                      <span className="text-[9px] font-bold">{property.area}m²</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {MOCK_PROPERTIES
            .filter(p => (dealTypeFilter === 'Todos' || p.dealType === dealTypeFilter))
            .filter(p => (categoryFilter === 'Todas' || p.type === categoryFilter)).length === 0 && (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
               <Search size={40} className="mx-auto text-slate-300 mb-4" />
               <p className="text-slate-500 font-medium">Nenhum imóvel encontrado nestas categorias.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyListView;
