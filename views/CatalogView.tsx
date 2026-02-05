
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
    <div className="space-y-4 animate-in fade-in duration-500 pb-10 max-w-[1800px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
             <Building2 size={20} />
           </div>
           <div>
             <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">Catálogo Monte</h1>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sincronizado com a Cloud</p>
           </div>
        </div>
        <button 
          onClick={() => { setShowModal(true); setEditingItem(null); setNewProp({title:'', type:'Casa', dealType:'Venda', price:0, location:'', beds:1, baths:1, area:0, description:'', image:''}); }} 
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-md active:scale-95"
        >
          <Plus size={14} /> Novo Imóvel
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sincronizando...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
          {properties.map(prop => (
            <div key={prop.id} className="group bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl transition-all relative">
              <div className="h-28 relative overflow-hidden">
                <img src={prop.image || defaultPlaceholder} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={prop.title} />
                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-md text-[8px] font-black uppercase text-blue-600 shadow-sm">
                  {prop.dealType}
                </div>
              </div>
              <div className="p-3">
                <div className="flex justify-between items-start mb-1.5">
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{prop.type}</p>
                   <p className="text-blue-600 font-black text-[11px]">{Number(prop.price).toLocaleString()} MT</p>
                </div>
                <h3 className="text-[11px] font-black text-slate-900 mb-1.5 truncate leading-none">{prop.title}</h3>
                
                <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold mb-3">
                  <MapPin size={10} className="text-blue-500" /> {prop.location || 'N/D'}
                </div>

                <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-50 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => { setEditingItem(prop); setNewProp(prop); setShowModal(true); }} className="p-1.5 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-md transition-all"><Edit3 size={11} /></button>
                   <button onClick={() => handleDeleteProp(prop.id)} className="p-1.5 bg-slate-50 text-slate-400 hover:text-red-600 rounded-md transition-all"><Trash2 size={11} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal - Compact */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-2xl p-8 max-w-xl w-full shadow-2xl relative border-t-8 border-blue-600">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 bg-slate-50 rounded-lg transition-all"><X size={18} /></button>
            <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
              <Camera size={18} className="text-blue-600" /> Detalhes do Imóvel
            </h2>
            <form onSubmit={handleSaveProperty} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Título Comercial</label>
                  <input required value={newProp.title} onChange={e => setNewProp({...newProp, title: e.target.value})} className="w-full bg-slate-50 border-none rounded-lg p-3 font-bold text-xs outline-none focus:ring-2 focus:ring-blue-100" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Preço Sugerido (MT)</label>
                  <input type="number" required value={newProp.price} onChange={e => setNewProp({...newProp, price: Number(e.target.value)})} className="w-full bg-slate-50 border-none rounded-lg p-3 font-bold text-xs outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Activo</label>
                  <select value={newProp.type} onChange={e => setNewProp({...newProp, type: e.target.value as any})} className="w-full bg-slate-50 rounded-lg p-3 font-bold text-xs border-none outline-none">
                    <option>Casa</option><option>Apartamento</option><option>Hotel</option><option>Terreno</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-2">
                <button disabled={isSubmitting} type="submit" className="flex-1 py-3 bg-blue-600 text-white font-black rounded-lg shadow-lg hover:bg-slate-900 transition-all text-[10px] uppercase tracking-widest active:scale-95">
                  {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={14} /> : 'Guardar Alterações'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-3 bg-slate-100 text-slate-500 font-black rounded-lg text-[10px] uppercase tracking-widest transition-all">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogView;
