import React from 'react';
import { Award, Shield, Loader2 } from 'lucide-react';

interface RoleRecord {
  id: string;
  name: string;
  is_deleted: boolean;
  permissions: string[];
}

interface AdminRolesTabProps {
  roles: RoleRecord[];
  rolesLoading: boolean;
  onEditRole: (role: RoleRecord) => void;
  meshStyle: React.CSSProperties;
}

export const AdminRolesTab: React.FC<AdminRolesTabProps> = ({ roles, rolesLoading, onEditRole, meshStyle }) => (
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
        <button onClick={() => onEditRole({...role})} className="market-button market-button-primary w-full py-5 text-[10px] uppercase tracking-widest flex items-center justify-center gap-3">
          <Shield size={16} /> Editar Matriz Base
        </button>
      </div>
    ))}
  </div>
);
