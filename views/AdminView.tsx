
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
  FileText
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { UserRole, Employee, User } from '../types';

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
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
  const [editingRolePermissions, setEditingRolePermissions] = useState<RoleRecord | null>(null);
  const [rolesLoading, setRolesLoading] = useState(false);

  // Estados de Filtro de Auditoria
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
      // Nota: Fetch inicial maior para permitir filtragem local eficiente
      const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(200);
      if (!error) setAuditLogs(data || []);
    } catch (e) {} finally { setLoadingLogs(false); }
  }

  // Lógica de filtragem e ordenação local dos Logs
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
      
      {/* HEADER DE COMANDO */}
      <div className="relative bg-white rounded-[3rem] p-10 md:p-14 border border-slate-100 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden" style={meshStyle}>
         <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent pointer-events-none"></div>
         <div className="flex items-center gap-8 relative z-10">
            <div className="w-20 h-20 bg-gradient-to-tr from-slate-900 to-indigo-900 rounded-[2rem] flex items-center justify-center shadow-2xl border border-white/10">
               <Shield size={36} className="text-indigo-400" />
            </div>
            <div>
               <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-2">Security <span className="text-indigo-600">Core</span></h1>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] flex items-center gap-2">
                  <Fingerprint size={12} className="text-emerald-500" /> Matriz de Identidade Monte v15.0
               </p>
            </div>
         </div>
         <div className="flex items-center gap-4 relative z-10">
            <button onClick={() => { fetchAuditLogs(); setShowAuditModal(true); }} className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-3">
               <History size={16} /> Auditoria
            </button>
            <button onClick={() => { fetchUsers(); fetchRoles(); }} className="p-4 bg-indigo-600 text-white rounded-2xl shadow-xl hover:bg-indigo-700 transition-all active:scale-95">
               <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
            </button>
         </div>
      </div>

      {/* SELETOR DE MÓDULO ADMIN */}
      <div className="flex p-2 bg-white rounded-[2.5rem] border border-slate-100 w-full max-w-xl mx-auto shadow-xl">
         <button onClick={() => setActiveTab('users')} className={`flex-1 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>
            <UserCheck size={16} /> Overrides Utilizador
         </button>
         <button onClick={() => setActiveTab('roles')} className={`flex-1 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${activeTab === 'roles' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>
            <Award size={16} /> Matriz de Cargos
         </button>
      </div>

      {/* CONTEÚDO DINÂMICO */}
      <div className="animate-in slide-in-from-bottom-6 duration-700">
         {activeTab === 'users' ? (
            <div className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl overflow-hidden" style={meshStyle}>
               <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="relative flex-1 max-w-md">
                     <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                     <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Localizar identidade..." className="w-full pl-16 pr-6 py-5 bg-slate-50 rounded-[2rem] border-none font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-500/20 shadow-inner" />
                  </div>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                           <th className="px-10 py-8">Utilizador / Cargo</th>
                           <th className="px-10 py-8 text-center">Estado de Acesso</th>
                           <th className="px-10 py-8 text-right">Ação</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase())).map(user => (
                           <tr key={user.id} className="hover:bg-slate-50/50 transition-all group">
                              <td className="px-10 py-10">
                                 <div className="flex items-center gap-6">
                                    <div className="relative">
                                       <img src={user.avatar} className="w-16 h-16 rounded-[1.8rem] object-cover ring-4 ring-slate-100 transition-transform group-hover:scale-110 shadow-sm" alt="" />
                                       <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white shadow-sm"></div>
                                    </div>
                                    <div>
                                       <p className="text-lg font-black text-slate-900 leading-none mb-2">{user.name}</p>
                                       <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg uppercase tracking-wider">{user.role}</span>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-10 py-10 text-center">
                                 <div className="flex flex-wrap justify-center gap-2 max-w-xs mx-auto">
                                    {user.permissions?.length ? (
                                       <span className="text-[9px] font-black bg-emerald-500 text-white px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg shadow-emerald-500/20">Override Ativo ({user.permissions.length})</span>
                                    ) : (
                                       <span className="text-[9px] font-black bg-slate-100 text-slate-400 px-3 py-1 rounded-full uppercase tracking-tighter">Padrão do Cargo</span>
                                    )}
                                 </div>
                              </td>
                              <td className="px-10 py-10 text-right">
                                 <button onClick={() => setEditingUser({...user})} className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl transition-all group-hover:scale-105 active:scale-95">
                                    <UserCog size={22} />
                                 </button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {rolesLoading ? (
                  <div className="col-span-full py-24 flex justify-center"><Loader2 className="animate-spin text-indigo-600" size={48} /></div>
               ) : roles.filter(r => !r.is_deleted).map(role => (
                  <div key={role.id} className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl hover:shadow-2xl transition-all group" style={meshStyle}>
                     <div className="flex justify-between items-start mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-2xl flex items-center justify-center shadow-2xl transition-transform group-hover:rotate-12">
                           <Award size={32} />
                        </div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{role.permissions.length} Funcionalidades</span>
                     </div>
                     <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-8 group-hover:tracking-tight transition-all">{role.name}</h3>
                     <button onClick={() => setEditingRolePermissions({...role})} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3">
                        <Shield size={16} /> Editar Matriz Base
                     </button>
                  </div>
               ))}
            </div>
         )}
      </div>

      {/* MODAL: EDITOR DE MATRIZ (CARGO OU USER) */}
      {(editingUser || editingRolePermissions) && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-3xl animate-in fade-in duration-500">
            <div className="bg-white rounded-[5rem] w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl relative border-t-[20px] border-indigo-600 animate-in zoom-in-95 duration-500 overflow-hidden" style={meshStyle}>
               <button onClick={() => { setEditingUser(null); setEditingRolePermissions(null); }} className="absolute top-10 right-10 p-5 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-[2rem] transition-all hover:rotate-90 duration-500"><X size={28} /></button>
               
               <div className="p-16 border-b border-slate-100 flex flex-col md:flex-row md:items-center gap-10">
                  <div className="w-24 h-24 bg-slate-950 rounded-[3rem] flex items-center justify-center text-indigo-400 shadow-2xl border border-white/10">
                     {editingUser ? <img src={editingUser.avatar} className="w-full h-full rounded-[3rem] object-cover" /> : <Award size={48} />}
                  </div>
                  <div className="flex-1">
                     <h3 className="text-4xl md:text-5xl font-black tracking-tighter leading-none mb-3 uppercase italic">
                        {editingUser ? editingUser.name : `Matriz: ${editingRolePermissions?.name}`}
                     </h3>
                     <div className="flex flex-wrap items-center gap-4">
                        <p className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.4em] flex items-center gap-3"><Shield size={18} /> Configuração Granular</p>
                        {editingUser && (
                           <button onClick={resetToRoleDefault} className="text-[9px] font-black text-slate-400 hover:text-indigo-500 uppercase flex items-center gap-2 transition-colors">
                              <RotateCcw size={12} /> Sincronizar com Padrão {editingUser.role}
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
                           <h4 className="text-xs font-black uppercase tracking-[0.6em] text-slate-300">{category}</h4>
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
                                    className={`p-8 rounded-[3rem] border-2 text-left transition-all duration-500 group relative overflow-hidden ${isActive ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xl scale-[1.03]' : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-200'}`}
                                 >
                                    <div className="flex items-center justify-between mb-4">
                                       <div className={`p-3 rounded-2xl transition-all ${isActive ? 'bg-white/20' : 'bg-slate-50 text-indigo-500'}`}>{p.icon}</div>
                                       {isActive && <CheckCircle2 size={18} className="animate-in zoom-in" />}
                                    </div>
                                    <p className="text-sm font-black uppercase tracking-tight mb-2 group-hover:tracking-wider transition-all">{p.label}</p>
                                    <p className={`text-[10px] leading-relaxed italic ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>{p.description}</p>
                                 </button>
                              );
                           })}
                        </div>
                     </div>
                  ))}
               </div>

               <div className="p-16 bg-white border-t border-slate-100 flex gap-6">
                  <button onClick={editingUser ? handleUpdateUserPermissions : handleSaveRolePermissions} className="flex-1 py-7 bg-indigo-600 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-slate-950 transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50">
                     {saving ? <Loader2 className="animate-spin" size={24} /> : <><Save size={24} /> Sincronizar Identidade</>}
                  </button>
                  <button onClick={() => { setEditingUser(null); setEditingRolePermissions(null); }} className="px-14 py-7 bg-slate-100 text-slate-500 rounded-[2.5rem] font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Descartar</button>
               </div>
            </div>
         </div>
      )}

      {/* MODAL: AUDITORIA REFINADA COM FILTROS */}
      {showAuditModal && (
         <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-3xl animate-in fade-in duration-500">
            <div className="bg-white rounded-[5rem] w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl relative border-t-[20px] border-emerald-600 animate-in zoom-in-95 duration-500 overflow-hidden" style={meshStyle}>
               <button onClick={() => setShowAuditModal(false)} className="absolute top-10 right-10 p-5 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-[2rem] transition-all hover:rotate-90 duration-500"><X size={28} /></button>
               
               <div className="p-12 md:p-16 border-b border-slate-100">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10">
                    <div>
                      <h3 className="text-4xl font-black tracking-tighter leading-none mb-3 uppercase italic">Eventos de <span className="text-emerald-500">Segurança</span></h3>
                      <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-3"><History size={18} /> Histórico Integral Cloud</p>
                    </div>
                    <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl shadow-inner border border-slate-100">
                       <p className="text-[10px] font-black text-slate-400 uppercase ml-4">Ordem Temporal:</p>
                       <button 
                        onClick={() => setLogSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm ${logSortOrder === 'desc' ? 'bg-white text-emerald-600' : 'bg-emerald-600 text-white'}`}
                       >
                         {logSortOrder === 'desc' ? <><SortDesc size={14} /> Recentes Primeiro</> : <><SortAsc size={14} /> Antigos Primeiro</>}
                       </button>
                    </div>
                  </div>

                  {/* BARRA DE FILTROS AVANÇADA */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 p-6 rounded-[2.5rem] border border-slate-100">
                     <div className="relative group">
                        <UserCog className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                        <input 
                          value={logSearchAdmin} 
                          onChange={e => setLogSearchAdmin(e.target.value)}
                          placeholder="Filtro Admin..." 
                          className="w-full bg-white pl-14 pr-6 py-4 rounded-2xl font-bold text-xs outline-none border border-slate-200 focus:ring-4 focus:ring-emerald-50 transition-all shadow-sm"
                        />
                     </div>
                     <div className="relative group">
                        <Zap className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                        <input 
                          value={logSearchAction} 
                          onChange={e => setLogSearchAction(e.target.value)}
                          placeholder="Tipo de Ação..." 
                          className="w-full bg-white pl-14 pr-6 py-4 rounded-2xl font-bold text-xs outline-none border border-slate-200 focus:ring-4 focus:ring-emerald-50 transition-all shadow-sm"
                        />
                     </div>
                     <div className="relative group">
                        <Target className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                        <input 
                          value={logSearchTarget} 
                          onChange={e => setLogSearchTarget(e.target.value)}
                          placeholder="Utilizador Alvo..." 
                          className="w-full bg-white pl-14 pr-6 py-4 rounded-2xl font-bold text-xs outline-none border border-slate-200 focus:ring-4 focus:ring-emerald-50 transition-all shadow-sm"
                        />
                     </div>
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto p-12 md:p-16 space-y-8 custom-scrollbar">
                  {loadingLogs ? (
                     <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="animate-spin text-emerald-500" size={48} />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Sincronizando Registos Cloud...</p>
                     </div>
                  ) : filteredAndSortedLogs.length > 0 ? filteredAndSortedLogs.map((log) => (
                     <div key={log.id} className="p-10 bg-slate-50 rounded-[3.5rem] border border-slate-100 hover:bg-white transition-all group shadow-sm hover:shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500 opacity-[0.02] rounded-full translate-x-1/2 -translate-y-1/2"></div>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                           <div className="flex items-center gap-4">
                              <div className="px-5 py-2 bg-emerald-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">{log.action_type}</div>
                              <p className="text-sm font-bold">
                                 <span className="text-slate-400 font-medium">Admin:</span> {log.admin_name} 
                                 <ArrowRight size={14} className="inline mx-2 text-slate-300" />
                                 <span className="text-indigo-600">{log.target_user_name}</span>
                              </p>
                           </div>
                           <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-5 py-2 rounded-full border border-slate-100 shadow-sm">
                              <Calendar size={12} className="text-emerald-500" /> {new Date(log.created_at).toLocaleString('pt-MZ')}
                           </div>
                        </div>
                        <div className="pl-6 border-l-4 border-emerald-500/20 py-2">
                           <div className="flex items-start gap-4 bg-black/5 p-6 rounded-[2rem] border border-black/5">
                              {/* Fix: Added FileText to lucide-react imports */}
                              <FileText size={18} className="text-slate-400 shrink-0 mt-1" />
                              <p className="text-xs font-medium text-slate-600 font-mono leading-relaxed">{log.change_details}</p>
                           </div>
                        </div>
                     </div>
                  )) : (
                    <div className="py-24 text-center space-y-6">
                       <Filter size={48} className="mx-auto text-slate-200" />
                       <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">Nenhum registo corresponde aos filtros aplicados.</p>
                       <button onClick={() => { setLogSearchAdmin(''); setLogSearchAction(''); setLogSearchTarget(''); }} className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all shadow-sm">Limpar Filtros</button>
                    </div>
                  )}
               </div>

               <div className="p-12 bg-white border-t border-slate-50 flex justify-between items-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Exibindo {filteredAndSortedLogs.length} de {auditLogs.length} registos em cache.</p>
                  <button onClick={() => setShowAuditModal(false)} className="px-14 py-6 bg-slate-900 text-white rounded-[2.5rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all active:scale-95 shadow-2xl">Fechar Terminal</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default AdminView;
