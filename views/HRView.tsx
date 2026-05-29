
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { 
  Users, AlertTriangle, Loader2, X, Mail, Phone, 
  Edit3, UserPlus, CheckCircle2, 
  Search, Building2, Save, Trash2, ShieldCheck, Fingerprint, FileBadge, CreditCard, Map, Shield, Briefcase, Linkedin, ExternalLink, Filter, Camera, 
  ChevronRight, MoreVertical, BadgeCheck, TrendingUp, Activity, Plus, Sparkles,
  Grid, List, DollarSign, Calendar, MessageSquare
} from 'lucide-react';
import { supabase, db } from '../supabaseClient';
import { Employee, UserRole, JobVacancy, JobApplication } from '../types';
import { ImageUploadField } from '../components/ImageUploadField';
import { useTranslation } from '../src/i18nContext';
import { formatImageUrl } from '../imageUtils';
import { generateJobDescription } from '../geminiService';

const NOTIFICATION_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

const HRView: React.FC = () => {
  const { t, tRole } = useTranslation();
  const [activeTab, setActiveTab] = useState<'employees' | 'vacancies' | 'applications'>('employees');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [vacancies, setVacancies] = useState<JobVacancy[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showVacancyModal, setShowVacancyModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingEmp, setViewingEmp] = useState<Employee | null>(null);
  const [editingEmpId, setEditingEmpId] = useState<string | null>(null);
  const [editingVacId, setEditingVacId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  
  const [employeesViewMode, setEmployeesViewMode] = useState<'grid' | 'table'>('grid');

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case 'Ativo':
      case 'Active':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-250';
      case 'Férias':
      case 'Vacation':
        return 'bg-sky-50 text-sky-700 border border-sky-200';
      case 'Suspenso':
      case 'Suspended':
        return 'bg-amber-50 text-amber-800 border border-amber-200';
      case 'Inativo':
      case 'Inactive':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border border-slate-200';
    }
  };

  const getDeptColorClasses = (dept: string) => {
    const dLower = (dept || '').toLowerCase();
    if (dLower.includes('venda') || dLower.includes('sales')) {
      return {
        bg: 'from-amber-400 to-orange-500',
        text: 'text-amber-700 bg-amber-50/70 border-amber-250',
        dot: 'bg-amber-500'
      };
    }
    if (dLower.includes('eng') || dLower.includes('hardware')) {
      return {
        bg: 'from-blue-400 to-indigo-500',
        text: 'text-blue-700 bg-blue-50/70 border-blue-200',
        dot: 'bg-blue-500'
      };
    }
    if (dLower.includes('ti') || dLower.includes('tech') || dLower.includes('it')) {
      return {
        bg: 'from-violet-400 to-purple-500',
        text: 'text-violet-700 bg-violet-50/70 border-violet-200',
        dot: 'bg-violet-500'
      };
    }
    if (dLower.includes('admin') || dLower.includes('adm')) {
      return {
        bg: 'from-emerald-400 to-teal-500',
        text: 'text-emerald-700 bg-emerald-50/70 border-emerald-200',
        dot: 'bg-emerald-500'
      };
    }
    if (dLower.includes('dir') || dLower.includes('mng') || dLower.includes('gest')) {
      return {
        bg: 'from-rose-400 to-pink-500',
        text: 'text-rose-700 bg-rose-50/70 border-rose-200',
        dot: 'bg-rose-500'
      };
    }
    return {
      bg: 'from-slate-400 to-slate-500',
      text: 'text-slate-700 bg-slate-50/70 border-slate-200',
      dot: 'bg-slate-400'
    };
  };

  const [staffSearch, setStaffSearch] = useState('');
  const [vacancySearch, setVacancySearch] = useState('');
  const [deptFilter, setDeptFilter] = useState(t('fin.all'));
  const [appSearch, setAppSearch] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState(t('fin.all'));

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const initialVacancyState: Partial<JobVacancy> = {
    title: '', area: t('fin.general'), type: 'Full-Time', location: 'Maputo', 
    salary: 'A Negociar', description: '', status: 'Open',
    created_at: new Date().toISOString()
  };

  const [vacancyForm, setVacancyForm] = useState<Partial<JobVacancy>>(initialVacancyState);

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'clean']
    ],
  };

  const initialFormState: Partial<Employee> = {
    name: '', role: UserRole.EMPLOYEE, department: t('fin.general'), salary: 0, 
    email: '', phone: '+258 ', document_type: 'BI', document_number: '', 
    document_expiry: '', payment_method: 'Banco', 
    contract_start: new Date().toISOString().split('T')[0],
    status: t('hr.active'), join_date: new Date().toISOString().split('T')[0],
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
    if (activeTab === 'vacancies') fetchVacancies();
  }, [activeTab]);

  async function fetchData() {
    setLoading(true);
    try {
      const { data: empData } = await db.hr('employees').select('*').order('name');
      setEmployees(empData || []);
      const { data: vacData } = await db.hr('job_vacancies').select('*').order('created_at', { ascending: false });
      setVacancies(vacData || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchVacancies() {
    try {
      const { data } = await db.hr('job_vacancies').select('*').order('created_at', { ascending: false });
      setVacancies(data || []);
    } catch (e) {}
  }

  async function fetchApplications() {
    try {
      const { data, error } = await db.hr('job_applications')
        .select('id, vacancy_id, name, email, phone, resume_url, message, status, created_at, job_vacancies:vacancy_id (title)')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching job applications:", error);
        return;
      }

      const mapped: JobApplication[] = (data || []).map((app: any) => ({
        id: app.id,
        job_id: app.vacancy_id || '',
        job_title: app.job_vacancies?.title || 'Vaga Geral',
        applicant_name: app.name || '',
        applicant_email: app.email || '',
        applicant_phone: app.phone || '',
        cv_url: app.resume_url || '',
        cover_letter_url: '',
        applicant_linkedin: '',
        message: app.message || '',
        status: app.status || 'Pendente',
        created_at: app.created_at
      }));

      setApplications(mapped);
    } catch (e) {
      console.error(e);
    }
  }

  const staffStats = useMemo(() => {
    const active = employees.filter(e => e.status === 'Ativo').length;
    const pendingApps = applications.filter(a => a.status === 'Pendente').length;
    const activeVacancies = vacancies.filter(v => v.status === 'Open').length;
    return { active, pendingApps, total: employees.length, activeVacancies };
  }, [employees, applications, vacancies]);

  const filteredVacancies = useMemo(() => {
    return vacancies.filter(v => {
      const matchesSearch = v.title.toLowerCase().includes(vacancySearch.toLowerCase()) || v.area.toLowerCase().includes(vacancySearch.toLowerCase());
      return matchesSearch;
    });
  }, [vacancies, vacancySearch]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => {
      const matchesSearch = e.name.toLowerCase().includes(staffSearch.toLowerCase()) || e.email.toLowerCase().includes(staffSearch.toLowerCase());
      const matchesDept = deptFilter === 'Todos' || e.department === deptFilter;
      return matchesSearch && matchesDept;
    });
  }, [employees, staffSearch, deptFilter]);

  const departments = [t('fin.all'), t('fin.sales'), 'Administrativo', 'Engenharia', 'TI', 'Manutenção', 'Direcção', t('fin.general')];

  const handleSaveVacancy = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vacancyForm.title) {
      alert(t('hr.vac_title_required') || "O título da vaga é obrigatório.");
      return;
    }

    setSaving(true);
    try {
      // Garantir que todos os campos obrigatórios e opcionais estão no payload
      const payload = {
        title: vacancyForm.title.trim(),
        area: vacancyForm.area || t('fin.general'),
        type: vacancyForm.type || 'Full-Time',
        location: vacancyForm.location || 'Maputo',
        salary: vacancyForm.salary || 'A Negociar',
        description: vacancyForm.description || '',
        status: vacancyForm.status || 'Open',
        created_at: vacancyForm.created_at || new Date().toISOString()
      };

      console.log("Saving vacancy payload:", payload);

      if (editingVacId) {
        const { error, data } = await db.hr('job_vacancies').update(payload).eq('id', editingVacId).select();
        if (error) {
           console.error("Supabase update error:", error);
           throw error;
        }
        console.log("Update success:", data);
      } else {
        const { error, data } = await db.hr('job_vacancies').insert([payload]).select();
        if (error) {
           console.error("Supabase insert error:", error);
           throw error;
        }
        console.log("Insert success:", data);
      }
      
      setShowVacancyModal(false);
      await fetchVacancies();
      alert(editingVacId ? "Vaga actualizada com sucesso!" : "Vaga publicada com sucesso!");
    } catch (err: any) {
      console.error("Critical error saving vacancy:", err);
      alert("Erro ao salvar vaga: " + (err.message || "Verifique a consola para mais detalhes"));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVacancy = async (id: string) => {
    if (confirm('Tem a certeza que deseja remover esta vaga?')) {
      try {
        const { error } = await db.hr('job_vacancies').delete().eq('id', id);
        if (error) throw error;
        fetchVacancies();
      } catch (err: any) {
        alert('Erro ao eliminar: ' + err.message);
      }
    }
  };

  const handleGenerateAIDescription = async () => {
    if (!vacancyForm.title) {
       alert("Por favor, indique o título da vaga primeiro.");
       return;
    }
    setGeneratingAI(true);
    try {
      const result = await generateJobDescription(
        vacancyForm.title || '', 
        vacancyForm.area || 'Geral', 
        vacancyForm.location || 'Maputo'
      );
      setVacancyForm(prev => ({ ...prev, description: result }));
    } catch (error) {
      console.error("AI Generation failed:", error);
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    let attempts = 0;
    const maxAttempts = 2;

    const executeSave = async (): Promise<void> => {
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
        if (err.message?.includes('Lock broken') && attempts < maxAttempts) {
          attempts++;
          await new Promise(r => setTimeout(r, 800));
          return executeSave();
        }
        throw err;
      }
    };

    try {
      await executeSave();
    } catch (err: any) {
      console.error("Error saving employee:", err);
      alert("Erro ao salvar colaborador: " + err.message);
    } finally { 
      setSaving(false); 
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (confirm('Tem a certeza que deseja remover este colaborador?')) {
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
    let attempts = 0;
    const maxAttempts = 2;

    const executeUpdate = async (): Promise<void> => {
      try {
        const { error } = await db.hr('job_applications').update({ status }).eq('id', id);
        if (error) throw error;
        fetchApplications();
      } catch (err: any) {
        if (err.message?.includes('Lock broken') && attempts < maxAttempts) {
          attempts++;
          await new Promise(r => setTimeout(r, 800));
          return executeUpdate();
        }
        throw err;
      }
    };

    try {
      await executeUpdate();
    } catch (e: any) {
      console.error("Error updating application:", e);
      alert("Erro ao atualizar status: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading && activeTab === 'employees') return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
      <Loader2 className="animate-spin text-market-blue" size={48} />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">{t('dash.syncing')} Staff Hub</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10 max-w-[1800px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-market-blue rounded-full"></div>
            <p className="text-[10px] text-market-blue font-black uppercase tracking-[0.4em]">{t('hr.title')}</p>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-market-navy tracking-tight">Monte <span className="italic font-display font-light text-market-blue">Staff</span> Hub</h1>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 items-center">
           <div className="flex gap-2 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50 shadow-inner">
              <button onClick={() => setActiveTab('employees')} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'employees' ? 'bg-white text-market-blue shadow-lg' : 'text-slate-500 hover:text-market-navy'}`}>{t('hr.staff')}</button>
              <button onClick={() => setActiveTab('vacancies')} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'vacancies' ? 'bg-white text-market-blue shadow-lg' : 'text-slate-500 hover:text-market-navy'}`}>{t('hr.vacancies')}</button>
              <button onClick={() => setActiveTab('applications')} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'applications' ? 'bg-white text-market-blue shadow-lg' : 'text-slate-500 hover:text-market-navy'}`}>
                {t('hr.applications')} {staffStats.pendingApps > 0 && <span className="w-2 h-2 bg-market-accent rounded-full animate-pulse"></span>}
              </button>
           </div>
           <button 
              onClick={() => { setEditingVacId(null); setVacancyForm(initialVacancyState); setShowVacancyModal(true); }} 
              className="market-button market-button-primary px-6 py-3.5 text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-market-blue/20"
            >
               <Plus size={16} /> <span className="hidden lg:inline">{t('hr.publish_vacancy')}</span><span className="lg:hidden">{t('fin.sales')}</span>
            </button>
        </div>
      </div>

      {activeTab === 'vacancies' ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 group w-full">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
               <input 
                 value={vacancySearch} 
                 onChange={e => setVacancySearch(e.target.value)} 
                 placeholder={t('hr.search_vacancies')} 
                 className="w-full pl-14 pr-6 py-4 bg-slate-50/50 rounded-2xl border border-slate-100 outline-none font-bold text-xs focus:ring-8 focus:ring-market-blue/5 focus:border-market-blue focus:bg-white transition-all shadow-inner" 
               />
            </div>
            {/* O botão 'Publicar Vaga' foi movido para o cabeçalho principal */}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVacancies.map((vac) => (
              <div key={vac.id} className="market-card p-8 space-y-6 group">
                <div className="flex justify-between items-start">
                   <div className="space-y-1">
                      <h3 className="text-xl font-black text-market-navy">{vac.title}</h3>
                      <p className="text-[10px] font-bold text-market-blue uppercase tracking-widest">{vac.area} • {vac.location}</p>
                   </div>
                   <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest ${vac.status === 'Open' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{vac.status}</span>
                </div>
                <div className="flex items-center gap-6 py-4 border-y border-slate-50">
                   <div className="text-center flex-1">
                      <p className="text-[8px] font-bold text-market-slate uppercase mb-1">{t('hr.type')}</p>
                      <p className="text-xs font-bold text-market-navy">{vac.type}</p>
                   </div>
                   <div className="text-center flex-1">
                      <p className="text-[8px] font-bold text-market-slate uppercase mb-1">{t('hr.applications')}</p>
                      <p className="text-xs font-bold text-market-navy">{applications.filter(a => a.job_id === vac.id).length}</p>
                   </div>
                </div>
                <div className="flex gap-2 pt-2">
                   <button onClick={() => { setVacancyForm(vac); setEditingVacId(vac.id); setShowVacancyModal(true); }} className="flex-1 py-3 bg-slate-50 text-market-navy rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-market-blue hover:text-white transition-all border border-slate-100 flex items-center justify-center gap-2"><Edit3 size={14}/> {t('hr.edit')}</button>
                   <button onClick={() => handleDeleteVacancy(vac.id)} className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all border border-rose-100"><Trash2 size={16}/></button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ) : activeTab === 'employees' ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {[
               { label: t('hr.total_effective'), value: staffStats.total, icon: <Users size={18} />, color: 'text-market-blue', bg: 'bg-market-blue/10' },
               { label: t('hr.active_status'), value: staffStats.active, icon: <BadgeCheck size={18} />, color: 'text-market-accent', bg: 'bg-market-accent/10' },
               { label: t('hr.hr_pipeline'), value: applications.length, icon: <Briefcase size={18} />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
               { label: t('hr.open_vacancies'), value: staffStats.activeVacancies, icon: <Activity size={18} />, color: 'text-amber-500', bg: 'bg-amber-50' },
             ].map((stat, i) => (
               <div key={i} className="market-card p-5 group flex justify-between items-center">
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                     <p className="text-2xl font-black text-market-navy">{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>{stat.icon}</div>
               </div>
             ))}
          </div>

          <div className="bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 group w-full">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
               <input 
                 value={staffSearch} 
                 onChange={e => setStaffSearch(e.target.value)} 
                 placeholder={t('hr.search_staff')} 
                 className="w-full pl-14 pr-6 py-4 bg-slate-50/50 rounded-2xl border border-slate-100 outline-none font-bold text-xs focus:ring-8 focus:ring-market-blue/5 focus:border-market-blue focus:bg-white transition-all shadow-inner" 
               />
            </div>
            <div className="flex items-center gap-3 bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100 min-w-[200px] w-full md:w-auto">
               <Building2 size={16} className="text-slate-400" />
               <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="bg-transparent font-black text-[10px] uppercase text-market-navy outline-none cursor-pointer w-full tracking-widest">
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
               </select>
            </div>

            {/* Seletor de Modo de Visualização */}
            <div className="flex bg-slate-100/80 p-1 rounded-2xl border border-slate-200/40 shadow-inner w-full md:w-auto justify-center">
               <button 
                 type="button"
                 onClick={() => setEmployeesViewMode('grid')} 
                 className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${employeesViewMode === 'grid' ? 'bg-white text-market-blue shadow-md' : 'text-slate-400 hover:text-market-navy'}`}
               >
                 <Grid size={14} />
                 <span>Grelha</span>
               </button>
               <button 
                 type="button"
                 onClick={() => setEmployeesViewMode('table')} 
                 className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${employeesViewMode === 'table' ? 'bg-white text-market-blue shadow-md' : 'text-slate-400 hover:text-market-navy'}`}
               >
                 <List size={14} />
                 <span>Lista</span>
               </button>
            </div>

            <button 
              onClick={() => { setEditingEmpId(null); setFormState(initialFormState); setShowAddModal(true); }} 
              className="market-button market-button-primary w-full md:w-auto px-8 py-4 text-[10px] uppercase tracking-[0.2em]"
            >
               <UserPlus size={18} /> {t('hr.hire_employee')}
            </button>
          </div>

          {employeesViewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredEmployees.map((emp) => {
                  const deptColors = getDeptColorClasses(emp.department);
                  return (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      key={emp.id} 
                      onClick={() => {setViewingEmp(emp); setShowViewModal(true);}} 
                      className="market-card overflow-hidden bg-white hover:shadow-2xl hover:shadow-slate-100 transition-all duration-300 relative group cursor-pointer border border-slate-100 flex flex-col justify-between"
                    >
                      {/* Top Decorative Stripe */}
                      <div className={`h-2 text-transparent w-full bg-gradient-to-r ${deptColors.bg}`} />
                      
                      <div className="p-6 pb-2 flex-1 flex flex-col items-center text-center">
                        <div className="relative mb-4 group-hover:scale-105 transition-all duration-300">
                           <img 
                             src={formatImageUrl(emp.avatar) || undefined} 
                             className="w-20 h-20 rounded-3xl object-cover shadow-lg ring-4 ring-white group-hover:ring-offset-2 transition-all" 
                             alt={emp.name} 
                           />
                           <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full ring-2 ring-white ${emp.status === t('hr.active') ? 'bg-emerald-500' : emp.status === 'Férias' ? 'bg-sky-500' : 'bg-amber-500'} animate-pulse`} />
                        </div>

                        <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border mb-2 ${deptColors.text}`}>
                           {emp.department}
                        </span>

                        <h3 className="text-sm font-black text-market-navy truncate max-w-full uppercase tracking-tight group-hover:text-market-blue transition-colors duration-300 leading-tight">
                          {emp.name}
                        </h3>

                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 mb-2">
                           {tRole(emp.role)}
                        </p>

                        <div className="flex gap-2.5 my-3 bg-slate-50/70 p-1.5 rounded-2xl border border-slate-100 transition-all duration-300 group-hover:bg-white group-hover:border-slate-200">
                           <a 
                             href={`mailto:${emp.email}`} 
                             onClick={e => e.stopPropagation()} 
                             className="p-2 bg-white hover:bg-market-blue hover:text-white text-slate-500 rounded-xl transition-all border border-slate-150 flex items-center justify-center hover:scale-110 shadow-sm"
                             title={`Enviar Email para ${emp.name}`}
                           >
                              <Mail size={13} />
                           </a>
                           <a 
                             href={`tel:${emp.phone}`} 
                             onClick={e => e.stopPropagation()} 
                             className="p-2 bg-white hover:bg-market-blue hover:text-white text-slate-500 rounded-xl transition-all border border-slate-150 flex items-center justify-center hover:scale-110 shadow-sm"
                             title={`Ligar para ${emp.name}`}
                           >
                              <Phone size={13} />
                           </a>
                           <a 
                             href={`https://wa.me/${(emp.phone || '').replace(/[^0-9]/g, '')}`} 
                             target="_blank" 
                             rel="noopener noreferrer" 
                             onClick={e => e.stopPropagation()} 
                             className="p-2 bg-white hover:bg-emerald-500 hover:text-white text-slate-500 rounded-xl transition-all border border-slate-150 flex items-center justify-center hover:scale-110 shadow-sm"
                             title="WhatsApp"
                           >
                              <MessageSquare size={13} />
                           </a>
                        </div>
                      </div>

                      <div className="mt-auto px-6 py-4 bg-slate-50/50 border-t border-slate-100/60 flex items-center justify-between text-[11px] text-slate-500 font-bold">
                         <div className="flex items-center gap-1.5 text-slate-400">
                            <Calendar size={13} />
                            <span className="font-medium text-[9px] text-slate-400">
                              {emp.join_date ? new Date(emp.join_date).toLocaleDateString('pt-MZ') : 'N/D'}
                            </span>
                         </div>
                         <div className="flex items-center gap-1.5 text-market-navy bg-white px-2.5 py-1 rounded-xl border border-slate-150 shadow-sm">
                            <DollarSign size={13} className="text-market-blue" />
                            <span className="font-mono font-bold text-[10px]">
                              {Number(emp.salary).toLocaleString('pt-MZ')} MT
                            </span>
                         </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="market-card overflow-hidden bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100/50"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] font-black text-market-slate uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                      <th className="px-6 py-4.5">Colaborador</th>
                      <th className="px-6 py-4.5">Departamento & Cargo</th>
                      <th className="px-6 py-4.5">Salário Base</th>
                      <th className="px-6 py-4.5">Estado</th>
                      <th className="px-6 py-4.5">Data de Admissão</th>
                      <th className="px-6 py-4.5 text-right">Contacto Rápido / Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEmployees.map((emp) => {
                      const deptColors = getDeptColorClasses(emp.department);
                      return (
                        <tr 
                          key={emp.id} 
                          onClick={() => {setViewingEmp(emp); setShowViewModal(true);}} 
                          className="hover:bg-slate-50/50 transition-all duration-200 cursor-pointer group"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <img src={formatImageUrl(emp.avatar) || undefined} className="w-11 h-11 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-all" alt="" />
                              <div>
                                <p className="text-[12px] font-black text-market-navy uppercase tracking-tight mb-0.5 group-hover:text-market-blue transition-colors">{emp.name}</p>
                                <p className="text-[10px] text-slate-400 font-medium">{emp.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-[11px] font-bold text-market-navy leading-none mb-1">{tRole(emp.role)}</p>
                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border inline-block ${deptColors.text}`}>
                              {emp.department}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1 text-slate-705">
                              <DollarSign size={13} className="text-market-blue" />
                              <span className="font-mono font-bold text-xs">{Number(emp.salary).toLocaleString('pt-MZ')} MT</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[8.5px] font-black uppercase tracking-wider inline-block text-center border ${getStatusBadgeStyles(emp.status)}`}>
                              {emp.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1 text-slate-500">
                              <Calendar size={13} className="text-slate-400" />
                              <span className="text-[11px] font-bold">{emp.join_date ? new Date(emp.join_date).toLocaleDateString('pt-MZ') : 'N/D'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-end gap-1.5 items-center">
                               <a href={`mailto:${emp.email}`} className="p-2 bg-slate-50 hover:bg-market-blue hover:text-white text-slate-500 border border-slate-150 rounded-xl transition-all shadow-sm" title="Email"><Mail size={13} /></a>
                               <a href={`tel:${emp.phone}`} className="p-2 bg-slate-50 hover:bg-market-blue hover:text-white text-slate-500 border border-slate-150 rounded-xl transition-all shadow-sm" title="Ligar"><Phone size={13} /></a>
                               <button 
                                 onClick={() => {setViewingEmp(emp); setShowViewModal(true);}} 
                                 className="py-1.5 px-3 bg-white hover:bg-market-navy hover:text-white text-market-navy font-black text-[9px] uppercase tracking-widest border border-slate-200 rounded-xl transition-all shadow-sm"
                               >
                                  Ficha
                               </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </motion.div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="market-card p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-market-blue/10 text-market-blue rounded-2xl flex items-center justify-center"><Briefcase size={20}/></div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('hr.total_apps')}</p>
                   <p className="text-2xl font-black text-market-navy">{applications.length}</p>
                </div>
             </div>
             <div className="market-card p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center"><Activity size={20}/></div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('hr.pending')}</p>
                   <p className="text-2xl font-black text-market-navy">{applications.filter(a => a.status === 'Pendente').length}</p>
                </div>
             </div>
             <div className="market-card p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center"><CheckCircle2 size={20}/></div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('hr.approved')}</p>
                   <p className="text-2xl font-black text-market-navy">{applications.filter(a => a.status === 'Aprovado').length}</p>
                </div>
             </div>
          </div>

          <div className="bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 group w-full">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
               <input 
                 value={appSearch} 
                 onChange={e => setAppSearch(e.target.value)} 
                 placeholder={t('hr.locate_candidate')} 
                 className="w-full pl-14 pr-6 py-4 bg-slate-50/50 rounded-2xl border border-slate-100 outline-none font-bold text-xs focus:ring-8 focus:ring-market-blue/5 focus:border-market-blue focus:bg-white transition-all shadow-inner" 
               />
            </div>
            <div className="flex items-center gap-3 bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100 min-w-[200px] w-full md:w-auto">
               <Filter size={16} className="text-slate-400" />
               <select value={appStatusFilter} onChange={e => setAppStatusFilter(e.target.value)} className="bg-transparent font-black text-[10px] uppercase text-market-navy outline-none cursor-pointer w-full tracking-widest">
                  <option value={t('fin.all')}>{t('hr.all_statuses')}</option>
                  <option value="Pendente">{t('hr.pending')}</option>
                  <option value="Aprovado">{t('hr.approved')}</option>
                  <option value="Rejeitado">Rejeitado</option>
               </select>
            </div>
          </div>

          <div className="market-card overflow-hidden">
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="text-[9px] font-black text-market-slate uppercase tracking-widest bg-slate-50/50">
                        <th className="px-6 py-4">{t('hr.candidate')}</th>
                        <th className="px-6 py-4">{t('hr.vac_date')}</th>
                        <th className="px-6 py-4">{t('hr.dossier_docs')}</th>
                        <th className="px-6 py-4">{t('footer.legal.status')}</th>
                        <th className="px-6 py-4 text-right">{t('fin.actions')}</th>
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
                              <div className="flex flex-wrap gap-2">
                                 {app.cv_url && (
                                    <a href={app.cv_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100 flex items-center gap-2 text-[9px] font-black uppercase"><FileBadge size={14}/> CV</a>
                                 )}
                                 {app.cover_letter_url && (
                                    <a href={app.cover_letter_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-market-blue/5 text-market-blue rounded-lg hover:bg-market-blue hover:text-white transition-all border border-market-blue/10 flex items-center gap-2 text-[9px] font-black uppercase"><ExternalLink size={14}/> {t('side.legal.sub')}</a>
                                 )}
                                 {app.applicant_linkedin && (
                                    <a href={app.applicant_linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100 flex items-center gap-2 text-[9px] font-black uppercase"><Linkedin size={14}/> Profile</a>
                                 )}
                                 {!app.cv_url && !app.cover_letter_url && !app.applicant_linkedin && (
                                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{t('hr.no_attachments')}</span>
                                 )}
                              </div>
                           </td>
                           <td className="px-6 py-5">
                              <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${app.status === 'Pendente' ? 'bg-amber-50 text-amber-600' : app.status === 'Aprovado' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                 {app.status === 'Aprovado' ? t('hr.approved') : app.status === 'Pendente' ? t('hr.pending') : app.status}
                              </span>
                           </td>
                           <td className="px-6 py-5 text-right space-x-2">
                              {app.status === 'Pendente' && (
                                <div className="flex justify-end gap-2">
                                   <button onClick={() => handleUpdateAppStatus(app.id, 'Aprovado')} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-100"><CheckCircle2 size={14}/></button>
                                   <button onClick={() => handleUpdateAppStatus(app.id, 'Rejeitado')} className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm border border-rose-100"><X size={14}/></button>
                                </div>
                              )}
                              {app.status !== 'Pendente' && (
                                <button onClick={() => handleUpdateAppStatus(app.id, 'Pendente')} className="text-[8px] font-black text-slate-300 hover:text-market-blue uppercase tracking-widest">{t('hr.revert')}</button>
                              )}
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>
        </div>
      )}

      {/* Vacancy Modal */}
      {showVacancyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-market-navy/80 backdrop-blur-xl animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl relative border-t-8 border-market-blue overflow-hidden">
            {/* Modal Header - Fixed */}
            <div className="p-8 pb-4 relative border-b border-slate-50">
              <button 
                onClick={() => setShowVacancyModal(false)} 
                className="absolute top-8 right-8 p-2 text-slate-400 hover:text-market-navy bg-slate-50 rounded-xl transition-all border border-slate-100 z-10"
              >
                <X size={24} />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-market-navy flex items-center gap-3">
                  <Briefcase size={28} className="text-market-blue" />
                  {editingVacId ? t('hr.edit_vac') : t('hr.new_vac')}
                </h2>
                <p className="text-[10px] text-market-slate font-bold uppercase mt-1 tracking-widest">{t('hr.vac_public_desc') || 'Este anúncio será visível no portal público de carreiras'}</p>
              </div>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-8 pt-6 scrollbar-thin scrollbar-thumb-slate-200">
              <form id="vacancy-form" onSubmit={handleSaveVacancy} className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[9px] font-bold text-market-slate uppercase tracking-widest ml-1">{t('hr.vac_title')}</label>
                  <input required value={vacancyForm.title} onChange={e => setVacancyForm({...vacancyForm, title: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 font-medium text-sm outline-none focus:ring-4 focus:ring-market-blue/10 focus:border-market-blue transition-all" placeholder="Ex: Gestor Imobiliário Senior" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-market-slate uppercase tracking-widest ml-1">{t('hr.vac_area')}</label>
                  <input value={vacancyForm.area} onChange={e => setVacancyForm({...vacancyForm, area: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 font-medium text-sm outline-none focus:ring-4 focus:ring-market-blue/10 transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-market-slate uppercase tracking-widest ml-1">{t('hr.contract_type')}</label>
                  <select value={vacancyForm.type} onChange={e => setVacancyForm({...vacancyForm, type: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 font-medium text-sm outline-none focus:ring-4 focus:ring-market-blue/10 transition-all">
                     <option>Full-Time</option>
                     <option>Part-Time</option>
                     <option>Estágio</option>
                     <option>Consultoria</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-market-slate uppercase tracking-widest ml-1">{t('hr.location')}</label>
                  <input value={vacancyForm.location} onChange={e => setVacancyForm({...vacancyForm, location: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 font-medium text-sm outline-none focus:ring-4 focus:ring-market-blue/10 transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-market-slate uppercase tracking-widest ml-1">{t('hr.salary_remun')}</label>
                  <input value={vacancyForm.salary} onChange={e => setVacancyForm({...vacancyForm, salary: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 font-medium text-sm outline-none focus:ring-4 focus:ring-market-blue/10 transition-all" placeholder="Ex: 50.000 ou A Negociar" />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[9px] font-bold text-market-slate uppercase tracking-widest ml-1">{t('hr.vac_status')}</label>
                  <select value={vacancyForm.status} onChange={e => setVacancyForm({...vacancyForm, status: e.target.value as any})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 font-medium text-sm outline-none focus:ring-4 focus:ring-market-blue/10 transition-all">
                     <option value="Open">Aberta (Público)</option>
                     <option value="Closed">Fechada / Arquivada</option>
                  </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[9px] font-bold text-market-slate uppercase tracking-widest">{t('hr.desc_reqs')}</label>
                    <div className="flex items-center gap-2">
                      <button 
                        type="button"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(vacancyForm.description || '');
                            alert(t('hr.content_copied') || 'Conteúdo copiado (HTML)!');
                          } catch (err) {
                            alert(t('hr.copy_error') || 'Erro ao copiar.');
                          }
                        }}
                        className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                      >
                        <Save size={10} /> {t('hr.copy_content')}
                      </button>
                      <button 
                        type="button"
                        onClick={handleGenerateAIDescription}
                        disabled={generatingAI}
                        className="flex items-center gap-1.5 px-3 py-1 bg-market-blue/5 text-market-blue rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-market-blue hover:text-white transition-all disabled:opacity-50"
                      >
                        {generatingAI ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                        {generatingAI ? 'A gerar...' : t('hr.generate_ai')}
                      </button>
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-inner focus-within:ring-4 focus-within:ring-market-blue/10 transition-all">
                    <ReactQuill 
                      theme="snow"
                      value={vacancyForm.description || ''}
                      onChange={(content) => setVacancyForm(prev => ({ ...prev, description: content }))}
                      modules={quillModules}
                      placeholder="O que se espera deste talento? Use a IA para ajudar nos detalhes e edite com as ferramentas acima..."
                      className="bg-white min-h-[300px]"
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer - Fixed */}
            <div className="p-8 pt-4 bg-white border-t border-slate-100 flex gap-4">
              <button 
                type="button"
                onClick={() => setShowVacancyModal(false)}
                className="px-6 py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest text-slate-400 hover:text-market-navy hover:bg-slate-50 transition-all"
              >
                Cancelar
              </button>
              <button 
                form="vacancy-form"
                type="submit" 
                disabled={saving} 
                className="market-button market-button-primary flex-1 py-4 text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-market-blue/20"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> {editingVacId ? t('hr.update_vac_btn') || 'Actualizar Vaga' : t('hr.confirm_publish') || 'Confirmar e Publicar'}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-market-navy/80 backdrop-blur-xl animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 md:p-10 max-w-4xl w-full shadow-2xl relative overflow-y-auto max-h-[90vh] custom-scrollbar border-t-8 border-market-blue">
            <button onClick={() => setShowAddModal(false)} className="absolute top-8 right-8 p-2 text-slate-400 hover:text-market-navy bg-slate-50 rounded-xl transition-all border border-slate-100"><X size={24} /></button>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-market-navy flex items-center gap-3">
                <UserPlus size={28} className="text-market-blue" />
                {editingEmpId ? t('hr.update_profile') : t('hr.new_hire')}
              </h2>
              <p className="text-[10px] text-market-slate font-bold uppercase mt-1 tracking-widest">{t('hr.official_reg') || 'Registo Oficial no Core System'}</p>
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
                <label className="text-[9px] font-bold text-market-slate uppercase tracking-widest ml-1">{t('hr.full_name')}</label>
                <input required value={formState.name} onChange={e => setFormState({...formState, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 font-medium text-sm outline-none focus:ring-4 focus:ring-market-blue/10 focus:border-market-blue transition-all" />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-market-slate uppercase tracking-widest ml-1">{t('hr.gender')}</label>
                <select value={formState.gender} onChange={e => setFormState({...formState, gender: e.target.value as any})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 font-medium text-sm outline-none focus:ring-4 focus:ring-market-blue/10 transition-all">
                  <option value="M">{t('hr.male')}</option>
                  <option value="F">{t('hr.female')}</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-market-slate uppercase tracking-widest ml-1">{t('hr.role_func')}</label>
                <select value={formState.role} onChange={e => setFormState({...formState, role: e.target.value as UserRole})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 font-medium text-sm outline-none focus:ring-4 focus:ring-market-blue/10 transition-all">
                  {Object.values(UserRole).map(role => <option key={role} value={role}>{tRole(role)}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-market-slate uppercase tracking-widest ml-1">{t('hr.department')}</label>
                <select value={formState.department} onChange={e => setFormState({...formState, department: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 font-medium text-sm outline-none focus:ring-4 focus:ring-market-blue/10 transition-all">
                  {departments.filter(d => d !== t('fin.all')).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-market-slate uppercase tracking-widest ml-1">{t('hr.base_salary')}</label>
                <input type="number" required value={formState.salary} onChange={e => setFormState({...formState, salary: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 font-medium text-sm outline-none focus:ring-4 focus:ring-market-blue/10 transition-all" />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-market-slate uppercase tracking-widest ml-1">{t('hr.corp_email')}</label>
                <input type="email" required value={formState.email} onChange={e => setFormState({...formState, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 font-medium text-sm outline-none focus:ring-4 focus:ring-market-blue/10 transition-all" />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-market-slate uppercase tracking-widest ml-1">{t('hr.phone_contact')}</label>
                <input required value={formState.phone} onChange={e => setFormState({...formState, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 font-medium text-sm outline-none focus:ring-4 focus:ring-market-blue/10 transition-all" />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-market-slate uppercase tracking-widest ml-1">{t('hr.contract_status')}</label>
                <select value={formState.status} onChange={e => setFormState({...formState, status: e.target.value as any})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 font-medium text-sm outline-none focus:ring-4 focus:ring-market-blue/10 transition-all">
                  <option value={t('hr.active')}>{t('hr.active')}</option>
                  <option value={t('hr.vacation')}>{t('hr.vacation')}</option>
                  <option value={t('hr.inactive')}>{t('hr.inactive')}</option>
                  <option value={t('hr.suspended')}>{t('hr.suspended')}</option>
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
                  {saving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> {editingEmpId ? t('hr.update_data') || 'Actualizar Dados' : t('hr.confirm_hire') || 'Confirmar Admissão'}</>}
                </button>
                <button type="button" onClick={() => setShowAddModal(false)} className="market-button market-button-outline px-8 py-4 text-[10px] uppercase tracking-widest">{t('fin.cancel') || 'Cancelar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewingEmp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-0 max-w-4xl w-full shadow-2xl relative overflow-hidden flex flex-col md:flex-row h-[75vh] border border-slate-100 animate-in zoom-in-95 duration-300">
            {/* Left side panel */}
            <div className="w-full md:w-1/3 bg-slate-50/50 p-8 flex flex-col items-center text-center border-r border-slate-100 relative">
               {/* Accent decoration */}
               <div className={`absolute top-0 inset-x-0 h-2 bg-gradient-to-r ${getDeptColorClasses(viewingEmp.department).bg}`} />

               <div className="relative mb-6 mt-4 group">
                  <img src={formatImageUrl(viewingEmp.avatar) || undefined} className="w-28 h-28 rounded-[2.5rem] object-cover shadow-xl ring-4 ring-white group-hover:scale-105 transition-all duration-300" alt={viewingEmp.name} />
                  <div className={`absolute -bottom-2 right-1 px-3.5 py-1 rounded-full text-[8.5px] font-black uppercase text-white shadow-md tracking-wider flex items-center gap-1 bg-gradient-to-r ${getDeptColorClasses(viewingEmp.department).bg}`}>
                     {viewingEmp.status}
                  </div>
               </div>

               <h2 className="text-lg font-black text-market-navy uppercase tracking-tight mb-1 leading-tight">{viewingEmp.name}</h2>
               <span className={`text-[8.5px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full border mb-6 inline-block bg-white ${getDeptColorClasses(viewingEmp.department).text}`}>
                  {viewingEmp.department}
               </span>
               
               <div className="w-full space-y-3.5 pt-6 border-t border-slate-100 flex-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left mb-2">Contacto Direto</p>
                  
                  <a href={`mailto:${viewingEmp.email}`} className="flex items-center gap-3 text-market-slate hover:text-market-blue transition-colors bg-white px-3.5 py-2.5 rounded-xl border border-slate-100 shadow-sm w-full">
                     <Mail size={14} className="text-slate-400" />
                     <span className="text-[11px] font-bold truncate text-left flex-1">{viewingEmp.email}</span>
                  </a>
                  
                  <a href={`tel:${viewingEmp.phone}`} className="flex items-center gap-3 text-market-slate hover:text-market-blue transition-colors bg-white px-3.5 py-2.5 rounded-xl border border-slate-100 shadow-sm w-full">
                     <Phone size={14} className="text-slate-400" />
                     <span className="text-[11px] font-bold text-left flex-1">{viewingEmp.phone}</span>
                  </a>
               </div>

               <div className="mt-8 flex gap-2 w-full pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => { setFormState(viewingEmp); setEditingEmpId(viewingEmp.id); setShowViewModal(false); setShowAddModal(true); }} 
                    className="flex-1 p-3.5 bg-market-blue hover:bg-market-navy text-white rounded-xl transition-all shadow-md flex items-center justify-center gap-2 font-bold text-[10px] uppercase tracking-wider"
                  >
                    <Edit3 size={15} /> {t('hr.edit')}
                  </button>
                  <button 
                    onClick={() => handleDeleteEmployee(viewingEmp.id)} 
                    className="p-3.5 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-100 rounded-xl transition-all shadow-sm flex items-center justify-center hover:scale-105"
                  >
                    <Trash2 size={15}/>
                  </button>
                  <button 
                    onClick={() => setShowViewModal(false)} 
                    className="p-3.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-all"
                  >
                    <X size={15}/>
                  </button>
               </div>
            </div>
            
            {/* Right side content */}
            <div className="flex-1 p-8 md:p-10 overflow-y-auto custom-scrollbar bg-white">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Identification Card */}
                  <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100/80">
                     <h4 className="text-[10px] font-black text-market-navy uppercase tracking-[0.2em] mb-4.5 flex items-center gap-2">
                       <Fingerprint size={14} className="text-market-blue"/> 
                       {t('hr.identification')}
                     </h4>
                     <div className="space-y-3">
                        <div className="bg-white p-3 rounded-2xl border border-slate-100 flex items-center justify-between">
                          <p className="text-[8.5px] font-black text-slate-400 uppercase">{t('hr.doc_type')}</p>
                          <p className="text-xs font-black text-market-navy">{viewingEmp.document_type || 'BI'}</p>
                        </div>
                        <div className="bg-white p-3 rounded-2xl border border-slate-100 flex items-center justify-between">
                          <p className="text-[8.5px] font-black text-slate-400 uppercase">{t('hr.doc_number')}</p>
                          <p className="text-xs font-mono font-bold text-market-navy">{viewingEmp.document_number || 'N/D'}</p>
                        </div>
                        <div className="bg-white p-3 rounded-2xl border border-slate-100 flex items-center justify-between">
                          <p className="text-[8.5px] font-black text-slate-400 uppercase">NUIT</p>
                          <p className="text-xs font-mono font-bold text-market-navy">{viewingEmp.nuit || 'N/D'}</p>
                        </div>
                     </div>
                  </div>

                  {/* Financial & Hiring info Card */}
                  <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100/80">
                     <h4 className="text-[10px] font-black text-market-navy uppercase tracking-[0.2em] mb-4.5 flex items-center gap-2">
                       <CreditCard size={14} className="text-market-blue"/> 
                       {t('fin.financial')}
                     </h4>
                     <div className="space-y-3">
                        <div className="bg-white p-3 rounded-2xl border border-slate-100 flex items-center justify-between">
                          <p className="text-[8.5px] font-black text-slate-400 uppercase">{t('hr.monthly_salary')}</p>
                          <p className="text-xs font-black text-market-accent font-mono">{Number(viewingEmp.salary).toLocaleString('pt-MZ')} MT</p>
                        </div>
                        <div className="bg-white p-3 rounded-2xl border border-slate-100 flex items-center justify-between">
                          <p className="text-[8.5px] font-black text-slate-400 uppercase">{t('hr.payment_method')}</p>
                          <p className="text-xs font-bold text-market-navy">{viewingEmp.payment_method || 'Transferência Bancária'}</p>
                        </div>
                        <div className="bg-white p-3 rounded-2xl border border-slate-100 flex items-center justify-between">
                          <p className="text-[8.5px] font-black text-slate-400 uppercase">Cargo / Função</p>
                          <p className="text-xs font-black text-market-blue">{tRole(viewingEmp.role)}</p>
                        </div>
                     </div>
                  </div>

                  {/* Contract & Staff info */}
                  <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100/80 md:col-span-2">
                     <h4 className="text-[10px] font-black text-market-navy uppercase tracking-[0.2em] mb-4.5 flex items-center gap-2">
                       <FileBadge size={14} className="text-market-blue"/> 
                       Contrato & Integração
                     </h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-3.5 rounded-2xl border border-slate-100">
                           <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Data de Admissão</p>
                           <p className="text-xs font-mono font-bold text-market-navy">{viewingEmp.join_date ? new Date(viewingEmp.join_date).toLocaleDateString('pt-MZ') : 'N/D'}</p>
                        </div>
                        <div className="bg-white p-3.5 rounded-2xl border border-slate-100">
                           <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Nº de Segurança Social (NISS)</p>
                           <p className="text-xs font-mono font-bold text-market-navy">{viewingEmp.niss || 'N/D'}</p>
                        </div>
                     </div>
                  </div>

                  {/* Location Card */}
                  <div className="md:col-span-2">
                     <h4 className="text-[10px] font-black text-market-navy uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                       <Map size={14} className="text-market-blue"/> 
                       {t('hr.location')}
                     </h4>
                     <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-xs font-bold text-market-navy/95 leading-relaxed">
                          {viewingEmp.address || "Endereço residencial não especificado no sistema corporativo."}
                        </p>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRView;
