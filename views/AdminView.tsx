
import React from 'react';
import { UserRole } from '../types';
import { Shield, Key, History, Activity } from 'lucide-react';

const AdminView: React.FC = () => {
  const logs = [
    { user: 'Admin', action: 'Alteração de Permissões', target: 'Ana Silva', time: '10 min atrás' },
    { user: 'Admin', action: 'Configuração do Sistema', target: 'Backup Automático', time: '2 horas atrás' },
    { user: 'Financeiro', action: 'Exportação de Dados', target: 'Relatório Outubro', time: '4 horas atrás' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Configurações do Sistema</h1>
          <p className="text-slate-500">Controle de acessos, auditoria e backups.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield size={20} className="text-blue-600" />
              <h3 className="font-bold">Gerenciamento de Perfis</h3>
            </div>
            <div className="space-y-3">
              {Object.values(UserRole).map((role) => (
                <div key={role} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Key size={18} className="text-slate-400" />
                    <span className="font-medium text-slate-700">{role}</span>
                  </div>
                  <button className="text-xs font-bold text-blue-600 hover:text-blue-700">Editar Permissões</button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <History size={20} className="text-blue-600" />
              <h3 className="font-bold">Histórico de Atividades (Auditoria)</h3>
            </div>
            <div className="space-y-4">
              {logs.map((log, i) => (
                <div key={i} className="flex items-center justify-between text-sm border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-blue-50 rounded flex items-center justify-center text-blue-600 shrink-0">
                      <Activity size={14} />
                    </div>
                    <div>
                      <p className="text-slate-900 font-semibold">{log.action}</p>
                      <p className="text-xs text-slate-500">Por <span className="font-medium">{log.user}</span> em {log.target}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <h3 className="font-bold mb-4">Segurança & Backup</h3>
              <div className="space-y-4">
                <div className="p-4 border border-green-100 bg-green-50 rounded-xl">
                  <p className="text-xs font-bold text-green-700 uppercase mb-1">Backup Automático</p>
                  <p className="text-sm text-green-800">Próximo: Hoje, 23:59</p>
                </div>
                <button className="w-full py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors">Realizar Backup Agora</button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminView;
