
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, Key, UserCog, Save, 
  CheckCircle2, Loader2, Search,
  Fingerprint, Database, X,
  RefreshCw, Award,
  RotateCcw, History, Calendar,
  ArrowRight,
  Wrench,
  LayoutDashboard,
  Wallet,
  Truck,
  Target,
  LayoutTemplate,
  Zap,
  Edit,
  Plus,
  Users as UsersIcon,
  Settings2,
  UserCheck,
  Filter,
  ArrowUpDown,
  SortAsc,
  SortDesc,
  FileText,
  Palette,
  Image as ImageIcon,
  Link as LinkIcon
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { UserRole, Employee, User } from '../types';
import { useBranding } from '../BrandingContext';

interface PermissionDefinition {
  id: string;
  label: string;
  category: 'Geral' | 'Negócio' | 'Recursos' | 'Sistema';
  description: string;
  icon: React.ReactNode;
}

interface RoleRecord {
  id: string;
  name: string;
  is_deleted: boolean;
  permissions: string[];
}

interface AuditLog {
  id: string;
  admin_name: string;
  target_user_name: string;
  action_type: string;
  change_details: string;
  created_at: string;
}

const GRANULAR_PERMISSIONS: PermissionDefinition[] = [
  { id: 'dashboard.view', label: 'Ver Dashboard', category: 'Geral', description: 'Acesso à vista principal de estatísticas.', icon: <LayoutDashboard size={14} /> },
  { id: 'catalog.view', label: 'Consultar Catálogo', category: 'Geral', description: 'Visualizar imóveis e portfólio público.', icon: <LayoutTemplate size={14} /> },
  { id: 'catalog.manage', label: 'Gerir Catálogo', category: 'Negócio', description: 'Adicionar, editar e remover imóveis.', icon: <Edit size={14} /> },
  { id: 'finance.view', label: 'Ver Financeiro', category: 'Negócio', description: 'Consultar fluxos de caixa e balanços.', icon: <Wallet size={14} /> },
  { id: 'finance.manage', label: 'Operar Financeiro', category: 'Negócio', description: 'Registar receitas, despesas e beneficiários.', icon: <Plus size={14} /> },
  { id: 'projects.view', label: 'Ver Projetos', category: 'Negócio', description: 'Acompanhar progresso de obras e orçamentos.', icon: <Wrench size={14} /> },
  { id: 'projects.manage', label: 'Gerir Projetos', category: 'Negócio', description: 'Criar novas obras e gerir equipas de projeto.', icon: <Wrench size={14} /> },
  { id: 'hr.view', label: 'Ver RH', category: 'Recursos', description: 'Visualizar lista de staff e candidaturas.', icon: <UsersIcon size={14} /> },
  { id: 'hr.manage', label: 'Gerir RH', category: 'Recursos', description: 'Contratar staff, editar contratos e gerir vagas.', icon: <UserCog size={14} /> },
  { id: 'fleet.view', label: 'Ver Frota', category: 'Recursos', description: 'Monitorizar estado e localização de veículos.', icon: <Truck size={14} /> },
  { id: 'fleet.manage', label: 'Gerir Frota', category: 'Recursos', description: 'Registar veículos, manutenções e motoristas.', icon: <Settings2 size={14} /> },
  { id: 'plans.view', label: 'Ver Estratégia', category: 'Recursos', description: 'Consultar metas e planos anuais.', icon: <Target size={14} /> },
  { id: 'plans.manage', label: 'Gerir Estratégia', category: 'Recursos', description: 'Definir e editar objetivos corporativos.', icon: <Zap size={14} /> },
  { id: 'admin.access', label: 'Administração TI', category: 'Sistema', description: 'Gestão de permissões, cargos e logs.', icon: <Shield size={14} /> },
  { id: 'system.repair', label: 'Reparação Cloud', category: 'Sistema', description: 'Acesso a scripts de reparação de base de dados.', icon: <Database size={14} /> },
];

interface AdminViewProps {
  currentUser: User | null;
}

