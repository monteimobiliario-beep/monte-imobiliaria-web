import React from 'react';
import { X, History, SortDesc, SortAsc, UserCog, Zap, Target, Loader2, ArrowRight, Calendar, FileText, Filter } from 'lucide-react';

interface AuditLog {
  id: string;
  admin_name: string;
  target_user_name: string;
  action_type: string;
  change_details: string;
  created_at: string;
}

interface AdminAuditModalProps {
  show: boolean;
  onClose: () => void;
  loading: boolean;
  logs: AuditLog[];
  filters: { admin: string, target: string, action: string };
  setFilters: (filters: any) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  meshStyle: React.CSSProperties;
}

export const AdminAuditModal: React.FC<AdminAuditModalProps> = ({ show, onClose, loading, logs, filters, setFilters, sortOrder, setSortOrder, meshStyle }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-market-navy/95 backdrop-blur-3xl animate-in fade-in duration-500">
      <div className="bg-white rounded-[4rem] w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl relative border-t-[20px] border-market-accent animate-in zoom-in-95 duration-500 overflow-hidden" style={meshStyle}>
        <button onClick={onClose} className="absolute top-10 right-10 p-5 bg-slate-50 text-slate-400 hover:text-market-navy rounded-[2rem] transition-all hover:rotate-90 duration-500 border border-slate-100"><X size={28} /></button>
        
        <div className="p-12 md:p-16 border-b border-slate-100">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10">
            <div>
              <h3 className="text-4xl font-bold tracking-tight leading-none mb-3 text-market-navy">Eventos de <span className="text-market-accent">Segurança</span></h3>
              <p className="text-[12px] font-bold text-market-slate uppercase tracking-[0.4em] flex items-center gap-3"><History size={18} /> Histórico Integral Cloud</p>
            </div>
            <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl shadow-inner border border-slate-100">
              <p className="text-[10px] font-bold text-market-slate uppercase ml-4">Ordem:</p>
              <button onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase transition-all shadow-sm ${sortOrder === 'desc' ? 'bg-white text-market-accent border border-slate-100' : 'bg-market-accent text-white'}`}>
                {sortOrder === 'desc' ? <><SortDesc size={14} /> Recentes</> : <><SortAsc size={14} /> Antigos</>}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 p-6 rounded-[2.5rem] border border-slate-100">
            <div className="relative group">
              <UserCog className="absolute left-5 top-1/2 -translate-y-1/2 text-market-slate group-focus-within:text-market-accent transition-colors" size={18} />
              <input value={filters.admin} onChange={e => setFilters({...filters, admin: e.target.value})} placeholder="Filtro Admin..." className="w-full bg-white pl-14 pr-6 py-4 rounded-2xl font-medium text-xs outline-none border border-slate-200 focus:ring-4 focus:ring-market-accent/10 focus:border-market-accent transition-all shadow-sm" />
            </div>
            <div className="relative group">
              <Zap className="absolute left-5 top-1/2 -translate-y-1/2 text-market-slate group-focus-within:text-market-accent transition-colors" size={18} />
              <input value={filters.action} onChange={e => setFilters({...filters, action: e.target.value})} placeholder="Tipo de Ação..." className="w-full bg-white pl-14 pr-6 py-4 rounded-2xl font-medium text-xs outline-none border border-slate-200 focus:ring-4 focus:ring-market-accent/10 focus:border-market-accent transition-all shadow-sm" />
            </div>
            <div className="relative group">
              <Target className="absolute left-5 top-1/2 -translate-y-1/2 text-market-slate group-focus-within:text-market-accent transition-colors" size={18} />
              <input value={filters.target} onChange={e => setFilters({...filters, target: e.target.value})} placeholder="Alvo..." className="w-full bg-white pl-14 pr-6 py-4 rounded-2xl font-medium text-xs outline-none border border-slate-200 focus:ring-4 focus:ring-market-accent/10 focus:border-market-accent transition-all shadow-sm" />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-12 md:p-16 space-y-8 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="animate-spin text-market-accent" size={48} />
            </div>
          ) : logs.length > 0 ? logs.map((log) => (
            <div key={log.id} className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100 hover:bg-white transition-all group shadow-sm hover:shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="px-5 py-2 bg-market-accent text-white rounded-full text-[9px] font-bold uppercase tracking-widest">{log.action_type}</div>
                  <p className="text-sm font-bold text-market-navy">
                    {log.admin_name} <ArrowRight size={14} className="inline mx-2" /> {log.target_user_name}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-bold text-market-slate uppercase bg-white px-5 py-2 rounded-full border border-slate-100">
                  <Calendar size={12} /> {new Date(log.created_at).toLocaleString('pt-MZ')}
                </div>
              </div>
              <div className="pl-6 border-l-4 border-market-accent/20 py-2">
                <div className="flex items-start gap-4 bg-black/5 p-6 rounded-2xl">
                  <FileText size={18} className="text-market-slate mt-1" />
                  <p className="text-xs font-medium text-market-navy font-mono">{log.change_details}</p>
                </div>
              </div>
            </div>
          )) : (
            <div className="py-24 text-center space-y-8">
              <Filter size={48} className="mx-auto text-slate-200" />
              <p className="text-market-slate font-bold uppercase tracking-widest text-[11px]">Nenhum registo encontrado.</p>
            </div>
          )}
        </div>
        <div className="p-12 bg-white border-t border-slate-100 flex justify-end">
          <button onClick={onClose} className="market-button market-button-primary px-14 py-6 text-[11px] uppercase tracking-widest">Fechar Terminal</button>
        </div>
      </div>
    </div>
  );
};
