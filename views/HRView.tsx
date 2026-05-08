
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, AlertTriangle, Loader2, X, Mail, Phone, 
  Edit3, UserPlus, CheckCircle2, 
  Search, Building2, Save, Trash2, ShieldCheck, Fingerprint, FileBadge, CreditCard, Map, Shield, Briefcase, Linkedin, ExternalLink, Filter, Camera, 
  ChevronRight, MoreVertical, BadgeCheck, TrendingUp, Activity
} from 'lucide-react';
import { supabase, db } from '../supabaseClient';
import { Employee, UserRole, JobVacancy, JobApplication } from '../types';
import { ImageUploadField } from '../components/ImageUploadField';
import { formatImageUrl } from '../imageUtils';

const NOTIFICATION_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

const HRView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'employees' | 'vacancies' | 'applications'>('employees');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingEmp, setViewingEmp] = useState<Employee | null>(null);
  const [editingEmpId, setEditingEmpId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [staffSearch, setStaffSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('Todos');
  const [appSearch, setAppSearch] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState('Todos');

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

    const channel = supabase
      .channel('hr_realtime_dashboard')
      .on('postgres_changes' as any, { event: 'INSERT', schema: 'hr', table: 'job_applications' }, () => {
        if (audioRef.current) audioRef.current.play().catch(() => {});
        fetchApplications();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (activeTab === 'applications') fetchApplications();
  }, [activeTab]);

  async function fetchData() {
    setLoading(true);
    try {
      const { data, error: sbError } = await db.hr('employees').select('*').order('name');
      setEmployees(data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchApplications() {
    try {
      const { data } = await db.hr('job_applications').select('*').order('created_at', { ascending: false });
      setApplications(data || []);
    } catch (e) {}
  }

  const staffStats = useMemo(() => {
    const active = employees.filter(e => e.status === 'Ativo').length;
    const pendingApps = applications.filter(a => a.status === 'Pendente').length;
    return { active, pendingApps, total: employees.length };
  }, [employees, applications]);

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
    setSaving(true);
    try {
      const payload = { 
        name: formState.name,
        email: formState.email,
        role: formState.role,
        department: formState.department,
        salary: Number(formState.salary),
        status: formState.status,
        avatar: formState.avatar || `https://picsum.photos/seed/${formState.name}/100`,
        phone: formState.phone,
        join_date: formState.join_date,
        nuit: formState.nuit,
        niss: formState.niss,
        address: formState.address,
        permissions: formState.permissions || []
      };

      if (editingEmpId) {
        const { error } = await db.hr('employees').update(payload).eq('id', editingEmpId);
        if (error) throw error;
      } else {
        const { error } = await db.hr('employees').insert([payload]);
        if (error) throw error;
      }
      setShowAddModal(false);
      fetchData();
    } catch (err: any) {
      console.error("Error saving employee:", err);
      alert("Erro ao salvar colaborador: " + err.message);
    } finally { 
      setSaving(false); 
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (confirm('Tem a certeza que deseja remover este colaborador? Está acção irá arquivar os dados permanentemente.')) {
      try {
        const { error } = await db.hr('employees').delete().eq('id', id);
        if (error) throw error;
        fetchData();
        setShowViewModal(false);
      } catch (err: any) {
        alert('Erro ao eliminar: ' + err.message);
      }
    }
  };

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = app.applicant_name.toLowerCase().includes(appSearch.toLowerCase()) || app.job_title.toLowerCase().includes(appSearch.toLowerCase());
      const matchesStatus = appStatusFilter === 'Todos' || app.status === appStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [applications, appSearch, appStatusFilter]);

  const handleUpdateAppStatus = async (id: string, status: 'Aprovado' | 'Rejeitado' | 'Pendente') => {
    setSaving(true);
    try {
      const { error } = await db.hr('job_applications').update({ status }).eq('id', id);
      if (error) throw error;
      fetchApplications();
    } catch (e: any) {
      console.error("Error updating application:", e);
      alert("Erro ao atualizar status: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading && activeTab === 'employees') return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
      <div className="relative">
        <Loader2 className="animate-spin text-market-blue" size={48} />
        <div className="absolute inset-0 blur-xl bg-market-blue/20 animate-pulse"></div>
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Neural Core Sincronizando Staff</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10 max-w-[1800px] mx-auto">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-market-blue rounded-full shadow-[0_0_10px_rgba(0,82,255,0.4)]"></div>
            <p className="text-[10px] text-market-blue font-black uppercase tracking-[0.4em]">Gestão de Capital Humano</p>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-market-navy tracking-tight leading-none">Monte <span className="italic font-display font-light text-market-blue">Staff</span> Hub</h1>
        </div>
        
        <div className="flex gap-2">
           <button onClick={fetchData} className="p-3 bg-slate-100 text-slate-500 rounded-2xl hover:bg-market-blue hover:text-white transition-all shadow-sm border border-slate-200">
              <Activity size={18} className={loading ? 'animate-pulse' : ''} />
           </button>
           <div className="flex gap-2 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50 shadow-inner">
              <button onClick={() => setActiveTab('employees')} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-500 ${activeTab === 'employees' ? 'bg-white text-market-blue shadow-lg ring-1 ring-slate-100' : 'text-slate-500 hover:text-market-navy'}`}>Corpo Ativo</button>
              <button onClick={() => setActiveTab('applications')} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-500 flex items-center gap-2 ${activeTab === 'applications' ? 'bg-white text-market-blue shadow-lg ring-1 ring-slate-100' : 'text-slate-500 hover:text-market-navy'}`}>
                Candidaturas {staffStats.pendingApps > 0 && <span className="w-2 h-2 bg-market-accent rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></span>}
              </button>
           </div>
        </div>
      </div>

      {activeTab === 'employees' ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Efetivos Totais', value: staffStats.total, icon: <Users size={18} />, color: 'text-market-blue', bg: 'bg-market-blue/10' },
              { label: 'Status Ativo', value: staffStats.active, icon: <BadgeCheck size={18} />, color: 'text-market-accent', bg: 'bg-market-accent/10' },
              { label: 'Pipeline RH', value: applications.length, icon: <Briefcase size={18} />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { label: 'Novos Talentos', value: staffStats.pendingApps, icon: <UserPlus size={18} />, color: 'text-amber-500', bg: 'bg-amber-50' },
            ].map((stat, i) => (
              <div key={i} className="market-card p-5 group relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-20 h-20 bg-slate-50 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                 <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-all`}>{stat.icon}</div>
                 </div>
                 <div className="relative z-10">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
                    <p className="text-2xl font-black text-market-navy tracking-tighter">{stat.value}</p>
                 </div>
              </div>
            ))}
          </div>

          <div className="bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 group w-full">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-market-blue transition-colors" size={18} />
               <input 
                 value={staffSearch} 
                 onChange={e => setStaffSearch(e.target.value)} 
                 placeholder="Pesquisar por nome ou credencial..." 
                 className="w-full pl-14 pr-6 py-4 bg-slate-50/50 rounded-2xl border border-slate-100 outline-none font-bold text-xs focus:ring-8 focus:ring-market-blue/5 focus:border-market-blue focus:bg-white transition-all shadow-inner" 
               />
            </div>
            <div className="flex items-center gap-3 bg-slate-50/80 px-6 py-4 rounded-2xl border border-slate-100 min-w-[200px] w-full md:w-auto">
               <Building2 size={16} className="text-slate-400" />
               <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="bg-transparent font-black text-[10px] uppercase text-market-navy outline-none cursor-pointer w-full tracking-widest">
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
               </select>
            </div>
            <button 
              onClick={() => { setEditingEmpId(null); setFormState(initialFormState); setShowAddModal(true); }} 
              className="market-button market-button-primary w-full md:w-auto px-8 py-4 text-[10px] uppercase tracking-[0.2em] shadow-2xl"
            >
               <UserPlus size={18} /> Recrutar Staff
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredEmployees.map((emp) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={emp.id} 
                  onClick={() => {setViewingEmp(emp); setShowViewModal(true);}} 
                  className="market-card p-6 relative group hover:scale-[1.02] cursor-pointer overflow-hidden text-center flex flex-col items-center"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-market-blue/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-market-blue/10 transition-all duration-700"></div>
                  
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-market-blue rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-20 transition-all duration-700 translate-y-4"></div>
                    <img src={formatImageUrl(emp.avatar) || undefined} className="w-24 h-24 rounded-[2rem] object-cover ring-[6px] ring-slate-50 shadow-2xl relative z-10 transition-transform duration-700 group-hover:-translate-y-2" alt="" />
                    <div className={`absolute bottom-0 right-0 w-6 h-6 border-[4px] border-white rounded-full z-20 shadow-lg ${emp.status === 'Ativo' ? 'bg-market-accent' : 'bg-amber-500'}`}></div>
                  </div>
                  
                  <div className="relative z-10 space-y-1 w-full">
                    <h3 className="text-base font-black text-market-navy truncate group-hover:text-market-blue transition-colors">{emp.name}</h3>
                    <p className="text-[10px] font-black text-market-blue uppercase tracking-[0.2em] mb-4">{emp.role}</p>
                    <div className="flex items-center justify-center gap-2 pt-4 border-t border-slate-50">
                       <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{emp.department}</span>
                    </div>
                  </div>

                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                     <div className="p-1.5 bg-white rounded-lg shadow-xl border border-slate-100">
                        <MoreVertical size={14} className="text-slate-400" />
                     </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Add/Edit Modal */}
          {showAddModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-market-navy/80 backdrop-blur-xl animate-in fade-in">
              <div className="bg-white rounded-3xl p-8 md:p-10 max-w-4xl w-full shadow-2xl relative border-t-8 border-market-blue max-h-[90vh] overflow-y-auto custom-scrollbar">
                <button onClick={() => setShowAddModal(false)} className="absolute top-8 right-8 p-2 text-slate-400 hover:text-market-navy bg-slate-50 rounded-xl transition-all border border-slate-100"><X size={24} /></button>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-market-navy flex items-center gap-3">
                    <UserPlus size={28} className="text-market-blue" />
                    {editingEmpId ? 'Editar Funcionário' : 'Admissão de Novo Colaborador'}
                  </h2>
                  <p className="text-[10px] text-market-slate font-bold uppercase mt-1 tracking-widest">Documentação e Cadastro Centralizado</p>
                </div>

                <form onSubmit={handleSaveEmployee} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-3">
                    <ImageUploadField 
                      label="Fotografia (Avatar)"
                      value={formState.avatar || ''}
                      onChange={(url) => setFormState({...formState, avatar: url})}
                      placeholder="Link da imagem (Google Drive, etc) ou upload da galeria..."
                    />
                  </div>

                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[9px] font-bold text-market-slate uppercase tracking-widest ml-1">Nome Completo</label>
                    <input required value={formState.name} onChange={e => setFormState({...formState, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 font-medium text-sm outline-none focus:ring-4 focus:ring-market-blue/10 focus:border-market-blue transition-all" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-market-slate uppercase tracking-widest ml-1">Gênero</label>
                    <select value={formState.gender} onChange={e => setFormState({...formState, gender: e.target.value as any})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 font-medium text-sm outline-none focus:ring-4 focus:ring-market-blue/10 transition-all">
                      <option value="M">Masculino</option>
                      <option value="F">Feminino</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-market-slate uppercase tracking-widest ml-1">Cargo / Função</label>
                    <select value={formState.role} onChange={e => setFormState({...formState, role: e.target.value as UserRole})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 font-medium text-sm outline-none focus:ring-4 focus:ring-market-blue/10 transition-all">
                      {Object.values(UserRole).map(role => <option key={role} value={role}>{role}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-market-slate uppercase tracking-widest ml-1">Departamento</label>
                    <select value={formState.department} onChange={e => setFormState({...formState, department: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 font-medium text-sm outline-none focus:ring-4 focus:ring-market-blue/10 transition-all">
                      {departments.filter(d => d !== 'Todos').map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-market-slate uppercase tracking-widest ml-1">Salário Base (MT)</label>
                    <input type="number" required value={formState.salary} onChange={e => setFormState({...formState, salary: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 font-medium text-sm outline-none focus:ring-4 focus:ring-market-blue/10 transition-all" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-market-slate uppercase tracking-widest ml-1">Email Corporativo</label>
                    <input type="email" required value={formState.email} onChange={e => setFormState({...formState, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 font-medium text-sm outline-none focus:ring-4 focus:ring-market-blue/10 transition-all" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-market-slate uppercase tracking-widest ml-1">Contacto Telefónico</label>
                    <input required value={formState.phone} onChange={e => setFormState({...formState, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 font-medium text-sm outline-none focus:ring-4 focus:ring-market-blue/10 transition-all" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-market-slate uppercase tracking-widest ml-1">Status Contratual</label>
                    <select value={formState.status} onChange={e => setFormState({...formState, status: e.target.value as any})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 font-medium text-sm outline-none focus:ring-4 focus:ring-market-blue/10 transition-all">
                      <option value="Ativo">Ativo</option>
                      <option value="Férias">Férias</option>
                      <option value="Inativo">Inativo</option>
                      <option value="Suspenso">Suspenso</option>
                    </select>
                  </div>

                  <div className="md:col-span-3 grid grid-cols-2 lg:grid-cols-4 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="space-y-1">
                       <label className="text-[8px] font-bold text-market-slate uppercase tracking-widest">Tipo Doc.</label>
                       <select value={formState.document_type} onChange={e => setFormState({...formState, document_type: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold outline-none"><option>BI</option><option>Passaporte</option><option>DIRE</option></select>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[8px] font-bold text-market-slate uppercase tracking-widest">Nº Documento</label>
                       <input value={formState.document_number} onChange={e => setFormState({...formState, document_number: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold outline-none" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[8px] font-bold text-market-slate uppercase tracking-widest">NUIT</label>
                       <input value={formState.nuit} onChange={e => setFormState({...formState, nuit: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold outline-none" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[8px] font-bold text-market-slate uppercase tracking-widest">NISS</label>
                       <input value={formState.niss} onChange={e => setFormState({...formState, niss: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold outline-none" />
                    </div>
                  </div>

                  <div className="md:col-span-3 flex gap-4 pt-6 border-t border-slate-100">
                    <button type="submit" disabled={saving} className="market-button market-button-primary flex-1 py-4 text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg">
                      {saving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> {editingEmpId ? 'Actualizar Dados' : 'Confirmar Admissão'}</>}
                    </button>
                    <button type="button" onClick={() => setShowAddModal(false)} className="market-button market-button-outline px-8 py-4 text-[10px] uppercase tracking-widest">Cancelar</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* View Modal */}
          {showViewModal && viewingEmp && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-market-navy/80 backdrop-blur-xl animate-in fade-in">
              <div className="bg-white rounded-3xl p-0 max-w-4xl w-full shadow-2xl relative overflow-hidden flex flex-col md:flex-row h-[70vh]">
                <div className="w-full md:w-1/3 bg-slate-50 p-10 flex flex-col items-center text-center border-r border-slate-100">
                   <div className="relative mb-6">
                      <img src={formatImageUrl(viewingEmp.avatar) || undefined} className="w-32 h-32 rounded-3xl object-cover shadow-2xl ring-4 ring-white" alt="" />
                      <div className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-[9px] font-bold uppercase text-white shadow-lg ${viewingEmp.status === 'Ativo' ? 'bg-market-accent' : 'bg-amber-500'}`}>{viewingEmp.status}</div>
                   </div>
                   <h2 className="text-xl font-bold text-market-navy mb-1">{viewingEmp.name}</h2>
                   <p className="text-[9px] font-bold text-market-blue uppercase tracking-widest mb-6 bg-market-blue/5 px-3 py-1 rounded-full">{viewingEmp.role}</p>
                   
                   <div className="w-full space-y-3 pt-6 border-t border-slate-200">
                      <div className="flex items-center gap-3 text-market-slate"><Mail size={14} /><span className="text-[11px] font-medium truncate">{viewingEmp.email}</span></div>
                      <div className="flex items-center gap-3 text-market-slate"><Phone size={14} /><span className="text-[11px] font-medium">{viewingEmp.phone}</span></div>
                   </div>

                   <div className="mt-auto flex gap-2 w-full pt-6">
                      <button onClick={() => { setFormState(viewingEmp); setEditingEmpId(viewingEmp.id); setShowViewModal(false); setShowAddModal(true); }} className="flex-1 p-3 bg-white hover:bg-market-blue hover:text-white text-market-blue border border-market-blue/20 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 font-bold text-[10px] uppercase"><Edit3 size={16} /> Editar</button>
                      <button onClick={() => handleDeleteEmployee(viewingEmp.id)} className="p-3 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-100 rounded-xl transition-all shadow-sm flex items-center justify-center"><Trash2 size={16}/></button>
                      <button onClick={() => setShowViewModal(false)} className="p-3 bg-slate-200 text-slate-500 rounded-xl hover:bg-slate-300 transition-all"><X size={16}/></button>
                   </div>
                </div>
                
                <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
                   <div className="grid grid-cols-2 gap-8">
                      <div>
                         <h4 className="text-[9px] font-bold text-market-slate uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><Fingerprint size={12} className="text-market-blue"/> Identificação</h4>
                         <div className="space-y-4">
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-[8px] font-bold text-market-slate uppercase mb-0.5">Tipo de Documento</p><p className="text-xs font-bold text-market-navy">{viewingEmp.document_type || 'BI'}</p></div>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-[8px] font-bold text-market-slate uppercase mb-0.5">Nº Documento</p><p className="text-xs font-bold text-market-navy">{viewingEmp.document_number || 'N/D'}</p></div>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-[8px] font-bold text-market-slate uppercase mb-0.5">NUIT</p><p className="text-xs font-bold text-market-navy">{viewingEmp.nuit || 'N/D'}</p></div>
                         </div>
                      </div>
                      <div>
                         <h4 className="text-[9px] font-bold text-market-slate uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><CreditCard size={12} className="text-market-blue"/> Financeiro</h4>
                         <div className="space-y-4">
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-[8px] font-bold text-market-slate uppercase mb-0.5">Salário Mensal</p><p className="text-xs font-bold text-market-accent">{Number(viewingEmp.salary).toLocaleString()} MT</p></div>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-[8px] font-bold text-market-slate uppercase mb-0.5">Método de Pagamento</p><p className="text-xs font-bold text-market-navy">{viewingEmp.payment_method || 'Transferência'}</p></div>
                         </div>
                      </div>
                      <div className="col-span-2">
                         <h4 className="text-[9px] font-bold text-market-slate uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><Map size={12} className="text-market-blue"/> Localização</h4>
                         <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <p className="text-xs font-medium text-market-navy italic">"{viewingEmp.address || 'Morada não especificada no sistema.'}"</p>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="market-card p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-market-blue/10 text-market-blue rounded-2xl flex items-center justify-center"><Briefcase size={20}/></div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Recebidas</p>
                   <p className="text-2xl font-black text-market-navy tracking-tighter">{applications.length}</p>
                </div>
             </div>
             <div className="market-card p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center"><Activity size={20}/></div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Em Análise</p>
                   <p className="text-2xl font-black text-market-navy tracking-tighter">{applications.filter(a => a.status === 'Pendente').length}</p>
                </div>
             </div>
             <div className="market-card p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center"><CheckCircle2 size={20}/></div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Aprovadas</p>
                   <p className="text-2xl font-black text-market-navy tracking-tighter">{applications.filter(a => a.status === 'Aprovado').length}</p>
                </div>
             </div>
          </div>

          <div className="bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 group w-full">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-market-blue transition-colors" size={18} />
               <input 
                 value={appSearch} 
                 onChange={e => setAppSearch(e.target.value)} 
                 placeholder="Localizar candidato ou vaga..." 
                 className="w-full pl-14 pr-6 py-4 bg-slate-50/50 rounded-2xl border border-slate-100 outline-none font-bold text-xs focus:ring-8 focus:ring-market-blue/5 focus:border-market-blue focus:bg-white transition-all shadow-inner" 
               />
            </div>
            <div className="flex items-center gap-3 bg-slate-50/80 px-6 py-4 rounded-2xl border border-slate-100 min-w-[200px] w-full md:w-auto">
               <Filter size={16} className="text-slate-400" />
               <select value={appStatusFilter} onChange={e => setAppStatusFilter(e.target.value)} className="bg-transparent font-black text-[10px] uppercase text-market-navy outline-none cursor-pointer w-full tracking-widest">
                  <option value="Todos">Todos Status</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Aprovado">Aprovado</option>
                  <option value="Rejeitado">Rejeitado</option>
               </select>
            </div>
          </div>

          <div className="market-card overflow-hidden">
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="text-[9px] font-black text-market-slate uppercase tracking-[0.2em] bg-slate-50/50">
                        <th className="px-6 py-4">Candidato</th>
                        <th className="px-6 py-4">Vaga / Data</th>
                        <th className="px-6 py-4">Ficheiro / CV</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Decisão</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {filteredApplications.map(app => (
                        <tr key={app.id} className="hover:bg-slate-50/30 transition-all group">
                           <td className="px-6 py-5">
                              <p className="text-[11px] font-black text-market-navy uppercase leading-none mb-1">{app.applicant_name}</p>
                              <p className="text-[9px] text-market-slate font-bold tracking-tight">{app.applicant_email}</p>
                           </td>
                           <td className="px-6 py-5">
                              <p className="text-[10px] font-black text-market-blue uppercase tracking-tight leading-none mb-1">{app.job_title}</p>
                              <p className="text-[8px] text-market-slate font-black uppercase">{new Date(app.created_at).toLocaleDateString('pt-MZ')}</p>
                           </td>
                           <td className="px-6 py-5">
                              {app.applicant_linkedin ? (
                                 <a href={app.applicant_linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-market-navy rounded-xl text-[9px] font-black uppercase hover:bg-market-blue hover:text-white transition-all shadow-sm">
                                    <Linkedin size={12} /> LinkedIn <ExternalLink size={10} />
                                 </a>
                              ) : (
                                 <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Digital CV</span>
                              )}
                           </td>
                           <td className="px-6 py-5">
                              <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] shadow-sm ring-1 ring-inset ${app.status === 'Pendente' ? 'bg-amber-50 text-amber-600 ring-amber-100' : app.status === 'Aprovado' ? 'bg-emerald-50 text-emerald-600 ring-emerald-100' : 'bg-rose-50 text-rose-600 ring-rose-100'}`}>
                                 {app.status}
                              </span>
                           </td>
                           <td className="px-6 py-5 text-right space-x-2">
                              {app.status === 'Pendente' && (
                                <div className="flex justify-end gap-2 group-hover:translate-x-0 translate-x-4 opacity-0 group-hover:opacity-100 transition-all">
                                   <button onClick={() => handleUpdateAppStatus(app.id, 'Aprovado')} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-100"><CheckCircle2 size={14}/></button>
                                   <button onClick={() => handleUpdateAppStatus(app.id, 'Rejeitado')} className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm border border-rose-100"><X size={14}/></button>
                                </div>
                              )}
                              {app.status !== 'Pendente' && (
                                <button onClick={() => handleUpdateAppStatus(app.id, 'Pendente')} className="text-[8px] font-black text-slate-300 hover:text-market-blue uppercase tracking-widest transition-colors">Reverter</button>
                              )}
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
               {filteredApplications.length === 0 && (
                  <div className="py-20 text-center flex flex-col items-center gap-4 opacity-30">
                     <div className="w-16 h-16 bg-slate-100 rounded-[2rem] flex items-center justify-center text-slate-400">
                        <Filter size={24} />
                     </div>
                     <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-market-slate">Nenhum registo compatível.</p>
                  </div>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRView;
