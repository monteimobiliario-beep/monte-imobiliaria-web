
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Wallet, Sparkles, Bot, RefreshCw, ArrowUpRight, Zap, Home, Users, 
  PieChart as PieIcon, Activity, Gauge, Briefcase, UserPlus, Linkedin, Truck, 
  BarChart3, History, CheckCircle2, Loader2, Target, TrendingUp
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { supabase, db } from '../supabaseClient';
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
    pendingApps: 0,
    projects: 0,
    fleet: 0
  });
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [recentApps, setRecentApps] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string>(new Date().toLocaleTimeString());
  const [aiInsight, setAiInsight] = useState<string>('Analisando pulso financeiro...');
  
  const [propertyTypes, setPropertyTypes] = useState<{name: string, value: number, color: string}[]>([]);
  
  useEffect(() => {
    fetchGlobalStats();
  }, []);

  async function fetchGlobalStats() {
    setIsSyncing(true);
    try {
      const [txRes, empRes, propRes, contactRes, appCountRes, recentAppsRes, projectRes, vehicleRes] = await Promise.all([
        db.finance('transactions').select('*'),
        db.hr('employees').select('*', { count: 'exact', head: true }),
        db.catalog('properties').select('*'),
        db.catalog('contact_requests').select('*', { count: 'exact', head: true }),
        db.hr('job_applications').select('*', { count: 'exact', head: true }).eq('status', 'Pendente'),
        db.hr('job_applications').select('*').order('created_at', { ascending: false }).limit(4),
        db.finance('projects').select('*', { count: 'exact', head: true }),
        db.fleet('vehicles').select('*', { count: 'exact', head: true })
      ]);

      const txs = txRes.data || [];
      const props = propRes.data || [];
      setAllTransactions(txs);
      setRecentApps(recentAppsRes.data || []);
      
      const rev = txs.filter(t => t.type === 'RECEITA').reduce((a, b) => a + Number(b.amount || 0), 0);
      const exp = txs.filter(t => t.type === 'DESPESA').reduce((a, b) => a + Number(b.amount || 0), 0);

      setStats({
        revenue: rev, 
        expenses: exp,
        employees: empRes.count || 0,
        properties: props.length || 0, 
        contacts: contactRes.count || 0,
        pendingApps: appCountRes.count || 0,
        projects: projectRes.count || 0,
        fleet: vehicleRes.count || 0
      });

      if (props.length > 0) {
        const counts: Record<string, number> = {};
        props.forEach(p => {
          counts[p.type] = (counts[p.type] || 0) + 1;
        });
        const colors = ['#0052FF', '#10b981', '#fb923c', '#8b5cf6', '#f43f5e'];
        const dynamicPie = Object.entries(counts).map(([name, value], idx) => ({
          name, 
          value, 
          color: colors[idx % colors.length]
        }));
        setPropertyTypes(dynamicPie);
      }
      
      const insight = await getStrategicInsight(`Saldo: ${rev-exp}MT, Propriedades: ${props.length}, Projetos: ${projectRes.count}, Frota: ${vehicleRes.count}`);
      setAiInsight(insight);
      setLastSync(new Date().toLocaleTimeString());
    } catch (error: any) {
      console.error("Dashboard Sync Error:", error);
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

  if (loading) return (
    <div className="h-[70vh] flex flex-col items-center justify-center gap-6">
      <div className="relative">
        <Loader2 className="animate-spin text-market-blue" size={48} />
        <div className="absolute inset-0 blur-xl bg-market-blue/20 animate-pulse"></div>
      </div>
      <div className="space-y-1 text-center">
        <p className="text-[10px] font-black text-market-navy uppercase tracking-[0.4em] animate-pulse">Neural Core Sincronizando</p>
        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">A carregar pulso operacional...</p>
      </div>
    </div>
  );

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-6 max-w-[1800px] mx-auto"
    >
      
      {/* Top Section: AI & Health */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
         <motion.div variants={item} className="lg:col-span-3 bg-market-navy rounded-[2.5rem] border border-white/10 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-market-blue/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-market-blue/20 transition-all duration-[3000ms]"></div>
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-market-accent/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
            
            <div className="flex items-center gap-8 relative z-10 flex-1 min-w-0">
               <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center shadow-[inset_0_2px_10px_rgba(255,255,255,0.05)] border border-white/10 shrink-0 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-market-blue/40 to-transparent opacity-50"></div>
                  <Bot size={32} className="text-market-blue relative z-10 animate-pulse" />
               </div>
               <div className="min-w-0 space-y-2">
                  <div className="flex items-center gap-3">
                     <span className="text-[8px] font-black text-market-blue uppercase tracking-[0.5em] bg-market-blue/10 px-3 py-1 rounded-full border border-market-blue/20">Executive AI Agent</span>
                     <span className="text-[8px] font-black text-market-accent uppercase tracking-[0.4em] bg-market-accent/10 px-3 py-1 rounded-full border border-market-accent/20 flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                        <Activity size={10} className="animate-pulse" /> Live Pulse
                     </span>
                     <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Sinc: {lastSync}</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-snug italic truncate font-display">"{aiInsight}"</h2>
               </div>
            </div>
            <button 
              onClick={fetchGlobalStats} 
              disabled={isSyncing}
              className="bg-white/10 hover:bg-white hover:text-market-navy text-white px-7 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-white/10 flex items-center gap-3 relative z-10 group/btn shadow-xl"
            >
               <RefreshCw size={14} className={`group-hover/btn:rotate-180 transition-transform duration-1000 ${isSyncing ? 'animate-spin' : ''}`} /> Sincronizar
            </button>
         </motion.div>

         <motion.div variants={item} className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.04)] flex flex-col justify-center items-center text-center relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full blur-3xl group-hover:bg-market-blue/5 transition-all"></div>
             <div className="relative mb-3">
                <div className="absolute inset-0 blur-lg bg-market-blue/10 animate-pulse"></div>
                <Gauge size={32} className="text-market-blue relative z-10" />
             </div>
             <p className="text-[10px] font-black text-market-slate uppercase tracking-[0.3em] mb-1">Health Score</p>
             <h3 className="text-3xl font-black text-market-navy tracking-tighter">94.8<span className="text-sm opacity-30">%</span></h3>
             <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "94.8%" }}
                  transition={{ duration: 1.5, ease: "circOut", delay: 0.5 }}
                  className="h-full bg-market-accent shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                ></motion.div>
             </div>
         </motion.div>
      </div>
      
      {/* KPI Ribbons */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {[
          { label: 'Fluxo Líquido', val: `${(stats.revenue - stats.expenses).toLocaleString()} MT`, icon: <Wallet size={18}/>, color: 'text-market-accent', trend: <TrendingUp size={12}/>, bg: 'bg-market-accent/10', border: 'border-market-accent/20' },
          { label: 'Capacidade Ativos', val: stats.properties, icon: <Home size={18}/>, color: 'text-market-blue', trend: '+2', bg: 'bg-market-blue/10', border: 'border-market-blue/20' },
          { label: 'Monte Staff', val: stats.employees, icon: <Users size={18}/>, color: 'text-market-navy', trend: 'Online', bg: 'bg-slate-100', border: 'border-slate-200' },
          { label: 'Operações Ativas', val: stats.projects, icon: <Briefcase size={18}/>, color: 'text-market-blue', trend: 'V14', bg: 'bg-market-blue/10', border: 'border-market-blue/20' },
          { label: 'Frota Gestão', val: stats.fleet, icon: <Truck size={18}/>, color: 'text-market-blue', trend: 'Audit', bg: 'bg-market-blue/10', border: 'border-market-blue/20' },
          { label: 'Pool Candidatos', val: stats.pendingApps, icon: <UserPlus size={18}/>, color: 'text-indigo-500', trend: 'Novos', bg: 'bg-indigo-50', border: 'border-indigo-100' },
          { label: 'Lead Velocity', val: stats.contacts, icon: <Zap size={18}/>, color: 'text-amber-500', trend: 'Peak', bg: 'bg-amber-50', border: 'border-amber-100' },
        ].map((kpi, i) => (
          <motion.div 
            key={i} 
            variants={item}
            whileHover={{ y: -5, scale: 1.02 }}
            className={`bg-white p-4 md:p-5 rounded-[2rem] border ${kpi.border} shadow-sm hover:shadow-xl transition-all group overflow-hidden relative`}
          >
             <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 ${kpi.bg} ${kpi.color} rounded-[1.2rem] flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform duration-500`}>
                   {kpi.icon}
                </div>
                <span className={`text-[8px] font-black ${kpi.color} uppercase tracking-tighter bg-white px-2 py-0.5 rounded-full border border-slate-100 shadow-sm flex items-center gap-1`}>
                   {kpi.trend}
                </span>
             </div>
             <div>
                <p className="text-[9px] font-black text-market-slate uppercase tracking-[0.2em] mb-1">{kpi.label}</p>
                <h3 className="text-lg font-black text-market-navy tracking-tighter leading-none">{kpi.val}</h3>
             </div>
          </motion.div>
        ))}
      </div>

      {/* Charts & Secondary Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Asset Distribution */}
        <motion.div variants={item} className="xl:col-span-4 bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col h-full min-h-[400px] overflow-hidden relative">
           <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-[60px] opacity-50"></div>
           <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="space-y-1">
                <h3 className="text-[12px] font-black text-market-navy uppercase tracking-widest flex items-center gap-2 italic">
                  <PieIcon className="text-market-blue" size={16} /> Mix de Património
                </h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Distribuição por Tipologia</p>
              </div>
           </div>
           <div className="flex-1 w-full h-[220px] relative z-10">
              {propertyTypes.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={propertyTypes}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {propertyTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip cursor={false} contentStyle={{ borderRadius: '1rem', border: 'none', backgroundColor: '#0F172A', padding: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }} itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-3 opacity-20">
                   <Loader2 className="animate-spin text-market-blue" size={24} />
                   <p className="text-[10px] font-black uppercase tracking-widest">Aguardando dados...</p>
                </div>
              )}
           </div>
           <div className="grid grid-cols-2 gap-4 mt-8 relative z-10 border-t border-slate-50 pt-6">
              {propertyTypes.slice(0, 4).map((t, i) => (
                <motion.div key={i} whileHover={{ x: 5 }} className="flex items-center gap-3 p-2 rounded-xl transition-all hover:bg-slate-50 cursor-pointer">
                   <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: t.color }}></div>
                   <div className="min-w-0 flex-1">
                      <p className="text-[9px] font-black text-market-navy truncate uppercase leading-none mb-1">{t.name}</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{t.value} Unidades</p>
                   </div>
                </motion.div>
              ))}
           </div>
        </motion.div>

        {/* Operational Timeline */}
        <motion.div variants={item} className="xl:col-span-8 bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm h-full flex flex-col min-h-[400px] overflow-hidden relative">
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-market-blue/5 rounded-full blur-[100px] opacity-30"></div>
           <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="space-y-1">
                <h3 className="text-[12px] font-black text-market-navy uppercase tracking-widest flex items-center gap-2 italic">
                  <BarChart3 className="text-market-blue" size={16} /> Fluxo Financeiro Logístico
                </h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Timeline de Despesas Operacionais</p>
              </div>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-market-blue ring-4 ring-market-blue/10"></div>
                    <span className="text-[9px] font-bold text-market-navy uppercase">Projeção</span>
                 </div>
              </div>
           </div>
           <div className="flex-1 w-full h-[300px] relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={expenseChartData}>
                    <defs>
                      <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0052FF" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#0052FF" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#ECEFF1" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 800, fill: '#94A3B8' }} dy={10} />
                    <YAxis hide />
                    <Tooltip cursor={{ stroke: '#0052FF', strokeWidth: 1 }} contentStyle={{ borderRadius: '1.2rem', border: '1px solid #ECEFF1', backgroundColor: '#fff', padding: '15px', color: '#0F172A', boxShadow: '0 15px 30px rgba(0,0,0,0.05)' }} />
                    <Area type="monotone" dataKey="valor" stroke="#0052FF" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" animationDuration={2000} />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </motion.div>

        {/* Talent Pipeline & Tasks */}
        <motion.div variants={item} className="xl:col-span-6 bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-2 h-full bg-market-blue opacity-5"></div>
           <div className="flex justify-between items-center mb-8">
              <div className="space-y-1">
                 <h4 className="text-[12px] font-black uppercase tracking-widest text-market-navy flex items-center gap-2 italic">
                    <Briefcase size={16} className="text-market-blue" /> Talent Pipeline
                 </h4>
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Recrutamento e Novas Admissões</p>
              </div>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'hr' }))}
                className="p-2.5 bg-slate-50 text-market-navy rounded-xl hover:bg-market-blue hover:text-white transition-all shadow-sm border border-slate-100"
              >
                 <ArrowUpRight size={18} />
              </button>
           </div>
           
           <div className="flex-1 space-y-4">
              {recentApps.length > 0 ? recentApps.map((app, idx) => (
                 <motion.div 
                   key={app.id} 
                   whileHover={{ x: 10 }}
                   className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-between group/row hover:bg-white hover:shadow-xl transition-all duration-500"
                 >
                    <div className="flex items-center gap-4 min-w-0">
                       <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center border border-slate-100 text-market-blue font-black text-xs">
                          {app.applicant_name.charAt(0)}
                       </div>
                       <div className="min-w-0">
                          <p className="text-[11px] font-black text-market-navy truncate uppercase leading-none mb-1">{app.applicant_name}</p>
                          <div className="flex items-center gap-2">
                             <span className="text-[8px] font-bold text-market-blue uppercase tracking-widest">{app.job_title}</span>
                             <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                             <span className="text-[8px] font-bold text-slate-400 uppercase">{new Date(app.created_at).toLocaleDateString()}</span>
                          </div>
                       </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                       {app.applicant_linkedin && (
                          <a href={app.applicant_linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-white text-[#0077B5] rounded-xl shadow-sm border border-slate-100 hover:scale-110 transition-all">
                             <Linkedin size={14} />
                          </a>
                       )}
                       <div className={`p-2 bg-white rounded-xl border border-slate-100 shadow-sm ${app.status === 'Pendente' ? 'text-amber-500' : 'text-market-accent'}`}>
                          <CheckCircle2 size={14} />
                       </div>
                    </div>
                 </motion.div>
              )) : (
                 <div className="flex flex-col items-center justify-center py-16 opacity-20 text-center">
                    <UserPlus size={48} className="mb-4 text-slate-400" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Sem atividade recente</p>
                 </div>
              )}
           </div>
        </motion.div>

        <motion.div variants={item} className="xl:col-span-6 bg-slate-950 rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden flex flex-col relative">
           <div className="absolute inset-0 bg-gradient-to-br from-market-blue/10 to-transparent opacity-30 pointer-events-none"></div>
           <div className="p-6 md:p-8 flex-1 flex flex-col h-full min-h-[400px]">
              <div className="flex items-center justify-between mb-8 relative z-10">
                 <div className="space-y-1">
                    <h4 className="text-[12px] font-black uppercase tracking-widest text-white flex items-center gap-2 italic">
                       <Target size={16} className="text-market-blue" /> Mission Control
                    </h4>
                    <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Agenda Operacional Crítica</p>
                 </div>
                 <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 text-white/40">
                    <History size={18} />
                 </div>
              </div>
              <div className="flex-1 relative z-10 shadow-2xl rounded-3xl overflow-hidden glass-morphism border-white/5">
                 <TodoList />
              </div>
           </div>
        </motion.div>
      </div>

    </motion.div>
  );
};

export default DashboardView;
