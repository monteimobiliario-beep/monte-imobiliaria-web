import React from 'react';
import { Shield, Fingerprint, History, RefreshCw } from 'lucide-react';

interface AdminHeaderProps {
  loading: boolean;
  onAuditClick: () => void;
  onRefresh: () => void;
  meshStyle: React.CSSProperties;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ loading, onAuditClick, onRefresh, meshStyle }) => (
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
      <button onClick={onAuditClick} className="market-button market-button-outline px-8 py-4 text-[10px] uppercase tracking-widest flex items-center justify-center gap-3">
        <History size={16} /> Auditoria
      </button>
      <button onClick={onRefresh} className="market-button market-button-primary p-4 shadow-xl">
        <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
      </button>
    </div>
  </div>
);
