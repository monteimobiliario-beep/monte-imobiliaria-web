
import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const DEFAULT_LOGO = 'https://raw.githubusercontent.com/lucide-react/lucide/main/icons/building-2.svg';
  const [systemLogo, setSystemLogo] = useState(localStorage.getItem('monte_custom_logo') || DEFAULT_LOGO);

  useEffect(() => {
    const handleLogoUpdate = (e: any) => {
      if (e.detail) setSystemLogo(e.detail);
    };
    window.addEventListener('monteLogoUpdated', handleLogoUpdate);
    return () => window.removeEventListener('monteLogoUpdated', handleLogoUpdate);
  }, []);

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-16 h-16 flex items-center justify-center p-2 bg-white/5 rounded-2xl overflow-hidden border border-white/5">
              <img src={systemLogo} alt="Monte Imobiliária Logo" className="w-full h-full object-contain brightness-0 invert" />
            </div>
          </div>
          <p className="text-sm leading-relaxed mb-6">
            Líder em soluções imobiliárias e manutenção em Moçambique. Construindo confiança e lares desde o Alto da Manga.
          </p>
          <div className="flex gap-4">
            <button className="p-2 bg-slate-800 rounded-lg hover:bg-blue-600 transition-colors"><Facebook size={18} /></button>
            <button className="p-2 bg-slate-800 rounded-lg hover:bg-blue-600 transition-colors"><Instagram size={18} /></button>
            <button className="p-2 bg-slate-800 rounded-lg hover:bg-blue-600 transition-colors"><Linkedin size={18} /></button>
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Links Rápidos</h4>
          <ul className="space-y-4 text-sm">
            <li><button onClick={() => onNavigate('home')} className="hover:text-white hover:translate-x-1 transition-all text-left">Início</button></li>
            <li><button onClick={() => onNavigate('imoveis')} className="hover:text-white hover:translate-x-1 transition-all text-left">Ver Imóveis</button></li>
            <li><button onClick={() => onNavigate('servicos')} className="hover:text-white hover:translate-x-1 transition-all text-left">Nossos Serviços</button></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Serviços</h4>
          <ul className="space-y-4 text-sm">
            <li><button onClick={() => onNavigate('servicos')} className="hover:text-white text-left">Pintura e Acabamento</button></li>
            <li><button onClick={() => onNavigate('servicos')} className="hover:text-white text-left">Canalização e Hidráulica</button></li>
            <li><button onClick={() => onNavigate('servicos')} className="hover:text-white text-left">Consultoria Imobiliária</button></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Contacto</h4>
          <ul className="space-y-4 text-sm">
            <li>
              <a href="https://wa.me/258875018283" target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 hover:text-white transition-colors">
                <Phone size={18} className="text-blue-500 shrink-0" />
                <span>+258 87 501 8283</span>
              </a>
            </li>
            <li>
              <a href="mailto:monteimobiliario@gmail.com" className="flex items-start gap-3 hover:text-white transition-colors">
                <Mail size={18} className="text-blue-500 shrink-0" />
                <span className="break-all">monteimobiliario@gmail.com</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium uppercase tracking-widest text-slate-500">
        <p>© 2024 Gestão Imobiliária. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
