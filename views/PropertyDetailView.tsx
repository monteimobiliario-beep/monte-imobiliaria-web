
import React, { useState } from 'react';
import { MOCK_PROPERTIES } from '../constants';
import { 
  MapPin, BedDouble, Bath, Ruler, ArrowLeft, Share2, Heart, 
  ShieldCheck, ChevronRight, ChevronLeft, MessageSquare, Phone, Mail, 
  Maximize2 
} from 'lucide-react';

interface PropertyDetailViewProps {
  propertyId: string | null;
  onBack: () => void;
}

const PropertyDetailView: React.FC<PropertyDetailViewProps> = ({ propertyId, onBack }) => {
  const property = MOCK_PROPERTIES.find(p => p.id === propertyId);
  
  // Lista unificada de imagens (principal + galeria)
  const images = property ? [property.image, ...property.gallery] : [];
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!property) return (
    <div className="py-20 text-center">
      <p>Imóvel não encontrado.</p>
      <button onClick={onBack} className="text-blue-600 font-bold mt-4">Voltar</button>
    </div>
  );

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 md:px-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Breadcrumbs & Actions */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold text-sm transition-all group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Voltar ao Catálogo
        </button>
        <div className="flex gap-2">
           <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-blue-600 transition-all" title="Partilhar"><Share2 size={18} /></button>
           <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-red-500 transition-all" title="Favoritos"><Heart size={18} /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content (Images & Info) */}
        <div className="lg:col-span-2 space-y-10">
          {/* Enhanced Gallery Section */}
          <div className="space-y-6">
            <div className="relative group aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl bg-slate-100">
              {/* Main Image */}
              <img 
                src={images[currentIndex]} 
                alt={`${property.title} - Imagem ${currentIndex + 1}`} 
                className="w-full h-full object-cover transition-all duration-500"
              />
              
              {/* Navigation Arrows */}
              <div className="absolute inset-0 flex items-center justify-between px-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={prevImage}
                  className="p-3 bg-white/90 backdrop-blur-md text-slate-900 rounded-full shadow-lg hover:bg-blue-600 hover:text-white transition-all transform hover:scale-110"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={nextImage}
                  className="p-3 bg-white/90 backdrop-blur-md text-slate-900 rounded-full shadow-lg hover:bg-blue-600 hover:text-white transition-all transform hover:scale-110"
                >
                  <ChevronRight size={24} />
                </button>
              </div>

              {/* Badges Overlay */}
              <div className="absolute top-6 left-6 flex gap-3">
                <div className="bg-blue-600 text-white px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest shadow-lg">
                  {property.dealType}
                </div>
                <div className="bg-white/90 backdrop-blur-md text-slate-900 px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest shadow-lg flex items-center gap-2">
                  <Maximize2 size={14} /> {currentIndex + 1} / {images.length}
                </div>
              </div>
            </div>

            {/* Thumbnail Navigation */}
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {images.map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => setCurrentIndex(i)}
                  className={`relative shrink-0 w-32 aspect-video rounded-2xl overflow-hidden border-4 transition-all ${
                    currentIndex === i 
                    ? 'border-blue-600 ring-4 ring-blue-100 scale-95' 
                    : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} className="w-full h-full object-cover" alt={`Miniatura ${i + 1}`} />
                  {currentIndex === i && (
                    <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center">
                       <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Property Header Info */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                  <h1 className="text-3xl font-black text-slate-900 mb-2">{property.title}</h1>
                  <p className="flex items-center gap-2 text-slate-500 font-medium">
                    <MapPin size={18} className="text-blue-600" /> {property.location}, Moçambique
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Valor de {property.dealType === 'Venda' ? 'Venda' : 'Renda'}</p>
                  <p className="text-4xl font-black text-blue-600 tracking-tighter">
                    {property.price.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                  </p>
                </div>
             </div>

             {/* Icons Stats */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8 border-y border-slate-50">
                {[
                  { icon: <BedDouble size={24} />, label: 'Quartos', value: property.beds },
                  { icon: <Bath size={24} />, label: 'Banheiros', value: property.baths },
                  { icon: <Ruler size={24} />, label: 'Área Total', value: `${property.area} m²` },
                  { icon: <ShieldCheck size={24} />, label: 'Vigilância', value: 'Disponível' },
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col items-center text-center p-4 bg-slate-50 rounded-2xl hover:bg-blue-50 transition-colors cursor-default group">
                    <div className="text-blue-600 mb-2 group-hover:scale-110 transition-transform">{stat.icon}</div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                    <span className="text-base font-black text-slate-900">{stat.value}</span>
                  </div>
                ))}
             </div>

             <div className="mt-8 space-y-6">
                <h2 className="text-xl font-black text-slate-900">Sobre este Imóvel</h2>
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-600 leading-relaxed font-medium">
                    {property.description}
                  </p>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    Este imóvel destaca-se pela sua localização estratégica e potencial de valorização. Quer procure uma residência familiar ou um investimento para o mercado de arrendamento hoteleiro, a Monte Imobiliária garante todo o suporte documental necessário para uma transação segura.
                  </p>
                </div>
             </div>
          </div>
        </div>

        {/* Sidebar (Contact Agent) */}
        <aside className="space-y-8">
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl sticky top-24">
              <h3 className="text-xl font-black text-slate-900 mb-6">Contactar Agente</h3>
              
              <div className="flex items-center gap-4 mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <img src={`https://picsum.photos/seed/agent_${property.id}/100`} className="w-14 h-14 rounded-xl object-cover ring-2 ring-white" alt="Consultor" />
                <div>
                  <p className="text-sm font-black text-slate-900">Equipa Comercial</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Atendimento Dedicado</p>
                </div>
              </div>

              <div className="space-y-4">
                <a 
                  href={`https://wa.me/258875018283?text=Olá, tenho interesse no imóvel: ${property.title}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-lg shadow-green-500/20 active:scale-95"
                >
                  <MessageSquare size={20} /> Enviar WhatsApp
                </a>
                <button className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all active:scale-95">
                  <Mail size={20} /> Solicitar Info
                </button>
                <a 
                  href="tel:+258875018283"
                  className="w-full border-2 border-slate-100 hover:border-blue-600 hover:text-blue-600 py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all text-slate-500 active:scale-95"
                >
                  <Phone size={20} /> Ligar Agora
                </a>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50">
                <p className="text-[10px] text-slate-400 font-bold text-center uppercase tracking-widest leading-relaxed">
                  Ref: MC-{property.type.toUpperCase().substring(0,3)}-{property.id.padStart(4, '0')}
                </p>
              </div>
           </div>

           <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <ShieldCheck size={120} />
              </div>
              <h4 className="font-black text-lg mb-4 relative z-10">Segurança Monte</h4>
              <ul className="space-y-3 relative z-10">
                {[
                  'Verificação de Matrícula',
                  'Vistoria de Infraestrutura',
                  'Contrato de Mediação Legal',
                  'Mediação de Pagamentos'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs font-bold text-blue-50">
                    <ChevronRight size={14} className="text-blue-300" /> {item}
                  </li>
                ))}
              </ul>
           </div>
        </aside>
      </div>
    </div>
  );
};

export default PropertyDetailView;
