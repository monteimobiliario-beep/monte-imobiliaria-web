
import React from 'react';
// Fix: Module '../constants' does not export 'NAVIGATION'. Using 'ERP_NAVIGATION' instead.
import { ERP_NAVIGATION } from '../constants';
import { UserRole } from '../types';
import { X, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  userRole: UserRole;
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate, userRole, isOpen, toggleSidebar }) => {
  // Fix: Use the correctly named ERP_NAVIGATION constant for menu items.
  const filteredNav = ERP_NAVIGATION.filter(item => item.roles.includes(userRole));

  return (
    <div className={`fixed inset-y-0 left-0 z-50 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-300 ease-in-out bg-slate-900 text-slate-300 w-64 flex flex-col`}>
      <div className="p-6 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <LayoutGrid size={24} />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">M&C ERP</span>
        </div>
        <button onClick={toggleSidebar} className="md:hidden text-slate-400 hover:text-white">
          <X size={24} />
        </button>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {filteredNav.map((item) => (
          <button
            key={item.path}
            onClick={() => {
              onNavigate(item.path);
              if (window.innerWidth < 768) toggleSidebar();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              currentPath === item.path 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
              : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className={`${currentPath === item.path ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`}>
              {item.icon}
            </span>
            <span className="font-medium">{item.name}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-800">
        <div className="bg-slate-800 rounded-2xl p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Plano Atual</p>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-white">Enterprise</span>
            <span className="text-xs font-bold text-blue-400">Ativo</span>
          </div>
          <div className="w-full bg-slate-700 h-1.5 rounded-full">
            <div className="bg-blue-500 h-full rounded-full w-4/5"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
