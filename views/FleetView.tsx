
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
          <div className="w-14 h-14 bg-market-blue rounded-2xl flex items-center justify-center text-white shadow-xl shadow-market-blue/20">
            <Truck size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-market-navy tracking-tight">Gestão de Frota</h1>
            <p className="text-market-slate font-medium">Controle operacional de veículos e motoristas.</p>
          </div>
        </div>
        <div className="flex gap-3">
           <button className="market-button market-button-outline px-6 py-3 text-[10px] uppercase tracking-widest flex items-center gap-2">
             <History size={16} className="text-market-blue" /> Histórico de Rotas
           </button>
           <button className="market-button market-button-primary px-6 py-3 text-[10px] uppercase tracking-widest flex items-center gap-2">
             <Plus size={16} /> Adicionar Veículo
           </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Frota Total', value: stats.total, icon: <Truck size={20} />, bg: 'bg-slate-50', text: 'text-slate-600' },
          { label: 'Em Serviço', value: stats.active, icon: <MapPin size={20} />, bg: 'bg-blue-50', text: 'text-market-blue' },
          { label: 'Disponíveis', value: stats.available, icon: <CheckCircle2 size={20} />, bg: 'bg-emerald-50', text: 'text-market-accent' },
          { label: 'Manutenção', value: stats.maintenance, icon: <AlertTriangle size={20} />, bg: 'bg-amber-50', text: 'text-amber-600' },
        ].map((kpi, idx) => (
          <div key={idx} className="market-card p-8">
            <div className={`p-3 ${kpi.bg} ${kpi.text} rounded-xl w-fit mb-4`}>
              {kpi.icon}
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
            <h3 className="text-3xl font-bold text-market-navy">{kpi.value}</h3>
          </div>
        ))}
      </div>

      <div className="market-card overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              placeholder="Pesquisar por matrícula ou motorista..." 
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 rounded-xl border border-slate-200 font-medium text-sm outline-none focus:ring-2 focus:ring-market-blue/20 focus:border-market-blue transition-all" 
            />
          </div>
          <div className="flex gap-2">
             <button className="p-3.5 bg-slate-50 text-slate-400 hover:text-market-blue rounded-xl transition-all border border-slate-200">
                <Settings size={20} />
             </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="px-8 py-5">Veículo / Matrícula</th>
                <th className="px-8 py-5">Status Operacional</th>
                <th className="px-8 py-5 text-center">Segurança</th>
                <th className="px-8 py-5">Motorista Atual</th>
                <th className="px-8 py-5">Combustível</th>
                <th className="px-8 py-5 text-right">Acção</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_FLEET.filter(v => 
                v.plate.toLowerCase().includes(searchTerm.toLowerCase()) || 
                v.driver.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((vehicle) => {
                const safety = getSafetyStatus(vehicle.fuelLevel, vehicle.lastMaintenance);
                
                const getStatusStyles = (status: string) => {
                  switch (status) {
                    case 'Disponível':
                      return { bg: 'bg-emerald-50 text-market-accent', dot: 'bg-market-accent' };
                    case 'Em Rota':
                      return { bg: 'bg-blue-50 text-market-blue', dot: 'bg-market-blue animate-pulse' };
                    case 'Manutenção':
                      return { bg: 'bg-amber-50 text-amber-600', dot: 'bg-amber-600' };
                    default:
                      return { bg: 'bg-slate-100 text-slate-500', dot: 'bg-slate-400' };
                  }
                };

                const statusStyles = getStatusStyles(vehicle.status);

                return (
                  <tr key={vehicle.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center border border-slate-100">
                          <Truck size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-market-navy leading-none mb-1">{vehicle.model}</p>
                          <span className="text-[10px] font-bold text-market-blue bg-market-blue/10 px-2 py-0.5 rounded uppercase tracking-wider">{vehicle.plate}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${statusStyles.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusStyles.dot}`}></span>
                        {vehicle.status}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-bold uppercase border ${safety.color} ${safety.border} shadow-sm`}>
                        {safety.icon}
                        {safety.label}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                          <User size={14} />
                        </div>
                        <span className="text-sm font-medium text-market-navy">{vehicle.driver}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="w-full max-w-[100px]">
                        <div className="flex justify-between items-center mb-1 text-[10px] font-bold">
                          <span className="text-slate-400 uppercase tracking-tighter">Nível</span>
                          <span className={vehicle.fuelLevel < 25 ? 'text-rose-600' : 'text-market-accent'}>{vehicle.fuelLevel}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${vehicle.fuelLevel < 25 ? 'bg-rose-500' : 'bg-market-accent'}`} 
                            style={{ width: `${vehicle.fuelLevel}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="p-2.5 text-slate-300 hover:text-market-blue hover:bg-slate-50 rounded-lg transition-all">
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
        <div className="market-card p-10">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-market-navy flex items-center gap-3">
              <History className="text-market-blue" /> Manutenções Próximas
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Este Mês</span>
          </div>
          <div className="space-y-4">
             {MOCK_FLEET.slice(0, 3).map(v => (
                <div key={v.id} className="p-5 bg-slate-50 rounded-2xl flex items-center justify-between group hover:bg-white hover:shadow-lg transition-all border border-slate-100 hover:border-market-blue/20">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
                       <Calendar size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-market-navy leading-none mb-1">{v.model}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Última: {v.lastMaintenance}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-market-blue uppercase tracking-widest mb-1">Quilometragem</p>
                    <p className="text-sm font-bold text-market-navy">{v.mileage}</p>
                  </div>
                </div>
             ))}
          </div>
        </div>

        <div className="bg-market-navy p-10 rounded-3xl shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-market-blue/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="mb-8">
              <div className="p-3 bg-market-blue rounded-xl w-fit mb-6 text-white shadow-lg shadow-market-blue/20">
                <Fuel size={24} />
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight mb-2">Relatório de Combustível</h3>
              <p className="text-white/50 text-sm">Análise de consumo médio da frota para optimização de custos operacionais.</p>
            </div>
            <button className="w-full py-4 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all">
              Gerar Relatório Cloud
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FleetView;
