
import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin } from 'lucide-react';
import { useBranding } from '../BrandingContext';

interface FooterProps {
  onNavigate: (path: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { settings } = useBranding();
  const systemLogo = settings.logoUrl;

  return (
    <footer className="bg-market-navy text-white/50 pt-8 pb-4 px-6 md:px-12 border-t border-white/5">
      <div className="max-w-[1500px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center p-2 bg-white/5 rounded-xl border border-white/5">
              <img src={systemLogo} alt="Logo" className="w-full h-full object-contain brightness-0 invert" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-base text-white leading-none tracking-tight">{settings.companyName}</span>
              <span className="text-[7px] uppercase tracking-[0.3em] text-market-blue font-bold">{settings.tagline}</span>
            </div>
          </div>
          <p className="text-[10px] leading-relaxed font-medium text-white/30 max-w-[200px]">
            Curadoria imobiliária e manutenção em Moçambique.
          </p>
          <div className="flex gap-3">
            <button className="p-2 bg-white/5 rounded-lg hover:bg-market-blue hover:text-white transition-all border border-white/5"><Facebook size={14} /></button>
            <button className="p-2 bg-white/5 rounded-lg hover:bg-market-blue hover:text-white transition-all border border-white/5"><Instagram size={14} /></button>
            <button className="p-2 bg-white/5 rounded-lg hover:bg-market-blue hover:text-white transition-all border border-white/5"><Linkedin size={14} /></button>
          </div>
        </div>

        <div>
          <h4 className="text-white font-display font-bold text-[9px] uppercase tracking-widest mb-3">Links</h4>
          <ul className="space-y-2 text-[9px] font-bold uppercase tracking-widest">
            <li><button onClick={() => onNavigate('home')} className="hover:text-market-blue transition-all">Início</button></li>
            <li><button onClick={() => onNavigate('imoveis')} className="hover:text-market-blue transition-all">Imóveis</button></li>
            <li><button onClick={() => onNavigate('servicos')} className="hover:text-market-blue transition-all">Serviços</button></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-display font-bold text-[9px] uppercase tracking-widest mb-3">Unidades</h4>
          <ul className="space-y-2 text-[9px] font-bold uppercase tracking-widest">
            <li className="text-white/20">Beira</li>
            <li className="text-white/20">Maputo</li>
            <li className="text-white/20">Nampula</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-display font-bold text-[9px] uppercase tracking-widest mb-3">Contacto</h4>
          <ul className="space-y-2 text-[10px] font-medium italic">
            <li>
              <a href="https://wa.me/258875018283" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-market-blue transition-colors">
                <Phone size={12} className="text-market-blue shrink-0" />
                <span>+258 87 501 8283</span>
              </a>
            </li>
            <li className="break-all opacity-40">
                monteimobiliario@gmail.com
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-[1500px] mx-auto pt-4 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-3 text-[8px] font-bold uppercase tracking-[0.2em] text-white/10">
        <p>© 2024 Monte Hub Group.</p>
        <div className="flex gap-4">
          <button className="hover:text-white">Privacidade</button>
          <button className="hover:text-white">Termos</button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
