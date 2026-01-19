
import React, { useState, useEffect } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';
import { 
  TrendingUp, Users, Sparkles, Edit3, Trash2, Plus, Zap, ShieldCheck, 
  X, Check, Layout, Eye, MoreHorizontal, BarChart3, FileText, 
  ShieldAlert, UserPlus, Key, Download, FilePlus, Camera, Settings,
  FileSearch, UserCircle, Briefcase, ChevronRight, Lock, Printer
} from 'lucide-react';
import { getStrategicInsight } from '../geminiService';
import { MOCK_PROPERTIES, MOCK_EMPLOYEES } from '../constants';
import { UserRole, Employee, ContractType } from '../types';

interface StatCard {
  id: string;
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: string;
}

const DashboardView: React.FC = () => {
  const [insight, setInsight] = useState<string>('Analisando métricas de produtividade e fluxo de caixa...');
  const [isMounted, setIsMounted] = useState(false);
  const [stats, setStats] = useState<StatCard[]>([
    { id: '1', label: 'Receita Operacional', value: '45.200.000 MT', change: '+12.5%', trend: 'up', icon: 'TrendingUp' },
    { id: '2', label: 'Quadro de Pessoal', value: MOCK_EMPLOYEES.length.toString(), change: '+3', trend: 'up', icon: 'Users' },
    { id: '3', label: 'Contratos Activos', value: '112', change: '+14', trend: 'up', icon: 'FileText' },
    { id: '4', label: 'Activos Sob Gestão', value: '128', change: '+8', trend: 'up', icon: 'ShieldCheck' },
  ]);

  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES.map(e => ({ ...e, role: e.role as UserRole, permissions: ['Basico'] })));
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [isPermModalOpen, setIsPermModalOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);

  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({
    name: '', role: UserRole.SALES, department: 'Vendas', salary: 0, status: 'Ativo', permissions: ['Vendas']
  });

  const [newContractFile, setNewContractFile] = useState<File | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const fetchInsight = async () => {
      const msg = await getStrategicInsight("45M MT em receitas, foco em gestão de staff imobiliário e manutenção técnica.");
      setInsight(msg);
    };
    fetchInsight();
  }, []);

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const emp: Employee = {
      id: Math.random().toString(36).substr(2, 9),
      name: newEmployee.name || 'Sem Nome',
      role: newEmployee.role || UserRole.EMPLOYEE,
      department: newEmployee.department || 'Operações',
      salary: Number(newEmployee.salary) || 0,
      status: 'Ativo',
      avatar: `https://picsum.photos/seed/${newEmployee.name}/100`,
      email: `${(newEmployee.name || 'user').toLowerCase().split(' ')[0]}@monte-chaisa.com`,
      phone: '+258 84 000 0000',
      joinDate: new Date().toISOString().split('T')[0],
      permissions: newEmployee.permissions || []
    };
    setEmployees([emp, ...employees]);
    setIsEmpModalOpen(false);
    setNewEmployee({ name: '', role: UserRole.SALES, department: 'Vendas', salary: 0, permissions: ['Vendas'] });
  };

  const removeEmployee = (id: string) => {
    if (confirm('Deseja remover este colaborador e todos os seus vínculos de acesso?')) {
      setEmployees(employees.filter(e => e.id !== id));
    }
  };

  const handleExportAreaReport = (area: string) => {
    setSelectedArea(area);
    setIsReporting(true);
    setTimeout(() => {
      setIsReporting(false);
      setSelectedArea(null);
      alert(`Relatório detalhado da área de ${area} gerado e pronto para download.`);
    }, 2000);
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'TrendingUp': return <TrendingUp size={20} />;
      case 'Users': return <Users size={20} />;
      case 'FileText': return <FileText size={20} />;
      case 'ShieldCheck': return <ShieldCheck size={20} />;
      case 'Zap': return <Zap size={20} />;
      default: return <Layout size={20} />;
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      {/* Main Header with Global Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="min-w-0">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Monte & Chaisa <span className="text-blue-600">Command Center</span>
          </h1>
          <p className="text-slate-500 font-medium">Controlo estratégico de activos, capital humano e compliance.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
           <button onClick={() => setIsEmpModalOpen(true)} className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-xs hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95">
             <UserPlus size={16} /> Admissão de Staff
           </button>
           <button onClick={() => setIsContractModalOpen(true)} className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-xs shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95">
             <FilePlus size={16} /> Novo Contrato PDF
           </button>
           <button onClick={() => setIsPermModalOpen(true)} className="flex items-center gap-2 px-6 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-2xl font-black text-xs hover:bg-slate-50 transition-all shadow-sm">
             <Lock size={16} /> Matriz de Acessos
           </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.id} className="group bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all"><Edit3 size={14} /></button>
            </div>
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-slate-50 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
                {renderIcon(stat.icon)}
              </div>
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${stat.trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {stat.change}
              </span>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8 min-w-0">
          {/* Main Visual Data Container */}
          <div className="bg-white p-6 md:p-10 rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5"><BarChart3 size={150} className="text-blue-600" /></div>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 relative z-10 gap-4">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Performance M&C Enterprise</h3>
                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Fluxo Financeiro em MT (Moçambique)</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleExportAreaReport('Financeiro Geral')} disabled={isReporting} className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase hover:bg-slate-100 transition-all">
                  {isReporting && selectedArea === 'Financeiro Geral' ? <Sparkles size={14} className="animate-spin" /> : <Printer size={14} />} 
                  Relatório Financeiro
                </button>
              </div>
            </div>
            
            <div className="h-[350px] w-full min-w-0 relative z-10 overflow-hidden" style={{ minHeight: '350px' }}>
              {isMounted && (
                <ResponsiveContainer width="100%" height="100%" debounce={100}>
                  <AreaChart 
                    data={[
                      { name: 'Jan', val: 12000000, exp: 8000000 }, { name: 'Fev', val: 18500000, exp: 9500000 }, 
                      { name: 'Mar', val: 16200000, exp: 11000000 }, { name: 'Abr', val: 24800000, exp: 14000000 }, 
                      { name: 'Mai', val: 32100000, exp: 12500000 }, { name: 'Jun', val: 45200000, exp: 18000000 }
                    ]}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} tickFormatter={(v) => `${v/1000000}M`} />
                    <Tooltip 
                      contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)'}}
                      itemStyle={{fontWeight: '900', fontSize: '12px'}}
                      formatter={(value: any) => [`${value.toLocaleString()} MT`, '']}
                    />
                    <Area type="monotone" dataKey="val" stroke="#3b82f6" strokeWidth={5} fillOpacity={1} fill="url(#colorVal)" name="Receita" />
                    <Area type="monotone" dataKey="exp" stroke="#f43f5e" strokeWidth={3} strokeDasharray="10 10" fillOpacity={1} fill="url(#colorExp)" name="Despesa" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* AI Strategy & Insights */}
          <div className="bg-slate-900 p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000"></div>
            <div className="flex items-center gap-5 mb-10 relative z-10">
              <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-blue-500/40">
                <Sparkles size={32} className="text-white animate-pulse" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight">Estratégia Monte Brain IA</h2>
                <p className="text-xs text-blue-400 font-black uppercase tracking-widest">Análise de IA & Inteligência de Negócio</p>
              </div>
            </div>
            <p className="text-blue-50 leading-relaxed text-xl font-medium relative z-10 pl-8 border-l-4 border-blue-600 italic">
              "{insight}"
            </p>
          </div>
        </div>

        {/* Sidebar: Sector Reports & Staff Management */}
        <div className="space-y-8">
          <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 mb-8 tracking-tight flex items-center gap-3">
              <FileSearch className="text-blue-600" /> Relatórios por Área
            </h3>
            <div className="space-y-4">
              {[
                { label: 'RH & Salários', area: 'RH', icon: <Users size={18} /> },
                { label: 'Vendas Imobiliárias', area: 'Vendas', icon: <TrendingUp size={18} /> },
                { label: 'Gestão Hoteleira', area: 'Hotéis', icon: <Briefcase size={18} /> },
                { label: 'Manutenção Técnica', area: 'Operações', icon: <Settings size={18} /> }
              ].map((rep, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleExportAreaReport(rep.area)}
                  disabled={isReporting}
                  className="w-full flex items-center justify-between p-5 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 rounded-3xl transition-all group border border-transparent hover:border-blue-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-xl text-slate-400 group-hover:text-blue-600 shadow-sm">{rep.icon}</div>
                    <span className="text-xs font-black uppercase tracking-wider">{rep.label}</span>
                  </div>
                  {isReporting && selectedArea === rep.area ? <Sparkles size={16} className="animate-spin" /> : <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-600 transition-all group-hover:translate-x-1" />}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Staff de Elite</h3>
              <button className="p-2 text-slate-400 hover:text-slate-900 bg-slate-50 rounded-xl"><MoreHorizontal size={20} /></button>
            </div>
            <div className="space-y-6">
              {employees.slice(0, 5).map(emp => (
                <div key={emp.id} className="flex items-center gap-4 group relative pr-12 cursor-pointer">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md shrink-0 border-2 border-white group-hover:border-blue-100 transition-all">
                    <img src={emp.avatar} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={emp.name} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{emp.name}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{emp.role}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); removeEmployee(emp.id); }} className="absolute right-0 top-1/2 -translate-y-1/2 p-2.5 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => setIsEmpModalOpen(true)} className="w-full mt-10 py-5 bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-500 rounded-3xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
              <UserPlus size={16} /> Ver Toda a Equipa
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Admissão de Staff & Gestão de Perfil */}
      {isEmpModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-10 max-w-xl w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setIsEmpModalOpen(false)} className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-900 bg-slate-50 rounded-xl"><X size={24} /></button>
            <div className="flex items-center gap-4 mb-10">
              <div className="p-4 bg-blue-600 text-white rounded-[1.5rem] shadow-xl shadow-blue-500/20">
                <UserPlus size={28} />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Admissão de Colaborador</h2>
            </div>
            <form onSubmit={handleAddEmployee} className="space-y-6">
              <div className="flex justify-center mb-6">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-[2rem] bg-slate-100 overflow-hidden border-4 border-white shadow-lg">
                    <img src={newEmployee.name ? `https://picsum.photos/seed/${newEmployee.name}/150` : 'https://www.gravatar.com/avatar/000?d=mp'} className="w-full h-full object-cover" alt="Profile" />
                  </div>
                  <button type="button" className="absolute bottom-2 right-2 p-2 bg-blue-600 text-white rounded-xl shadow-lg border-2 border-white hover:scale-110 transition-transform">
                    <Camera size={16} />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo do Funcionário</label>
                <input required value={newEmployee.name} onChange={e => setNewEmployee({...newEmployee, name: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-900" placeholder="Ex: António Mahumana" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cargo & Responsabilidade</label>
                  <select value={newEmployee.role} onChange={e => setNewEmployee({...newEmployee, role: e.target.value as UserRole})} className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-900 appearance-none">
                    {Object.values(UserRole).map(role => <option key={role} value={role}>{role}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Salário Base (MT)</label>
                  <input required type="number" value={newEmployee.salary} onChange={e => setNewEmployee({...newEmployee, salary: Number(e.target.value)})} className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-900" placeholder="0.00" />
                </div>
              </div>
              <button type="submit" className="w-full py-5 bg-blue-600 text-white font-black rounded-3xl shadow-2xl shadow-blue-500/30 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active:scale-95">
                Validar e Registar Staff <Check size={20} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Matriz de Permissões */}
      {isPermModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-10 max-w-2xl w-full shadow-2xl relative">
            <button onClick={() => setIsPermModalOpen(false)} className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-900 bg-slate-50 rounded-xl"><X size={24} /></button>
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-indigo-600 text-white rounded-[1.5rem] shadow-xl shadow-indigo-500/20">
                <Key size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900">Políticas de Acesso M&C</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Gestão de Permissões por Departamento</p>
              </div>
            </div>
            <div className="space-y-6">
               <div className="bg-amber-50 border border-amber-100 p-5 rounded-[2rem] flex items-start gap-4">
                 <ShieldAlert className="text-amber-600 shrink-0" size={24} />
                 <p className="text-xs font-bold text-amber-900 leading-relaxed">Atenção: A alteração de permissões críticas pode expor dados financeiros e sensíveis de clientes. Apenas administradores podem validar estas mudanças.</p>
               </div>
               <div className="overflow-hidden rounded-3xl border border-slate-100">
                 <table className="w-full text-left">
                   <thead className="bg-slate-50">
                     <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       <th className="px-6 py-4">Módulo Operacional</th>
                       <th className="px-6 py-4 text-center">Visualizar</th>
                       <th className="px-6 py-4 text-center">Escrita</th>
                       <th className="px-6 py-4 text-center">Relatórios</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                     {['Financeiro', 'Staff/RH', 'Imobiliária', 'Tecnologia', 'Auditoria'].map(mod => (
                       <tr key={mod} className="hover:bg-slate-50/50 transition-all">
                         <td className="px-6 py-4 text-sm font-bold text-slate-800">{mod}</td>
                         <td className="px-6 py-4 text-center"><input type="checkbox" defaultChecked className="w-4 h-4 rounded-md text-blue-600 focus:ring-blue-500 border-slate-300" /></td>
                         <td className="px-6 py-4 text-center"><input type="checkbox" className="w-4 h-4 rounded-md text-blue-600 focus:ring-blue-500 border-slate-300" /></td>
                         <td className="px-6 py-4 text-center"><input type="checkbox" className="w-4 h-4 rounded-md text-blue-600 focus:ring-blue-500 border-slate-300" /></td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
               <button onClick={() => setIsPermModalOpen(false)} className="w-full py-5 bg-slate-900 text-white font-black rounded-3xl shadow-xl transition-all hover:bg-slate-800 active:scale-95">
                 Guardar Configuração de Segurança
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Novo Contrato PDF */}
      {isContractModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-10 max-w-lg w-full shadow-2xl relative">
            <button onClick={() => setIsContractModalOpen(false)} className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-900 bg-slate-50 rounded-xl"><X size={24} /></button>
            <div className="flex items-center gap-4 mb-10">
              <div className="p-4 bg-blue-600 text-white rounded-[1.5rem] shadow-xl shadow-blue-500/20">
                <FilePlus size={28} />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Upload de Contrato PDF</h2>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Colaborador Vinculado</label>
                <select className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-900 appearance-none">
                  <option value="">Selecionar Staff...</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.department})</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Documento</label>
                <select className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-900 appearance-none">
                  <option>Contrato de Trabalho</option>
                  <option>Acordo de Confidencialidade (NDA)</option>
                  <option>Termo de Responsabilidade</option>
                  <option>Certificado de Formação</option>
                </select>
              </div>
              <div className="border-4 border-dashed border-slate-100 rounded-[2.5rem] p-12 flex flex-col items-center justify-center gap-4 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer relative group">
                <input 
                  type="file" 
                  accept=".pdf" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={(e) => setNewContractFile(e.target.files?.[0] || null)}
                />
                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-slate-300 group-hover:text-blue-600 shadow-sm transition-all">
                  <Download size={32} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-black text-slate-900">{newContractFile ? newContractFile.name : 'Clique ou arraste o PDF'}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{newContractFile ? `${(newContractFile.size / 1024 / 1024).toFixed(2)} MB` : 'Suporte apenas para ficheiros PDF'}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  if (newContractFile) {
                    alert('Contrato PDF arquivado com sucesso no perfil do colaborador.');
                    setIsContractModalOpen(false);
                    setNewContractFile(null);
                  } else {
                    alert('Por favor, selecione um ficheiro PDF primeiro.');
                  }
                }}
                className="w-full py-5 bg-blue-600 text-white font-black rounded-3xl shadow-2xl hover:bg-blue-700 transition-all active:scale-95"
              >
                Vincular Documento PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardView;
