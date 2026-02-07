
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Plus, 
  DollarSign, 
  X, 
  Loader2, 
  BarChart3, 
  TrendingUp, 
  User, 
  Tag, 
  Trash2, 
  Search,
  Filter,
  Paperclip,
  FileUp,
  FileCheck,
  FileText,
  CloudUpload,
  RefreshCw,
  AlertCircle,
  Calendar,
  Building,
  CheckCircle2,
  Clock,
  ArrowRight,
  Download,
  Upload,
  PieChart as PieIcon,
  Zap,
  MoreVertical,
  ChevronDown,
  AlertTriangle,
  FileSpreadsheet,
  LayoutList 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, LineChart, Line, Cell, AreaChart, Area
} from 'recharts';
import { supabase } from '../supabaseClient';
import { Transaction, Beneficiary, Project, TransactionStatus } from '../types';
import { getFinancialInsights } from '../geminiService';

type FinanceTab = 'transactions' | 'receivable' | 'payable' | 'reports';

const FinanceView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FinanceTab>('transactions');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [aiInsight, setAiInsight] = useState<string>('');
  
  // Filtros Globais
  const [periodFilter, setPeriodFilter] = useState('Este Mês');
  const [projectFilter, setProjectFilter] = useState('Todas Unidades');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Estados de Lançamento
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newLaunch, setNewLaunch] = useState<Partial<Transaction>>({
    description: '',
    category: 'Vendas',
    amount: 0,
    type: 'DESPESA',
    status: 'Pendente',
    due_date: new Date().toISOString().split('T')[0],
    project_id: '',
    client_supplier_name: ''
  });

  useEffect(() => {
    fetchData();
  }, [periodFilter, projectFilter, categoryFilter, statusFilter]);

  async function fetchData() {
    setLoading(true);
    try {
      const [txRes, benRes, projRes] = await Promise.all([
        supabase.from('transactions').select(`*, project:projects(name)`).order('date', { ascending: false }),
        supabase.from('beneficiaries').select('*').order('name'),
        supabase.from('projects').select('*').order('name')
      ]);

      if (txRes.data) {
        setTransactions(txRes.data as Transaction[]);
        
        // Calcular insight da IA com base nos dados reais
        const rev = txRes.data.filter(t => t.type === 'RECEITA').reduce((a, b) => a + Number(b.amount), 0);
        const exp = txRes.data.filter(t => t.type === 'DESPESA').reduce((a, b) => a + Number(b.amount), 0);
        const rec = txRes.data.filter(t => t.type === 'RECEITA' && t.status !== 'Pago').reduce((a, b) => a + Number(b.amount), 0);
        
        const insights = await getFinancialInsights({ revenue: rev, expenses: exp, profit: rev - exp, receivable: rec });
        setAiInsight(insights);
      }
      if (benRes.data) setBeneficiaries(benRes.data);
      if (projRes.data) setProjects(projRes.data);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const kpis = useMemo(() => {
    const revenue = transactions.filter(t => t.type === 'RECEITA' && t.status === 'Pago').reduce((a, b) => a + Number(b.amount), 0);
    const expenses = transactions.filter(t => t.type === 'DESPESA' && t.status === 'Pago').reduce((a, b) => a + Number(b.amount), 0);
    const profit = revenue - expenses;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    
    const receivable = transactions.filter(t => t.type === 'RECEITA' && t.status !== 'Pago').reduce((a, b) => a + Number(b.amount), 0);
    const payable = transactions.filter(t => t.type === 'DESPESA' && t.status !== 'Pago').reduce((a, b) => a + Number(b.amount), 0);
    
    const overdue = transactions.filter(t => t.status === 'Vencido').length;

    return { revenue, expenses, profit, margin, receivable, payable, overdue };
  }, [transactions]);

  const filteredData = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           t.client_supplier_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'Todas' || t.category === categoryFilter;
      const matchesStatus = statusFilter === 'Todos' || t.status === statusFilter;
      const matchesProject = projectFilter === 'Todas Unidades' || t.project_id === projectFilter;
      return matchesSearch && matchesCategory && matchesStatus && matchesProject;
    });
  }, [transactions, searchTerm, categoryFilter, statusFilter, projectFilter]);

  const chartData = useMemo(() => {
    // Agrupar por data para o gráfico de fluxo
    const days: any = {};
    transactions.slice(0, 15).forEach(t => {
      const d = t.date.split('T')[0];
      if (!days[d]) days[d] = { name: d, receita: 0, despesa: 0 };
      if (t.type === 'RECEITA') days[d].receita += Number(t.amount);
      else days[d].despesa += Number(t.amount);
    });
    return Object.values(days).sort((a:any, b:any) => a.name.localeCompare(b.name));
  }, [transactions]);

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...newLaunch, date: new Date().toISOString() };
      const { error } = await supabase.from('transactions').insert([payload]);
      if (error) throw error;
      setShowLaunchModal(false);
      fetchData();
    } catch (e) {
      alert("Erro ao lançar transação.");
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = ["Data", "Descrição", "Tipo", "Categoria", "Valor", "Status"];
    const rows = filteredData.map(t => [t.date, t.description, t.type, t.category, t.amount, t.status]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "relatorio_financeiro.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 max-w-[1600px] mx-auto">
      
      {/* 1) TOP BAR DE FILTROS GLOBAIS */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col lg:flex-row items-center gap-6 sticky top-0 z-[60]">
        <div className="flex-1 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
            <Calendar size={16} className="text-blue-600" />
            <select value={periodFilter} onChange={e => setPeriodFilter(e.target.value)} className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer">
              <option>Hoje</option><option>Esta Semana</option><option>Este Mês</option><option>Este Ano</option><option>Personalizado</option>
            </select>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
            <Building size={16} className="text-blue-600" />
            <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)} className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer">
              <option>Todas Unidades</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
            <Tag size={16} className="text-blue-600" />
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer">
              <option>Todas</option><option>Vendas</option><option>Operacional</option><option>Salários</option><option>Marketing</option>
            </select>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
            <AlertCircle size={16} className="text-blue-600" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer">
              <option>Todos</option><option>Pago</option><option>Pendente</option><option>Vencido</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Pesquisar..." className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl border-none text-[11px] font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all" />
          </div>
          <button onClick={() => setShowLaunchModal(true)} className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg hover:scale-105 transition-all">
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* 2) KPIs FINANCEIROS AVANÇADOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-6">
        {[
          { label: 'Receita', val: `${kpis.revenue.toLocaleString()} MT`, icon: <ArrowUpCircle size={20}/>, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Despesa', val: `${kpis.expenses.toLocaleString()} MT`, icon: <ArrowDownCircle size={20}/>, color: 'text-rose-500', bg: 'bg-rose-50' },
          { label: 'Lucro Líquido', val: `${kpis.profit.toLocaleString()} MT`, icon: <DollarSign size={20}/>, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Margem %', val: `${kpis.margin.toFixed(1)}%`, icon: <TrendingUp size={20}/>, color: 'text-indigo-500', bg: 'bg-indigo-50' },
          { label: 'Saldo Caixa', val: `${(kpis.revenue - kpis.expenses).toLocaleString()} MT`, icon: <Zap size={20}/>, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'A Receber', val: `${kpis.receivable.toLocaleString()} MT`, icon: <FileText size={20}/>, color: 'text-blue-400', bg: 'bg-blue-50' },
          { label: 'A Pagar', val: `${kpis.payable.toLocaleString()} MT`, icon: <FileSpreadsheet size={20}/>, color: 'text-rose-400', bg: 'bg-rose-50' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className={`w-10 h-10 ${kpi.bg} ${kpi.color} rounded-xl flex items-center justify-center mb-4`}>
              {kpi.icon}
            </div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
            <h4 className="text-sm font-black text-slate-900 tracking-tighter">{kpi.val}</h4>
          </div>
        ))}
      </div>

      {/* 3) GRÁFICOS E INSIGHTS */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <div className="xl:col-span-8 bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl relative overflow-hidden">
           <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
              <div>
                 <h3 className="text-xl font-black text-slate-900 uppercase italic">Fluxo de <span className="text-blue-600">Caixa Diário</span></h3>
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.5em] mt-2">Movimentação Real (Entradas/Saídas)</p>
              </div>
           </div>
           
           <div className="h-[350px] w-full min-h-[350px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                 <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                      <linearGradient id="colorDes" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/><stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="receita" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRec)" strokeWidth={3} />
                    <Area type="monotone" dataKey="despesa" stroke="#f43f5e" fillOpacity={1} fill="url(#colorDes)" strokeWidth={3} />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="xl:col-span-4 bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-2xl flex flex-col justify-between overflow-hidden relative">
           <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                 <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center"><Zap size={20} className="text-white" /></div>
                 <h4 className="text-xs font-black uppercase tracking-[0.4em] text-indigo-400">Monte IA Insights</h4>
              </div>
              <div className="space-y-6">
                 {aiInsight ? aiInsight.split('\n').map((line, i) => (
                   <div key={i} className="flex gap-4 group">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 group-hover:scale-150 transition-all"></div>
                      <p className="text-sm font-medium leading-relaxed italic text-slate-300">"{line}"</p>
                   </div>
                 )) : (
                   <div className="flex flex-col items-center gap-4 py-10 opacity-40">
                      <Loader2 size={32} className="animate-spin" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Consultando Rede Neural Financeira...</p>
                   </div>
                 )}
              </div>
           </div>
           <button onClick={fetchData} className="mt-10 py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Recalcular Cenários</button>
        </div>
      </div>

      {/* Rest of the component remains same... */}
      <div className="bg-white rounded-[4rem] border border-slate-100 shadow-xl overflow-hidden min-h-[600px] flex flex-col">
        <div className="flex border-b border-slate-50 bg-slate-50/20 p-2">
           {[
             { id: 'transactions', label: 'Transações', icon: <LayoutList size={16}/> },
             { id: 'receivable', label: 'Contas a Receber', icon: <ArrowUpCircle size={16}/> },
             { id: 'payable', label: 'Contas a Pagar', icon: <ArrowDownCircle size={16}/> },
             { id: 'reports', label: 'Relatórios & Export', icon: <BarChart3 size={16}/> },
           ].map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as FinanceTab)}
               className={`flex-1 flex items-center justify-center gap-3 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-md ring-1 ring-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
             >
               {tab.icon} {tab.label}
             </button>
           ))}
        </div>

        <div className="flex-1 overflow-x-auto p-6">
           {activeTab === 'reports' ? (
             <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-8 animate-in zoom-in-95">
                {[
                  { title: 'Fluxo de Caixa', desc: 'DRE e movimentação diária.', action: exportCSV, icon: <FileSpreadsheet className="text-blue-500" /> },
                  { title: 'Inadimplência', desc: 'Faturas vencidas e não pagas.', action: () => {}, icon: <AlertTriangle className="text-rose-500" /> },
                  { title: 'Custos por Projeto', desc: 'Rentabilidade por unidade de obra.', action: () => {}, icon: <Building className="text-indigo-500" /> },
                ].map((rep, i) => (
                  <div key={i} className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 hover:bg-white hover:shadow-2xl transition-all group flex flex-col items-center text-center">
                     <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-inner mb-6 group-hover:scale-110 transition-transform">
                        {rep.icon}
                     </div>
                     <h4 className="text-lg font-black text-slate-900 mb-2">{rep.title}</h4>
                     <p className="text-xs text-slate-500 mb-8">{rep.desc}</p>
                     <button onClick={rep.action} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-600 transition-all">
                        <Download size={16} /> Exportar CSV
                     </button>
                  </div>
                ))}
             </div>
           ) : (
             <table className="w-full text-left">
               <thead>
                 <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                   <th className="px-6 py-4">Data / Vencimento</th>
                   <th className="px-6 py-4">Descrição / Cliente</th>
                   <th className="px-6 py-4">Categoria / Unidade</th>
                   <th className="px-6 py-4">Status</th>
                   <th className="px-6 py-4 text-right">Valor</th>
                   <th className="px-6 py-4 text-center">Acções</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {filteredData
                   .filter(t => {
                     if (activeTab === 'receivable') return t.type === 'RECEITA';
                     if (activeTab === 'payable') return t.type === 'DESPESA';
                     return true;
                   })
                   .map(t => (
                   <tr key={t.id} className="hover:bg-slate-50/50 transition-all group">
                     <td className="px-6 py-6">
                       <p className="text-[11px] font-black text-slate-900">{new Date(t.date).toLocaleDateString('pt-MZ')}</p>
                       {t.due_date && <p className="text-[9px] font-bold text-rose-400 mt-1 uppercase">Vence: {new Date(t.due_date).toLocaleDateString('pt-MZ')}</p>}
                     </td>
                     <td className="px-6 py-6">
                        <p className="text-sm font-black text-slate-900 leading-none mb-1.5">{t.description}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{t.client_supplier_name || 'Fluxo Interno'}</p>
                     </td>
                     <td className="px-6 py-6">
                        <div className="flex flex-col gap-1.5">
                           <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase w-fit tracking-wider">{t.category}</span>
                           <span className="text-[9px] font-bold text-blue-500 uppercase tracking-tighter truncate max-w-[150px]">{t.project?.name || 'Geral'}</span>
                        </div>
                     </td>
                     <td className="px-6 py-6">
                        <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          t.status === 'Pago' ? 'bg-emerald-50 text-emerald-600' : 
                          t.status === 'Vencido' ? 'bg-rose-50 text-rose-600 animate-pulse' : 
                          'bg-amber-50 text-amber-600'
                        }`}>
                          {t.status}
                        </span>
                     </td>
                     <td className={`px-6 py-6 text-right font-black text-sm tracking-tighter ${t.type === 'RECEITA' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {t.type === 'RECEITA' ? '+' : '-'} {Number(t.amount).toLocaleString()} MT
                     </td>
                     <td className="px-6 py-6 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button className="p-2 bg-white text-slate-400 hover:text-blue-600 rounded-lg shadow-sm border border-slate-100 transition-all"><FileText size={14}/></button>
                           <button className="p-2 bg-white text-slate-400 hover:text-emerald-600 rounded-lg shadow-sm border border-slate-100 transition-all"><CheckCircle2 size={14}/></button>
                        </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           )}
        </div>
      </div>
    </div>
  );
};

export default FinanceView;
