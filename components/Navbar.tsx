
import React, { useState, useEffect } from 'react';
import { Menu, X, Phone, Mail, MapPin, User as UserIcon, Globe } from 'lucide-react';
import { useBranding } from '../BrandingContext';
import { useTranslation, Language } from '../src/i18nContext';
import { NavLink, useNavigate } from 'react-router-dom';

interface NavbarProps {
  isLoggedIn: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ isLoggedIn }) => {
  const { settings } = useBranding();
  const { language, setLanguage, t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const systemLogo = settings.logoUrl;

  const navLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.catalog'), path: '/imoveis' },
    { name: t('nav.services'), path: '/servicos' },
    { name: t('nav.about'), path: '/sobre' },
    { name: t('nav.careers'), path: '/carreira' },
    { name: t('nav.contact'), path: '/contato' },
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'pt' ? 'en' : 'pt');
  };

  return (
    <div className={`w-full sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'translate-y-0' : ''}`}>
      {/* Top Info Bar - Professional */}
      {!scrolled && (
        <div className="hidden lg:flex bg-market-navy text-white/70 py-2.5 px-8 justify-between text-[11px] font-semibold tracking-wider animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="flex gap-8">
            <a href="https://wa.me/258875018283" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-market-blue transition-colors">
              <Phone size={12} className="text-market-blue" /> +258 87 501 8283
            </a>
            <a href="mailto:monteimobiliario@gmail.com" className="flex items-center gap-2 hover:text-market-blue transition-colors">
              <Mail size={12} className="text-market-blue" /> monteimobiliario@gmail.com
            </a>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <MapPin size={12} className="text-market-blue" /> Alto da Manga, Beira, Moçambique
            </div>
          </div>
        </div>
      )}

      {/* Main Navbar - Modern Portal */}
      <nav className={`transition-all duration-500 border-b ${
        scrolled 
          ? 'bg-white/70 backdrop-blur-md border-slate-200/50 py-1.5 shadow-lg scale-[0.98] mt-2 mx-4 rounded-2xl' 
          : 'bg-white border-slate-100 py-3 shadow-sm'
      } px-4 lg:px-12`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-3 group text-left">
            <div className={`transition-all duration-500 flex items-center justify-center ${scrolled ? 'w-10 h-10' : 'w-16 h-16'}`}>
              <img 
                src={systemLogo || null} 
                alt="Monte Logo" 
                className="w-full h-full object-contain" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/lucide-react/lucide/main/icons/building-2.svg';
                }}
              />
            </div>
            <div className={`flex flex-col transition-all duration-500 origin-left ${scrolled ? 'scale-90 -ml-1' : ''}`}>
              <span className="font-bold text-lg lg:text-xl leading-none tracking-tight text-market-navy whitespace-nowrap">Monte <span className="text-market-blue">Imobiliária</span></span>
              {!scrolled && (
                <span className="text-[10px] uppercase tracking-widest text-market-blue font-black mt-1">{t('nav.tagline')}</span>
              )}
            </div>
          </NavLink>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-8">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) => `text-xs font-bold uppercase tracking-widest transition-all relative py-2 group ${
                    isActive ? 'text-market-blue' : 'text-slate-500 hover:text-market-navy'
                  }`}
                >
                  {({ isActive }) => (
                    <>
                      {link.name}
                      <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-market-blue transition-transform duration-300 origin-left ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            <div className="w-px h-6 bg-slate-200 mx-2"></div>
            
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors text-xs font-bold text-slate-600 uppercase tracking-widest"
            >
              <Globe size={14} className="text-market-blue" />
              {language.toUpperCase()}
            </button>

            <NavLink
              to={isLoggedIn ? '/dashboard' : '/login'}
              className="flex items-center gap-2 bg-market-blue text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
            >
              <UserIcon size={14} />
              {isLoggedIn ? t('nav.dashboard') : t('nav.login')}
            </NavLink>
          </div>

          {/* Mobile Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <button 
              onClick={toggleLanguage}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Globe size={20} />
            </button>
            <button className="text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-6 space-y-2 animate-in slide-in-from-top-4 duration-300">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) => `block w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-colors ${
                  isActive ? 'bg-market-blue/10 text-market-blue' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {link.name}
              </NavLink>
            ))}
            <div className="pt-4 px-4">
               <NavLink
                 to={isLoggedIn ? '/dashboard' : '/login'}
                 onClick={() => setIsMenuOpen(false)}
                 className="w-full flex items-center justify-center gap-2 bg-market-blue text-white py-4 rounded-xl text-xs font-bold uppercase tracking-widest"
               >
                 <UserIcon size={16} />
                 {isLoggedIn ? t('nav.dashboard') : t('nav.login')}
               </NavLink>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
