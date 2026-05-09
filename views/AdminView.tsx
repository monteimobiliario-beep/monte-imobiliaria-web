import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, Edit, Plus, Wrench, Wallet, Truck, 
  Target, Zap, LayoutDashboard, LayoutTemplate, 
  Users as UsersIcon, UserCog, Settings2, Database,
  ArrowUpDown, UserCheck, Award, Palette
} from 'lucide-react';
import { db } from '../supabaseClient';
import { Employee, User } from '../types';
import { useBranding } from '../BrandingContext';

// Import Modular Components
import { AdminHeader } from '../components/admin/AdminHeader';
import { AdminUsersTab } from '../components/admin/AdminUsersTab';
import { AdminRolesTab } from '../components/admin/AdminRolesTab';
import { AdminSettingsTab } from '../components/admin/AdminSettingsTab';
import { AdminHealthTab } from '../components/admin/AdminHealthTab';
import { AdminAuditModal } from '../components/admin/AdminAuditModal';
import { AdminPermissionModal } from '../components/admin/AdminPermissionModal';

const GRANULAR_PERMISSIONS: any[] = [
  { id: 'dashboard.view', label: 'Ver Dashboard', category: 'Geral', description: 'Acesso à vista principal.', icon: <LayoutDashboard size={14} /> },
  { id: 'catalog.view', label: 'Consultar Catálogo', category: 'Geral', description: 'Visualizar imóveis.', icon: <LayoutTemplate size={14} /> },
  { id: 'catalog.manage', label: 'Gerir Catálogo', category: 'Negócio', description: 'Adicionar imóveis.', icon: <Edit size={14} /> },
  { id: 'finance.view', label: 'Ver Financeiro', category: 'Negócio', description: 'Consultar balanços.', icon: <Wallet size={14} /> },
  { id: 'hr.view', label: 'Ver RH', category: 'Recursos', description: 'Visualizar staff.', icon: <UsersIcon size={14} /> },
  { id: 'hr.manage', label: 'Gerir RH', category: 'Recursos', description: 'Contratar staff.', icon: <UserCog size={14} /> },
  { id: 'admin.access', label: 'Administração TI', category: 'Sistema', description: 'Gestão cloud.', icon: <Shield size={14} /> },
];

