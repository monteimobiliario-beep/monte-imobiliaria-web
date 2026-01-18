
import React from 'react';
import { Search, MapPin, Building2, ShieldCheck, ThumbsUp, ArrowRight } from 'lucide-react';
import { MOCK_PROPERTIES, MOCK_SERVICES } from '../constants';

interface HomeViewProps {
  onNavigate: (path: string) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  return (
    <div className="animate-in fade-in duration-500">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1920" 
            alt="Hero Background" 
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            Encontre o imóvel ideal com a <span className="text-blue-400">Monte Imobiliária</span>
          </h1>
          <p className="text-lg text-slate-200 mb-10 max-w-2xl mx-auto">
            Venda, arrendamento e manutenção com a confiança que você merece. Descubra as melhores oportunidades em Moçambique.
          </p>

          {/* Search Bar */}
          <div className="bg-white p-2 rounded-2xl md:rounded-full shadow-2xl flex flex-col md:flex-row gap-2 max-w-3xl mx-auto">
            <div className="flex-1 flex items-center px-4 py-2 gap-3 border-b md:border-b-0 md:border-r border-slate-100">
              <MapPin size={20} className="text-blue-500" />
              <input type="text" placeholder="Onde você procura?" className="w-full bg-transparent outline-none text-slate-800 font-medium" />
            </div>
            <div className="flex-1 flex items-center px-4 py-2 gap-3">
              <Building2 size={20} className="text-blue-500" />
              <select className="bg-transparent outline-none text-slate-800 font-medium w-full appearance-none">
                <option>Todos os Tipos</option>
                <option>Casas</option>
                <option>Apartamentos</option>
                <option>Terrenos</option>
              </select>
            </div>
            <button onClick={() => onNavigate('imoveis')} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold flex items-center justify-center gap-2 transition-all">
              <Search size={18} />
              Pesquisar
            </button>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Destaques</h2>
              <p className="text-slate-500">Imóveis exclusivos selecionados para você.</p>
            </div>
            <button onClick={() => onNavigate('imoveis')} className="text-blue-600 font-bold flex items-center gap-2 hover:gap-3 transition-all">
              Ver todos os imóveis <ArrowRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {MOCK_PROPERTIES.filter(p => p.featured).map(property => (
              <div key={property.id} className="group cursor-pointer bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all overflow-hidden">
                <div className="relative h-64 overflow-hidden">
                  <img src={property.image} alt={property.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-4 left-4 bg-blue-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full">
                    {property.dealType}
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-blue-600 font-bold text-lg mb-1">
                    {property.price.toLocaleString('pt-PT', { style: 'currency', currency: 'MZN', minimumFractionDigits: 0 })}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{property.title}</h3>
                  <p className="text-sm text-slate-500 flex items-center gap-1 mb-6">
                    <MapPin size={14} /> {property.location}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50 text-slate-600 font-medium text-sm">
                    <span className="flex items-center gap-1.5"><Building2 size={16} /> {property.beds} Quartos</span>
                    <span className="flex items-center gap-1.5"><ThumbsUp size={16} /> {property.area}m²</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-4 md:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-black text-slate-900 mb-4">Por que escolher a Monte?</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">Oferecemos uma experiência imobiliária completa, da compra à manutenção preventiva.</p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Confiabilidade', icon: <ShieldCheck size={32} />, desc: 'Anos de experiência no mercado moçambicano garantindo transações seguras.' },
            { title: 'Atendimento Premium', icon: <ThumbsUp size={32} />, desc: 'Suporte personalizado desde a primeira visita até o pós-venda.' },
            { title: 'Especialistas Locais', icon: <MapPin size={32} />, desc: 'Equipa com profundo conhecimento das áreas mais valorizadas.' },
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-10 rounded-3xl border border-slate-100 text-center shadow-sm hover:-translate-y-2 transition-transform">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">{item.title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomeView;
