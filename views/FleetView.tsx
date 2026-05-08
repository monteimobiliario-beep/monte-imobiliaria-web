
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Truck, MapPin, User, Settings, Search, Plus, 
  Fuel, Gauge, Calendar, CheckCircle2, AlertTriangle, 
  History, MoreHorizontal, ShieldCheck, ShieldAlert, 
  Shield, X, Loader2, Save, Trash2, Camera,
  ChevronRight, Activity, Zap, TrendingUp, Filter,
  MoreVertical, Navigation2, FileText
} from 'lucide-react';
import { supabase, db } from '../supabaseClient';
import { Vehicle } from '../types';
import { ImageUploadField } from '../components/ImageUploadField';
import { formatImageUrl } from '../imageUtils';

const FleetView: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [showModal, setShowModal] = useState(false);
  const [viewingVehicle, setViewingVehicle] = useState<Vehicle | null>(null);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const initialFormState: Partial<Vehicle> = {
    plate: '',
    model: '',
    current_driver: '',
    status: 'Disponível',
    fuel_level: 100,
    last_maintenance: new Date().toISOString().split('T')[0],
    odometer: 0,
    image: ''
  };

  const [formState, setFormState] = useState<Partial<Vehicle>>(initialFormState);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const { data, error } = await db.fleet('vehicles').select('*').order('model');
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
    let attempts = 0;
    const maxAttempts = 2;

    const executeSave = async (): Promise<void> => {
      try {
        const payload = { ...formState };
        if (editingVehicleId) {
          const { error } = await db.fleet('vehicles').update(payload).eq('id', editingVehicleId);
          if (error) throw error;
        } else {
          const { error } = await db.fleet('vehicles').insert([payload]);
          if (error) throw error;
        }
        setShowModal(false);
        fetchVehicles();
      } catch (err: any) {
        if (err.message?.includes('Lock broken') && attempts < maxAttempts) {
          attempts++;
          await new Promise(r => setTimeout(r, 800));
          return executeSave();
        }
        throw err;
      }
    };

    try {
      await executeSave();
    } catch (err: any) {
      console.error("Error saving vehicle:", err);
      alert("Erro ao salvar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    if (confirm('Deseja realmente remover este veículo da frota?')) {
      try {
        const { error } = await db.fleet('vehicles').delete().eq('id', id);
        if (error) throw error;
        fetchVehicles();
      } catch (err) {
        console.error("Error deleting vehicle:", err);
        alert("Erro ao eliminar: " + (err as any).message);
      }
    }
  };

  const stats = useMemo(() => ({
    total: vehicles.length,
    active: vehicles.filter(v => v.status === 'Em Serviço').length,
    maintenance: vehicles.filter(v => v.status === 'Manutenção').length,
    available: vehicles.filter(v => v.status === 'Disponível').length,
  }), [vehicles]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchesSearch = v.plate.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (v.current_driver?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        v.model.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'Todos' || v.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [vehicles, searchTerm, statusFilter]);

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
    <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
      <div className="relative">
        <Loader2 className="animate-spin text-market-blue" size={48} />
        <div className="absolute inset-0 blur-xl bg-market-blue/20 animate-pulse"></div>
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Neural Core Sincronizando Frota</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-16 max-w-[1800px] mx-auto">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-market-blue rounded-full shadow-[0_0_10px_rgba(0,82,255,0.4)]"></div>
            <p className="text-[10px] text-market-blue font-black uppercase tracking-[0.4em]">Logística Operacional</p>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-market-navy tracking-tight leading-none">Monte <span className="italic font-display font-light text-market-blue">Fleet</span> Core</h1>
        </div>
        
        <div className="flex gap-3">
           <button 
             onClick={fetchVehicles} 
             className="p-4 bg-slate-100 text-slate-500 rounded-2xl hover:bg-market-blue hover:text-white transition-all shadow-sm border border-slate-200"
           >
              <Activity size={18} className={loading ? 'animate-pulse' : ''} />
           </button>
           <button 
              onClick={() => { setEditingVehicleId(null); setFormState(initialFormState); setShowModal(true); }} 
              className="market-button market-button-primary px-8 py-4 text-[10px] uppercase tracking-[0.2em] shadow-2xl flex items-center gap-2"
            >
              <Plus size={18} /> Incorporar Veículo
           </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Unidades Totais', value: stats.total, icon: <Truck size={18} />, color: 'text-slate-600', bg: 'bg-slate-50' },
          { label: 'Fluxo Activo', value: stats.active, icon: <Activity size={18} />, color: 'text-market-blue', bg: 'bg-market-blue/10' },
          { label: 'Disponibilidade', value: stats.available, icon: <Zap size={18} />, color: 'text-market-accent', bg: 'bg-market-accent/10' },
          { label: 'Ponto de Alerta', value: stats.maintenance, icon: <AlertTriangle size={18} />, color: 'text-amber-500', bg: 'bg-amber-100/50' },
        ].map((kpi, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={idx} 
            className="market-card p-5 group relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 w-20 h-20 bg-slate-50 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
             <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`w-10 h-10 ${kpi.bg} ${kpi.color} rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-all`}>{kpi.icon}</div>
             </div>
             <div className="relative z-10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{kpi.label}</p>
                <p className="text-2xl font-black text-market-navy tracking-tighter">{kpi.value}</p>
             </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group w-full">
           <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-market-blue transition-colors" size={18} />
           <input 
             value={searchTerm} 
             onChange={e => setSearchTerm(e.target.value)} 
             placeholder="Localizar por matrícula ou motorista..." 
             className="w-full pl-14 pr-6 py-4 bg-slate-50/50 rounded-2xl border border-slate-100 outline-none font-bold text-xs focus:ring-8 focus:ring-market-blue/5 focus:border-market-blue focus:bg-white transition-all shadow-inner" 
           />
        </div>
        <div className="flex items-center gap-3 bg-slate-50/80 px-6 py-4 rounded-2xl border border-slate-100 min-w-[200px] w-full md:w-auto">
           <Filter size={16} className="text-slate-400" />
           <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-transparent font-black text-[10px] uppercase text-market-navy outline-none cursor-pointer w-full tracking-widest">
              <option value="Todos">Todos Status</option>
              <option value="Disponível">Disponível</option>
              <option value="Em Serviço">Em Serviço</option>
              <option value="Manutenção">Manutenção</option>
              <option value="Lavagem">Lavagem</option>
           </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredVehicles.map((vehicle, idx) => {
            const safety = getSafetyStatus(vehicle.fuel_level, vehicle.last_maintenance);
            const statusStyles = {
              'Disponível': { color: 'text-emerald-500', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
              'Em Serviço': { color: 'text-market-blue', bg: 'bg-market-blue/10', dot: 'bg-market-blue animate-pulse' },
              'Manutenção': { color: 'text-amber-500', bg: 'bg-amber-50', dot: 'bg-amber-500' },
              'Lavagem': { color: 'text-slate-400', bg: 'bg-slate-50', dot: 'bg-slate-400' }
            }[vehicle.status] || { color: 'text-slate-400', bg: 'bg-slate-50', dot: 'bg-slate-400' };

            return (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={vehicle.id} 
                className="market-card p-6 flex flex-col gap-6 relative group overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl group-hover:bg-market-blue/5 transition-colors -mr-16 -mt-16 duration-700"></div>
                
                <div className="flex items-start justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img 
                        src={formatImageUrl(vehicle.image || initialFormState.image!) || undefined} 
                        className="w-20 h-16 object-cover rounded-2xl border-4 border-white shadow-2xl relative z-10 transition-transform duration-700 group-hover:-translate-y-1" 
                        alt="" 
                      />
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full z-20 ${statusStyles.dot}`}></div>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-market-navy leading-none mb-1 group-hover:text-market-blue transition-colors">{vehicle.model}</h3>
                      <span className="text-[10px] font-black tracking-widest text-market-blue bg-market-blue/5 px-2 py-0.5 rounded-lg">{vehicle.plate}</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                    <button onClick={() => { setFormState(vehicle); setEditingVehicleId(vehicle.id); setShowModal(true); }} className="p-2 bg-white text-slate-400 hover:text-market-navy rounded-xl shadow-lg border border-slate-100 transition-all"><Settings size={14} /></button>
                    <button onClick={() => handleDeleteVehicle(vehicle.id)} className="p-2 bg-white text-rose-400 hover:text-rose-600 rounded-xl shadow-lg border border-slate-100 transition-all"><Trash2 size={14} /></button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 relative z-10">
                   <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-200/40">
                      <div className="flex items-center gap-2 mb-2">
                         <User size={12} className="text-slate-400" />
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Condutor</span>
                      </div>
                      <p className="text-xs font-bold text-market-navy truncate">{vehicle.current_driver || 'Indefinido'}</p>
                   </div>
                   <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-200/40">
                      <div className="flex items-center gap-2 mb-2">
                         <Gauge size={12} className="text-slate-400" />
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Odométro</span>
                      </div>
                      <p className="text-xs font-bold text-market-navy">{vehicle.odometer ? `${Number(vehicle.odometer).toLocaleString()} KM` : 'N/D'}</p>
                   </div>
                </div>

                <div className="space-y-4 relative z-10">
                   <div className="space-y-2">
                      <div className="flex justify-between items-end">
                         <div className="flex items-center gap-2">
                            <Fuel size={14} className={vehicle.fuel_level < 25 ? 'text-rose-500' : 'text-market-blue'} />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nível de Combustível</span>
                         </div>
                         <span className={`text-[11px] font-black ${vehicle.fuel_level < 25 ? 'text-rose-500' : 'text-market-navy'}`}>{vehicle.fuel_level}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner p-0.5">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${vehicle.fuel_level}%` }}
                           className={`h-full rounded-full ${vehicle.fuel_level < 25 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]' : 'bg-market-blue shadow-[0_0_10px_rgba(0,82,255,0.4)]'}`}
                         />
                      </div>
                   </div>

                   <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] shadow-sm ${safety.color} ${safety.border} border`}>
                         {safety.icon} {safety.label}
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                         <Calendar size={12} />
                         <span className="text-[10px] font-bold">{new Date(vehicle.last_maintenance).toLocaleDateString('pt-MZ')}</span>
                      </div>
                   </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredVehicles.length === 0 && (
        <div className="py-24 text-center flex flex-col items-center gap-6">
          <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-300">
             <Navigation2 size={32} />
          </div>
          <div className="space-y-2">
             <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Escaneamento Concluído</p>
             <p className="text-sm font-medium text-slate-300">Nenhuma unidade detectada nos parâmetros atuais.</p>
          </div>
        </div>
      )}

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
                  placeholder="Link da imagem (URL) ou selecione..."
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Modelo / Descrição</label>
                <input required value={formState.model} onChange={e => setFormState({...formState, model: e.target.value})} className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl p-4 font-bold text-xs outline-none focus:ring-8 focus:ring-market-blue/5 focus:border-market-blue focus:bg-white transition-all shadow-inner" placeholder="Ex: Toyota Hilux 2024 D4D" />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Matrícula</label>
                <input required value={formState.plate} onChange={e => setFormState({...formState, plate: e.target.value})} className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl p-4 font-bold text-xs outline-none focus:ring-8 focus:ring-market-blue/5 focus:border-market-blue focus:bg-white transition-all shadow-inner" placeholder="Ex: ABC-123-MC" />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Condutor Designado</label>
                <input value={formState.current_driver || ''} onChange={e => setFormState({...formState, current_driver: e.target.value})} className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl p-4 font-bold text-xs outline-none focus:ring-8 focus:ring-market-blue/5 focus:border-market-blue focus:bg-white transition-all shadow-inner" placeholder="Nome do Responsável" />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Estado da Unidade</label>
                <select value={formState.status} onChange={e => setFormState({...formState, status: e.target.value as any})} className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl p-4 font-black text-[10px] uppercase tracking-[0.2em] outline-none focus:ring-8 focus:ring-market-blue/5 focus:border-market-blue focus:bg-white transition-all shadow-inner cursor-pointer appearance-none">
                  <option value="Disponível">Disponível</option>
                  <option value="Em Serviço">Em Serviço</option>
                  <option value="Manutenção">Manutenção</option>
                  <option value="Lavagem">Lavagem</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Combustível (%)</label>
                <input type="number" min="0" max="100" value={formState.fuel_level} onChange={e => setFormState({...formState, fuel_level: Number(e.target.value)})} className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl p-4 font-bold text-xs outline-none focus:ring-8 focus:ring-market-blue/5 focus:border-market-blue focus:bg-white transition-all shadow-inner" />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Odométro Atual</label>
                <input type="number" value={formState.odometer} onChange={e => setFormState({...formState, odometer: Number(e.target.value)})} className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl p-4 font-bold text-xs outline-none focus:ring-8 focus:ring-market-blue/5 focus:border-market-blue focus:bg-white transition-all shadow-inner" placeholder="Ex: 12000" />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Manutenção Recente</label>
                <input type="date" value={formState.last_maintenance} onChange={e => setFormState({...formState, last_maintenance: e.target.value})} className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl p-4 font-bold text-xs outline-none focus:ring-8 focus:ring-market-blue/5 focus:border-market-blue focus:bg-white transition-all shadow-inner" />
              </div>

              <div className="md:col-span-3 flex gap-4 pt-8 border-t border-slate-100 mt-4">
                <button type="submit" disabled={saving} className="market-button market-button-primary flex-1 py-4 text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-2xl">
                  {saving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> {editingVehicleId ? 'Actualizar Unidade' : 'Integrar na Frota'}</>}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="market-button market-button-outline px-10 py-4 text-[10px] uppercase tracking-[0.2em]">Descartar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FleetView;

