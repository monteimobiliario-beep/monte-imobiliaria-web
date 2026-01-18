
import React from 'react';
import { MOCK_EMPLOYEES } from '../constants';
import { Mail, Phone, MapPin, MoreHorizontal, UserPlus } from 'lucide-react';

const HRView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Recursos Humanos</h1>
          <p className="text-slate-500">Gerencie sua equipe, salários e desempenho.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
          <UserPlus size={20} />
          Novo Funcionário
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {MOCK_EMPLOYEES.map((emp) => (
          <div key={emp.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <img src={emp.avatar} alt={emp.name} className="w-16 h-16 rounded-2xl object-cover ring-4 ring-slate-50" />
                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                  <MoreHorizontal size={20} />
                </button>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{emp.name}</h3>
                <p className="text-sm text-blue-600 font-medium mb-4">{emp.role}</p>
                <div className="flex items-center gap-2 mb-6">
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    emp.status === 'Ativo' ? 'bg-green-100 text-green-700' : 
                    emp.status === 'Férias' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {emp.status}
                  </span>
                  <span className="text-xs text-slate-400">• {emp.department}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Mail size={14} /> <span>{emp.name.toLowerCase().split(' ')[0]}@empresa.com</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Phone size={14} /> <span>(11) 98765-4321</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              <p className="text-xs text-slate-500 font-medium">Salário</p>
              <p className="text-sm font-bold text-slate-900">R$ {emp.salary.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HRView;
