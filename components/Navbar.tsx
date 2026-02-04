
import React, { useState, useEffect } from 'react';
import { Menu, X, Phone, Mail, MapPin, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isLoggedIn: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate, isLoggedIn }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [systemLogo, setSystemLogo] = useState(localStorage.getItem('monte_custom_logo') || 'https://i.ibb.co/LzfNdf7Y/building-logo.png');

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
      {/* Top Info Bar */}
      <div className="hidden lg:flex bg-slate-900 text-slate-300 py-2 px-8 justify-between text-xs font-medium">
        <div className="flex gap-6">
          <a href="https://wa.me/258875018283" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
            <Phone size={12} className="text-blue-500" /> +258 87 501 8283
          </a>
          <a href="mailto:monteimobiliario@gmail.com" className="flex items-center gap-2 hover:text-white transition-colors">
            <Mail size={12} className="text-blue-500" /> monteimobiliario@gmail.com
          </a>
        </div>
        <a href="https://www.google.com/maps/search/?api=1&query=Bairro+Alto+da+Manga,+Beira,+Moçambique" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
          <MapPin size={12} className="text-blue-500" /> Alto da Manga, Beira
        </a>
      </div>

      {/* Main Navbar */}
      <nav className="bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm px-4 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={() => onNavigate('home')} className="flex items-center gap-4 group">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center p-2 shadow-xl shadow-blue-500/10 group-hover:scale-105 transition-transform overflow-hidden border border-slate-50">
              <img src={systemLogo} alt="Monte Logo" className="w-full h-full object-contain" />
            </div>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => onNavigate(link.path)}
                className={`text-sm font-semibold transition-colors ${
                  currentPath === link.path ? 'text-blue-600' : 'text-slate-600 hover:text-blue-500'
                }`}
              >
                {link.name}
              </button>
            ))}
            <button
              onClick={() => onNavigate(isLoggedIn ? 'dashboard' : 'login')}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
            >
              <UserIcon size={16} />
              {isLoggedIn ? 'Aceder Hub' : 'Login Staff'}
            </button>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden text-slate-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-2 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => { onNavigate(link.path); setIsMenuOpen(false); }}
                className="block w-full text-left px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-lg"
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
