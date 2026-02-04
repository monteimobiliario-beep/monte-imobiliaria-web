
import React, { useState } from 'react';
import { 
  Truck, 
  MapPin, 
  User, 
  Settings, 
  Search, 
  Plus, 
  Fuel, 
  Gauge, 
  Calendar,
  CheckCircle2,
  AlertTriangle,
  History,
  MoreHorizontal,
  ShieldCheck,
  ShieldAlert,
  Shield
} from 'lucide-react';

interface Vehicle {
  id: string;
  plate: string;
  model: string;
  driver: string;
  status: 'Disponível' | 'Em Rota' | 'Manutenção' | 'Reserva';
  fuelLevel: number;
  lastMaintenance: string;
  mileage: string;
}

const MOCK_FLEET: Vehicle[] = [
  { id: '1', plate: 'ABC-123-MC', model: 'Toyota Hilux 2023', driver: 'António Muleva', status: 'Em Rota', fuelLevel: 75, lastMaintenance: '2024-04-15', mileage: '12.450 km' },
  { id: '2', plate: 'XYZ-888-MC', model: 'Isuzu D-Max', driver: 'Carlos Beira', status: 'Disponível', fuelLevel: 100, lastMaintenance: '2024-05-10', mileage: '45.200 km' },
  { id: '3', plate: 'MOZ-555-BE', model: 'Mitsubishi L200', driver: 'N/A', status: 'Manutenção', fuelLevel: 20, lastMaintenance: '2023-11-20', mileage: '88.120 km' },
  { id: '4', plate: 'AFR-777-MC', model: 'Ford Ranger XL', driver: 'Sérgio Maputo', status: 'Disponível', fuelLevel: 35, lastMaintenance: '2024-01-01', mileage: '22.300 km' },
];

