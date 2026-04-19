
import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit3, Trash2, X, Check, Camera, 
  Loader2, Building2, MapPin, 
  CheckCircle2, AlertCircle
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Property } from '../types';

const CatalogView: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Property | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const defaultPlaceholder = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800';

  const [newProp, setNewProp] = useState<Partial<Property>>({
    title: '', 
    type: 'Casa', 
    dealType: 'Venda', 
    price: 0, 
    location: '', 
    beds: 1, 
    baths: 1, 
    area: 0, 
    description: '', 
    image: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('properties').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setProperties(data || []);
    } catch (err: any) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteProp = async (id: string) => {
    if(confirm('Eliminar este imóvel permanentemente?')) {
      try {
        const { error } = await supabase.from('properties').delete().eq('id', id);
        if (error) throw error;
        setMessage({ type: 'success', text: 'Imóvel removido.' });
        setTimeout(() => setMessage(null), 3000);
        fetchData();
      } catch (err: any) {
        setMessage({ type: 'error', text: 'Erro ao eliminar: ' + err.message });
      }
    }
  };

  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    const payload = {
      ...newProp,
      price: Number(newProp.price),
      area: Number(newProp.area),
      beds: Number(newProp.beds),
      baths: Number(newProp.baths),
      image: newProp.image?.trim() || defaultPlaceholder
    };

    try {
      const { error } = editingItem 
        ? await supabase.from('properties').update(payload).eq('id', editingItem.id)
        : await supabase.from('properties').insert([payload]);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Operação concluída com sucesso!' });
      setShowModal(false);
      setEditingItem(null);
      fetchData();
      setTimeout(() => setMessage(null), 5000);
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Erro: ' + (err.message || 'Falha na rede') });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-16 max-w-[1800px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-market-blue rounded-xl flex items-center justify-center text-white shadow-xl shadow-market-blue/20">
             <Building2 size={24} />
           </div>
           <div>
             <h1 className="text-2xl font-bold text-market-navy tracking-tight leading-none mb-1.5">Catálogo Monte</h1>
             <p className="text-[10px] text-market-slate font-bold uppercase tracking-widest">Sincronizado com a Cloud Operacional</p>
           </div>
        </div>
        <button 
          onClick={() => { setShowModal(true); setEditingItem(null); setNewProp({title:'', type:'Casa', dealType:'Venda', price:0, location:'', beds:1, baths:1, area:0, description:'', image:''}); }} 
          className="market-button market-button-primary px-6 py-3 text-[10px] uppercase tracking-widest flex items-center gap-2"
        >
          <Plus size={16} /> Novo Imóvel
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="animate-spin text-market-blue" size={40} />
          <p className="text-[11px] font-bold text-market-slate uppercase tracking-widest animate-pulse">Sincronizando Base de Dados...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {properties.map(prop => (
            <div key={prop.id} className="group market-card overflow-hidden transition-all hover:shadow-xl relative border-slate-100">
              <div className="h-36 relative overflow-hidden">
                <img src={prop.image || defaultPlaceholder} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={prop.title} />
                <div className="absolute top-3 left-3 bg-market-navy/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase text-white shadow-sm">
                  {prop.dealType}
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                   <p className="text-[9px] font-bold text-market-slate uppercase tracking-widest">{prop.type}</p>
                   <p className="text-market-blue font-bold text-xs">{Number(prop.price).toLocaleString()} MT</p>
                </div>
                <h3 className="text-sm font-bold text-market-navy mb-2 truncate leading-none group-hover:text-market-blue transition-colors">{prop.title}</h3>
                
                <div className="flex items-center gap-1.5 text-[10px] text-market-slate font-medium mb-4">
                  <MapPin size={12} className="text-market-blue" /> {prop.location || 'N/D'}
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-50 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => { setEditingItem(prop); setNewProp(prop); setShowModal(true); }} className="p-2 bg-slate-50 text-slate-400 hover:text-market-blue hover:bg-market-blue/5 rounded-lg transition-all border border-slate-100"><Edit3 size={14} /></button>
                   <button onClick={() => handleDeleteProp(prop.id)} className="p-2 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all border border-slate-100"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal - Compact */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-market-navy/80 backdrop-blur-xl animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 md:p-10 max-w-xl w-full shadow-2xl relative border-t-8 border-market-blue">
            <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 p-2 text-slate-400 hover:text-market-navy bg-slate-50 rounded-xl transition-all border border-slate-100"><X size={24} /></button>
            <h2 className="text-xl font-bold text-market-navy mb-8 flex items-center gap-3">
              <Camera size={24} className="text-market-blue" /> Detalhes do Imóvel
            </h2>
            <form onSubmit={handleSaveProperty} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold text-market-slate uppercase tracking-widest ml-1">Título Comercial</label>
                  <input required value={newProp.title} onChange={e => setNewProp({...newProp, title: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-medium text-sm outline-none focus:ring-2 focus:ring-market-blue/20 focus:border-market-blue transition-all" placeholder="Ex: Apartamento T3 na Polana" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-market-slate uppercase tracking-widest ml-1">Preço Sugerido (MT)</label>
                  <input type="number" required value={newProp.price} onChange={e => setNewProp({...newProp, price: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-medium text-sm outline-none focus:ring-2 focus:ring-market-blue/20 focus:border-market-blue transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-market-slate uppercase tracking-widest ml-1">Tipo de Activo</label>
                  <select value={newProp.type} onChange={e => setNewProp({...newProp, type: e.target.value as any})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-medium text-sm outline-none focus:ring-2 focus:ring-market-blue/20 focus:border-market-blue transition-all">
                    <option>Casa</option><option>Apartamento</option><option>Hotel</option><option>Terreno</option>
                  </select>
                </div>
              </div>
              <div className="pt-6 flex gap-3">
                <button disabled={isSubmitting} type="submit" className="market-button market-button-primary flex-1 py-4 text-[11px] uppercase tracking-widest">
                  {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Guardar Alterações'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="market-button market-button-outline px-8 py-4 text-[11px] uppercase tracking-widest">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogView;
