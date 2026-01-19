
import React from 'react';
import { MOCK_PLANS } from '../constants';
import { Target, Flag, CheckCircle2, ChevronRight, TrendingUp } from 'lucide-react';

const PlansView: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Plano Estratégico</h1>
          <p className="text-slate-500 font-medium">Metas corporativas e indicadores chave de desempenho (KPIs).</p>
        </div>
        <button className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl hover:bg-blue-600 transition-all">Definir Nova Meta</button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="flex items-center gap-4 mb-12 relative z-10">
          <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-500/30">
            <Target size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">Objetivos Anuais 2024</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Acompanhamento de Resultados</p>
          </div>
        </div>

        <div className="space-y-16 relative z-10">
          {MOCK_PLANS.map((plan) => (
            <div key={plan.id} className="relative group">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-indigo-50 rounded-[1.5rem] flex items-center justify-center text-indigo-600 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                    <Flag size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 mb-1">{plan.goal}</h3>
                    <div className="flex items-center gap-3">
                      <p className="text-xs font-bold text-slate-400">KPI: <span className="text-indigo-600 uppercase">{plan.kpi}</span></p>
                      <span className="text-slate-200">•</span>
                      <p className="text-xs font-bold text-slate-400">RESPONSÁVEL: <span className="text-slate-900 uppercase">{plan.responsible}</span></p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-black text-slate-900 tracking-tighter">{plan.progress}%</p>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Prazo: {plan.deadline}</p>
                </div>
              </div>

              <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-blue-600 transition-all duration-1000 shadow-[0_0_20px_rgba(79,70,229,0.3)]" 
                  style={{width: `${plan.progress}%`}}
                ></div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
                {[
                  { label: 'Status', value: 'Em dia', icon: <CheckCircle2 size={14} className="text-green-500" /> },
                  { label: 'Prioridade', value: 'Crítica', icon: null },
                  { label: 'Variação', value: '+4.2%', icon: <TrendingUp size={14} className="text-green-500" /> },
                  { label: 'Custo Est.', value: '12.500 MT', icon: null },
                ].map((item, i) => (
                  <div key={i} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="text-sm font-black text-slate-900 flex items-center gap-2">{item.icon}{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlansView;