const FleetView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const stats = {
    total: MOCK_FLEET.length,
    active: MOCK_FLEET.filter(v => v.status === 'Em Rota').length,
    maintenance: MOCK_FLEET.filter(v => v.status === 'Manutenção').length,
    available: MOCK_FLEET.filter(v => v.status === 'Disponível').length,
  };

  const getSafetyStatus = (fuel: number, maintenanceDate: string) => {
    const today = new Date();
    const lastMaint = new Date(maintenanceDate);
    const diffTime = Math.abs(today.getTime() - lastMaint.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Regras de Segurança
    if (fuel < 25 || diffDays > 180) {
      return { 
        label: 'Crítico', 
        color: 'text-rose-600 bg-rose-50', 
        icon: <ShieldAlert size={14} />,
        border: 'border-rose-100'
      };
    }
    if (fuel < 45 || diffDays > 90) {
      return { 
        label: 'Atenção', 
        color: 'text-amber-600 bg-amber-50', 
        icon: <Shield size={14} />,
        border: 'border-amber-100'
      };
    }
    return { 
      label: 'Seguro', 
      color: 'text-emerald-600 bg-emerald-50', 
      icon: <ShieldCheck size={14} />,
      border: 'border-emerald-100'
    };
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
            <Truck size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestão de Frota</h1>
            <p className="text-slate-500 font-medium italic">Controle operacional de veículos e motoristas.</p>
          </div>
        </div>
        <div className="flex gap-3">
           <button className="px-6 py-3 bg-white text-slate-600 border border-slate-200 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
             <History size={16} className="text-blue-600" /> Histórico de Rotas
           </button>
           <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2 shadow-xl shadow-blue-500/20">
             <Plus size={16} /> Adicionar Veículo
           </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Frota Total', value: stats.total, icon: <Truck size={20} />, bg: 'bg-slate-50', text: 'text-slate-600' },
          { label: 'Em Serviço', value: stats.active, icon: <MapPin size={20} />, bg: 'bg-blue-50', text: 'text-blue-600' },
          { label: 'Disponíveis', value: stats.available, icon: <CheckCircle2 size={20} />, bg: 'bg-emerald-50', text: 'text-emerald-600' },
          { label: 'Manutenção', value: stats.maintenance, icon: <AlertTriangle size={20} />, bg: 'bg-amber-50', text: 'text-amber-600' },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className={`p-3 ${kpi.bg} ${kpi.text} rounded-2xl w-fit mb-4`}>
              {kpi.icon}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
            <h3 className="text-3xl font-black text-slate-900">{kpi.value}</h3>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              placeholder="Pesquisar por matrícula ou motorista..." 
              className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-none font-bold text-sm outline-none focus:ring-4 focus:ring-blue-50" 
            />
          </div>
          <div className="flex gap-2">
             <button className="p-4 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-2xl transition-all">
                <Settings size={20} />
             </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                <th className="px-10 py-6">Veículo / Matrícula</th>
                <th className="px-10 py-6">Status Operacional</th>
                <th className="px-10 py-6 text-center">Segurança</th>
                <th className="px-10 py-6">Motorista Atual</th>
                <th className="px-10 py-6">Combustível</th>
                <th className="px-10 py-6 text-right">Acção</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {MOCK_FLEET.filter(v => 
                v.plate.toLowerCase().includes(searchTerm.toLowerCase()) || 
                v.driver.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((vehicle) => {
                const safety = getSafetyStatus(vehicle.fuelLevel, vehicle.lastMaintenance);
                
                // Definição dinâmica de estilos por status
                const getStatusStyles = (status: string) => {
                  switch (status) {
                    case 'Disponível':
                      return { bg: 'bg-emerald-50 text-emerald-600', dot: 'bg-emerald-600' };
                    case 'Em Rota':
                      return { bg: 'bg-blue-50 text-blue-600', dot: 'bg-blue-600 animate-pulse' };
                    case 'Manutenção':
                      return { bg: 'bg-amber-50 text-amber-600', dot: 'bg-amber-600' };
                    case 'Reserva':
                    default:
                      return { bg: 'bg-slate-100 text-slate-500', dot: 'bg-slate-400' };
                  }
                };

                const statusStyles = getStatusStyles(vehicle.status);

                return (
                  <tr key={vehicle.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                          <Truck size={24} />
                        </div>
                        <div>
                          <p className="text-base font-black text-slate-900 leading-none mb-1">{vehicle.model}</p>
                          <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">{vehicle.plate}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${statusStyles.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusStyles.dot}`}></span>
                        {vehicle.status}
                      </div>
                    </td>
                    <td className="px-10 py-8 text-center">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase border ${safety.color} ${safety.border} shadow-sm transition-transform group-hover:scale-105`}>
                        {safety.icon}
                        {safety.label}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                          <User size={14} />
                        </div>
                        <span className="text-sm font-bold text-slate-700">{vehicle.driver}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="w-full max-w-[120px]">
                        <div className="flex justify-between items-center mb-1 text-[10px] font-black">
                          <span className="text-slate-400 uppercase tracking-tighter">Nível</span>
                          <span className={vehicle.fuelLevel < 25 ? 'text-rose-600' : 'text-emerald-600'}>{vehicle.fuelLevel}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${vehicle.fuelLevel < 25 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                            style={{ width: `${vehicle.fuelLevel}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <button className="p-3 bg-white text-slate-300 hover:text-blue-600 rounded-xl border border-slate-100 shadow-sm transition-all group-hover:scale-105 active:scale-95">
                        <MoreHorizontal size={20} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Maintenance Alerts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <History className="text-blue-600" /> Manutenções Próximas
            </h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Este Mês</span>
          </div>
          <div className="space-y-4">
             {MOCK_FLEET.slice(0, 3).map(v => (
               <div key={v.id} className="p-5 bg-slate-50 rounded-2xl flex items-center justify-between group hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-blue-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400">
                       <Calendar size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 leading-none mb-1">{v.model}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Última: {v.lastMaintenance}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Quilometragem</p>
                    <p className="text-sm font-black text-slate-900">{v.mileage}</p>
                  </div>
               </div>
             ))}
          </div>
        </div>

        <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="mb-8">
              <div className="p-3 bg-blue-600 rounded-2xl w-fit mb-6 text-white shadow-lg shadow-blue-500/20">
                <Fuel size={24} />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight mb-2">Relatório de Combustível</h3>
              <p className="text-slate-400 text-sm font-medium">Análise de consumo médio da frota para optimização de custos operacionais.</p>
            </div>
            <button className="w-full py-5 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">
              Gerar Relatório Cloud
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FleetView;
