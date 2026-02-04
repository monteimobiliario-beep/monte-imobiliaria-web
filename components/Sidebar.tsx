
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

const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate, user, isOpen, toggleSidebar }) => {
  const [stats, setStats] = useState({ revenue: 0, employees: 0, properties: 0 });
  const [isHovered, setIsHovered] = useState(false);
  
  // Estado do logotipo sincronizado
  const [systemLogo, setSystemLogo] = useState(localStorage.getItem('monte_custom_logo') || 'https://i.ibb.co/LzfNdf7Y/building-logo.png');

  useEffect(() => {
    fetchMiniStats();
    
    // Listener para atualizações de marca em tempo real
    const handleLogoUpdate = (e: any) => {
      if (e.detail) setSystemLogo(e.detail);
    };
    window.addEventListener('monteLogoUpdated', handleLogoUpdate);
    return () => window.removeEventListener('monteLogoUpdated', handleLogoUpdate);
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
    { label: 'Fluxo Financeiro', sub: 'Cash Control', val: `${(stats.revenue/1000).toFixed(0)}k`, path: 'finance', icon: <Wallet size={20} />, activeColor: 'bg-emerald-500', glowColor: 'shadow-emerald-500/40' },
    { label: 'Gestão Staff', sub: 'Recursos', val: stats.employees.toString(), path: 'hr', icon: <Users size={20} />, activeColor: 'bg-blue-500', glowColor: 'shadow-blue-500/40' },
    { label: 'Catálogo Ativo', sub: 'Imóveis', val: stats.properties.toString(), path: 'catalog', icon: <LayoutTemplate size={20} />, activeColor: 'bg-indigo-500', glowColor: 'shadow-indigo-500/40' },
    { label: 'Obras & Projetos', sub: 'Build Ops', val: 'V14', path: 'projects', icon: <Briefcase size={20} />, activeColor: 'bg-amber-500', glowColor: 'shadow-amber-500/40' },
    { label: 'Operações Frota', sub: 'Logística', val: 'Active', path: 'fleet', icon: <Truck size={20} />, activeColor: 'bg-rose-500', glowColor: 'shadow-rose-500/40' },
    { label: 'Configurações', sub: 'Security', val: 'v15', path: 'admin', icon: <Settings2 size={20} />, activeColor: 'bg-purple-500', glowColor: 'shadow-purple-500/40' },
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
        className={`fixed inset-y-0 left-0 z-[110] p-6 flex flex-col transition-all duration-700 cubic-bezier(0.19, 1, 0.22, 1) ${
          isHovered || isOpen ? 'translate-x-0 opacity-100' : '-translate-x-[90%] opacity-0 pointer-events-none'
        } w-80 md:w-96`}
      >
        <div className="flex-1 bg-slate-950/95 backdrop-blur-3xl rounded-[3.5rem] border border-white/10 shadow-[50px_0_120px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden relative ring-1 ring-white/10">
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          
          <div className="p-10 border-b border-white/5 flex items-center justify-between relative z-10">
            <div className="flex items-center group/logo cursor-pointer" onClick={() => onNavigate('dashboard')}>
              <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center p-3 shadow-2xl group-hover/logo:scale-110 group-hover/logo:rotate-3 transition-all duration-500 overflow-hidden">
                <img src={systemLogo} className="w-full h-full object-contain" alt="Logo" />
              </div>
            </div>
            <button onClick={toggleSidebar} className="md:hidden text-slate-500 hover:text-white transition-colors p-2"><X size={28} /></button>
          </div>

          <nav className="flex-1 px-6 py-8 space-y-4 overflow-y-auto custom-scrollbar-dark relative z-10">
            <div className="mb-8 px-4 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Sistemas Centrais</span>
              <button onClick={fetchMiniStats} className="p-2 hover:bg-white/5 rounded-xl text-slate-600 hover:text-indigo-400 transition-all active:rotate-180 duration-700">
                <RefreshCw size={14} />
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
                  className={`w-full group flex items-center justify-between p-5 rounded-[2.5rem] transition-all duration-500 border ${
                    isActive 
                    ? `bg-white/10 border-white/20 shadow-2xl scale-[1.04] ${item.glowColor} brightness-110` 
                    : 'hover:bg-white/[0.07] border-transparent hover:border-white/10 hover:scale-[1.05] hover:brightness-110'
                  }`}
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700 ${
                      isActive ? `${item.activeColor} text-white shadow-lg` : 'bg-white/5 text-slate-500 group-hover:text-white group-hover:bg-white/10'
                    } group-hover:scale-110 group-hover:-rotate-3`}>
                      {item.icon}
                    </div>
                    <div className="text-left">
                      <span className={`block text-xs font-black uppercase tracking-[0.15em] leading-none mb-2 transition-all group-hover:tracking-wider ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>{item.label}</span>
                      <span className={`text-[9px] font-bold uppercase tracking-widest transition-all ${isActive ? 'text-white/40' : 'text-slate-600 group-hover:text-slate-300'}`}>{item.sub}</span>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <span className={`text-xs font-black tracking-tighter transition-all group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`}>{item.val}</span>
                    <ChevronRight size={18} className={`transition-all duration-700 ${isActive ? 'text-white opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-1'}`} />
                  </div>
                </button>
              );
            })}
          </nav>

          <div className="p-8 bg-black/50 mt-auto border-t border-white/5">
            <div className="bg-white/[0.03] rounded-[3rem] p-6 border border-white/5 flex flex-col gap-5 group/footer transition-all duration-500 hover:bg-white/[0.07] hover:border-white/10 shadow-inner">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_#10b981]"></div>
                     <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Cloud Online</span>
                  </div>
                  <Zap size={16} className="text-slate-600 group-hover/footer:text-amber-400 transition-all duration-700 group-hover/footer:scale-125 group-hover/footer:rotate-12" />
               </div>
               <div className="flex items-center gap-5">
                  <div className="relative group/avatar">
                     <div className="absolute -inset-1.5 bg-gradient-to-tr from-indigo-500 to-blue-500 rounded-[1.4rem] blur opacity-0 group-hover/avatar:opacity-50 transition duration-700"></div>
                     <img src={user.avatar} className="w-12 h-12 rounded-[1.2rem] object-cover ring-2 ring-white/10 relative z-10 transition-transform duration-500 group-hover/avatar:scale-105" alt="User" />
                  </div>
                  <div className="min-w-0">
                     <p className="text-sm font-black text-white truncate leading-none mb-2">{user.name}</p>
                     <p className="text-[9px] font-bold text-slate-500 uppercase truncate tracking-widest">{user.role}</p>
                  </div>
               </div>
            </div>
            <p className="text-center mt-6 text-[8px] font-black text-slate-700 uppercase tracking-[0.6em]">Monte Hub v15.0</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
