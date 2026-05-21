
import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin, ChevronUp } from 'lucide-react';
import { useBranding } from '../BrandingContext';
import { useTranslation } from '../src/i18nContext';

import { NavLink } from 'react-router-dom';

const Footer: React.FC = () => {
  const { settings } = useBranding();
  const { t } = useTranslation();
  const systemLogo = settings.logoUrl;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-market-navy text-white/50 pt-4 pb-2 px-6 md:px-12 border-t border-white/5 relative">
      {/* Botão Rolar para Cima */}
      <button 
        onClick={scrollToTop}
        className="absolute -top-6 right-8 md:right-12 w-10 h-10 bg-market-blue text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-90 transition-all z-20"
        title={t('footer.legal.terms')}
      >
        <ChevronUp size={20} />
      </button>

      <div className="max-w-[1500px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center transition-all">
              <img src={systemLogo || undefined} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-sm text-white leading-none tracking-tight">{settings.companyName}</span>
              <span className="text-[6px] uppercase tracking-[0.3em] text-market-blue font-bold">{settings.tagline}</span>
            </div>
          </div>
          <p className="text-[9px] leading-relaxed font-medium text-white/30 max-w-[200px]">
            {t('footer.tagline')}
          </p>
          <div className="flex gap-2">
            <a href="https://web.facebook.com/profile.php?id=100090022435019" target="_blank" rel="noopener noreferrer" className="p-1.5 bg-white/5 rounded-lg hover:bg-market-blue hover:text-white transition-all border border-white/5 flex items-center justify-center" aria-label="Facebook"><Facebook size={12} /></a>
            <a href="https://www.instagram.com/monteimobiliaria?igsh=MWF5Zzk1ejdwMjJ6Mw==" target="_blank" rel="noopener noreferrer" className="p-1.5 bg-white/5 rounded-lg hover:bg-market-blue hover:text-white transition-all border border-white/5 flex items-center justify-center" aria-label="Instagram"><Instagram size={12} /></a>
            <a href="https://www.linkedin.com/in/monte-imobili%C3%A1ria-a8345a300?utm_source=share_via&utm_content=profile&utm_medium=member_android" target="_blank" rel="noopener noreferrer" className="p-1.5 bg-white/5 rounded-lg hover:bg-market-blue hover:text-white transition-all border border-white/5 flex items-center justify-center" aria-label="LinkedIn"><Linkedin size={12} /></a>
          </div>
        </div>

        <div>
          <h4 className="text-white font-display font-bold text-[8px] uppercase tracking-widest mb-2">{t('footer.links.title')}</h4>
          <ul className="space-y-1 text-[8px] font-bold uppercase tracking-widest">
            <li><NavLink to="/" className="hover:text-market-blue transition-all">{t('nav.home')}</NavLink></li>
            <li><NavLink to="/imoveis" className="hover:text-market-blue transition-all">{t('nav.catalog')}</NavLink></li>
            <li><NavLink to="/servicos" className="hover:text-market-blue transition-all">{t('nav.services')}</NavLink></li>
            <li><NavLink to="/login" className="hover:text-amber-500 transition-all">{t('footer.links.staff')}</NavLink></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-display font-bold text-[8px] uppercase tracking-widest mb-2">{t('footer.units.title')}</h4>
          <ul className="space-y-1 text-[8px] font-bold uppercase tracking-widest">
            <li className="text-white/20">Beira</li>
            <li className="text-white/20">Maputo</li>
            <li className="text-white/20">Nampula</li>
          </ul>
        </div>

        <div>
           <h4 className="text-white font-display font-bold text-[8px] uppercase tracking-widest mb-2">{t('footer.contact.title')}</h4>
          <ul className="space-y-1 text-[9px] font-medium italic">
            <li>
              <a href="https://wa.me/258875018283" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-market-blue transition-colors">
                <Phone size={10} className="text-market-blue shrink-0" />
                <span>+258 87 501 8283</span>
              </a>
            </li>
            <li className="break-all opacity-40">
                monteimobiliario@gmail.com
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-[1500px] mx-auto pt-2 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-2 text-[7px] font-bold uppercase tracking-[0.2em] text-white/10">
        <p>© 2024 Monte Hub Group.</p>
        <div className="flex gap-4">
          <button className="hover:text-white">{t('footer.legal.privacy')}</button>
          <button className="hover:text-white">{t('footer.legal.terms')}</button>
        </div>
      </div>
    </footer>

  );
};

export default Footer;
