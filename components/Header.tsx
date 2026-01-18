
import React from 'react';
import { User } from '../types';
import { Bell, Search, LogOut, Menu } from 'lucide-react';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onOpenSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onOpenSidebar }) => {
  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0">
      <div className="flex items-center gap-4">
        <button onClick={onOpenSidebar} className="md:hidden text-slate-500 p-2 hover:bg-slate-100 rounded-lg">
          <Menu size={24} />
        </button>
        <div className="hidden sm:flex relative max-w-xs md:max-w-md w-full">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Pesquisar..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
        </button>
        
        <div className="h-8 w-px bg-slate-200"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-900 leading-none">{user.name}</p>
            <p className="text-xs text-slate-500 mt-1">{user.role}</p>
          </div>
          <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-100" />
          <button 
            onClick={onLogout}
            className="ml-2 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
            title="Sair do sistema"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
