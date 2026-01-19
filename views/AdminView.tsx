
import React from 'react';
import { UserRole } from '../types';
import { Shield, Key, History, Activity, Cpu, Server, Database, Globe, Lock, Settings } from 'lucide-react';

const AdminView: React.FC = () => {
  const logs = [
    { user: 'Admin', action: 'Permissões Alteradas', target: 'Gestor Financeiro', time: '5 min atrás', status: 'Sucesso' },
    { user: 'System', action: 'Backup Concluído', target: 'Cloud Storage', time: '1 hora atrás', status: 'Sucesso' },
    { user: 'Security', action: 'Tentativa de Acesso', target: 'IP: 197.234.xx', time: '3 horas atrás', status: 'Bloqueado' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Centro de Controle TI</h1>
          <p className="text-slate-500 font-medium">Monitorização em tempo real e segurança do sistema Monte & Chaisa.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Todos os Sistemas Operacionais
        </div>
      </div>

      {/* System Health Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'CPU Usage', value: '14%', icon: <Cpu size={20} />, color: 'blue' },
          { label: 'Database', value: '4.2GB', icon: <Database size={20} />, color: 'indigo' },
          { label: 'API Uptime', value: '99.9%', icon: <Globe size={20} />, color: 'green' },
          { label: 'Server Latency', value: '42ms', icon: <Server size={20} />, color: 'purple' },
        ].map((tile, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className={`p-2.5 bg-${tile.color}-50 text-${tile.color}-600 rounded-xl w-fit mb-4`}>
              {tile.icon}
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{tile.label}</p>
              <p className="text-xl font-black text-slate-900">{tile.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* User Roles & Permissions */}
        <div className="xl:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                  <Lock size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Perfis & Permissões</h3>
                  <p className="text-sm font-medium text-slate-400">Controlo de acessos granulares.</p>
                </div>
              </div>
              <button className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-xl transition-colors"><Settings size={20} /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.values(UserRole).map((role) => (
                <div key={role} className="group flex items-center justify-between p-5 bg-slate-50 hover:bg-white hover:shadow-lg rounded-2xl border border-transparent hover:border-slate-100 transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 shadow-sm transition-colors">
                      <Key size={18} />
                    </div>
                    <span className="font-bold text-slate-700">{role}</span>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Audit Logs */}
          <div className="bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="flex items-center gap-3 mb-8 relative z-10">
              <History size={24} className="text-blue-400" />
              <h3 className="text-xl font-black text-white tracking-tight">Logs de Auditoria</h3>
            </div>
            
            <div className="space-y-4 relative z-10">
              {logs.map((log, i) => (
                <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/[0.08] transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white">
                      <Activity size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white leading-none mb-1">{log.action}</p>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Executado por {log.user} em {log.target}</p>
                    </div>
                  </div>
                  <div className="mt-3 md:mt-0 text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{log.time}</p>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${log.status === 'Sucesso' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {log.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Config Sidebar */}
        <div className="space-y-8">
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                <Database size={20} className="text-blue-600" /> Armazenamento
              </h3>
              <div className="space-y-6">
                <div className="p-5 border border-blue-50 bg-blue-50/30 rounded-[1.5rem] relative overflow-hidden">
                  <div className="absolute bottom-0 right-0 p-4 opacity-10">
                    <Cpu size={40} className="text-blue-600" />
                  </div>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-3">Backup Cloud</p>
                  <p className="text-sm text-blue-900 font-bold mb-4">Próximo Backup Automático: Hoje, 23:59 (GMT+2)</p>
                  <div className="w-full bg-blue-200/50 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full w-4/5 animate-pulse"></div>
                  </div>
                </div>
                <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl hover:shadow-slate-900/20 transition-all active:scale-95">Executar Backup Manual</button>
              </div>
           </div>

           <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-500/20">
              <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                <Shield size={20} /> Segurança Ativa
              </h3>
              <p className="text-sm text-blue-100 leading-relaxed mb-6 font-medium">Firewall de nível 4 ativo e monitorizando tráfego externo.</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold bg-white/10 p-3 rounded-xl border border-white/10">
                  <span>SSL Encryption</span>
                  <span className="text-blue-300">256-bit AES</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold bg-white/10 p-3 rounded-xl border border-white/10">
                  <span>Threat Intel</span>
                  <span className="text-green-300">Ativo</span>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const ChevronRight = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

export default AdminView;
