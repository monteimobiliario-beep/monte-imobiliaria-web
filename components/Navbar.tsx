
import React, { useState } from 'react';
import { Menu, X, Phone, Mail, MapPin, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isLoggedIn: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate, isLoggedIn }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
          <span className="flex items-center gap-2"><Phone size={12} className="text-blue-500" /> +258 87 501 8283</span>
          <span className="flex items-center gap-2"><Mail size={12} className="text-blue-500" /> monteimobiliario@gmail.com</span>
        </div>
        <span className="flex items-center gap-2"><MapPin size={12} className="text-blue-500" /> Alto da Manga, Moçambique</span>
      </div>

      {/* Main Navbar */}
      <nav className="bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm px-4 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={() => onNavigate('home')} className="flex items-center gap-3 group">
            <div className="w-12 h-12 flex items-center justify-center transition-transform group-hover:scale-105">
              <img src="https://raw.githubusercontent.com/filipe-beira/static-assets/main/monte-chaisa-logo.png" alt="Monte & Chaisa Logo" className="w-full h-full object-contain" />
            </div>
            <div className="text-left">
              <span className="block text-xl font-black text-slate-900 leading-none">MONTE</span>
              <span className="block text-[10px] font-bold text-blue-600 tracking-widest uppercase">Imobiliária</span>
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
              {isLoggedIn ? 'Acessar ERP' : 'Área do Cliente'}
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
            <button
              onClick={() => { onNavigate('login'); setIsMenuOpen(false); }}
              className="w-full mt-2 bg-blue-600 text-white py-4 rounded-xl font-bold"
            >
              Entrar
            </button>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
