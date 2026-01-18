
import React from 'react';
import { MOCK_SERVICES } from '../constants';
import * as LucideIcons from 'lucide-react';

const ServicesView: React.FC = () => {
  return (
    <div className="py-20 px-4 md:px-8 max-w-7xl mx-auto animate-in fade-in duration-700">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Nossos Serviços Especializados</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Oferecemos suporte técnico completo para garantir que seu imóvel esteja sempre em perfeitas condições.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {MOCK_SERVICES.map((service) => {
          const IconComponent = (LucideIcons as any)[service.icon] || LucideIcons.HelpCircle;
          return (
            <div key={service.id} className="group p-10 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all flex flex-col md:flex-row gap-8">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
                <IconComponent size={40} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">{service.title}</h3>
                <p className="text-slate-500 leading-relaxed mb-6">{service.description}</p>
                <button className="text-blue-600 font-bold flex items-center gap-2 border-b-2 border-transparent hover:border-blue-600 pb-1 transition-all">
                  Solicitar Orçamento <LucideIcons.ArrowRight size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-20 bg-slate-900 rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
        <h2 className="text-3xl md:text-4xl font-black mb-6 relative z-10">Precisa de assistência imediata?</h2>
        <p className="text-slate-400 mb-10 relative z-10 max-w-lg mx-auto italic">Disponíveis para emergências e manutenções preventivas em toda a região do Alto da Manga.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
          <a href="tel:+258875018283" className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-black transition-all flex items-center justify-center gap-2">
            <LucideIcons.Phone size={20} /> Ligar agora
          </a>
          <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-10 py-5 rounded-2xl font-black transition-all border border-white/20">
            Falar no WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServicesView;
