
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Wallet, Sparkles, X as CloseIcon, 
  ShieldCheck, Send, Bot, RefreshCw,
  LayoutTemplate,
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
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { supabase } from '../supabaseClient';
import { getStrategicInsight, chatWithMonteAI } from '../geminiService';
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
  const [aiInsight, setAiInsight] = useState<string>('Analizando rede neural da Monte Imobiliária...');
  
  // Branding States
  const [logoUrl, setLogoUrl] = useState(localStorage.getItem('monte_custom_logo') || 'https://i.ibb.co/LzfNdf7Y/building-logo.png');
  const [isUpdatingLogo, setIsUpdatingLogo] = useState(false);
  const [showLogoSuccess, setShowLogoSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: 'Central Monte Imobiliária Ativa. Aguardando comandos estratégicos.' }
  ]);
  const [isAiTyping, setIsAiTyping] = useState(false);

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
      
      const insight = await getStrategicInsight(`Saldo: ${rev-exp}MT, Staff: ${empRes.count}, Leads: ${contactRes.count}`);
      setAiInsight(insight);
    } catch (error: any) {
      console.error(error);
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLogoUrl(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateLogo = async () => {
    setIsUpdatingLogo(true);
    localStorage.setItem('monte_custom_logo', logoUrl);
    window.dispatchEvent(new CustomEvent('monteLogoUpdated', { detail: logoUrl }));
    
    await new Promise(r => setTimeout(r, 1000));
    setIsUpdatingLogo(false);
    setShowLogoSuccess(true);
    setTimeout(() => setShowLogoSuccess(false), 3000);
  };

  const pieData = [
    { name: 'Venda', value: 65, color: '#8b5cf6' },
    { name: 'Arrend.', value: 25, color: '#10b981' },
    { name: 'Obras', value: 10, color: '#fb923c' },
  ];

  const meshStyle = {
    backgroundImage: `radial-gradient(rgba(0,0,0,0.03) 1px, transparent 1px)`,
    backgroundSize: '24px 24px'
  };

  if (loading) return (
    <div className="h-[80vh] flex flex-col items-center justify-center gap-10">
      <div className="relative">
        <div className="w-24 h-24 bg-slate-900 rounded-[3rem] flex items-center justify-center p-5 shadow-[0_0_80px_rgba(79,70,229,0.3)] animate-pulse border border-white/5 overflow-hidden">
           <img src={logoUrl} className="w-full h-full object-contain brightness-0 invert" alt="Logo" />
        </div>
        <div className="absolute -inset-6 border border-indigo-600/30 rounded-[4rem] animate-[spin_10s_linear_infinite] border-dashed"></div>
      </div>
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.8em] animate-pulse">Sincronizando Monte Imobiliária...</p>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-1000 pb-20 max-w-[1600px] mx-auto">
      
      {/* SYNC STATUS BAR */}
      <div className="flex items-center justify-between px-8 py-4 bg-white/40 rounded-3xl border border-white/20 backdrop-blur-2xl shadow-xl">
         <div className="flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full ${isSyncing ? 'bg-indigo-500 animate-ping' : 'bg-emerald-500'} shadow-[0_0_10px_currentColor]`}></div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
               Monte Cloud Network <span className="mx-2 text-slate-300">|</span> <span className={isSyncing ? 'text-indigo-600' : 'text-emerald-500'}>{isSyncing ? 'Sincronizando...' : 'Conectado'}</span>
            </p>
         </div>
         <div className="flex items-center gap-6">
            <button onClick={fetchGlobalStats} className="p-2 bg-indigo-600/10 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all">
               <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         {/* CAMPO: GESTÃO DE LOGOTIPO COM UPLOAD LOCAL */}
         <div className="lg:col-span-4 bg-white rounded-[4rem] p-10 border border-slate-100 shadow-xl relative overflow-hidden" style={meshStyle}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 opacity-[0.03] rounded-full -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="flex items-center gap-4 mb-8">
               <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shadow-inner"><Palette size={20}/></div>
               <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase italic">Identidade Visual</h3>
            </div>

            <div className="space-y-6 relative z-10">
               <div className="p-6 bg-slate-900 rounded-[2.5rem] flex items-center justify-center border-4 border-slate-800 shadow-2xl mb-8 group overflow-hidden relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <img src={logoUrl} className="max-h-20 object-contain brightness-0 invert group-hover:scale-110 transition-transform duration-500" alt="Preview Logo" />
                  <div className="absolute inset-0 bg-indigo-600/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    <Upload size={24} className="text-white animate-bounce" />
                    <span className="text-[8px] font-black text-white uppercase tracking-widest">Carregar do PC</span>
                  </div>
               </div>

               <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
               />

               <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                    <LinkIcon size={12} /> URL ou Base64 do Logotipo
                  </label>
                  <input 
                    type="text" 
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="Cole a URL ou use o botão de upload"
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-[10px] outline-none focus:ring-4 focus:ring-indigo-100 shadow-inner transition-all truncate"
                  />
               </div>

               <button 
                onClick={handleUpdateLogo}
                disabled={isUpdatingLogo}
                className="w-full py-5 bg-slate-900 text-white rounded-[1.8rem] font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl disabled:opacity-50"
               >
                  {isUpdatingLogo ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Aplicar Marca Global</>}
               </button>

               {showLogoSuccess && (
                 <div className="flex items-center justify-center gap-2 text-emerald-500 font-black text-[10px] uppercase animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 size={14} /> Logotipo Atualizado com Sucesso
                 </div>
               )}
            </div>
         </div>

         {/* AI INSIGHT CARD */}
         <div className="lg:col-span-8 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-[4rem] blur-2xl opacity-10 group-hover:opacity-20 transition duration-1000"></div>
            <div className="relative bg-white rounded-[4rem] border border-slate-100 p-12 flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl overflow-hidden h-full" style={meshStyle}>
               <div className="flex items-center gap-8 relative z-10 flex-1">
                  <div className="w-20 h-20 bg-slate-950 rounded-[2.5rem] flex items-center justify-center shadow-2xl border border-white/10 shrink-0">
                     <Bot size={40} className="text-indigo-400" />
                  </div>
                  <div className="space-y-2">
                     <div className="flex items-center gap-3">
                        <span className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.5em] bg-indigo-50 px-4 py-1.5 rounded-full">Monte Intel</span>
                        <Sparkles size={12} className="text-amber-400" />
                     </div>
                     <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter leading-tight italic">"{aiInsight}"</h2>
                  </div>
               </div>
               <button onClick={() => setAiChatOpen(true)} className="px-10 py-6 bg-indigo-600 text-white rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-slate-950 transition-all flex items-center gap-3 shadow-xl">
                  Consultar AI <ArrowUpRight size={18} />
               </button>
            </div>
         </div>
      </div>
      
      {/* Restante do Dashboard omitido para brevidade, mantendo consistência visual */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Lucro Líquido', val: `${(stats.revenue - stats.expenses).toLocaleString()} MT`, icon: <Wallet size={24}/>, grad: 'from-emerald-400 via-emerald-500 to-teal-600', text: 'text-emerald-500', shadow: 'shadow-emerald-500/20' },
          { label: 'Time Operacional', val: stats.employees, icon: <Users size={24}/>, grad: 'from-blue-500 via-indigo-500 to-indigo-700', text: 'text-indigo-500', shadow: 'shadow-indigo-500/20' },
          { label: 'Ativos Ativos', val: stats.properties, icon: <Home size={24}/>, grad: 'from-purple-500 via-purple-600 to-violet-800', text: 'text-purple-500', shadow: 'shadow-purple-500/20' },
          { label: 'Novos Leads', val: stats.contacts, icon: <Zap size={24}/>, grad: 'from-orange-400 via-rose-500 to-rose-600', text: 'text-rose-500', shadow: 'shadow-rose-500/20' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden group" style={meshStyle}>
             <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${kpi.grad} opacity-[0.03] group-hover:opacity-[0.1] rounded-full -translate-y-1/2 translate-x-1/2 transition-opacity duration-700`}></div>
             <div className="flex justify-between items-start mb-10">
                <div className={`w-16 h-16 bg-gradient-to-tr ${kpi.grad} text-white rounded-2xl flex items-center justify-center shadow-lg ${kpi.shadow} transition-transform group-hover:rotate-12`}>
                   {kpi.icon}
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-50 ${kpi.text}`}>Real-time</div>
             </div>
             <div className="relative z-10">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">{kpi.label}</p>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter group-hover:tracking-tight transition-all">{kpi.val}</h3>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <div className="xl:col-span-7 bg-white p-12 rounded-[4.5rem] border border-slate-100 shadow-2xl relative overflow-hidden group" style={meshStyle}>
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16 relative z-10">
              <div>
                 <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-4">
                   <TrendingDown className="text-rose-500" /> Ciclo de <span className="text-rose-600">Custos</span>
                 </h3>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.5em] mt-3">Análise Mensal (MT)</p>
              </div>
           </div>
           <div className="h-[400px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={expenseChartData}>
                    <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#00000005" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 900, fill: '#94a3b8' }} dy={15} />
                    <YAxis hide />
                    <Tooltip 
                      cursor={{ fill: '#f43f5e05' }}
                      contentStyle={{ borderRadius: '2rem', border: 'none', backgroundColor: 'rgba(15, 23, 42, 0.98)', padding: '20px', color: '#fff' }}
                      formatter={(value: any) => [`${Number(value).toLocaleString()} MT`, 'Despesa']}
                    />
                    <Bar dataKey="valor" fill="#f43f5e" radius={[12, 12, 0, 0]} barSize={60} />
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="xl:col-span-5 space-y-10">
           <div className="bg-slate-950 p-12 rounded-[4.5rem] text-white shadow-[0_40px_100px_rgba(0,0,0,0.4)] relative overflow-hidden" style={meshStyle}>
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none"></div>
              <div className="relative z-10">
                 <div className="flex items-center justify-between mb-12">
                    <h4 className="text-xs font-black uppercase tracking-[0.5em] text-indigo-400 flex items-center gap-3">
                       <PieIcon size={18} className="animate-spin-slow" /> Portfolio Mix
                    </h4>
                    <div className="p-2 bg-white/5 rounded-xl border border-white/5"><Waves size={16} className="text-indigo-500" /></div>
                 </div>
                 <div className="h-[200px] w-full mb-12">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie data={pieData} innerRadius={60} outerRadius={85} paddingAngle={8} dataKey="value">
                             {pieData.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                             ))}
                          </Pie>
                       </PieChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="grid grid-cols-1 gap-4">
                    {pieData.map((item, i) => (
                       <div key={i} className="flex items-center justify-between bg-white/5 p-5 rounded-[2rem] border border-white/5 hover:bg-white/10 transition-all group">
                          <div className="flex items-center gap-4">
                             <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                             <span className="text-[11px] font-black uppercase tracking-widest opacity-60 group-hover:opacity-100">{item.name}</span>
                          </div>
                          <span className="text-sm font-black tracking-tighter">{item.value}%</span>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
           <TodoList />
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
