
import React from 'react';
import { MOCK_PROJECTS } from '../constants';
import { Calendar, Users, DollarSign, ArrowRight, CheckCircle2, Clock } from 'lucide-react';

const ProjectsView: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestão de Projetos</h1>
          <p className="text-slate-500 font-medium">Acompanhe cronogramas, orçamentos e equipes de campo.</p>
        </div>
        <div className="flex gap-3">
           <button className="px-6 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">Visualizar Kanban</button>
           <button className="px-6 py-2.5 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20">Novo Projeto</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {MOCK_PROJECTS.map((project) => {
          const progress = (project.spent / project.budget) * 100;
          return (
            <div key={project.id} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm flex flex-col hover:shadow-xl transition-all group">
              <div className="flex justify-between items-start mb-6">
                <span className={`text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full ${
                  project.status === 'Em Andamento' ? 'bg-blue-50 text-blue-600' :
                  project.status === 'Concluído' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-600'
                }`}>
                  {project.status}
                </span>
                <button className="p-2 text-slate-300 hover:text-blue-600 rounded-xl transition-colors">
                  <ArrowRight size={20} />
                </button>
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight">{project.name}</h3>
              <p className="text-xs text-slate-500 mb-8 font-medium">Projeto estratégico focado em manutenção de infraestrutura e expansão de catálogo na Beira.</p>

              <div className="space-y-4 mb-8 flex-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest"><Clock size={14} /> Deadline</div>
                  <div className="font-black text-slate-900">{project.deadline}</div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest"><Users size={14} /> Equipa</div>
                  <div className="flex -space-x-2">
                    {project.team.map((name) => (
                      <div key={name} className="w-8 h-8 rounded-xl border-2 border-white bg-blue-100 text-blue-600 flex items-center justify-center text-[9px] font-black" title={name}>
                        {name[0]}
                      </div>
                    ))}
                    <div className="w-8 h-8 rounded-xl border-2 border-white bg-slate-100 text-slate-400 flex items-center justify-center text-[9px] font-black">+</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest"><DollarSign size={14} /> Orçamento</div>
                  <div className="font-black text-slate-900">{project.budget.toLocaleString()} MT</div>
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t border-slate-50">
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span>Execução Orçamentária</span>
                  <span className={progress > 90 ? 'text-red-600' : 'text-blue-600'}>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${progress > 90 ? 'bg-red-500' : 'bg-blue-600'}`} 
                    style={{width: `${Math.min(progress, 100)}%`}}
                  ></div>
                </div>
                <p className="text-[10px] text-slate-400 font-bold">Investido até agora: <span className="text-slate-900">{project.spent.toLocaleString()} MT</span></p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectsView;
