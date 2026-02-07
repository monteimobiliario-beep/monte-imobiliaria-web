
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Wallet, Sparkles, X as CloseIcon, 
  Bot, RefreshCw,
  ArrowUpRight,
  Zap,
  Home,
  Users,
  PieChart as PieIcon,
  Waves,
  Target,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  Save,
  CheckCircle2,
  Loader2,
  TrendingDown,
  BarChart3,
  Palette,
  FileImage,
  Gauge,
  Activity,
  History,
  Briefcase,
  UserPlus,
  Linkedin
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { supabase } from '../supabaseClient';
import { getStrategicInsight } from '../geminiService';
import TodoList from '../components/TodoList';
import { Transaction, JobApplication } from '../types';

const DashboardView: React.FC = () => {
  const [stats, setStats] = useState({ 
    revenue: 0, 
    expenses: 0, 
    employees: 0, 
    properties: 0, 
    contacts: 0,
    pendingApps: 0 
  });
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [recentApps, setRecentApps] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [aiInsight, setAiInsight] = useState<string>('Analisando pulso financeiro...');
  
  const [logoUrl, setLogoUrl] = useState(localStorage.getItem('monte_custom_logo') || 'https://i.ibb.co/LzfNdf7Y/building-logo.png');

  useEffect(() => {
    fetchGlobalStats();
  }, []);

  async function fetchGlobalStats() {
    setIsSyncing(true);
    try {
      const [txRes, empRes, propRes, contactRes, appCountRes, recentAppsRes] = await Promise.all([
        supabase.from('transactions').select('*'),
        supabase.from('employees').select('*', { count: 'exact', head: true }),
        supabase.from('properties').select('*', { count: 'exact', head: true }),
        supabase.from('contact_requests').select('*', { count: 'exact', head: true }),
        supabase.from('job_applications').select('*', { count: 'exact', head: true }).eq('status', 'Pendente'),
        supabase.from('job_applications').select('*').order('created_at', { ascending: false }).limit(3)
      ]);

      const txs = txRes.data || [];
      setAllTransactions(txs);
      setRecentApps(recentAppsRes.data || []);
      
      const rev = txs.filter(t => t.type === 'RECEITA').reduce((a, b) => a + Number(b.amount || 0), 0);
      const exp = txs.filter(t => t.type === 'DESPESA').reduce((a, b) => a + Number(b.amount || 0), 0);

      setStats({
        revenue: rev, 
        expenses: exp,
        employees: empRes.count || 0,
        properties: propRes.count || 0, 
        contacts: contactRes.count || 0,
        pendingApps: appCountRes.count || 0
      });
      
      const insight = await getStrategicInsight(`Saldo: ${rev-exp}MT, Staff: ${empRes.count}, Candidaturas: ${appCountRes.count}`);
      setAiInsight(insight);
    } catch (error: any) {
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  }

  const expenseChartData = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleString('pt-MZ', { month: 'short' });
      months.push({
        monthKey: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        name: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        valor: 0
      });
    }
    allTransactions.forEach(t => {
      if (t.type === 'DESPESA' && t.date) {
        const tMonth = t.date.substring(0, 7);
        const monthObj = months.find(m => m.monthKey === tMonth);
        if (monthObj) monthObj.valor += Number(t.amount || 0);
      }
    });
    return months;
  }, [allTransactions]);

  const pieData = [
    { name: 'Luxo', value: 65, color: '#8b5cf6' },
    { name: 'Comercial', value: 25, color: '#10b981' },
    { name: 'Desenvolvimento', value: 10, color: '#fb923c' },
  ];

  if (loading) return (
    <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-blue-600" size={32} />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse tracking-[0.3em]">Neural Monte Core...</p>
    </div>
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-1000 pb-4 max-w-[1800px] mx-auto">
      
      {/* 1. Cockpit Header */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
         <div className="lg:col-span-3 bg-slate-950 rounded-2xl border border-white/5 p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-1000"></div>
            <div className="flex items-center gap-6 relative z-10 flex-1 min-w-0">
               <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center shadow-inner border border-white/10 shrink-0">
                  <Bot size={28} className="text-indigo-400 animate-pulse" />
               </div>
               <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                     <span className="text-[7px] font-black text-indigo-400 uppercase tracking-[0.4em] bg-indigo-400/10 px-2 py-0.5 rounded-full">Inteligência Estratégica</span>
                     <span className="text-[7px] font-black text-emerald-400 uppercase tracking-[0.4em] bg-emerald-400/10 px-2 py-0.5 rounded-full flex items-center gap-1"><Activity size={8}/> Live</span>
                  </div>
                  <h2 className="text-lg font-black text-white tracking-tight leading-snug italic truncate">"{aiInsight}"</h2>
               </div>
            </div>
            <button onClick={fetchGlobalStats} className="bg-white/5 hover:bg-white/10 text-white px-5 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all border border-white/10 flex items-center gap-2 relative z-10 group/btn">
               <RefreshCw size={12} className={`group-hover/btn:rotate-180 transition-transform duration-700 ${isSyncing ? 'animate-spin' : ''}`} /> Sincronizar
            </button>
         </div>

         <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm flex flex-col justify-center items-center text-center">
             <div className="relative mb-1">
                <Gauge size={24} className="text-indigo-600 mb-1" />
             </div>
             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Eficiência</p>
             <h3 className="text-xl font-black text-slate-900 tracking-tighter">94.8%</h3>
             <div className="w-full bg-slate-50 h-1 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-emerald-500 w-[94.8%] shadow-[0_0_8px_#10b981]"></div>
             </div>
         </div>
      </div>
      
      {/* 2. KPI GRID - Compacted */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Fluxo de Caixa', val: `${(stats.revenue - stats.expenses).toLocaleString()} MT`, icon: <Wallet size={16}/>, color: 'text-emerald-500', trend: '+12%', bg: 'bg-emerald-500/10' },
          { label: 'Asset Capacity', val: stats.properties, icon: <Home size={16}/>, color: 'text-indigo-500', trend: '+2', bg: 'bg-indigo-500/10' },
          { label: 'Monte Staff', val: stats.employees, icon: <Users size={16}/>, color: 'text-blue-500', trend: 'Active', bg: 'bg-blue-500/10' },
          { label: 'Talentos Pendentes', val: stats.pendingApps, icon: <UserPlus size={16}/>, color: 'text-purple-500', trend: 'Novos', bg: 'bg-purple-500/10' },
          { label: 'Lead Velocity', val: stats.contacts, icon: <Zap size={16}/>, color: 'text-amber-500', trend: 'High', bg: 'bg-amber-500/10' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-3 md:p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all group overflow-hidden relative">
             <div className="flex justify-between items-start mb-2">
                <div className={`w-8 h-8 ${kpi.bg} ${kpi.color} rounded-xl flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform`}>
                   {kpi.icon}
                </div>
                <span className={`text-[7px] font-black ${kpi.color} uppercase tracking-tighter`}>{kpi.trend}</span>
             </div>
             <div>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-0.5">{kpi.label}</p>
                <h3 className="text-base font-black text-slate-900 tracking-tighter">{kpi.val}</h3>
             </div>
          </div>
        ))}
      </div>

      {/* 3. Main Data Core */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        
        {/* Gráfico Performance */}
        <div className="xl:col-span-8 bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-sm">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-black text-slate-900 uppercase italic flex items-center gap-2">
                <BarChart3 className="text-indigo-600" size={14} /> Performance de Ativos
              </h3>
           </div>
           <div className="h-[220px] md:h-[260px] w-full min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                 <AreaChart data={expenseChartData}>
                    <defs>
                      <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#00000003" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 900, fill: '#cbd5e1' }} />
                    <YAxis hide />
                    <Tooltip cursor={{ stroke: '#6366f1', strokeWidth: 2 }} contentStyle={{ borderRadius: '0.5rem', border: 'none', backgroundColor: '#0f172a', padding: '8px', color: '#fff', fontSize: '9px' }} />
                    <Area type="monotone" dataKey="valor" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVal)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Candidaturas Recentes Column */}
        <div className="xl:col-span-4 space-y-4">
           <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full">
              <div className="flex justify-between items-center mb-4">
                 <h4 className="text-[8px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Briefcase size={12} className="text-purple-600" /> Fluxo de Talentos
                 </h4>
                 <History size={10} className="text-slate-300" />
              </div>
              
              <div className="flex-1 space-y-3">
                 {recentApps.length > 0 ? recentApps.map((app) => (
                    <div key={app.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all">
                       <div className="min-w-0">
                          <p className="text-[10px] font-black text-slate-900 truncate uppercase">{app.applicant_name}</p>
                          <p className="text-[8px] font-bold text-indigo-600 uppercase tracking-tighter truncate">{app.job_title}</p>
                       </div>
                       <div className="flex gap-1.5 shrink-0">
                          {app.applicant_linkedin && (
                             <a href={app.applicant_linkedin} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-white text-blue-600 rounded-lg shadow-sm border border-slate-100 hover:scale-110 transition-all">
                                <Linkedin size={10} />
                             </a>
                          )}
                          <div className="p-1.5 bg-white text-slate-400 rounded-lg border border-slate-100">
                             <CheckCircle2 size={10} className={app.status === 'Pendente' ? 'text-amber-400' : 'text-emerald-500'} />
                          </div>
                       </div>
                    </div>
                 )) : (
                    <div className="flex flex-col items-center justify-center py-10 opacity-30 text-center">
                       <UserPlus size={24} className="mb-2" />
                       <p className="text-[8px] font-black uppercase tracking-widest">Sem candidaturas recentes</p>
                    </div>
                 )}
              </div>
              
              <button onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'hr' }))} className="mt-4 w-full py-2 bg-slate-900 text-white rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all">
                 Ver Todas no RH
              </button>
           </div>
        </div>
      </div>

      <div className="h-[200px] md:h-[240px] shadow-sm rounded-2xl overflow-hidden border border-slate-100">
         <TodoList />
      </div>
    </div>
  );
};

export default DashboardView;
