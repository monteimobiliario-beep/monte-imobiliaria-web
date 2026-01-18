
import React from 'react';
import { MOCK_PLANS } from '../constants';
import { Target, Flag, CheckCircle2 } from 'lucide-react';

const PlansView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Plano Estratégico</h1>
          <p className="text-slate-500">Metas corporativas e indicadores chave (KPIs).</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">Definir Nova Meta</button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <Target size={24} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Objetivos Anuais 2024</h2>
        </div>

        <div className="space-y-12">
          {MOCK_PLANS.map((plan) => (
            <div key={plan.id} className="relative">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                    <Flag size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{plan.goal}</h3>
                    <p className="text-sm text-slate-500">Métrica: <span className="text-indigo-600 font-semibold">{plan.kpi}</span> • Responsável: {plan.responsible}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-slate-900">{plan.progress}%</p>
                  <p className="text-xs text-slate-500">Prazo: {plan.deadline}</p>
                </div>
              </div>

              <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-1000" 
                  style={{width: `${plan.progress}%`}}
                ></div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Status</p>
                  <p className="text-sm font-bold text-slate-700 flex items-center gap-1"><CheckCircle2 size={14} className="text-green-500" /> Em dia</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Nível Prioridade</p>
                  <p className="text-sm font-bold text-slate-700">Crítica</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Variação Mensal</p>
                  <p className="text-sm font-bold text-green-600">+4.2%</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Custo Estimado</p>
                  <p className="text-sm font-bold text-slate-700">R$ 12k/mês</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlansView;
