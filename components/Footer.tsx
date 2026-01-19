
import React from 'react';
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 flex items-center justify-center">
              <img src="https://raw.githubusercontent.com/filipe-beira/static-assets/main/monte-chaisa-logo.png" alt="Monte & Chaisa Logo" className="w-full h-full object-contain brightness-0 invert" />
            </div>
            <span className="text-2xl font-black text-white">MONTE</span>
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
            <li><button onClick={() => onNavigate('home')} className="hover:text-white hover:translate-x-1 transition-all">Início</button></li>
            <li><button onClick={() => onNavigate('imoveis')} className="hover:text-white hover:translate-x-1 transition-all">Ver Imóveis</button></li>
            <li><button onClick={() => onNavigate('servicos')} className="hover:text-white hover:translate-x-1 transition-all">Nossos Serviços</button></li>
            <li><button onClick={() => onNavigate('blog')} className="hover:text-white hover:translate-x-1 transition-all">Blog Imobiliário</button></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Serviços</h4>
          <ul className="space-y-4 text-sm">
            <li><button onClick={() => onNavigate('servicos')} className="hover:text-white">Pintura e Acabamento</button></li>
            <li><button onClick={() => onNavigate('servicos')} className="hover:text-white">Canalização e Hidráulica</button></li>
            <li><button onClick={() => onNavigate('servicos')} className="hover:text-white">Ar Condicionado</button></li>
            <li><button onClick={() => onNavigate('servicos')} className="hover:text-white">Consultoria Imobiliária</button></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Contacto</h4>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <Phone size={18} className="text-blue-500 shrink-0" />
              <span>+258 87 501 8283</span>
            </li>
            <li className="flex items-start gap-3">
              <Mail size={18} className="text-blue-500 shrink-0" />
              <span className="break-all">monteimobiliario@gmail.com</span>
            </li>
            <li className="flex items-start gap-3">
              <MapPin size={18} className="text-blue-500 shrink-0" />
              <span>Bairro Alto da Manga,<br />Moçambique</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium uppercase tracking-widest text-slate-500">
        <p>© 2024 Monte Imobiliária. Todos os direitos reservados.</p>
        <div className="flex gap-6">
          <button className="hover:text-white">Privacidade</button>
          <button className="hover:text-white">Termos</button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