const AdminView: React.FC<AdminViewProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<Employee[]>([]);
  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<Employee | null>(null);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'settings'>('users');
  const [editingRolePermissions, setEditingRolePermissions] = useState<RoleRecord | null>(null);
  const [rolesLoading, setRolesLoading] = useState(false);

  const { settings, updateSettings } = useBranding();
  const [tempSettings, setTempSettings] = useState(settings);
  const [isBrandingSaving, setIsBrandingSaving] = useState(false);

  // Auditoria Filters
  const [logSearchAdmin, setLogSearchAdmin] = useState('');
  const [logSearchTarget, setLogSearchTarget] = useState('');
  const [logSearchAction, setLogSearchAction] = useState('');
  const [logSortOrder, setLogSortOrder] = useState<'desc' | 'asc'>('desc');

  const meshStyle = {
    backgroundImage: `radial-gradient(rgba(0,0,0,0.03) 1px, transparent 1px)`,
    backgroundSize: '24px 24px'
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  async function logAction(action: string, target: string, details: string) {
    if (!currentUser) return;
    try {
      await supabase.from('audit_logs').insert([{
        admin_id: currentUser.id,
        admin_name: currentUser.name,
        target_user_name: target,
        action_type: action,
        change_details: details
      }]);
    } catch (e) {}
  }

  async function fetchRoles() {
    setRolesLoading(true);
    try {
      const { data, error } = await supabase.from('roles').select('*').order('name');
      if (!error && data) setRoles(data);
    } catch (e) {} finally { setRolesLoading(false); }
  }

  async function fetchUsers() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('employees').select('*').order('name');
      if (!error) setUsers(data || []);
    } catch (e) {} finally { setLoading(false); }
  }

  async function fetchAuditLogs() {
    setLoadingLogs(true);
    try {
      const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(200);
      if (!error) setAuditLogs(data || []);
    } catch (e) {} finally { setLoadingLogs(false); }
  }

  const handleSaveBranding = () => {
    setIsBrandingSaving(true);
    updateSettings(tempSettings);
    setTimeout(() => {
      setIsBrandingSaving(false);
      logAction('SISTEMA_CMS_UPDATE', 'Branding Integral', `Configurações de identidade e conteúdo sincronizadas com a cloud.`);
    }, 1200);
  };

  const filteredAndSortedLogs = useMemo(() => {
    let result = auditLogs.filter(log => {
      const matchesAdmin = log.admin_name?.toLowerCase().includes(logSearchAdmin.toLowerCase());
      const matchesTarget = log.target_user_name?.toLowerCase().includes(logSearchTarget.toLowerCase());
      const matchesAction = log.action_type?.toLowerCase().includes(logSearchAction.toLowerCase());
      return matchesAdmin && matchesTarget && matchesAction;
    });

    return result.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return logSortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [auditLogs, logSearchAdmin, logSearchTarget, logSearchAction, logSortOrder]);

  const handleSaveRolePermissions = async () => {
    if (!editingRolePermissions) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('roles').update({ permissions: editingRolePermissions.permissions }).eq('id', editingRolePermissions.id);
      if (error) throw error;
      await logAction('MATRIZ_CARGO_SYNC', `Cargo: ${editingRolePermissions.name}`, `Matriz base atualizada para ${editingRolePermissions.permissions.length} funcionalidades.`);
      setEditingRolePermissions(null);
      fetchRoles();
    } catch (err: any) { alert(err.message); } finally { setSaving(false); }
  };

  const handleUpdateUserPermissions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('employees').update({ role: editingUser.role, permissions: editingUser.permissions || [] }).eq('id', editingUser.id);
      if (error) throw error;
      await logAction('USER_OVERRIDE_SYNC', editingUser.name, `Permissões específicas aplicadas: ${editingUser.permissions?.length || 0} itens.`);
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) { alert(err.message); } finally { setSaving(false); }
  };

  const togglePermission = (permId: string, target: 'user' | 'role') => {
    if (target === 'user' && editingUser) {
      const current = editingUser.permissions || [];
      const next = current.includes(permId) ? current.filter(p => p !== permId) : [...current, permId];
      setEditingUser({ ...editingUser, permissions: next });
    } else if (target === 'role' && editingRolePermissions) {
      const current = editingRolePermissions.permissions || [];
      const next = current.includes(permId) ? current.filter(p => p !== permId) : [...current, permId];
      setEditingRolePermissions({ ...editingRolePermissions, permissions: next });
    }
  };

  const resetToRoleDefault = () => {
    if (!editingUser) return;
    const roleBase = roles.find(r => r.name === editingUser.role);
    if (roleBase) setEditingUser({ ...editingUser, permissions: [...roleBase.permissions] });
  };

  const groupedPermissions = useMemo(() => {
    return GRANULAR_PERMISSIONS.reduce((acc, curr) => {
      if (!acc[curr.category]) acc[curr.category] = [];
      acc[curr.category].push(curr);
      return acc;
    }, {} as Record<string, PermissionDefinition[]>);
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 max-w-[1600px] mx-auto">
      
      <div className="relative bg-white rounded-[3rem] p-10 md:p-14 border border-slate-100 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden" style={meshStyle}>
         <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-market-blue/5 via-transparent to-transparent pointer-events-none"></div>
         <div className="flex items-center gap-8 relative z-10">
            <div className="w-20 h-20 bg-gradient-to-tr from-market-navy to-market-blue rounded-[2rem] flex items-center justify-center shadow-2xl border border-white/10">
               <Shield size={36} className="text-white" />
            </div>
            <div>
               <h1 className="text-3xl md:text-5xl font-bold text-market-navy tracking-tight leading-none mb-2">Security <span className="text-market-blue">Core</span></h1>
               <p className="text-[10px] font-bold text-market-slate uppercase tracking-[0.5em] flex items-center gap-2">
                  <Fingerprint size={12} className="text-market-accent" /> Matriz de Identidade Monte v15.0
               </p>
            </div>
         </div>
         <div className="flex items-center gap-4 relative z-10">
            <button onClick={() => { fetchAuditLogs(); setShowAuditModal(true); }} className="market-button market-button-outline px-8 py-4 text-[10px] uppercase tracking-widest flex items-center justify-center gap-3">
               <History size={16} /> Auditoria
            </button>
            <button onClick={() => { fetchUsers(); fetchRoles(); }} className="market-button market-button-primary p-4 shadow-xl">
               <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
            </button>
         </div>
      </div>

      <div className="flex p-2 bg-white rounded-[2.5rem] border border-slate-100 w-full max-w-2xl mx-auto shadow-xl">
         <button onClick={() => setActiveTab('users')} className={`flex-1 py-4 rounded-[2rem] text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${activeTab === 'users' ? 'bg-market-blue text-white shadow-lg' : 'text-market-slate hover:text-market-navy'}`}>
            <UserCheck size={16} /> Utilizadores
         </button>
         <button onClick={() => setActiveTab('roles')} className={`flex-1 py-4 rounded-[2rem] text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${activeTab === 'roles' ? 'bg-market-blue text-white shadow-lg' : 'text-market-slate hover:text-market-navy'}`}>
            <Award size={16} /> Matriz Cargos
         </button>
         <button onClick={() => setActiveTab('settings')} className={`flex-1 py-4 rounded-[2rem] text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${activeTab === 'settings' ? 'bg-market-blue text-white shadow-lg' : 'text-market-slate hover:text-market-navy'}`}>
            <Palette size={16} /> Identidade
         </button>
      </div>

      <div className="animate-in slide-in-from-bottom-6 duration-700">
         {activeTab === 'users' && (
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden" style={meshStyle}>
               <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="relative flex-1 max-w-md">
                     <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-market-slate" size={18} />
                     <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Localizar identidade..." className="w-full pl-16 pr-6 py-5 bg-slate-50 rounded-[2rem] border border-slate-200 font-medium text-sm outline-none focus:ring-4 focus:ring-market-blue/10 focus:border-market-blue transition-all" />
                  </div>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-slate-50/50 text-[10px] font-bold text-market-slate uppercase tracking-widest border-b border-slate-100">
                           <th className="px-10 py-8">Utilizador / Cargo</th>
                           <th className="px-10 py-8 text-center">Estado de Acesso</th>
                           <th className="px-10 py-8 text-right">Ação</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase())).map(user => (
                           <tr key={user.id} className="hover:bg-slate-50/50 transition-all group">
                              <td className="px-10 py-10">
                                 <div className="flex items-center gap-6">
                                    <div className="relative">
                                       <img src={user.avatar} className="w-16 h-16 rounded-2xl object-cover ring-4 ring-slate-100 transition-transform group-hover:scale-110 shadow-sm" alt="" />
                                       <div className={`absolute -bottom-1 -right-1 w-5 h-5 bg-market-accent rounded-full border-4 border-white shadow-sm`}></div>
                                    </div>
                                    <div>
                                       <p className="text-lg font-bold text-market-navy leading-none mb-2 group-hover:text-market-blue transition-colors">{user.name}</p>
                                       <span className="text-[10px] font-bold text-market-blue bg-market-blue/5 px-3 py-1 rounded-lg uppercase tracking-wider">{user.role}</span>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-10 py-10 text-center">
                                 <div className="flex flex-wrap justify-center gap-2 max-w-xs mx-auto">
                                    {user.permissions?.length ? (
                                       <span className="text-[9px] font-bold bg-market-accent text-white px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg shadow-market-accent/20">Override Ativo ({user.permissions.length})</span>
                                    ) : (
                                       <span className="text-[9px] font-bold bg-slate-100 text-market-slate px-3 py-1 rounded-full uppercase tracking-tighter">Padrão do Cargo</span>
                                    )}
                                 </div>
                              </td>
                              <td className="px-10 py-10 text-right">
                                 <button onClick={() => setEditingUser({...user})} className="p-4 bg-market-navy text-white rounded-2xl shadow-xl transition-all group-hover:scale-105 group-hover:bg-market-blue active:scale-95">
                                    <UserCog size={22} />
                                 </button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         )}

         {activeTab === 'roles' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {rolesLoading ? (
                  <div className="col-span-full py-24 flex justify-center"><Loader2 className="animate-spin text-market-blue" size={48} /></div>
               ) : roles.filter(r => !r.is_deleted).map(role => (
                  <div key={role.id} className="market-card p-10 border-slate-100 hover:shadow-2xl transition-all group" style={meshStyle}>
                     <div className="flex justify-between items-start mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-market-blue to-market-navy text-white rounded-2xl flex items-center justify-center shadow-2xl transition-transform group-hover:rotate-12">
                           <Award size={32} />
                        </div>
                        <span className="text-[10px] font-bold text-market-slate uppercase tracking-widest">{role.permissions.length} Funcionalidades</span>
                     </div>
                     <h3 className="text-2xl font-bold text-market-navy tracking-tight mb-8 group-hover:text-market-blue transition-all">{role.name}</h3>
                     <button onClick={() => setEditingRolePermissions({...role})} className="market-button market-button-primary w-full py-5 text-[10px] uppercase tracking-widest flex items-center justify-center gap-3">
                        <Shield size={16} /> Editar Matriz Base
                     </button>
                  </div>
               ))}
            </div>
         )}

         {activeTab === 'settings' && (
            <div className="max-w-6xl mx-auto space-y-12 animate-in slide-in-from-right-10 duration-700">
               {/* Branding Header Card */}
               <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl p-10 md:p-16" style={meshStyle}>
                  <div className="flex items-center gap-6 mb-12">
                     <div className="w-16 h-16 bg-market-blue rounded-3xl flex items-center justify-center text-white shadow-xl">
                        <Palette size={32} />
                     </div>
                     <div>
                        <h2 className="text-3xl font-bold text-market-navy tracking-tight uppercase">Gestão da <span className="text-market-blue">Marca</span></h2>
                        <p className="text-xs font-bold text-market-slate uppercase tracking-widest">Painel de Controlo de Identidade e Conteúdo</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                     <div className="space-y-10">
                        {/* Company Identity */}
                        <div className="space-y-6">
                           <h4 className="text-[10px] font-bold text-market-blue uppercase tracking-[0.4em] mb-4">Informação Institucional</h4>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-bold text-market-slate uppercase tracking-widest ml-1">Nome da Empresa</label>
                                 <input value={tempSettings.companyName} onChange={e => setTempSettings({...tempSettings, companyName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-medium text-sm focus:ring-4 focus:ring-market-blue/10 outline-none" />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-bold text-market-slate uppercase tracking-widest ml-1">Tagline / Legado</label>
                                 <input value={tempSettings.tagline} onChange={e => setTempSettings({...tempSettings, tagline: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-medium text-sm focus:ring-4 focus:ring-market-blue/10 outline-none" />
                              </div>
                           </div>
                        </div>

                        {/* Hero Content */}
                        <div className="space-y-6">
                           <h4 className="text-[10px] font-bold text-market-blue uppercase tracking-[0.4em] mb-4">Conteúdo Hero (Página Inicial)</h4>
                           <div className="space-y-4">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-bold text-market-slate uppercase tracking-widest ml-1">Título Hero</label>
                                 <input value={tempSettings.heroTitle} onChange={e => setTempSettings({...tempSettings, heroTitle: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-medium text-sm focus:ring-4 focus:ring-market-blue/10 outline-none" />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-bold text-market-slate uppercase tracking-widest ml-1">Descrição Hero</label>
                                 <textarea value={tempSettings.heroDescription} onChange={e => setTempSettings({...tempSettings, heroDescription: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-medium text-sm focus:ring-4 focus:ring-market-blue/10 outline-none h-32 resize-none" />
                              </div>
                           </div>
                        </div>

                        {/* Visual Assets */}
                        <div className="space-y-6">
                           <h4 className="text-[10px] font-bold text-market-blue uppercase tracking-[0.4em] mb-4">Ativos Visuais</h4>
                           <div className="space-y-4">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-bold text-market-slate uppercase tracking-widest ml-1 flex items-center gap-2">URL do Logotipo <LinkIcon size={12} /></label>
                                 <input value={tempSettings.logoUrl} onChange={e => setTempSettings({...tempSettings, logoUrl: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-medium text-sm focus:ring-4 focus:ring-market-blue/10 outline-none" />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-bold text-market-slate uppercase tracking-widest ml-1 flex items-center gap-2">URL Imagem Hero <ImageIcon size={12} /></label>
                                 <input value={tempSettings.heroBgUrl} onChange={e => setTempSettings({...tempSettings, heroBgUrl: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-medium text-sm focus:ring-4 focus:ring-market-blue/10 outline-none" />
                              </div>
                           </div>
                        </div>

                        <button 
                           onClick={handleSaveBranding}
                           disabled={isBrandingSaving}
                           className="market-button market-button-primary w-full py-6 text-[11px] uppercase tracking-widest flex items-center justify-center gap-4 shadow-2xl"
                        >
                           {isBrandingSaving ? <Loader2 size={24} className="animate-spin" /> : <><Save size={24} /> Sincronizar Tudo</>}
                        </button>
                     </div>

                     <div className="space-y-10">
                        {/* Pre-visualização de Marca */}
                        <div className="bg-slate-50 rounded-[2.5rem] p-10 border border-slate-200 shadow-inner flex flex-col items-center">
                           <h5 className="text-[9px] font-bold text-market-slate uppercase tracking-widest mb-8">Preview de Logotipo</h5>
                           <div className="w-full h-48 bg-white rounded-3xl border border-slate-100 flex items-center justify-center p-8 group overflow-hidden">
                              <img src={tempSettings.logoUrl} alt="Logo Preview" className="max-w-full max-h-full object-contain transition-transform group-hover:scale-110" />
                           </div>
                           
                           <h5 className="text-[9px] font-bold text-market-slate uppercase tracking-widest mt-12 mb-8">Cores Corporativas</h5>
                           <div className="flex gap-6">
                              <div className="space-y-3 flex flex-col items-center">
                                 <input type="color" value={tempSettings.primaryColor} onChange={e => setTempSettings({...tempSettings, primaryColor: e.target.value})} className="w-16 h-16 rounded-2xl cursor-pointer border-4 border-white shadow-xl" />
                                 <span className="text-[8px] font-bold text-market-slate uppercase">Primária</span>
                              </div>
                              <div className="space-y-3 flex flex-col items-center">
                                 <input type="color" value={tempSettings.accentColor} onChange={e => setTempSettings({...tempSettings, accentColor: e.target.value})} className="w-16 h-16 rounded-2xl cursor-pointer border-4 border-white shadow-xl" />
                                 <span className="text-[8px] font-bold text-market-slate uppercase">Acento</span>
                              </div>
                           </div>
                        </div>

                        {/* Preview do Hero */}
                        <div className="relative rounded-[2.5rem] overflow-hidden aspect-video shadow-2xl border-4 border-white group">
                           <img src={tempSettings.heroBgUrl} className="w-full h-full object-cover opacity-80" />
                           <div className="absolute inset-0 bg-market-navy/60 p-8 flex flex-col justify-end">
                              <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 max-w-[80%]">
                                 <p className="text-[8px] text-market-blue font-bold uppercase tracking-[0.3em] mb-2">{tempSettings.legacyTitle}</p>
                                 <h4 className="text-sm font-bold text-white leading-tight">{tempSettings.heroTitle}</h4>
                              </div>
                           </div>
                           <div className="absolute top-4 right-4 bg-market-blue text-white p-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                              <ImageIcon size={16} />
                           </div>
                        </div>
                        
                        <div className="p-8 bg-market-navy rounded-[2.5rem] text-white/40 italic text-xs leading-relaxed border-t-8 border-market-blue">
                           "A gestão visual do ecossistema é aplicada em tempo real. Cada mudança nestes dados afeta a percepção global da Monte Hub em Moçambique e no mercado internacional."
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>

      {/* MODAL: EDITOR DE MATRIZ */}
      {(editingUser || editingRolePermissions) && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-market-navy/90 backdrop-blur-3xl animate-in fade-in duration-500">
            <div className="bg-white rounded-[4rem] w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl relative border-t-[20px] border-market-blue animate-in zoom-in-95 duration-500 overflow-hidden" style={meshStyle}>
               <button onClick={() => { setEditingUser(null); setEditingRolePermissions(null); }} className="absolute top-10 right-10 p-5 bg-slate-50 text-slate-400 hover:text-market-navy rounded-[2rem] transition-all hover:rotate-90 duration-500 border border-slate-100"><X size={28} /></button>
               
               <div className="p-16 border-b border-slate-100 flex flex-col md:flex-row md:items-center gap-10">
                  <div className="w-24 h-24 bg-market-navy rounded-[2.5rem] flex items-center justify-center text-market-blue shadow-2xl border border-white/10 overflow-hidden">
                     {editingUser ? <img src={editingUser.avatar} className="w-full h-full object-cover" /> : <Award size={48} />}
                  </div>
                  <div className="flex-1">
                     <h3 className="text-4xl md:text-5xl font-bold tracking-tight leading-none mb-3 text-market-navy">
                        {editingUser ? editingUser.name : `Matriz: ${editingRolePermissions?.name}`}
                     </h3>
                     <div className="flex flex-wrap items-center gap-6">
                        <p className="text-[11px] font-bold text-market-blue uppercase tracking-[0.4em] flex items-center gap-3"><Shield size={18} /> Configuração Granular</p>
                        {editingUser && (
                           <button onClick={resetToRoleDefault} className="text-[10px] font-bold text-market-slate hover:text-market-blue uppercase flex items-center gap-2 transition-colors">
                              <RotateCcw size={14} /> Sincronizar com Padrão {editingUser.role}
                           </button>
                        )}
                     </div>
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto p-16 space-y-20 custom-scrollbar">
                  {(Object.entries(groupedPermissions) as [string, PermissionDefinition[]][]).map(([category, perms]) => (
                     <div key={category} className="space-y-8">
                        <div className="flex items-center gap-6">
                           <div className="h-px flex-1 bg-slate-100"></div>
                           <h4 className="text-xs font-bold uppercase tracking-[0.6em] text-market-slate">{category}</h4>
                           <div className="h-px flex-1 bg-slate-100"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                           {perms.map(p => {
                              const isActive = editingUser 
                                 ? editingUser.permissions?.includes(p.id)
                                 : editingRolePermissions?.permissions?.includes(p.id);
                              
                              return (
                                 <button 
                                    key={p.id} 
                                    onClick={() => togglePermission(p.id, editingUser ? 'user' : 'role')}
                                    className={`p-8 rounded-[2.5rem] border-2 text-left transition-all duration-500 group relative overflow-hidden ${isActive ? 'bg-market-blue border-market-blue text-white shadow-2xl scale-[1.03]' : 'bg-white border-slate-100 text-market-navy hover:border-market-blue/30'}`}
                                 >
                                    <div className="flex items-center justify-between mb-4">
                                       <div className={`p-3 rounded-2xl transition-all ${isActive ? 'bg-white/20' : 'bg-slate-50 text-market-blue'}`}>{p.icon}</div>
                                       {isActive && <CheckCircle2 size={18} className="animate-in zoom-in" />}
                                    </div>
                                    <p className="text-sm font-bold uppercase tracking-tight mb-2 transition-all">{p.label}</p>
                                    <p className={`text-[11px] leading-relaxed ${isActive ? 'text-white/80' : 'text-market-slate'}`}>{p.description}</p>
                                 </button>
                              );
                           })}
                        </div>
                     </div>
                  ))}
               </div>

               <div className="p-16 bg-white border-t border-slate-100 flex gap-6">
                  <button onClick={editingUser ? handleUpdateUserPermissions : handleSaveRolePermissions} className="market-button market-button-primary flex-1 py-7 text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4">
                     {saving ? <Loader2 className="animate-spin" size={24} /> : <><Save size={24} /> Sincronizar Identidade</>}
                  </button>
                  <button onClick={() => { setEditingUser(null); setEditingRolePermissions(null); }} className="market-button market-button-outline px-14 py-7 text-xs uppercase tracking-widest">Descartar</button>
               </div>
            </div>
         </div>
      )}

      {/* MODAL: AUDITORIA REFINADA */}
      {showAuditModal && (
         <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-market-navy/95 backdrop-blur-3xl animate-in fade-in duration-500">
            <div className="bg-white rounded-[4rem] w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl relative border-t-[20px] border-market-accent animate-in zoom-in-95 duration-500 overflow-hidden" style={meshStyle}>
               <button onClick={() => setShowAuditModal(false)} className="absolute top-10 right-10 p-5 bg-slate-50 text-slate-400 hover:text-market-navy rounded-[2rem] transition-all hover:rotate-90 duration-500 border border-slate-100"><X size={28} /></button>
               
               <div className="p-12 md:p-16 border-b border-slate-100">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10">
                    <div>
                      <h3 className="text-4xl font-bold tracking-tight leading-none mb-3 text-market-navy">Eventos de <span className="text-market-accent">Segurança</span></h3>
                      <p className="text-[12px] font-bold text-market-slate uppercase tracking-[0.4em] flex items-center gap-3"><History size={18} /> Histórico Integral Cloud</p>
                    </div>
                    <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl shadow-inner border border-slate-100">
                       <p className="text-[10px] font-bold text-market-slate uppercase ml-4">Ordem Temporal:</p>
                       <button 
                        onClick={() => setLogSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase transition-all shadow-sm ${logSortOrder === 'desc' ? 'bg-white text-market-accent border border-slate-100' : 'bg-market-accent text-white'}`}
                       >
                         {logSortOrder === 'desc' ? <><SortDesc size={14} /> Recentes Primeiro</> : <><SortAsc size={14} /> Antigos Primeiro</>}
                       </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 p-6 rounded-[2.5rem] border border-slate-100">
                     <div className="relative group">
                        <UserCog className="absolute left-5 top-1/2 -translate-y-1/2 text-market-slate group-focus-within:text-market-accent transition-colors" size={18} />
                        <input 
                          value={logSearchAdmin} 
                          onChange={e => setLogSearchAdmin(e.target.value)}
                          placeholder="Filtro Admin..." 
                          className="w-full bg-white pl-14 pr-6 py-4 rounded-2xl font-medium text-xs outline-none border border-slate-200 focus:ring-4 focus:ring-market-accent/10 focus:border-market-accent transition-all shadow-sm"
                        />
                     </div>
                     <div className="relative group">
                        <Zap className="absolute left-5 top-1/2 -translate-y-1/2 text-market-slate group-focus-within:text-market-accent transition-colors" size={18} />
                        <input 
                          value={logSearchAction} 
                          onChange={e => setLogSearchAction(e.target.value)}
                          placeholder="Tipo de Ação..." 
                          className="w-full bg-white pl-14 pr-6 py-4 rounded-2xl font-medium text-xs outline-none border border-slate-200 focus:ring-4 focus:ring-market-accent/10 focus:border-market-accent transition-all shadow-sm"
                        />
                     </div>
                     <div className="relative group">
                        <Target className="absolute left-5 top-1/2 -translate-y-1/2 text-market-slate group-focus-within:text-market-accent transition-colors" size={18} />
                        <input 
                          value={logSearchTarget} 
                          onChange={e => setLogSearchTarget(e.target.value)}
                          placeholder="Utilizador Alvo..." 
                          className="w-full bg-white pl-14 pr-6 py-4 rounded-2xl font-medium text-xs outline-none border border-slate-200 focus:ring-4 focus:ring-market-accent/10 focus:border-market-accent transition-all shadow-sm"
                        />
                     </div>
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto p-12 md:p-16 space-y-8 custom-scrollbar">
                  {loadingLogs ? (
                     <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <Loader2 className="animate-spin text-market-accent" size={48} />
                        <p className="text-[11px] font-bold text-market-slate uppercase tracking-widest animate-pulse">Sincronizando Registos Cloud...</p>
                     </div>
                  ) : filteredAndSortedLogs.length > 0 ? filteredAndSortedLogs.map((log) => (
                     <div key={log.id} className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100 hover:bg-white transition-all group shadow-sm hover:shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-market-accent opacity-[0.05] rounded-full translate-x-1/2 -translate-y-1/2"></div>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                           <div className="flex items-center gap-4">
                              <div className="px-5 py-2 bg-market-accent text-white rounded-full text-[9px] font-bold uppercase tracking-widest shadow-lg shadow-market-accent/20">{log.action_type}</div>
                              <p className="text-sm font-bold text-market-navy">
                                 <span className="text-market-slate font-medium">Admin:</span> {log.admin_name} 
                                 <ArrowRight size={14} className="inline mx-2 text-market-slate" />
                                 <span className="text-market-blue">{log.target_user_name}</span>
                              </p>
                           </div>
                           <div className="flex items-center gap-3 text-[10px] font-bold text-market-slate uppercase tracking-widest bg-white px-5 py-2 rounded-full border border-slate-100 shadow-sm">
                              <Calendar size={12} className="text-market-accent" /> {new Date(log.created_at).toLocaleString('pt-MZ')}
                           </div>
                        </div>
                        <div className="pl-6 border-l-4 border-market-accent/20 py-2">
                           <div className="flex items-start gap-4 bg-black/5 p-6 rounded-2xl border border-black/5">
                              <FileText size={18} className="text-market-slate shrink-0 mt-1" />
                              <p className="text-xs font-medium text-market-navy font-mono leading-relaxed">{log.change_details}</p>
                           </div>
                        </div>
                     </div>
                  )) : (
                    <div className="py-24 text-center space-y-8">
                       <Filter size={48} className="mx-auto text-slate-200" />
                       <p className="text-market-slate font-bold uppercase tracking-widest text-[11px]">Nenhum registo corresponde aos filtros aplicados.</p>
                       <button onClick={() => { setLogSearchAdmin(''); setLogSearchAction(''); setLogSearchTarget(''); }} className="market-button market-button-outline px-10 py-4 text-[10px] uppercase tracking-widest">Limpar Filtros</button>
                    </div>
                  )}
               </div>

               <div className="p-12 bg-white border-t border-slate-100 flex justify-between items-center">
                  <p className="text-[10px] font-bold text-market-slate uppercase tracking-widest ml-4">Exibindo {filteredAndSortedLogs.length} de {auditLogs.length} registos em cache.</p>
                  <button onClick={() => setShowAuditModal(false)} className="market-button market-button-primary px-14 py-6 text-[11px] uppercase tracking-widest">Fechar Terminal</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default AdminView;
