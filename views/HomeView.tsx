
import React, { useState, useEffect } from 'react';
import { Search, MapPin, Building2, ShieldCheck, ThumbsUp, ArrowRight, Star, MessageCircle, ChevronDown } from 'lucide-react';
import { MOCK_PROPERTIES } from '../constants';

interface HomeViewProps {
  onNavigate: (path: string) => void;
  onViewProperty: (id: string) => void;
}

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1600566753190-17f0bcd2a6c4?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200'
];

const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onViewProperty }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="animate-in fade-in duration-500">
      <section className="relative h-[340px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 transition-all duration-1000">
          {HERO_IMAGES.map((img, idx) => (
            <img 
              key={idx}
              src={img} 
              alt="Hero Background" 
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${idx === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
            />
          ))}
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-4xl font-black text-white mb-4 leading-tight drop-shadow-lg">
            Encontre o imóvel ideal com a <span className="text-blue-400">Monte Imobiliária</span>
          </h1>
          <p className="text-sm md:text-base text-slate-100 mb-6 max-w-xl mx-auto drop-shadow">
            Excelência em Venda, Aluguel e Gestão Hoteleira em Moçambique.
          </p>

          <div className="bg-white p-2 rounded-2xl md:rounded-full shadow-2xl flex flex-col md:flex-row gap-2 max-w-2xl mx-auto">
            <div className="flex-1 flex items-center px-4 py-2 gap-3 border-b md:border-b-0 md:border-r border-slate-100">
              <MapPin size={16} className="text-blue-500" />
              <input type="text" placeholder="Bairro ou Cidade..." className="w-full bg-transparent outline-none text-slate-800 font-medium text-xs" />
            </div>
            <div className="flex-1 flex items-center px-4 py-2 gap-3">
              <Building2 size={16} className="text-blue-500" />
              <select className="bg-transparent outline-none text-slate-800 font-medium w-full appearance-none text-xs">
                <option>Categorias</option>
                <option>Hotel</option>
                <option>Condomínio</option>
                <option>Guest House</option>
              </select>
            </div>
            <button onClick={() => onNavigate('imoveis')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-bold flex items-center justify-center gap-2 transition-all text-xs">
              <Search size={14} /> Pesquisar
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Imóveis Reais para Você</h2>
              <p className="text-slate-500 text-sm">Transparência e fotos reais em cada listagem.</p>
            </div>
            <button onClick={() => onNavigate('imoveis')} className="text-blue-600 font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all">
              Ver Catálogo Completo <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_PROPERTIES.filter(p => p.featured).slice(0, 6).map(property => (
              <div 
                key={property.id} 
                onClick={() => onViewProperty(property.id)}
                className="group cursor-pointer bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col"
              >
                <div className="relative h-48 overflow-hidden">
                  <img src={property.image} alt={property.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  <div className="absolute top-3 left-3 bg-blue-600 text-white text-[9px] font-black uppercase px-2 py-1 rounded-md">
                    {property.dealType}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="text-blue-600 font-black text-lg mb-1">
                    {property.price.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN', minimumFractionDigits: 0 })}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">{property.title}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mb-4">
                    <MapPin size={12} /> {property.location}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-50 text-slate-600 font-medium text-[11px]">
                    <span className="flex items-center gap-1"><Building2 size={14} /> {property.beds} Qts</span>
                    <span className="flex items-center gap-1"><ThumbsUp size={14} /> {property.area}m²</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 md:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-black text-center mb-12">O que dizem os nossos clientes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(5)].map((_, star) => <Star key={star} size={14} fill="currentColor" />)}
                </div>
                <p className="text-sm text-slate-600 italic mb-6">"Excelente serviço de gestão de condomínio. Transparência total nas contas e manutenção sempre em dia. Recomendo a Monte Imobiliária!"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden">
                    <img src={`https://picsum.photos/seed/user${i}/100`} alt="User" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Cliente Satisfeito {i}</p>
                    <p className="text-[10px] text-slate-400">Proprietário</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="fixed bottom-6 right-6 z-50">
        <button className="bg-green-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center gap-2">
          <MessageCircle size={24} />
          <span className="hidden md:block font-bold">Falar connosco</span>
        </button>
      </div>
    </div>
  );
};

export default HomeView;
