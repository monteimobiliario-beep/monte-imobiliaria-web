
import React from 'react';
import { MOCK_PROJECTS } from '../constants';
import { Calendar, Users, DollarSign, ArrowRight } from 'lucide-react';

const ProjectsView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestão de Projetos</h1>
          <p className="text-slate-500">Acompanhe cronogramas, orçamentos e equipes.</p>
        </div>
        <div className="flex gap-2">
           <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50">Visualizar em Kanban</button>
           <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">Novo Projeto</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {MOCK_PROJECTS.map((project) => {
          const progress = (project.spent / project.budget) * 100;
          return (
            <div key={project.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  project.status === 'Em Andamento' ? 'bg-blue-100 text-blue-700' :
                  project.status === 'Concluído' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {project.status}
                </span>
                <button className="text-slate-400 hover:text-blue-600 transition-colors">
                  <ArrowRight size={20} />
                </button>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2">{project.name}</h3>
              <p className="text-sm text-slate-500 mb-6">Projeto estratégico focado em melhorias de infraestrutura e performance.</p>

              <div className="space-y-4 mb-8 flex-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-500"><Calendar size={16} /> Deadline</div>
                  <div className="font-semibold text-slate-900">{project.deadline}</div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-500"><Users size={16} /> Equipe</div>
                  <div className="flex -space-x-2">
                    {project.team.map((name) => (
                      <div key={name} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold" title={name}>
                        {name[0]}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-500"><DollarSign size={16} /> Orçamento</div>
                  <div className="font-semibold text-slate-900">R$ {project.budget.toLocaleString()}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                  <span>Execução Orçamentária</span>
                  <span className={progress > 90 ? 'text-red-600' : 'text-blue-600'}>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${progress > 90 ? 'bg-red-500' : 'bg-blue-500'}`} 
                    style={{width: `${Math.min(progress, 100)}%`}}
                  ></div>
                </div>
                <p className="text-[10px] text-slate-400">Investido: R$ {project.spent.toLocaleString()}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectsView;
