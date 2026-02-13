
import React, { useState, useEffect } from 'react';
import { Menu, X, Phone, Mail, MapPin, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isLoggedIn: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate, isLoggedIn }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const DEFAULT_LOGO = 'https://raw.githubusercontent.com/lucide-react/lucide/main/icons/building-2.svg';
  const [systemLogo, setSystemLogo] = useState(localStorage.getItem('monte_custom_logo') || DEFAULT_LOGO);

  useEffect(() => {
    const handleLogoUpdate = (e: any) => {
      if (e.detail) setSystemLogo(e.detail);
    };
    window.addEventListener('monteLogoUpdated', handleLogoUpdate);
    return () => window.removeEventListener('monteLogoUpdated', handleLogoUpdate);
  }, []);

  const navLinks = [
    { name: 'Início', path: 'home' },
    { name: 'Imóveis', path: 'imoveis' },
    { name: 'Serviços', path: 'servicos' },
    { name: 'Sobre Nós', path: 'sobre' },
    { name: 'Carreira', path: 'carreira' },
    { name: 'Contacto', path: 'contato' },
  ];

  return (
    <div className="w-full sticky top-0 z-50">
      {/* Top Info Bar - Ultra Compact */}
      <div className="hidden lg:flex bg-slate-900 text-slate-400 py-1 px-8 justify-between text-[9px] font-black uppercase tracking-wider">
        <div className="flex gap-4">
          <a href="https://wa.me/258875018283" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
            <Phone size={9} className="text-blue-500" /> +258 87 501 8283
          </a>
          <a href="mailto:monteimobiliario@gmail.com" className="flex items-center gap-2 hover:text-white transition-colors">
            <Mail size={9} className="text-blue-500" /> monteimobiliario@gmail.com
          </a>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={9} className="text-blue-500" /> Alto da Manga, Beira
        </div>
      </div>

      {/* Main Navbar - Thinner py-1.5 */}
      <nav className="bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm px-4 lg:px-8 py-1.5">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2 group text-left">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1 shadow-sm group-hover:scale-105 transition-transform overflow-hidden border border-slate-50">
              <img src={systemLogo} alt="Monte Logo" className="w-full h-full object-contain" />
            </div>
            <span className="hidden sm:block font-black text-slate-900 text-xs tracking-tighter italic uppercase">MONTE IMOBILIÁRIA</span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => onNavigate(link.path)}
                className={`text-[10px] font-black uppercase tracking-widest transition-colors px-2 py-1 rounded-md ${
                  currentPath === link.path ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:text-blue-500 hover:bg-slate-50'
                }`}
              >
                {link.name}
              </button>
            ))}
            <div className="w-px h-4 bg-slate-200 mx-2"></div>
            <button
              onClick={() => onNavigate(isLoggedIn ? 'dashboard' : 'login')}
              className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-sm"
            >
              <UserIcon size={12} />
              {isLoggedIn ? 'Sistema' : 'Entrar'}
            </button>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden text-slate-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-1 animate-in slide-in-from-top-2">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => { onNavigate(link.path); setIsMenuOpen(false); }}
                className="block w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-blue-600 hover:bg-slate-50"
              >
                {link.name}
              </button>
            ))}
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
