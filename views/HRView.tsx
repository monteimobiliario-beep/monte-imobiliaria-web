
import React, { useState } from 'react';
import { MOCK_EMPLOYEES, MOCK_ATTENDANCE, MOCK_CONTRACTS } from '../constants';
import { 
  Mail, Phone, Trash2, UserPlus, Search, Filter, 
  Briefcase, DollarSign, Clock, FileBadge, Calendar, 
  ChevronRight, ArrowUpRight, ArrowDownRight, UserCheck, 
  AlertCircle, Download, Plus, MapPin, X, CheckCircle, FileText, Activity, LayoutDashboard, Users
} from 'lucide-react';
import { Employee, AttendanceRecord, Contract, AttendanceStatus, ContractType, UserRole } from '../types';

type HRTab = 'dashboard' | 'funcionarios' | 'assiduidade' | 'contratos';

const HRView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<HRTab>('dashboard');
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(MOCK_ATTENDANCE);
  const [contracts] = useState<Contract[]>(MOCK_CONTRACTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);

  // Fix: Initializing role with a valid UserRole instead of an empty string
  const [newEmp, setNewEmp] = useState<Partial<Employee>>({
    name: '', role: UserRole.EMPLOYEE, department: 'Operações', salary: 0, email: '', phone: '', joinDate: new Date().toISOString().split('T')[0]
  });

  const [newAtt, setNewAtt] = useState({
    employeeId: '', date: new Date().toISOString().split('T')[0], checkIn: '08:00', checkOut: '17:00', status: 'Presente' as AttendanceStatus, location: 'Sede Beira'
  });

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const employee: Employee = {
      id: Math.random().toString(36).substr(2, 9),
      // Fix: Ensuring role is assigned a valid UserRole by using a fallback
      name: newEmp.name || '', 
      role: newEmp.role || UserRole.EMPLOYEE, 
      department: newEmp.department || 'Operações', 
      salary: Number(newEmp.salary) || 0,
      status: 'Ativo', 
      avatar: `https://picsum.photos/seed/${newEmp.name}/100`, 
      email: newEmp.email || '', 
      phone: newEmp.phone || '', 
      joinDate: newEmp.joinDate || '',
      // Fix: Added missing permissions property
      permissions: ['Basico']
    };
    setEmployees([employee, ...employees]);
    setShowAddModal(false);
  };

  const handleAddAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    const record: AttendanceRecord = {
      id: Math.random().toString(36).substr(2, 9),
      employeeId: newAtt.employeeId, date: newAtt.date, checkIn: newAtt.checkIn, checkOut: newAtt.checkOut, status: newAtt.status, location: newAtt.location
    };
    setAttendance([record, ...attendance]);
    setShowAttendanceModal(false);
  };

  const removeEmployee = (id: string) => {
    if (window.confirm('Confirmar rescisão e remoção?')) {
      setEmployees(employees.filter(emp => emp.id !== id));
    }
  };

  const formatMZN = (val: number) => val.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' });

  const renderDashboard = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Staff Total', value: employees.length, sub: 'Colaboradores', icon: <Users size={24} />, color: 'blue' },
          { label: 'Folha Mensal', value: formatMZN(employees.reduce((acc, c) => acc + c.salary, 0)), sub: 'Em Meticais', icon: <DollarSign size={24} />, color: 'green' },
          { label: 'Presença Hoje', value: '92%', sub: 'Taxa Diária', icon: <UserCheck size={24} />, color: 'indigo' },
          { label: 'Alertas HR', value: '2', sub: 'Pendências', icon: <AlertCircle size={24} />, color: 'amber' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className={`w-12 h-12 bg-slate-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4`}>{stat.icon}</div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-black text-slate-900">Assiduidade Recente</h3>
            <button onClick={() => setActiveTab('assiduidade')} className="text-blue-600 text-xs font-bold hover:underline">Ver Mapa Completo</button>
          </div>
          <div className="space-y-4">
            {attendance.slice(0, 4).map(record => {
              const emp = employees.find(e => e.id === record.employeeId);
              return (
                <div key={record.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl hover:bg-white hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <img src={emp?.avatar} className="w-10 h-10 rounded-xl object-cover" />
                    <div><p className="text-sm font-bold text-slate-900">{emp?.name}</p><p className="text-[10px] text-slate-400 font-black uppercase">{record.location}</p></div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-black px-2 py-1 rounded-full ${record.status === 'Presente' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>{record.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
          <h3 className="text-lg font-black mb-6 relative z-10 flex items-center gap-2"><FileBadge size={20} className="text-blue-400" /> Próximas Renovações</h3>
          <div className="space-y-4 relative z-10">
            {contracts.slice(0, 3).map(c => {
              const emp = employees.find(e => e.id === c.employeeId);
              return (
                <div key={c.id} className="p-4 bg-white/5 rounded-2xl border border-white/10 flex justify-between items-center group cursor-pointer hover:bg-white/10 transition-all">
                  <div><p className="text-sm font-bold">{emp?.name}</p><p className="text-[10px] text-slate-400 font-black">{c.type}</p></div>
                  <p className="text-[10px] text-blue-400 font-black">Ativo</p>
                </div>
              );
            })}
          </div>
          <button onClick={() => setActiveTab('contratos')} className="w-full mt-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20">Gerir Documentação</button>
        </div>
      </div>
    </div>
  );

  const renderAssiduidade = () => (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
      <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-900">Lançamento de Presença</h3>
          <p className="text-sm text-slate-500 font-medium">Controlo diário do staff Monte & Chaisa.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAttendanceModal(true)} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-sm shadow-xl shadow-blue-500/20 hover:scale-105 transition-all flex items-center gap-2">
            <Plus size={18} /> Registar Presença
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <th className="px-8 py-5">Colaborador</th>
              <th className="px-8 py-5">Data</th>
              <th className="px-8 py-5">Entrada/Saída</th>
              <th className="px-8 py-5">Local</th>
              <th className="px-8 py-5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {attendance.map(record => {
              const emp = employees.find(e => e.id === record.employeeId);
              return (
                <tr key={record.id} className="hover:bg-slate-50/50 transition-all">
                  <td className="px-8 py-5 flex items-center gap-3">
                    <img src={emp?.avatar} className="w-10 h-10 rounded-xl object-cover" />
                    <div><p className="text-sm font-bold text-slate-900">{emp?.name}</p><p className="text-[10px] text-slate-400 font-bold">{emp?.role}</p></div>
                  </td>
                  <td className="px-8 py-5 text-sm font-medium text-slate-500">{record.date}</td>
                  <td className="px-8 py-5 text-sm font-black text-slate-900">{record.checkIn} - {record.checkOut}</td>
                  <td className="px-8 py-5 text-xs text-slate-500 font-medium">{record.location}</td>
                  <td className="px-8 py-5"><span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${record.status === 'Presente' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>{record.status}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Módulo RH</h1>
          <p className="text-slate-500 font-medium mt-1">Gestão de Staff, Presenças e Contratos (Monte & Chaisa).</p>
        </div>
        <div className="flex p-1 bg-white border border-slate-200 rounded-2xl shadow-sm self-start overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
            { id: 'funcionarios', label: 'Staff', icon: <Users size={16} /> },
            { id: 'assiduidade', label: 'Presenças', icon: <Clock size={16} /> },
            { id: 'contratos', label: 'Contratos', icon: <FileBadge size={16} /> },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as HRTab)} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-900'}`}>{tab.icon} {tab.label}</button>
          ))}
        </div>
      </div>
      <div className="mt-8">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'assiduidade' && renderAssiduidade()}
        {activeTab === 'funcionarios' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {employees.map(emp => (
              <div key={emp.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all relative group">
                <button onClick={() => removeEmployee(emp.id)} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18} /></button>
                <div className="flex items-center gap-5 mb-6">
                  <img src={emp.avatar} className="w-16 h-16 rounded-3xl object-cover ring-4 ring-slate-50" />
                  <div><h3 className="text-lg font-black text-slate-900">{emp.name}</h3><p className="text-xs font-bold text-blue-600 uppercase">{emp.role}</p></div>
                </div>
                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div><p className="text-[10px] font-black text-slate-400 uppercase">Vencimento</p><p className="text-sm font-black text-slate-900">{formatMZN(emp.salary)}</p></div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${emp.status === 'Ativo' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>{emp.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAttendanceModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl relative">
            <button onClick={() => setShowAttendanceModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900"><X size={24} /></button>
            <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Lançamento de Presença</h2>
            <form onSubmit={handleAddAttendance} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Funcionário</label>
                <select required value={newAtt.employeeId} onChange={e => setNewAtt({...newAtt, employeeId: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-900 appearance-none">
                  <option value="">Selecionar...</option>
                  {employees.map(e => ( <option key={e.id} value={e.id}>{e.name}</option> ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Entrada</label>
                  <input required type="time" value={newAtt.checkIn} onChange={e => setNewAtt({...newAtt, checkIn: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Saída</label>
                  <input required type="time" value={newAtt.checkOut} onChange={e => setNewAtt({...newAtt, checkOut: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Estado</label>
                <select value={newAtt.status} onChange={e => setNewAtt({...newAtt, status: e.target.value as AttendanceStatus})} className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold appearance-none">
                  <option>Presente</option><option>Atraso</option><option>Falta</option><option>Férias</option>
                </select>
              </div>
              <button type="submit" className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-3">Confirmar Presença <CheckCircle size={20} /></button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRView;
