
import React, { useState, useEffect } from 'react';
import { 
  X, Wallet, Users, LayoutTemplate, Briefcase, Truck, Settings2, 
  RefreshCw, ChevronRight, Zap
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { User } from '../types';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  user: User;
  isOpen: boolean;
  toggleSidebar: () => void;
}

import { useBranding } from '../BrandingContext';

const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate, user, isOpen, toggleSidebar }) => {
  const { settings } = useBranding();
  const [stats, setStats] = useState({ revenue: 0, employees: 0, properties: 0 });
  const [isHovered, setIsHovered] = useState(false);
  
  const systemLogo = settings.logoUrl;

  useEffect(() => {
    fetchMiniStats();
  }, []);

  async function fetchMiniStats() {
    try {
      const [txRes, empRes, propRes] = await Promise.all([
        supabase.from('transactions').select('amount').eq('type', 'RECEITA'),
        supabase.from('employees').select('*', { count: 'exact', head: true }),
        supabase.from('properties').select('*', { count: 'exact', head: true })
      ]);
      const rev = (txRes.data || []).reduce((a, b) => a + Number(b.amount || 0), 0);
      setStats({
        revenue: rev,
        employees: empRes.count || 0,
        properties: propRes.count || 0
      });
    } catch (e) {}
  }

  const hubItems = [
    { label: 'Fluxo Financeiro', sub: 'Cash Control', val: `${(stats.revenue/1000).toFixed(0)}k`, path: 'finance', icon: <Wallet size={20} />, activeColor: 'bg-market-blue', glowColor: 'shadow-market-blue/40' },
    { label: 'Gestão Staff', sub: 'Recursos', val: stats.employees.toString(), path: 'hr', icon: <Users size={20} />, activeColor: 'bg-market-blue', glowColor: 'shadow-market-blue/40' },
    { label: 'Catálogo Ativo', sub: 'Imóveis', val: stats.properties.toString(), path: 'catalog', icon: <LayoutTemplate size={20} />, activeColor: 'bg-market-blue', glowColor: 'shadow-market-blue/40' },
    { label: 'Obras & Projetos', sub: 'Build Ops', val: 'V14', path: 'projects', icon: <Briefcase size={20} />, activeColor: 'bg-market-blue', glowColor: 'shadow-market-blue/40' },
    { label: 'Operações Frota', sub: 'Logística', val: 'Active', path: 'fleet', icon: <Truck size={20} />, activeColor: 'bg-market-blue', glowColor: 'shadow-market-blue/40' },
    { label: 'Configurações', sub: 'Security', val: 'v15', path: 'admin', icon: <Settings2 size={20} />, activeColor: 'bg-market-blue', glowColor: 'shadow-market-blue/40' },
  ];

  return (
    <>
      <div 
        onMouseEnter={() => setIsHovered(true)}
        className="fixed inset-y-0 left-0 w-6 z-[100] transition-all bg-transparent cursor-pointer"
      />

      <aside 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed inset-y-0 left-0 z-[110] p-3 flex flex-col transition-all duration-700 cubic-bezier(0.19, 1, 0.22, 1) ${
          isHovered || isOpen ? 'translate-x-0 opacity-100' : '-translate-x-[90%] opacity-0 pointer-events-none'
        } w-64 md:w-72`}
      >
        <div className="flex-1 bg-market-navy/95 backdrop-blur-3xl rounded-[2rem] border border-white/10 shadow-[40px_0_100px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden relative ring-1 ring-white/10">
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          
          <div className="p-2 border-b border-white/5 flex items-center justify-between relative z-10">
            <div className="flex items-center group/logo cursor-pointer" onClick={() => onNavigate('dashboard')}>
              <div className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center p-1 shadow-2xl group-hover/logo:scale-110 group-hover/logo:rotate-3 transition-all duration-500 overflow-hidden">
                <img 
                  src={systemLogo || undefined} 
                  className="w-full h-full object-contain" 
                  alt="Logo" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/lucide-react/lucide/main/icons/building-2.svg';
                  }}
                />
              </div>
            </div>
            <button onClick={toggleSidebar} className="md:hidden text-slate-500 hover:text-white transition-colors p-1.5"><X size={16} /></button>
          </div>

          <nav className="flex-1 px-2 py-1.5 space-y-0.5 overflow-y-auto custom-scrollbar-dark relative z-10">
            <div className="mb-1 px-2 flex items-center justify-between">
              <span className="text-[6px] font-black text-slate-500 uppercase tracking-[0.3em]">Operações Core</span>
              <button onClick={fetchMiniStats} className="p-1 hover:bg-white/5 rounded-lg text-slate-600 hover:text-market-blue transition-all active:rotate-180 duration-700">
                <RefreshCw size={8} />
              </button>
            </div>

            {hubItems.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    onNavigate(item.path);
                    if (window.innerWidth < 768) toggleSidebar();
                  }}
                  className={`w-full group flex items-center justify-between p-1 rounded-[0.5rem] transition-all duration-500 border ${
                    isActive 
                    ? `bg-white/10 border-white/20 shadow-xl ${item.glowColor} brightness-110` 
                    : 'hover:bg-white/[0.05] border-transparent hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-700 ${
                      isActive ? `${item.activeColor} text-white shadow-lg` : 'bg-white/5 text-slate-500 group-hover:text-white group-hover:bg-white/10'
                    }`}>
                      {React.cloneElement(item.icon as React.ReactElement, { size: 10 })}
                    </div>
                    <div className="text-left">
                      <span className={`block text-[6.5px] font-black uppercase tracking-[0.05em] leading-none mb-0.5 transition-all ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>{item.label}</span>
                      <span className={`text-[5px] font-bold uppercase tracking-widest transition-all ${isActive ? 'text-white/40' : 'text-slate-600 group-hover:text-slate-400'}`}>{item.sub}</span>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-1">
                    <span className={`text-[6px] font-black tracking-tighter transition-all ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`}>{item.val}</span>
                    <ChevronRight size={8} className={`transition-all duration-700 ${isActive ? 'text-white opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                  </div>
                </button>
              );
            })}
          </nav>

          <div className="p-2 bg-black/40 mt-auto border-t border-white/5">
            <div className="bg-white/[0.01] rounded-[1rem] p-1.5 border border-white/5 flex flex-col gap-1.5 group/footer transition-all duration-500 hover:bg-white/[0.03] hover:border-white/10 shadow-inner">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                     <div className="w-1 h-1 bg-market-accent rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>
                     <span className="text-[6px] font-black text-market-accent uppercase tracking-[0.2em]">Sync Active</span>
                  </div>
                  <Zap size={8} className="text-slate-700 group-hover/footer:text-market-blue transition-all duration-700 group-hover/footer:scale-110" />
               </div>
               <div className="flex items-center gap-2">
                  <div className="relative group/avatar">
                     <img src={user.avatar || undefined} className="w-6 h-6 rounded-lg object-cover ring-2 ring-white/5 transition-transform duration-500 group-hover/avatar:scale-105" alt="User" />
                  </div>
                  <div className="min-w-0">
                     <p className="text-[8px] font-black text-white truncate leading-none mb-0.5">{user.name}</p>
                     <p className="text-[5.5px] font-bold text-slate-500 uppercase truncate tracking-widest">{user.role}</p>
                  </div>
               </div>
            </div>
            <p className="text-center mt-2 text-[5px] font-black text-slate-800 uppercase tracking-[0.6em]">Monte Hub v15.5</p>
          </div>
        </div>
      </aside>

    </>
  );
};

export default Sidebar;
