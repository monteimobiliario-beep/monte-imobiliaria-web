
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Users, AlertTriangle, Loader2, X, Mail, Phone, 
  Edit3, UserPlus, CheckCircle2, 
  Search, Building2, Save, Trash2, ShieldCheck, Fingerprint, FileBadge, CreditCard, Map, Shield, Briefcase, Linkedin, ExternalLink, Filter, Camera
} from 'lucide-react';
import { supabase } from '../supabaseClient';
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
      .on('postgres_changes' as any, { event: 'INSERT', table: 'job_applications' }, () => {
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
      const { data, error: sbError } = await supabase.from('employees').select('*').order('name');
      setEmployees(data || []);
    } catch (err: any) {
    } finally {
      setLoading(false);
    }
  }

  async function fetchApplications() {
    try {
      const { data } = await supabase.from('job_applications').select('*').order('created_at', { ascending: false });
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
      const payload = { ...formState, salary: Number(formState.salary), avatar: formState.avatar || `https://picsum.photos/seed/${formState.name}/100` };
      if (editingEmpId) {
        await supabase.from('employees').update(payload).eq('id', editingEmpId);
      } else {
        await supabase.from('employees').insert([payload]);
      }
      setShowAddModal(false);
      fetchData();
    } finally { 
      setSaving(false); 
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (confirm('Tem a certeza que deseja remover este colaborador? Está acção irá arquivar os dados permanentemente.')) {
      try {
        const { error } = await supabase.from('employees').delete().eq('id', id);
        if (error) throw error;
        fetchData();
        setShowViewModal(false);
      } catch (err: any) {
        alert('Erro ao eliminar: ' + err.message);
      }
    }
  };

  const handleUpdateAppStatus = async (id: string, status: 'Aprovado' | 'Rejeitado') => {
    try {
      await supabase.from('job_applications').update({ status }).eq('id', id);
      fetchApplications();
    } catch (e) {}
  };

  if (loading && activeTab === 'employees') return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 className="animate-spin text-indigo-600" size={32} />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse tracking-[0.3em]">Staff Monte Imobiliária Sync...</p>
    </div>
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-700 pb-10 max-w-[1800px] mx-auto">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-market-blue rounded-xl flex items-center justify-center text-white shadow-lg"><Users size={18} /></div>
           <div>
             <h1 className="text-xl font-bold text-market-navy tracking-tight leading-none mb-1">Recursos Humanos</h1>
             <p className="text-[10px] text-market-slate font-bold uppercase tracking-widest">Gestão Integral de Talentos</p>
           </div>
        </div>
        <div className="flex gap-2 bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
           <button onClick={() => setActiveTab('employees')} className={`px-4 py-2 rounded-lg font-bold text-[9px] uppercase tracking-widest transition-all ${activeTab === 'employees' ? 'bg-market-blue text-white shadow-md' : 'text-market-slate hover:bg-slate-50'}`}>Staff Atual</button>
           <button onClick={() => setActiveTab('applications')} className={`px-4 py-2 rounded-lg font-bold text-[9px] uppercase tracking-widest transition-all ${activeTab === 'applications' ? 'bg-market-blue text-white shadow-md' : 'text-market-slate hover:bg-slate-50'}`}>Candidaturas ({staffStats.pendingApps})</button>
        </div>
      </div>

      {activeTab === 'employees' ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Staff', value: staffStats.total, icon: <Users size={14} className="text-market-blue"/>, bg: 'bg-market-blue/10' },
              { label: 'Activos', value: staffStats.active, icon: <CheckCircle2 size={14} className="text-market-accent"/>, bg: 'bg-market-accent/10' },
              { label: 'Candidaturas', value: staffStats.pendingApps, icon: <Briefcase size={14} className="text-market-blue"/>, bg: 'bg-market-blue/10' },
            ].map((stat, i) => (
              <div key={i} className="market-card p-3 flex items-center gap-3">
                 <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center shadow-inner`}>{stat.icon}</div>
                 <div>
                    <p className="text-[9px] font-bold text-market-slate uppercase tracking-widest leading-none mb-0.5">{stat.label}</p>
                    <p className="text-sm font-bold text-market-navy tracking-tighter">{stat.value}</p>
                 </div>
              </div>
            ))}
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
               <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-market-slate" size={14} />
               <input value={staffSearch} onChange={e => setStaffSearch(e.target.value)} placeholder="Localizar funcionário..." className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-lg border border-slate-200 outline-none font-medium text-[11px] focus:ring-4 focus:ring-market-blue/10 focus:border-market-blue transition-all" />
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-3 rounded-lg border border-slate-200 min-w-[140px]">
               <Building2 size={10} className="text-market-slate" />
               <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="bg-transparent font-bold text-[9px] uppercase text-market-navy outline-none py-2 cursor-pointer w-full">
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
               </select>
            </div>
            <button onClick={() => { setEditingEmpId(null); setFormState(initialFormState); setShowAddModal(true); }} className="market-button market-button-primary px-5 py-2 text-[9px] flex items-center gap-2">
               <UserPlus size={14} /> Admitir
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
            {filteredEmployees.map((emp) => (
              <div key={emp.id} onClick={() => {setViewingEmp(emp); setShowViewModal(true);}} className="market-card p-4 relative group hover:shadow-xl transition-all cursor-pointer overflow-hidden text-center">
                <div className="flex flex-col items-center">
                  <div className="relative mb-3">
                    <img src={formatImageUrl(emp.avatar)} className="w-12 h-12 rounded-lg object-cover ring-2 ring-slate-50 shadow-sm" alt="" />
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 border-2 border-white rounded-full ${emp.status === 'Ativo' ? 'bg-market-accent' : 'bg-amber-500'}`}></div>
                  </div>
                  <h3 className="text-[11px] font-bold text-market-navy truncate w-full mb-0.5 group-hover:text-market-blue transition-colors">{emp.name}</h3>
                  <p className="text-[8px] font-bold text-market-blue uppercase tracking-widest mb-2 bg-market-blue/5 px-1.5 py-0.5 rounded-md inline-block">{emp.role}</p>
                </div>
              </div>
            ))}
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
                      <img src={formatImageUrl(viewingEmp.avatar)} className="w-32 h-32 rounded-3xl object-cover shadow-2xl ring-4 ring-white" alt="" />
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
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-right-4 duration-500">
           <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-sm font-bold text-market-navy uppercase tracking-widest flex items-center gap-2"><Briefcase size={16} className="text-market-blue" /> Dossiê de Candidaturas</h2>
              <div className="flex gap-2">
                 <span className="text-[9px] font-bold bg-market-blue/10 text-market-blue px-3 py-1 rounded-full uppercase">{applications.length} Inscritos</span>
              </div>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="text-[9px] font-bold text-market-slate uppercase tracking-[0.2em] bg-slate-50/50">
                       <th className="px-6 py-4">Candidato</th>
                       <th className="px-6 py-4">Vaga / Data</th>
                       <th className="px-6 py-4">Perfil / CV</th>
                       <th className="px-6 py-4">Status</th>
                       <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {applications.map(app => (
                       <tr key={app.id} className="hover:bg-slate-50/30 transition-all group">
                          <td className="px-6 py-5">
                             <p className="text-[11px] font-bold text-market-navy uppercase">{app.applicant_name}</p>
                             <p className="text-[9px] text-market-slate font-medium">{app.applicant_email}</p>
                          </td>
                          <td className="px-6 py-5">
                             <p className="text-[10px] font-bold text-market-blue uppercase tracking-tight">{app.job_title}</p>
                             <p className="text-[8px] text-market-slate uppercase">{new Date(app.created_at).toLocaleDateString('pt-MZ')}</p>
                          </td>
                          <td className="px-6 py-5">
                             {app.applicant_linkedin ? (
                                <a href={app.applicant_linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-1.5 bg-market-blue/10 text-market-blue rounded-lg text-[9px] font-bold uppercase hover:bg-market-blue hover:text-white transition-all shadow-sm">
                                   <Linkedin size={12} /> Ver Perfil <ExternalLink size={10} />
                                </a>
                             ) : (
                                <span className="text-[8px] font-bold text-slate-300 uppercase">Não Fornecido</span>
                             )}
                          </td>
                          <td className="px-6 py-5">
                             <span className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest ${app.status === 'Pendente' ? 'bg-amber-50 text-amber-600' : app.status === 'Aprovado' ? 'bg-market-accent/10 text-market-accent' : 'bg-rose-50 text-rose-600'}`}>
                                {app.status}
                             </span>
                          </td>
                          <td className="px-6 py-5 text-right">
                             <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleUpdateAppStatus(app.id, 'Aprovado')} className="p-2 bg-market-accent/10 text-market-accent rounded-lg hover:bg-market-accent hover:text-white transition-all shadow-sm"><CheckCircle2 size={14}/></button>
                                <button onClick={() => handleUpdateAppStatus(app.id, 'Rejeitado')} className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all shadow-sm"><X size={14}/></button>
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
              {applications.length === 0 && (
                 <div className="py-20 text-center flex flex-col items-center gap-4 opacity-30">
                    <Filter size={32} className="text-market-slate" />
                    <p className="text-[9px] font-bold uppercase tracking-widest text-market-slate">Nenhuma candidatura registada na nuvem.</p>
                 </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default HRView;
