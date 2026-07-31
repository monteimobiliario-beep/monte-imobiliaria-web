import React from 'react';
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
    <footer className="bg-market-navy text-white/60 pt-16 pb-8 px-6 md:px-12 border-t border-white/5 relative mt-auto">
      {/* Botão Rolar para Cima */}
      <button 
        onClick={scrollToTop}
        className="absolute -top-6 right-8 md:right-12 w-12 h-12 bg-market-blue text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-90 transition-all z-20"
        title="Rolar para Cima"
      >
        <ChevronUp size={24} />
      </button>

      <div className="max-w-[1500px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 flex items-center justify-center bg-white/5 rounded-2xl p-2 transition-all">
              <img src={systemLogo || undefined} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-xl text-white leading-none tracking-tight">{settings.companyName}</span>
              <span className="text-xs uppercase tracking-[0.3em] text-market-blue font-bold mt-1">{settings.tagline}</span>
            </div>
          </div>
          <p className="text-sm leading-relaxed font-medium text-white/50 max-w-sm">
            {t('footer.tagline')}
          </p>
          <div className="flex gap-4">
            <a href="https://web.facebook.com/profile.php?id=100090022435019" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-xl hover:bg-market-blue hover:text-white transition-all border border-white/10 flex items-center justify-center" aria-label="Facebook"><Facebook size={20} /></a>
            <a href="https://www.instagram.com/monteimobiliaria?igsh=MWF5Zzk1ejdwMjJ6Mw==" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-xl hover:bg-market-blue hover:text-white transition-all border border-white/10 flex items-center justify-center" aria-label="Instagram"><Instagram size={20} /></a>
            <a href="https://www.linkedin.com/in/monte-imobili%C3%A1ria-a8345a300?utm_source=share_via&utm_content=profile&utm_medium=member_android" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-xl hover:bg-market-blue hover:text-white transition-all border border-white/10 flex items-center justify-center" aria-label="LinkedIn"><Linkedin size={20} /></a>
          </div>
        </div>

        <div>
          <h4 className="text-white font-display font-bold text-xs uppercase tracking-widest mb-6">{t('footer.links.title')}</h4>
          <ul className="space-y-4 text-sm font-bold uppercase tracking-widest">
            <li><NavLink to="/" className="hover:text-market-blue transition-all">{t('nav.home')}</NavLink></li>
            <li><NavLink to="/imoveis" className="hover:text-market-blue transition-all">{t('nav.catalog')}</NavLink></li>
            <li><NavLink to="/servicos" className="hover:text-market-blue transition-all">{t('nav.services')}</NavLink></li>
            <li><NavLink to="/login" className="text-white/40 hover:text-amber-500 transition-all">{t('footer.links.staff')}</NavLink></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-display font-bold text-xs uppercase tracking-widest mb-6">{t('footer.units.title')}</h4>
          <ul className="space-y-4 text-sm font-bold uppercase tracking-widest">
            <li className="text-white/40 flex items-center gap-2"><MapPin size={16} className="text-market-blue" /> Beira</li>
            <li className="text-white/40 flex items-center gap-2"><MapPin size={16} className="text-market-blue" /> Maputo</li>
            <li className="text-white/40 flex items-center gap-2"><MapPin size={16} className="text-market-blue" /> Nampula</li>
          </ul>
        </div>

        <div>
           <h4 className="text-white font-display font-bold text-xs uppercase tracking-widest mb-6">{t('footer.contact.title')}</h4>
          <ul className="space-y-4 text-sm font-medium italic">
            <li>
              <a href="https://wa.me/258875018283" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-market-blue transition-colors">
                <Phone size={18} className="text-market-blue shrink-0" />
                <span>+258 87 501 8283</span>
              </a>
            </li>
            <li className="break-all text-white/50">
              <a href="mailto:info@monteimobiliaria.com" className="flex items-center gap-3 hover:text-market-blue transition-colors">
                <Mail size={18} className="text-market-blue shrink-0" />
                info@monteimobiliaria.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-[1500px] mx-auto pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold uppercase tracking-[0.2em] text-white/30">
        <p>© 2024 Monte Hub Group.</p>
        <div className="flex gap-6">
          <button className="hover:text-white transition-colors">{t('footer.legal.privacy')}</button>
          <button className="hover:text-white transition-colors">{t('footer.legal.terms')}</button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
