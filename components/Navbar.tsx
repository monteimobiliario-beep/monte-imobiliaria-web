
import React, { useState, useEffect } from 'react';
import { Menu, X, Phone, Mail, MapPin, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isLoggedIn: boolean;
}

import { useBranding } from '../BrandingContext';

const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate, isLoggedIn }) => {
  const { settings } = useBranding();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const systemLogo = settings.logoUrl;

  const navLinks = [
    { name: 'Início', path: 'home' },
    { name: 'Imóveis', path: 'imoveis' },
    { name: 'Serviços', path: 'servicos' },
    { name: 'Sobre Nós', path: 'sobre' },
    { name: 'Carreira', path: 'carreira' },
    { name: 'Contacto', path: 'contato' },
  ];

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
          <div className="flex items-center gap-2">
            <MapPin size={12} className="text-market-blue" /> Alto da Manga, Beira, Moçambique
          </div>
        </div>
      )}

      {/* Main Navbar - Modern Portal */}
      <nav className={`transition-all duration-500 border-b ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md border-slate-200 py-2 shadow-lg scale-[0.98] mt-2 mx-4 rounded-2xl' 
          : 'bg-white border-slate-100 py-4 shadow-sm'
      } px-4 lg:px-12`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={() => onNavigate('home')} className="flex items-center gap-3 group text-left">
            <div className={`transition-all duration-500 flex items-center justify-center ${scrolled ? 'w-12 h-12' : 'w-16 h-16'}`}>
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
                <span className="text-[10px] uppercase tracking-widest text-market-blue font-black mt-1">Gestão de Propriedades</span>
              )}
            </div>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => onNavigate(link.path)}
                className={`text-xs font-bold uppercase tracking-widest transition-all relative py-2 group ${
                  currentPath === link.path ? 'text-market-blue' : 'text-slate-500 hover:text-market-navy'
                }`}
              >
                {link.name}
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-market-blue transition-transform duration-300 origin-left ${currentPath === link.path ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
              </button>
            ))}
            <div className="w-px h-6 bg-slate-200 mx-2"></div>
            <button
              onClick={() => onNavigate(isLoggedIn ? 'dashboard' : 'login')}
              className="flex items-center gap-2 bg-market-blue text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
            >
              <UserIcon size={14} />
              {isLoggedIn ? 'Sistema' : 'Entrar'}
            </button>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-6 space-y-2 animate-in slide-in-from-top-4 duration-300">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => { onNavigate(link.path); setIsMenuOpen(false); }}
                className={`block w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-colors ${
                  currentPath === link.path ? 'bg-market-blue/10 text-market-blue' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {link.name}
              </button>
            ))}
            <div className="pt-4 px-4">
               <button
                 onClick={() => { onNavigate(isLoggedIn ? 'dashboard' : 'login'); setIsMenuOpen(false); }}
                 className="w-full flex items-center justify-center gap-2 bg-market-blue text-white py-4 rounded-xl text-xs font-bold uppercase tracking-widest"
               >
                 <UserIcon size={16} />
                 {isLoggedIn ? 'Painel de Gestão' : 'Entrar no Sistema'}
               </button>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