const AdminView: React.FC<{ currentUser: User | null }> = ({ currentUser }) => {
  const [users, setUsers] = useState<Employee[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<Employee | null>(null);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [showAudit, setShowAudit] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'settings' | 'health'>('users');
  const [dbHealth, setDbHealth] = useState<any[]>([]);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [logFilters, setLogFilters] = useState({ admin: '', target: '', action: '' });
  const [logSort, setLogSort] = useState<'desc' | 'asc'>('desc');

  const { settings, updateSettings } = useBranding();
  const [tempSettings, setTempSettings] = useState(settings);
  const [isBrandingSaving, setIsBrandingSaving] = useState(false);

  const meshStyle = { backgroundImage: `radial-gradient(rgba(0,0,0,0.03) 1px, transparent 1px)`, backgroundSize: '24px 24px' };

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    setLoading(true);
    try {
      const { data: userData } = await db.hr('employees').select('*').order('name');
      const { data: roleData } = await db.core('roles').select('*').order('name');
      setUsers(userData || []);
      setRoles(roleData || []);
    } catch (e) {} finally { setLoading(false); }
  }

  async function logAction(action: string, target: string, details: string) {
    if (!currentUser) return;
    try {
      await db.core('audit_logs').insert([{
        admin_id: currentUser.id,
        admin_name: currentUser.name,
        target_user_name: target,
        action_type: action,
        change_details: details
      }]);
    } catch (e) {}
  }

  async function checkHealth() {
    setIsCheckingHealth(true);
    const tables = [{ n: 'properties', s: 'catalog' }, { n: 'employees', s: 'hr' }, { n: 'transactions', s: 'finance' }];
    const results = await Promise.all(tables.map(async t => {
      // @ts-ignore
      const { count, error } = await db[t.s](t.n).select('*', { count: 'exact', head: true });
      return { table: t.n, status: error ? 'error' : 'ok', count: count || 0 };
    }));
    setDbHealth(results as any);
    setIsCheckingHealth(false);
    logAction('HEALTH_CHECK', 'Sistema', 'Verificação concluída');
  }

  const handleSavePerms = async () => {
    setSaving(true);
    const target = editingUser || editingRole;
    const table = editingUser ? db.hr('employees') : db.core('roles');
    await table.update({ permissions: target.permissions }).eq('id', target.id);
    logAction('PERM_SYNC', target.name || 'Role', 'Permissões atualizadas');
    setSaving(false);
    setEditingUser(null);
    setEditingRole(null);
    fetchInitialData();
  };

  const groupedPermissions = useMemo(() => {
    return GRANULAR_PERMISSIONS.reduce((acc, curr) => {
      if (!acc[curr.category]) acc[curr.category] = [];
      acc[curr.category].push(curr);
      return acc;
    }, {} as any);
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 max-w-[1600px] mx-auto">
      <AdminHeader loading={loading} meshStyle={meshStyle} onAuditClick={() => setShowAudit(true)} onRefresh={fetchInitialData} />

      <div className="flex p-2 bg-white rounded-[2.5rem] border border-slate-100 w-full max-w-2xl mx-auto shadow-xl">
         {['users', 'roles', 'settings', 'health'].map((tab: any) => (
           <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-4 rounded-[2rem] text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-market-blue text-white shadow-lg' : 'text-market-slate'}`}>
             {tab === 'users' && <UserCheck size={16} className="inline mr-2" />}
             {tab === 'roles' && <Award size={16} className="inline mr-2" />}
             {tab === 'settings' && <Palette size={16} className="inline mr-2" />}
             {tab === 'health' && <Database size={16} className="inline mr-2" />}
             {tab}
           </button>
         ))}
      </div>

      {activeTab === 'users' && <AdminUsersTab users={users} searchTerm={searchTerm} setSearchTerm={setSearchTerm} onEditUser={setEditingUser} meshStyle={meshStyle} />}
      {activeTab === 'roles' && <AdminRolesTab roles={roles} rolesLoading={loading} onEditRole={setEditingRole} meshStyle={meshStyle} />}
      {activeTab === 'settings' && <AdminSettingsTab tempSettings={tempSettings} setTempSettings={setTempSettings} isBrandingSaving={isBrandingSaving} handleSaveBranding={() => updateSettings(tempSettings)} meshStyle={meshStyle} />}
      {activeTab === 'health' && <AdminHealthTab dbHealth={dbHealth} isCheckingHealth={isCheckingHealth} checkSystemHealth={checkHealth} meshStyle={meshStyle} />}

      <AdminAuditModal show={showAudit} onClose={() => setShowAudit(false)} loading={loadingLogs} logs={auditLogs} filters={logFilters} setFilters={setLogFilters} sortOrder={logSort} setSortOrder={setLogSort} meshStyle={meshStyle} />
      
      <AdminPermissionModal 
        editingUser={editingUser} 
        editingRole={editingRole} 
        onClose={() => { setEditingUser(null); setEditingRole(null); }}
        onSave={handleSavePerms}
        saving={saving}
        onTogglePermission={(id) => {
          const target = editingUser || editingRole;
          const next = target.permissions.includes(id) ? target.permissions.filter((p: any) => p !== id) : [...target.permissions, id];
          editingUser ? setEditingUser({...editingUser, permissions: next}) : setEditingRole({...editingRole, permissions: next});
        }}
        onResetToDefault={() => {}}
        groupedPermissions={groupedPermissions}
        meshStyle={meshStyle}
      />
    </div>
  );
};

export default AdminView;
