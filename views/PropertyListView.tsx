
import React, { useState } from 'react';
import { Filter, MapPin, Building2, Ruler, BedDouble, Bath } from 'lucide-react';
import { MOCK_PROPERTIES } from '../constants';

const PropertyListView: React.FC = () => {
  const [filter, setFilter] = useState('Todos');

  return (
    <div className="py-12 px-4 md:px-8 max-w-7xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 mb-4">Explore nossos Imóveis</h1>
        <p className="text-slate-500">Encontre a moradia dos seus sonhos em nosso catálogo completo.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 shrink-0 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Filter size={18} className="text-blue-600" /> Filtros
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Finalidade</label>
                <div className="space-y-2">
                  {['Todos', 'Venda', 'Arrendamento'].map(type => (
                    <button 
                      key={type}
                      onClick={() => setFilter(type)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                        filter === type ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Preço Máximo</label>
                <input type="range" className="w-full accent-blue-600" />
                <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1">
                  <span>0 MZN</span>
                  <span>50M MZN</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Property Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MOCK_PROPERTIES
              .filter(p => filter === 'Todos' || p.dealType === filter)
              .map(property => (
              <div key={property.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                <div className="relative h-56 overflow-hidden">
                  <img src={property.image} alt={property.title} className="w-full h-full object-cover" />
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md text-blue-600 font-black px-4 py-2 rounded-xl text-sm shadow-lg">
                    {property.price.toLocaleString('pt-PT', { style: 'currency', currency: 'MZN', minimumFractionDigits: 0 })}
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-blue-600 font-bold text-[10px] uppercase tracking-widest mb-2">
                    <Building2 size={12} /> {property.type} • {property.dealType}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{property.title}</h3>
                  <p className="text-sm text-slate-500 flex items-center gap-1 mb-6">
                    <MapPin size={14} /> {property.location}
                  </p>
                  
                  <div className="mt-auto grid grid-cols-3 gap-2 text-slate-500 border-t border-slate-50 pt-4">
                    <div className="flex flex-col items-center">
                      <BedDouble size={18} className="text-slate-300 mb-1" />
                      <span className="text-[10px] font-bold">{property.beds} Camas</span>
                    </div>
                    <div className="flex flex-col items-center border-x border-slate-50">
                      <Bath size={18} className="text-slate-300 mb-1" />
                      <span className="text-[10px] font-bold">{property.baths} WC</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Ruler size={18} className="text-slate-300 mb-1" />
                      <span className="text-[10px] font-bold">{property.area}m²</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyListView;
