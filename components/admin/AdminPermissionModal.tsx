import React from 'react';
import { X, Award, Shield, RotateCcw, CheckCircle2, Loader2, Save } from 'lucide-react';

interface PermissionDefinition {
  id: string;
  label: string;
  category: string;
  description: string;
  icon: React.ReactNode;
}

interface AdminPermissionModalProps {
  editingUser: any;
  editingRole: any;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
  onTogglePermission: (id: string) => void;
  onResetToDefault: () => void;
  groupedPermissions: Record<string, PermissionDefinition[]>;
  meshStyle: React.CSSProperties;
}

export const AdminPermissionModal: React.FC<AdminPermissionModalProps> = ({ 
  editingUser, editingRole, onClose, onSave, saving, onTogglePermission, onResetToDefault, groupedPermissions, meshStyle 
}) => {
  if (!editingUser && !editingRole) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-market-navy/90 backdrop-blur-3xl animate-in fade-in duration-500">
      <div className="bg-white rounded-[4rem] w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl relative border-t-[20px] border-market-blue animate-in zoom-in-95 duration-500 overflow-hidden" style={meshStyle}>
        <button onClick={onClose} className="absolute top-10 right-10 p-5 bg-slate-50 text-slate-400 hover:text-market-navy rounded-[2rem] border border-slate-100"><X size={28} /></button>
        
        <div className="p-16 border-b border-slate-100 flex flex-col md:flex-row md:items-center gap-10">
          <div className="w-24 h-24 bg-market-navy rounded-[2.5rem] flex items-center justify-center text-market-blue overflow-hidden">
            {editingUser ? <img src={editingUser.avatar || undefined} className="w-full h-full object-cover" /> : <Award size={48} />}
          </div>
          <div className="flex-1">
            <h3 className="text-4xl font-bold tracking-tight text-market-navy">
              {editingUser ? editingUser.name : `Matriz: ${editingRole?.name}`}
            </h3>
            <div className="flex flex-wrap items-center gap-6 mt-2">
              <p className="text-[11px] font-bold text-market-blue uppercase tracking-[0.4em] flex items-center gap-3"><Shield size={18} /> Configuração Granular</p>
              {editingUser && (
                <button onClick={onResetToDefault} className="text-[10px] font-bold text-market-slate hover:text-market-blue uppercase flex items-center gap-2 transition-colors">
                  <RotateCcw size={14} /> Sincronizar com Padrão {editingUser.role}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-16 space-y-20 custom-scrollbar">
          {Object.entries(groupedPermissions).map(([category, perms]) => (
            <div key={category} className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="h-px flex-1 bg-slate-100"></div>
                <h4 className="text-xs font-bold uppercase tracking-[0.6em] text-market-slate">{category}</h4>
                <div className="h-px flex-1 bg-slate-100"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(perms as PermissionDefinition[]).map(p => {
                  const isActive = editingUser 
                    ? editingUser.permissions?.includes(p.id)
                    : editingRole?.permissions?.includes(p.id);
                  
                  return (
                    <button 
                      key={p.id} 
                      onClick={() => onTogglePermission(p.id)}
                      className={`p-8 rounded-[2.5rem] border-2 text-left transition-all duration-500 group relative overflow-hidden ${isActive ? 'bg-market-blue border-market-blue text-white shadow-2xl scale-[1.03]' : 'bg-white border-slate-100 text-market-navy hover:border-market-blue/30'}`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-2xl ${isActive ? 'bg-white/20' : 'bg-slate-50 text-market-blue'}`}>{p.icon}</div>
                        {isActive && <CheckCircle2 size={18} className="animate-in zoom-in" />}
                      </div>
                      <p className="text-sm font-bold uppercase tracking-tight mb-2">{p.label}</p>
                      <p className={`text-[11px] leading-relaxed ${isActive ? 'text-white/80' : 'text-market-slate'}`}>{p.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="p-16 bg-white border-t border-slate-100 flex gap-6">
          <button onClick={onSave} className="market-button market-button-primary flex-1 py-7 text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4">
            {saving ? <Loader2 className="animate-spin" size={24} /> : <><Save size={24} /> Sincronizar Identidade</>}
          </button>
          <button onClick={onClose} className="market-button market-button-outline px-14 py-7 text-xs uppercase tracking-widest">Descartar</button>
        </div>
      </div>
    </div>
  );
};
