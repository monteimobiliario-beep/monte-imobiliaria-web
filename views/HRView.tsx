
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Plus, Users, AlertCircle, Clock, 
  Loader2, X, Trash2, Save, Mail, Phone, 
  Edit3, ShieldCheck, AlertTriangle, Briefcase, 
  Search, MapPin, DollarSign, RefreshCw,
  CheckCircle2, UserPlus, Fingerprint,
  BellRing,
  Calendar,
  Building2,
  FileBadge,
  Heart,
  Download,
  Info,
  CreditCard,
  Map,
  Shield
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Employee, UserRole, JobVacancy, JobApplication } from '../types';

const NOTIFICATION_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

const HRView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'employees' | 'vacancies' | 'applications'>('employees');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [vacancies, setVacancies] = useState<JobVacancy[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingEmp, setViewingEmp] = useState<Employee | null>(null);
  const [editingEmpId, setEditingEmpId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [realtimeNotification, setRealtimeNotification] = useState<{name: string, job: string} | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [staffSearch, setStaffSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('Todos');

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const initialFormState: Partial<Employee> = {
    name: '', role: UserRole.EMPLOYEE, department: 'Geral', salary: 0, 
    email: '', phone: '+258 ', document_type: 'BI', document_number: '', 
    document_expiry: '', payment_method: 'Banco', 
    contract_start: new Date().toISOString().split('T')[0],
    status: 'Ativo', join_date: new Date().toISOString().split('T')[0],
    nuit: '', niss: '', emergency_contact: '', gender: 'M', address: ''
  };

  const [formState, setFormState] = useState<Partial<Employee>>(initialFormState);

  useEffect(() => {
    audioRef.current = new Audio(NOTIFICATION_SOUND);
    fetchData();
    fetchVacancies();
    fetchApplications();

    const channel = supabase
      .channel('hr_realtime_dashboard')
      .on('postgres_changes', { event: 'INSERT', table: 'job_applications' }, (payload) => {
        const newApp = payload.new as JobApplication;
        setApplications(prev => [newApp, ...prev]);
        if (audioRef.current) audioRef.current.play().catch(() => {});
        setRealtimeNotification({ name: newApp.applicant_name, job: newApp.job_title });
        setTimeout(() => setRealtimeNotification(null), 8000);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const { data, error: sbError } = await supabase.from('employees').select('*').order('name');
      if (sbError) setError(sbError.message);
      setEmployees(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchVacancies() {
    try {
      const { data } = await supabase.from('job_vacancies').select('*').order('created_at', { ascending: false });
      if (data) setVacancies(data);
    } catch (err) {}
  }

  async function fetchApplications() {
    try {
      const { data } = await supabase.from('job_applications').select('*').order('created_at', { ascending: false });
      if (data) setApplications(data);
    } catch (err) {}
  }

  const staffStats = useMemo(() => {
    const active = employees.filter(e => e.status === 'Ativo').length;
    const expiringDocs = employees.filter(e => {
      if (!e.document_expiry) return false;
      const today = new Date();
      const expiry = new Date(e.document_expiry);
      const diff = (expiry.getTime() - today.getTime()) / (1000 * 3600 * 24);
      return diff <= 30;
    }).length;
    const onVacation = employees.filter(e => e.status === 'Férias').length;
    return { active, expiringDocs, onVacation, total: employees.length };
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => {
      const matchesSearch = e.name.toLowerCase().includes(staffSearch.toLowerCase()) || e.email.toLowerCase().includes(staffSearch.toLowerCase());
      const matchesDept = deptFilter === 'Todos' || e.department === deptFilter;
      return matchesSearch && matchesDept;
    });
  }, [employees, staffSearch, deptFilter]);

  const departments = ['Todos', 'Vendas', 'Administrativo', 'Engenharia', 'TI', 'Manutenção', 'Direcção', 'Geral'];

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formState.name || formState.name.trim().length < 3) { setError("Nome inválido."); return; }
    setSaving(true);
    try {
      const payload = { 
        ...formState, 
        salary: Number(formState.salary),
        avatar: formState.avatar || `https://picsum.photos/seed/${formState.name}/100` 
      };
      
      let res;
      if (editingEmpId) {
        res = await supabase.from('employees').update(payload).eq('id', editingEmpId);
      } else {
        res = await supabase.from('employees').insert([payload]);
      }

      if (res.error) throw res.error;
      
      setShowAddModal(false);
      setEditingEmpId(null);
      setFormState(initialFormState);
      fetchData();
    } catch (err: any) { 
      setError(err.message); 
    } finally { 
      setSaving(false); 
    }
  };

  const openViewModal = (emp: Employee) => {
    setViewingEmp(emp);
    setShowViewModal(true);
  };

  const getExpiryStatus = (expiryDate?: string) => {
    if (!expiryDate) return { label: 'Pendente', color: 'bg-slate-100 text-slate-400 border-slate-200' };
    const today = new Date();
    const expiry = new Date(expiryDate);
    if (expiry < today) return { label: 'Expirado', color: 'bg-rose-50 text-rose-600 border-rose-100' };
    const diff = (expiry.getTime() - today.getTime()) / (1000 * 3600 * 24);
    if (diff <= 30) return { label: 'A Vencer', color: 'bg-amber-50 text-amber-600 border-amber-100' };
    return { label: 'Regular', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <Loader2 className="animate-spin text-indigo-600" size={48} />
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Sincronizando Ecossistema Monte Staff...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 relative">
      
      {realtimeNotification && (
        <div className="fixed top-24 right-8 z-[200] bg-slate-900 text-white p-6 rounded-[2.5rem] shadow-2xl flex items-center gap-5 animate-in slide-in-from-right-10 border border-emerald-500/30 backdrop-blur-xl">
           <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center animate-bounce">
             <BellRing size={24} />
           </div>
           <div>
              <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Nova Candidatura</p>
              <h4 className="text-sm font-bold truncate">{realtimeNotification.name}</h4>
           </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
           <div className="w-14 h-14 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-indigo-500/20"><Users size={28} /></div>
           <div>
             <h1 className="text-3xl font-black text-slate-900 tracking-tight">Recursos Humanos</h1>
             <p className="text-slate-500 font-medium italic">Gestão integral de talentos e conformidade.</p>
           </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'reports' }))} className="px-6 py-4 bg-white text-slate-600 border border-slate-200 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2">
            <Download size={18} /> Exportar CSV
          </button>
          <button onClick={() => { setEditingEmpId(null); setFormState(initialFormState); setShowAddModal(true); }} className="px-8 py-4 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-2">
            <UserPlus size={18} /> Admitir Staff
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
         {[
           { label: 'Staff Total', value: staffStats.total, icon: <Users className="text-blue-600"/>, bg: 'bg-blue-50' },
           { label: 'Activos Agora', value: staffStats.active, icon: <CheckCircle2 className="text-emerald-600"/>, bg: 'bg-emerald-50' },
           { label: 'Alertas Doc.', value: staffStats.expiringDocs, icon: <AlertTriangle className="text-amber-600"/>, bg: 'bg-amber-50' },
           { label: 'Férias/Ausentes', value: staffStats.onVacation, icon: <Heart className="text-rose-600"/>, bg: 'bg-rose-50' },
         ].map((stat, i) => (
           <div key={i} className="bg-white p-7 rounded-[3rem] border border-slate-100 shadow-sm flex items-center gap-5">
              <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center shadow-inner`}>{stat.icon}</div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
                 <p className="text-2xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
              </div>
           </div>
         ))}
      </div>

      <div className="flex p-1.5 bg-slate-100 rounded-[2.5rem] w-full max-w-lg mx-auto border border-slate-200 shadow-inner mb-6">
        <button onClick={() => setActiveTab('employees')} className={`flex-1 py-3 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'employees' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500'}`}>Base de Staff</button>
        <button onClick={() => setActiveTab('vacancies')} className={`flex-1 py-3 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'vacancies' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500'}`}>Vagas Abertas</button>
        <button onClick={() => setActiveTab('applications')} className={`flex-1 py-3 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'applications' ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-500'}`}>Candidatos</button>
      </div>

      {activeTab === 'employees' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-6 rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6">
             <div className="relative flex-1">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input value={staffSearch} onChange={e => setStaffSearch(e.target.value)} placeholder="Localizar identidade..." className="w-full pl-16 pr-6 py-5 bg-slate-50 rounded-[2rem] border-none outline-none font-bold text-sm focus:ring-4 focus:ring-indigo-100" />
             </div>
             <div className="flex items-center gap-3 bg-slate-50 px-6 rounded-[2rem] border border-slate-100">
                <Building2 size={16} className="text-slate-400" />
                <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="bg-transparent font-black text-[10px] uppercase text-slate-600 outline-none py-5 cursor-pointer">
                   {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredEmployees.map((emp) => {
              const docStatus = getExpiryStatus(emp.document_expiry);
              return (
                <div 
                  key={emp.id} 
                  onClick={() => openViewModal(emp)}
                  className="bg-white p-8 rounded-[4rem] border border-slate-100 shadow-sm relative group hover:shadow-2xl transition-all cursor-pointer overflow-hidden text-center"
                >
                  <div className={`absolute top-0 right-0 w-24 h-24 opacity-[0.03] rounded-full -translate-y-1/2 translate-x-1/2 bg-indigo-600 transition-all group-hover:scale-150`}></div>
                  <div className={`absolute top-6 right-6 px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest ${docStatus.color}`}>
                    {docStatus.label}
                  </div>
                  <div className="flex flex-col items-center relative z-10">
                    <div className="relative mb-6">
                      <img src={emp.avatar} className="w-24 h-24 rounded-[2.5rem] object-cover ring-8 ring-slate-50 shadow-md group-hover:scale-105 transition-transform" alt="" />
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 border-4 border-white rounded-full ${emp.status === 'Ativo' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 leading-tight mb-1 truncate w-full px-4">{emp.name}</h3>
                    <p className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-4 bg-indigo-50 px-4 py-1.5 rounded-full">{emp.role}</p>
                    <div className="flex items-center gap-4 text-slate-400">
                       <Mail size={14} className="hover:text-indigo-600 transition-colors" />
                       <Phone size={14} className="hover:text-emerald-600 transition-colors" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL ADIÇÃO DE STAFF - REFINADO */}
      {showAddModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in">
          <div className="bg-white rounded-[5rem] p-10 md:p-16 max-w-6xl w-full shadow-2xl relative overflow-y-auto max-h-[90vh] custom-scrollbar border-t-[20px] border-indigo-600">
            <button onClick={() => setShowAddModal(false)} className="absolute top-10 right-10 p-4 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-[2rem] transition-all hover:rotate-90"><X size={32} /></button>
            
            <div className="flex items-center gap-6 mb-16">
               <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[2.5rem] flex items-center justify-center shadow-inner"><UserPlus size={40} /></div>
               <div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase italic">{editingEmpId ? 'Atualizar Dossiê' : 'Admissão de Staff Monte'}</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mt-2 flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-500" /> Sincronização Segura v15.0
                  </p>
               </div>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-20">
              {/* SECÇÃO 1: IDENTIDADE & CONTRATO */}
              <div className="space-y-10">
                <div className="flex items-center gap-6">
                   <div className="h-px flex-1 bg-slate-100"></div>
                   <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.6em] flex items-center gap-3">
                     <FileBadge size={16} className="text-indigo-600" /> Vínculo Corporativo
                   </h3>
                   <div className="h-px flex-1 bg-slate-100"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2"><Info size={12} /> Nome Completo</label>
                    <input required value={formState.name} onChange={e => setFormState({...formState, name: e.target.value})} className="w-full bg-slate-50 border-none rounded-[1.8rem] p-6 font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-100 shadow-inner" placeholder="Nome Completo" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2"><Mail size={12} /> E-mail Profissional</label>
                    <input required type="email" value={formState.email} onChange={e => setFormState({...formState, email: e.target.value})} className="w-full bg-slate-50 border-none rounded-[1.8rem] p-6 font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-100 shadow-inner" placeholder="exemplo@monte.mz" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2"><Phone size={12} /> Telemóvel</label>
                    <input required value={formState.phone} onChange={e => setFormState({...formState, phone: e.target.value})} className="w-full bg-slate-50 border-none rounded-[1.8rem] p-6 font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-100 shadow-inner" placeholder="+258 8..." />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Cargo / Responsabilidade</label>
                    <select value={formState.role} onChange={e => setFormState({...formState, role: e.target.value as UserRole})} className="w-full bg-slate-50 border-none rounded-[1.8rem] p-6 font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-100 cursor-pointer shadow-inner">
                      {Object.values(UserRole).map(role => <option key={role} value={role}>{role}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Departamento</label>
                    <select value={formState.department} onChange={e => setFormState({...formState, department: e.target.value})} className="w-full bg-slate-50 border-none rounded-[1.8rem] p-6 font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-100 cursor-pointer shadow-inner">
                      {departments.filter(d => d !== 'Todos').map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2"><DollarSign size={12} className="text-emerald-500" /> Salário Base (MT)</label>
                    <input type="number" required value={formState.salary} onChange={e => setFormState({...formState, salary: Number(e.target.value)})} className="w-full bg-slate-50 border-none rounded-[1.8rem] p-6 font-black text-lg outline-none focus:ring-4 focus:ring-emerald-50 shadow-inner" />
                  </div>
                </div>
              </div>

              {/* SECÇÃO 2: FISCAL & SOCIAL MOÇAMBIQUE */}
              <div className="space-y-10">
                <div className="flex items-center gap-6">
                   <div className="h-px flex-1 bg-slate-100"></div>
                   <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.6em] flex items-center gap-3">
                     <Fingerprint size={16} className="text-indigo-600" /> Conformidade Legal
                   </h3>
                   <div className="h-px flex-1 bg-slate-100"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">NUIT (Tributário)</label>
                    <input required value={formState.nuit} onChange={e => setFormState({...formState, nuit: e.target.value})} className="w-full bg-slate-900 text-white border-none rounded-[1.8rem] p-6 font-black tracking-widest text-sm outline-none focus:ring-4 focus:ring-indigo-500/20" placeholder="9 DÍGITOS" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">NISS (Seg. Social)</label>
                    <input required value={formState.niss} onChange={e => setFormState({...formState, niss: e.target.value})} className="w-full bg-slate-50 border-none rounded-[1.8rem] p-6 font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-100 shadow-inner" placeholder="Nº INSS" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Tipo Documento</label>
                    <select value={formState.document_type} onChange={e => setFormState({...formState, document_type: e.target.value})} className="w-full bg-slate-50 border-none rounded-[1.8rem] p-6 font-bold text-sm outline-none shadow-inner">
                       <option value="BI">Bilhete de Identidade</option>
                       <option value="Passaporte">Passaporte</option>
                       <option value="DIRE">DIRE</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Validade</label>
                    <input type="date" required value={formState.document_expiry} onChange={e => setFormState({...formState, document_expiry: e.target.value})} className="w-full bg-slate-50 border-none rounded-[1.8rem] p-6 font-bold text-sm outline-none shadow-inner" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2"><CreditCard size={12} /> Método Pagamento</label>
                    <select value={formState.payment_method} onChange={e => setFormState({...formState, payment_method: e.target.value as any})} className="w-full bg-slate-50 border-none rounded-[1.8rem] p-6 font-bold text-sm outline-none shadow-inner">
                       <option value="Banco">Transf. Bancária</option>
                       <option value="M-Pesa">M-Pesa</option>
                       <option value="e-Mola">e-Mola</option>
                       <option value="Dinheiro">Numerário</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2"><Map size={12} /> Morada Residencial</label>
                    <input required value={formState.address} onChange={e => setFormState({...formState, address: e.target.value})} className="w-full bg-slate-50 border-none rounded-[1.8rem] p-6 font-bold text-sm outline-none shadow-inner" placeholder="Cidade, Bairro, Rua, Casa nº" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2"><Shield size={12} className="text-rose-500" /> Emergência</label>
                    <input required value={formState.emergency_contact} onChange={e => setFormState({...formState, emergency_contact: e.target.value})} className="w-full bg-rose-50/30 border-2 border-rose-100 rounded-[1.8rem] p-6 font-bold text-sm outline-none focus:ring-4 focus:ring-rose-100" placeholder="Nome / Telefone" />
                  </div>
                </div>
              </div>

              <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row gap-6">
                 <button disabled={saving} type="submit" className="flex-1 py-8 bg-indigo-600 text-white font-black rounded-[2.5rem] shadow-2xl hover:bg-slate-900 transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50 text-base uppercase tracking-widest">
                    {saving ? <Loader2 className="animate-spin" size={24} /> : <><Save size={24} /> Sincronizar Dossiê Monte</>}
                 </button>
                 <button type="button" onClick={() => setShowAddModal(false)} className="px-16 py-8 bg-slate-100 text-slate-500 rounded-[2.5rem] font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Descartar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VISUALIZAÇÃO DE DOSSIÊ DETALHADO */}
      {showViewModal && viewingEmp && (
        <div className="fixed inset-0 z-[180] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-3xl animate-in fade-in duration-300">
          <div className="bg-white rounded-[5rem] max-w-6xl w-full shadow-2xl relative overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-[85vh] animate-in zoom-in-95 duration-500 border-t-[20px] border-indigo-600">
            <div className="w-full md:w-[35%] bg-slate-50 p-12 border-r border-slate-100 flex flex-col items-center text-center overflow-y-auto custom-scrollbar">
               <button onClick={() => setShowViewModal(false)} className="mb-12 p-4 bg-white text-slate-400 hover:text-slate-900 rounded-[2rem] shadow-sm transition-all self-start"><X size={24} /></button>
               <div className="relative mb-10 group">
                  <img src={viewingEmp.avatar} className="w-48 h-48 rounded-[4rem] object-cover ring-[16px] ring-white shadow-2xl transition-transform group-hover:scale-105" alt="" />
                  <div className={`absolute -bottom-2 -right-2 px-6 py-2 rounded-full border-4 border-white text-[10px] font-black uppercase text-white shadow-lg ${viewingEmp.status === 'Ativo' ? 'bg-emerald-500' : 'bg-amber-500'}`}>{viewingEmp.status}</div>
               </div>
               <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight mb-3">{viewingEmp.name}</h2>
               <p className="text-sm font-black text-indigo-600 uppercase tracking-[0.3em] bg-indigo-50 px-6 py-2 rounded-2xl mb-12 shadow-inner">{viewingEmp.role}</p>
               
               <div className="w-full space-y-6">
                  <div className="p-8 bg-white rounded-[3rem] border border-slate-100 text-left shadow-sm">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2"><CreditCard size={14} /> Dados de Pagamento</p>
                     <p className="text-lg font-black text-slate-700 mb-1">{viewingEmp.payment_method || 'Banco'}</p>
                     <p className="text-[10px] font-bold text-emerald-600 uppercase">Sincronizado via Monte Cloud</p>
                  </div>
                  <div className="p-8 bg-slate-900 rounded-[3rem] text-left shadow-2xl">
                     <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">Identificação Única</p>
                     <p className="text-sm font-bold text-white mb-2 tracking-widest">NUIT: {viewingEmp.nuit || '---'}</p>
                     <p className="text-sm font-bold text-slate-400 tracking-widest">NISS: {viewingEmp.niss || '---'}</p>
                  </div>
               </div>
            </div>

            <div className="flex-1 p-16 overflow-y-auto custom-scrollbar space-y-20">
               <section className="space-y-10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em] flex items-center gap-3">
                      <FileBadge size={22} className="text-indigo-600" /> Dossier Contratual Permanente
                    </h3>
                    <button onClick={() => { setEditingEmpId(viewingEmp.id); setFormState(viewingEmp); setShowAddModal(true); setShowViewModal(false); }} className="p-5 bg-indigo-50 text-indigo-600 rounded-[2rem] hover:bg-indigo-600 hover:text-white transition-all shadow-sm"><Edit3 size={24} /></button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                     <div className="p-8 bg-slate-50 rounded-[3rem] border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Contacto de Segurança</p>
                        <p className="text-lg font-black text-slate-900">{viewingEmp.emergency_contact || 'Não registado'}</p>
                     </div>
                     <div className="p-8 bg-slate-50 rounded-[3rem] border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">E-mail Corporativo</p>
                        <p className="text-lg font-black text-slate-900 break-all">{viewingEmp.email}</p>
                     </div>
                     <div className="md:col-span-2 p-8 bg-slate-50 rounded-[3rem] border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Morada Declarada</p>
                        <p className="text-lg font-black text-slate-900 leading-relaxed italic">"{viewingEmp.address || 'Sem morada registada no sistema.'}"</p>
                     </div>
                  </div>
               </section>

               <div className="pt-12 border-t border-slate-100 flex flex-col sm:flex-row justify-between gap-6">
                  <button onClick={() => { if(confirm('Eliminar?')) { supabase.from('employees').delete().eq('id', viewingEmp.id).then(() => fetchData()); setShowViewModal(false); } }} className="px-10 py-5 bg-rose-50 text-rose-500 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all flex items-center gap-3">
                    <Trash2 size={18} /> Revogar Acessos
                  </button>
                  <button onClick={() => setShowViewModal(false)} className="px-14 py-6 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-indigo-600 transition-all active:scale-95">Fechar Arquivo</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRView;
