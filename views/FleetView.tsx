
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Truck, MapPin, User, Settings, Search, Plus, 
  Fuel, Gauge, Calendar, CheckCircle2, AlertTriangle, 
  History, MoreHorizontal, ShieldCheck, ShieldAlert, 
  Shield, X, Loader2, Save, Trash2, Camera
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Vehicle } from '../types';
import { ImageUploadField } from '../components/ImageUploadField';
import { formatImageUrl } from '../imageUtils';

const FleetView: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [viewingVehicle, setViewingVehicle] = useState<Vehicle | null>(null);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const initialFormState: Partial<Vehicle> = {
    plate: '',
    model: '',
    driver: 'N/A',
    status: 'Disponível',
    fuelLevel: 100,
    lastMaintenance: new Date().toISOString().split('T')[0],
    mileage: '0 km',
    image: ''
  };

  const [formState, setFormState] = useState<Partial<Vehicle>>(initialFormState);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('vehicles').select('*').order('model');
      if (error) throw error;
      setVehicles(data || []);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...formState };
      if (editingVehicleId) {
        await supabase.from('vehicles').update(payload).eq('id', editingVehicleId);
      } else {
        await supabase.from('vehicles').insert([payload]);
      }
      setShowModal(false);
      fetchVehicles();
    } catch (err) {
      console.error("Error saving vehicle:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    if (confirm('Deseja realmente remover este veículo da frota?')) {
      try {
        await supabase.from('vehicles').delete().eq('id', id);
        fetchVehicles();
      } catch (err) {
        console.error("Error deleting vehicle:", err);
      }
    }
  };

  const stats = useMemo(() => ({
    total: vehicles.length,
    active: vehicles.filter(v => v.status === 'Em Rota').length,
    maintenance: vehicles.filter(v => v.status === 'Manutenção').length,
    available: vehicles.filter(v => v.status === 'Disponível').length,
  }), [vehicles]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => 
      v.plate.toLowerCase().includes(searchTerm.toLowerCase()) || 
      v.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [vehicles, searchTerm]);

  const getSafetyStatus = (fuel: number, maintenanceDate: string) => {
    const today = new Date();
    const lastMaint = new Date(maintenanceDate);
    const diffTime = Math.abs(today.getTime() - lastMaint.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (fuel < 25 || diffDays > 180) {
      return { label: 'Crítico', color: 'text-rose-600 bg-rose-50', icon: <ShieldAlert size={14} />, border: 'border-rose-100' };
    }
    if (fuel < 45 || diffDays > 90) {
      return { label: 'Atenção', color: 'text-amber-600 bg-amber-50', icon: <Shield size={14} />, border: 'border-amber-100' };
    }
    return { label: 'Seguro', color: 'text-emerald-600 bg-emerald-50', icon: <ShieldCheck size={14} />, border: 'border-emerald-100' };
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-market-blue">
      <Loader2 className="animate-spin" size={32} />
      <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Sincronizando Frota Cloud...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16 max-w-[1800px] mx-auto">
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
           <button onClick={() => { setEditingVehicleId(null); setFormState(initialFormState); setShowModal(true); }} className="market-button market-button-primary px-6 py-3 text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg">
             <Plus size={16} /> Adicionar Veículo
           </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Frota Total', value: stats.total, icon: <Truck size={20} />, bg: 'bg-slate-50', text: 'text-slate-600' },
          { label: 'Em Serviço', value: stats.active, icon: <MapPin size={20} />, bg: 'bg-blue-50', text: 'text-market-blue' },
          { label: 'Disponíveis', value: stats.available, icon: <CheckCircle2 size={20} />, bg: 'bg-emerald-50', text: 'text-market-accent' },
          { label: 'Manutenção', value: stats.maintenance, icon: <AlertTriangle size={20} />, bg: 'bg-amber-50', text: 'text-amber-600' },
        ].map((kpi, idx) => (
          <div key={idx} className="market-card p-4 md:p-6">
            <div className={`p-2.5 ${kpi.bg} ${kpi.text} rounded-xl w-fit mb-3`}>
              {kpi.icon}
            </div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
            <h3 className="text-2xl font-bold text-market-navy">{kpi.value}</h3>
          </div>
        ))}
      </div>

      <div className="market-card overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              placeholder="Pesquisar matrícula, modelo ou motorista..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 font-medium text-sm outline-none focus:ring-4 focus:ring-market-blue/10 focus:border-market-blue transition-all" 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-4">Veículo</th>
                <th className="px-6 py-4">Status Operational</th>
                <th className="px-6 py-4 text-center">Segurança</th>
                <th className="px-6 py-4">Motorista</th>
                <th className="px-6 py-4">Combustível</th>
                <th className="px-6 py-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVehicles.map((vehicle) => {
                const safety = getSafetyStatus(vehicle.fuelLevel, vehicle.lastMaintenance);
                const statusStyles = {
                  'Disponível': { bg: 'bg-emerald-50 text-market-accent', dot: 'bg-market-accent' },
                  'Em Rota': { bg: 'bg-blue-50 text-market-blue', dot: 'bg-market-blue animate-pulse' },
                  'Manutenção': { bg: 'bg-amber-50 text-amber-600', dot: 'bg-amber-600' },
                  'Reserva': { bg: 'bg-slate-100 text-slate-500', dot: 'bg-slate-400' }
                }[vehicle.status] || { bg: 'bg-slate-100 text-slate-500', dot: 'bg-slate-400' };

                return (
                  <tr key={vehicle.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img 
                          src={formatImageUrl(vehicle.image || initialFormState.image!)} 
                          className="w-12 h-10 object-cover rounded-lg border border-slate-100 shadow-sm" 
                          alt="" 
                        />
                        <div>
                          <p className="text-sm font-bold text-market-navy truncate max-w-[150px]">{vehicle.model}</p>
                          <span className="text-[9px] font-bold text-market-blue bg-market-blue/5 px-2 py-0.5 rounded uppercase">{vehicle.plate}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${statusStyles.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusStyles.dot}`}></span>
                        {vehicle.status}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[8px] font-bold uppercase border ${safety.color} ${safety.border}`}>
                        {safety.icon} {safety.label}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200"><User size={12} /></div>
                        <span className="text-xs font-medium text-market-navy">{vehicle.driver}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-24">
                        <div className="flex justify-between items-center mb-1 text-[9px] font-bold">
                          <span className="text-slate-400">NÍVEL</span>
                          <span className={vehicle.fuelLevel < 25 ? 'text-rose-600' : 'text-market-accent'}>{vehicle.fuelLevel}%</span>
                        </div>
                        <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full transition-all ${vehicle.fuelLevel < 25 ? 'bg-rose-500' : 'bg-market-accent'}`} style={{ width: `${vehicle.fuelLevel}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                         <button onClick={() => { setFormState(vehicle); setEditingVehicleId(vehicle.id); setShowModal(true); }} className="p-2 text-slate-400 hover:text-market-blue hover:bg-market-blue/5 rounded-lg border border-slate-100"><Settings size={14} /></button>
                         <button onClick={() => handleDeleteVehicle(vehicle.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-100"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredVehicles.length === 0 && (
            <div className="py-20 text-center opacity-20 flex flex-col items-center gap-4">
              <Truck size={48} />
              <p className="text-[10px] font-bold uppercase tracking-widest">Nenhum veículo encontrado.</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-market-navy/80 backdrop-blur-xl animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 md:p-10 max-w-4xl w-full shadow-2xl relative border-t-8 border-market-blue max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 p-2 text-slate-400 hover:text-market-navy bg-slate-50 rounded-xl transition-all border border-slate-100"><X size={24} /></button>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-market-navy flex items-center gap-3">
                <Truck size={28} className="text-market-blue" />
                {editingVehicleId ? 'Editar Veículo' : 'Registar Novo Veículo'}
              </h2>
              <p className="text-[10px] text-market-slate font-bold uppercase mt-1 tracking-widest">Cadastro Técnico de Frota Monte</p>
            </div>

            <form onSubmit={handleSaveVehicle} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-3">
                <ImageUploadField 
                  label="Fotografia do Veículo"
                  value={formState.image || ''}
                  onChange={(url) => setFormState({...formState, image: url})}
                  placeholder="Link da imagem ou upload da galeria..."
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-market-slate uppercase tracking-widest ml-1">Modelo / Descrição</label>
                <input required value={formState.model} onChange={e => setFormState({...formState, model: e.target.value})} className="market-input" placeholder="Ex: Toyota Hilux 2024 D4D" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-market-slate uppercase tracking-widest ml-1">Matrícula</label>
                <input required value={formState.plate} onChange={e => setFormState({...formState, plate: e.target.value})} className="market-input" placeholder="Ex: ABC-123-MC" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-market-slate uppercase tracking-widest ml-1">Motorista</label>
                <input value={formState.driver} onChange={e => setFormState({...formState, driver: e.target.value})} className="market-input" placeholder="Nome do motorista" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-market-slate uppercase tracking-widest ml-1">Status Operational</label>
                <select value={formState.status} onChange={e => setFormState({...formState, status: e.target.value as any})} className="market-input border-none bg-slate-50 p-4">
                  <option value="Disponível">Disponível</option>
                  <option value="Em Rota">Em Rota</option>
                  <option value="Manutenção">Manutenção</option>
                  <option value="Reserva">Reserva</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-market-slate uppercase tracking-widest ml-1">Combustível (%)</label>
                <input type="number" min="0" max="100" value={formState.fuelLevel} onChange={e => setFormState({...formState, fuelLevel: Number(e.target.value)})} className="market-input" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-market-slate uppercase tracking-widest ml-1">Quilometragem</label>
                <input value={formState.mileage} onChange={e => setFormState({...formState, mileage: e.target.value})} className="market-input" placeholder="Ex: 12.000 km" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-market-slate uppercase tracking-widest ml-1">Última Manutenção</label>
                <input type="date" value={formState.lastMaintenance} onChange={e => setFormState({...formState, lastMaintenance: e.target.value})} className="market-input" />
              </div>

              <div className="md:col-span-3 flex gap-4 pt-8 border-t border-slate-100 mt-4">
                <button type="submit" disabled={saving} className="market-button market-button-primary flex-1 py-4 text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> {editingVehicleId ? 'Actualizar Dados' : 'Registar Veículo'}</>}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="market-button market-button-outline px-8 py-4 text-[10px] uppercase tracking-widest">Descartar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FleetView;

