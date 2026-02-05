
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Users, AlertTriangle, Loader2, X, Mail, Phone, 
  Edit3, UserPlus, CheckCircle2, 
  Search, Building2, Save, Trash2, ShieldCheck, Fingerprint, FileBadge, CreditCard, Map, Shield
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Employee, UserRole, JobVacancy, JobApplication } from '../types';

const NOTIFICATION_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

const HRView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'employees' | 'vacancies' | 'applications'>('employees');
  const [employees, setEmployees] = useState<Employee[]>([]);
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
      .on('postgres_changes', { event: 'INSERT', table: 'job_applications' }, () => {
        if (audioRef.current) audioRef.current.play().catch(() => {});
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

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

  const staffStats = useMemo(() => {
    const active = employees.filter(e => e.status === 'Ativo').length;
    const expiringDocs = employees.filter(e => {
      if (!e.document_expiry) return false;
      const today = new Date();
      const expiry = new Date(e.document_expiry);
      const diff = (expiry.getTime() - today.getTime()) / (1000 * 3600 * 24);
      return diff <= 30;
    }).length;
    return { active, expiringDocs, total: employees.length };
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

  const openViewModal = (emp: Employee) => {
    setViewingEmp(emp);
    setShowViewModal(true);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 className="animate-spin text-indigo-600" size={32} />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse tracking-[0.3em]">Staff Monte Imobiliária Sync...</p>
    </div>
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-700 pb-10 max-w-[1800px] mx-auto">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg"><Users size={18} /></div>
           <div>
             <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">Recursos Humanos</h1>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Base Interna de Talentos</p>
           </div>
        </div>
        <button onClick={() => { setEditingEmpId(null); setFormState(initialFormState); setShowAddModal(true); }} className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-black text-[10px] uppercase tracking-widest shadow-md hover:bg-slate-900 transition-all flex items-center gap-2">
          <UserPlus size={14} /> Admitir Staff
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {[
           { label: 'Total Staff', value: staffStats.total, icon: <Users size={14} className="text-blue-600"/>, bg: 'bg-blue-50' },
           { label: 'Activos', value: staffStats.active, icon: <CheckCircle2 size={14} className="text-emerald-600"/>, bg: 'bg-emerald-50' },
           { label: 'Vencimentos Doc', value: staffStats.expiringDocs, icon: <AlertTriangle size={14} className="text-amber-600"/>, bg: 'bg-amber-50' },
         ].map((stat, i) => (
           <div key={i} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center shadow-inner`}>{stat.icon}</div>
              <div>
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">{stat.label}</p>
                 <p className="text-sm font-black text-slate-900 tracking-tighter">{stat.value}</p>
              </div>
           </div>
         ))}
      </div>

      <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3">
         <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input value={staffSearch} onChange={e => setStaffSearch(e.target.value)} placeholder="Localizar funcionário..." className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-lg border-none outline-none font-bold text-[11px] focus:ring-2 focus:ring-indigo-100" />
         </div>
         <div className="flex items-center gap-2 bg-slate-50 px-3 rounded-lg border border-slate-100 min-w-[140px]">
            <Building2 size={10} className="text-slate-400" />
            <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="bg-transparent font-black text-[9px] uppercase text-slate-600 outline-none py-2 cursor-pointer w-full">
               {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
         </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
        {filteredEmployees.map((emp) => (
          <div key={emp.id} onClick={() => openViewModal(emp)} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm relative group hover:shadow-xl transition-all cursor-pointer overflow-hidden text-center">
            <div className="flex flex-col items-center">
              <div className="relative mb-3">
                <img src={emp.avatar} className="w-12 h-12 rounded-lg object-cover ring-2 ring-slate-50 shadow-sm" alt="" />
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 border-2 border-white rounded-full ${emp.status === 'Ativo' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
              </div>
              <h3 className="text-[11px] font-black text-slate-900 truncate w-full mb-0.5">{emp.name}</h3>
              <p className="text-[8px] font-black text-indigo-600 uppercase tracking-widest mb-2 bg-indigo-50 px-1.5 py-0.5 rounded-md inline-block">{emp.role}</p>
              <div className="flex items-center gap-2 text-slate-300 justify-center">
                 <Mail size={10} />
                 <Phone size={10} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HRView;
