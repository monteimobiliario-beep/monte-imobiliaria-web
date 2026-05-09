import React from 'react';
import { Search, UserCog } from 'lucide-react';
import { Employee } from '../../types';

interface AdminUsersTabProps {
  users: Employee[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onEditUser: (user: Employee) => void;
  meshStyle: React.CSSProperties;
}

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({ users, searchTerm, setSearchTerm, onEditUser, meshStyle }) => (
  <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden" style={meshStyle}>
    <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-market-slate" size={18} />
        <input 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)} 
          placeholder="Localizar identidade..." 
          className="w-full pl-16 pr-6 py-5 bg-slate-50 rounded-[2rem] border border-slate-200 font-medium text-sm outline-none focus:ring-4 focus:ring-market-blue/10 focus:border-market-blue transition-all" 
        />
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-50/50 text-[10px] font-bold text-market-slate uppercase tracking-widest border-b border-slate-100">
            <th className="px-10 py-8">Utilizador / Cargo</th>
            <th className="px-10 py-8 text-center">Estado de Acesso</th>
            <th className="px-10 py-8 text-right">Ação</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase())).map(user => (
            <tr key={user.id} className="hover:bg-slate-50/50 transition-all group">
              <td className="px-10 py-10">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <img src={user.avatar || undefined} className="w-16 h-16 rounded-2xl object-cover ring-4 ring-slate-100 transition-transform group-hover:scale-110 shadow-sm" alt="" />
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 bg-market-accent rounded-full border-4 border-white shadow-sm`}></div>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-market-navy leading-none mb-2 group-hover:text-market-blue transition-colors">{user.name}</p>
                    <span className="text-[10px] font-bold text-market-blue bg-market-blue/5 px-3 py-1 rounded-lg uppercase tracking-wider">{user.role}</span>
                  </div>
                </div>
              </td>
              <td className="px-10 py-10 text-center">
                <div className="flex flex-wrap justify-center gap-2 max-w-xs mx-auto">
                  {user.permissions?.length ? (
                    <span className="text-[9px] font-bold bg-market-accent text-white px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg shadow-market-accent/20">Override Ativo ({user.permissions.length})</span>
                  ) : (
                    <span className="text-[9px] font-bold bg-slate-100 text-market-slate px-3 py-1 rounded-full uppercase tracking-tighter">Padrão do Cargo</span>
                  )}
                </div>
              </td>
              <td className="px-10 py-10 text-right">
                <button onClick={() => onEditUser({...user})} className="p-4 bg-market-navy text-white rounded-2xl shadow-xl transition-all group-hover:scale-105 group-hover:bg-market-blue active:scale-95">
                  <UserCog size={22} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
