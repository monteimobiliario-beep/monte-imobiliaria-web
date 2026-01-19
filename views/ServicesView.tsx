
import React from 'react';
import { MOCK_SERVICES } from '../constants';
import * as LucideIcons from 'lucide-react';

const ServicesView: React.FC = () => {
  return (
    <div className="py-20 px-4 md:px-8 max-w-7xl mx-auto animate-in fade-in duration-700">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Nossos Serviços Especializados</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Suporte técnico em manutenção e gestão operacional completa para o seu património.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_SERVICES.map((service) => {
          const IconComponent = (LucideIcons as any)[service.icon] || LucideIcons.HelpCircle;
          return (
            <div key={service.id} className="group p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
                <IconComponent size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">{service.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-6 flex-1">{service.description}</p>
              <button className="text-blue-600 text-xs font-bold flex items-center gap-2 border-b-2 border-transparent hover:border-blue-600 pb-1 transition-all">
                Solicitar Orçamento <LucideIcons.ArrowRight size={14} />
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-20 bg-slate-900 rounded-[40px] p-10 md:p-16 text-center text-white relative overflow-hidden">
        <h2 className="text-2xl md:text-3xl font-black mb-6 relative z-10">Precisa de assistência imediata?</h2>
        <p className="text-slate-400 mb-10 relative z-10 max-w-lg mx-auto italic text-sm">Disponíveis para manutenção corretiva e gestão de staff em toda a Beira.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
          <a href="tel:+258875018283" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2">
            <LucideIcons.Phone size={18} /> Ligar agora
          </a>
          <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-black transition-all border border-white/20">
            Falar no WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServicesView;
