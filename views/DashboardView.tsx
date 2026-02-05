
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
  FileImage
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { supabase } from '../supabaseClient';
import { getStrategicInsight } from '../geminiService';
import TodoList from '../components/TodoList';
import { Transaction } from '../types';

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
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [aiInsight, setAiInsight] = useState<string>('Processando dados...');
  
  // Branding States
  const [logoUrl, setLogoUrl] = useState(localStorage.getItem('monte_custom_logo') || 'https://i.ibb.co/LzfNdf7Y/building-logo.png');
  const [isUpdatingLogo, setIsUpdatingLogo] = useState(false);
  const [showLogoSuccess, setShowLogoSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchGlobalStats();
  }, []);

  async function fetchGlobalStats() {
    setIsSyncing(true);
    try {
      const [txRes, empRes, propRes, contactRes, appCountRes] = await Promise.all([
        supabase.from('transactions').select('*'),
        supabase.from('employees').select('*', { count: 'exact', head: true }),
        supabase.from('properties').select('*', { count: 'exact', head: true }),
        supabase.from('contact_requests').select('*', { count: 'exact', head: true }),
        supabase.from('job_applications').select('*', { count: 'exact', head: true }).eq('status', 'Pendente')
      ]);

      const txs = txRes.data || [];
      setAllTransactions(txs);
      
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
      
      const insight = await getStrategicInsight(`Saldo: ${rev-exp}MT, Staff: ${empRes.count}`);
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

  const handleUpdateLogo = async () => {
    setIsUpdatingLogo(true);
    localStorage.setItem('monte_custom_logo', logoUrl);
    window.dispatchEvent(new CustomEvent('monteLogoUpdated', { detail: logoUrl }));
    await new Promise(r => setTimeout(r, 600));
    setIsUpdatingLogo(false);
    setShowLogoSuccess(true);
    setTimeout(() => setShowLogoSuccess(false), 3000);
  };

  const pieData = [
    { name: 'Venda', value: 65, color: '#8b5cf6' },
    { name: 'Arrend.', value: 25, color: '#10b981' },
    { name: 'Obras', value: 10, color: '#fb923c' },
  ];

  if (loading) return (
    <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-blue-600" size={32} />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse tracking-[0.3em]">Sincronizando Sistema...</p>
    </div>
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-700 pb-10 max-w-[1800px] mx-auto">
      
      {/* Mini Breadcrumb/Status Bar */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-white border border-slate-100 rounded-xl shadow-sm">
         <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-indigo-500 animate-ping' : 'bg-emerald-500'}`}></div>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Monte Imobiliária Central Hub</p>
         </div>
         <button onClick={fetchGlobalStats} className="p-1 bg-slate-50 text-slate-400 rounded-md hover:text-indigo-600 transition-all">
            <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
         {/* BRANDING CARD - Smaller */}
         <div className="lg:col-span-3 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
               <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg shadow-inner"><Palette size={14}/></div>
               <h3 className="text-[11px] font-black text-slate-900 tracking-tight uppercase italic">Branding</h3>
            </div>
            <div className="space-y-3">
               <div className="p-3 bg-slate-900 rounded-xl flex items-center justify-center border-2 border-slate-800 shadow-lg relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <img src={logoUrl} className="h-10 object-contain brightness-0 invert" alt="Logo" />
               </div>
               <input type="text" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} className="w-full bg-slate-50 border-none rounded-lg p-2 font-bold text-[9px] outline-none shadow-inner truncate" />
               <button onClick={handleUpdateLogo} disabled={isUpdatingLogo} className="w-full py-2 bg-slate-900 text-white rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-md active:scale-95 disabled:opacity-50">
                  {isUpdatingLogo ? <Loader2 size={12} className="animate-spin mx-auto" /> : 'Aplicar Marca'}
               </button>
            </div>
         </div>

         {/* AI INSIGHT CARD - More compact */}
         <div className="lg:col-span-9 bg-white rounded-2xl border border-slate-100 p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-5 flex-1">
               <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center shadow-lg shrink-0">
                  <Bot size={24} className="text-indigo-400" />
               </div>
               <div className="min-w-0">
                  <span className="text-[8px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-md mb-1 inline-block">Directriz IA</span>
                  <h2 className="text-base font-black text-slate-900 tracking-tight leading-snug italic truncate">"{aiInsight}"</h2>
               </div>
            </div>
            <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-slate-950 transition-all shadow-md shrink-0">
               Explorar Insights <ArrowUpRight size={12} className="inline ml-1" />
            </button>
         </div>
      </div>
      
      {/* KPI GRID - Compacted p-4 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Lucro Líquido', val: `${(stats.revenue - stats.expenses).toLocaleString()} MT`, icon: <Wallet size={16}/>, grad: 'bg-emerald-500', text: 'text-emerald-500' },
          { label: 'Staff Ativo', val: stats.employees, icon: <Users size={16}/>, grad: 'bg-indigo-500', text: 'text-indigo-500' },
          { label: 'Activos Totais', val: stats.properties, icon: <Home size={16}/>, grad: 'bg-purple-500', text: 'text-purple-500' },
          { label: 'Novos Leads', val: stats.contacts, icon: <Zap size={16}/>, grad: 'bg-orange-500', text: 'text-rose-500' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm group hover:shadow-lg transition-all">
             <div className="flex justify-between items-start mb-3">
                <div className={`w-8 h-8 ${kpi.grad} text-white rounded-lg flex items-center justify-center shadow-md`}>
                   {kpi.icon}
                </div>
             </div>
             <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{kpi.label}</p>
                <h3 className="text-base font-black text-slate-900 tracking-tighter">{kpi.val}</h3>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-[11px] font-black text-slate-900 uppercase italic flex items-center gap-2">
                <TrendingDown className="text-rose-500" size={14} /> Fluxo Financeiro <span className="text-rose-600">Mensal</span>
              </h3>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Tempo Real</p>
           </div>
           <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={expenseChartData}>
                    <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#00000005" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }} />
                    <YAxis hide />
                    <Tooltip cursor={{ fill: '#f43f5e05' }} contentStyle={{ borderRadius: '0.75rem', border: 'none', backgroundColor: '#0f172a', padding: '10px', color: '#fff' }} />
                    <Bar dataKey="valor" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={32} />
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="xl:col-span-4 space-y-4">
           <div className="bg-slate-950 p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                 <h4 className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-4 flex items-center gap-2">
                    <PieIcon size={12} /> Mix de Portfólio
                 </h4>
                 <div className="h-[120px] w-full mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie data={pieData} innerRadius={40} outerRadius={52} paddingAngle={4} dataKey="value">
                             {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />)}
                          </Pie>
                       </PieChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="grid grid-cols-1 gap-1.5">
                    {pieData.map((item, i) => (
                       <div key={i} className="flex items-center justify-between bg-white/5 p-2 rounded-lg border border-white/5">
                          <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                             <span className="text-[9px] font-black uppercase tracking-widest opacity-60">{item.name}</span>
                          </div>
                          <span className="text-[10px] font-black">{item.value}%</span>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
           <div className="h-[200px]">
              <TodoList />
           </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
