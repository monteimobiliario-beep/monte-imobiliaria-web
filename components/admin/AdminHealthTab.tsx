import React from 'react';
import { Database, RefreshCw, RotateCcw, History, Wrench } from 'lucide-react';

interface AdminHealthTabProps {
  dbHealth: {table: string, status: 'ok' | 'error', count: number}[];
  isCheckingHealth: boolean;
  checkSystemHealth: () => void;
  meshStyle: React.CSSProperties;
}

export const AdminHealthTab: React.FC<AdminHealthTabProps> = ({ dbHealth, isCheckingHealth, checkSystemHealth, meshStyle }) => (
  <div className="max-w-4xl mx-auto space-y-8 animate-in zoom-in-95 duration-500">
    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl p-10 md:p-14" style={meshStyle}>
      <div className="flex items-center justify-between mb-10">
        <div>
          <h3 className="text-3xl font-bold text-market-navy tracking-tight uppercase">Integridade <span className="text-market-blue">Cloud</span></h3>
          <p className="text-[10px] font-bold text-market-slate uppercase tracking-widest mt-1">Status da Camada de Persistência Supabase</p>
        </div>
        <button 
          onClick={checkSystemHealth} 
          disabled={isCheckingHealth}
          className="p-4 bg-slate-50 text-market-blue rounded-2xl hover:bg-market-blue hover:text-white transition-all shadow-sm border border-slate-100"
        >
          <RefreshCw size={24} className={isCheckingHealth ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dbHealth.map((h, i) => (
          <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-xl transition-all">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${h.status === 'ok' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                <Database size={20} />
              </div>
              <div>
                <p className="text-xs font-black text-market-navy uppercase tracking-tight">{h.table}</p>
                <p className="text-[9px] font-bold text-market-slate uppercase">{h.count} Registos</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${h.status === 'ok' ? 'bg-emerald-500 text-white shadow-[0_0_8px_#10b981]' : 'bg-rose-500 text-white shadow-[0_0_8px_#f43f5e]'}`}>
                {h.status === 'ok' ? 'Online' : 'Falha'}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 p-8 bg-market-navy rounded-[2.5rem] border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-market-blue opacity-10 rounded-full translate-x-1/2 -translate-y-1/2"></div>
        <div className="flex items-start gap-4 mb-6">
          <Wrench className="text-market-blue" size={24} />
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-widest">Ferramentas de Reparação</h4>
            <p className="text-white/30 text-[10px] mt-1 italic">Utilize estas opções caso detete inconsistências no sistema.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="bg-white/5 hover:bg-white/10 text-white/60 hover:text-white p-4 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-white/5 transition-all text-left flex items-center justify-between group">
            Sincronizar Esquema SQL <RotateCcw size={14} className="group-hover:rotate-180 transition-transform" />
          </button>
          <button className="bg-white/5 hover:bg-white/10 text-white/60 hover:text-white p-4 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-white/5 transition-all text-left flex items-center justify-between group">
            Limpar Cache de Auditoria <History size={14} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  </div>
);
