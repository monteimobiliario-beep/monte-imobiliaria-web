
import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit3, Trash2, X, Check, Camera, 
  Loader2, AlertTriangle, Building2, MapPin, Ruler, BedDouble,
  CheckCircle2, AlertCircle, Bath, AlignLeft
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Property, PropertyCategory } from '../types';

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
        setMessage({ type: 'success', text: 'Imóvel removido com sucesso.' });
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

    if (Number(newProp.price) <= 0) {
      setMessage({ type: 'error', text: 'O preço deve ser um valor superior a zero.' });
      return;
    }

    if (Number(newProp.area) <= 0) {
      setMessage({ type: 'error', text: 'A área do imóvel deve ser um valor positivo.' });
      return;
    }

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

      setMessage({ 
        type: 'success', 
        text: editingItem ? 'Alterações guardadas com sucesso!' : 'Novo imóvel registado no catálogo Monte Imobiliária.' 
      });
      
      setShowModal(false);
      setEditingItem(null);
      setNewProp({ title: '', type: 'Casa', dealType: 'Venda', price: 0, location: '', beds: 1, baths: 1, area: 0, description: '', image: '' });
      fetchData();

      setTimeout(() => setMessage(null), 5000);
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Erro ao comunicar com a Cloud: ' + (err.message || 'Falha na rede') });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
             <Building2 size={24} />
           </div>
           <div>
             <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestão de Portfólio</h1>
             <p className="text-slate-500 font-medium">Controlo centralizado de ativos imobiliários.</p>
           </div>
        </div>
        <button 
          onClick={() => { 
            setMessage(null); 
            setEditingItem(null); 
            setNewProp({ title: '', type: 'Casa', dealType: 'Venda', price: 0, location: '', beds: 1, baths: 1, area: 0, description: '', image: '' }); 
            setShowModal(true); 
          }} 
          className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-[1.5rem] font-black text-sm shadow-xl hover:bg-blue-700 transition-all hover:scale-105 active:scale-95"
        >
          <Plus size={20} /> Registar Imóvel
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-[2rem] border-l-4 flex items-center justify-between gap-4 animate-in slide-in-from-top-4 shadow-lg ${
          message.type === 'success' 
            ? 'bg-emerald-50 border-emerald-500 text-emerald-800' 
            : 'bg-rose-50 border-rose-500 text-rose-800'
        }`}>
          <div className="flex items-center gap-3">
            {message.type === 'success' ? <CheckCircle2 size={20} className="text-emerald-500" /> : <AlertCircle size={20} className="text-rose-500" />}
            <p className="text-xs font-black uppercase tracking-tight">{message.text}</p>
          </div>
          <button onClick={() => setMessage(null)} className="p-1.5 hover:bg-black/5 rounded-full transition-colors">
            <X size={16} />
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sincronizando Catálogo...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {properties.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center gap-4">
               <Building2 size={40} className="text-slate-200" />
               <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Nenhum imóvel registado.</p>
            </div>
          ) : properties.map(prop => (
            <div key={prop.id} className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-2xl transition-all relative">
              <div className="h-48 relative overflow-hidden">
                <img src={prop.image || defaultPlaceholder} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={prop.title} />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-[8px] font-black uppercase text-blue-600 shadow-sm">
                  {/* Fix: use dealType property as defined in types.ts instead of non-existent deal_type */}
                  {prop.dealType}
                </div>
              </div>
              <div className="p-6">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{prop.type}</p>
                <h3 className="text-base font-black text-slate-900 mb-3 truncate leading-snug">{prop.title}</h3>
                
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold mb-5">
                  <MapPin size={12} className="text-blue-500" /> {prop.location || 'N/A'}
                </div>

                <div className="flex items-center justify-between pt-5 border-t border-slate-50">
                   <div>
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Valor</p>
                     <p className="text-blue-600 font-black text-base">{Number(prop.price).toLocaleString()} MT</p>
                   </div>
                   <div className="flex gap-1.5">
                     <button 
                       onClick={() => { 
                         setMessage(null); 
                         setEditingItem(prop); 
                         setNewProp(prop); 
                         setShowModal(true); 
                       }} 
                       className="p-2.5 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                       title="Editar"
                     >
                       <Edit3 size={14} />
                     </button>
                     <button 
                       onClick={() => handleDeleteProp(prop.id)} 
                       className="p-2.5 bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                       title="Eliminar"
                     >
                       <Trash2 size={14} />
                     </button>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-[3rem] p-8 md:p-12 max-w-3xl w-full shadow-2xl relative overflow-y-auto max-h-[90vh] custom-scrollbar">
            <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 p-1.5 text-slate-400 hover:text-slate-900 bg-slate-50 rounded-xl transition-all">
              <X size={20} />
            </button>
            <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3 tracking-tight">
              <Camera className="text-blue-600" /> {editingItem ? 'Editar Registo' : 'Novo Imóvel'}
            </h2>
            <form onSubmit={handleSaveProperty} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Título</label>
                  <input 
                    required 
                    value={newProp.title} 
                    onChange={e => setNewProp({...newProp, title: e.target.value})} 
                    className="w-full bg-slate-50 border-none rounded-xl p-4 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all" 
                    placeholder="Vivenda Moderna T4..." 
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">URL Imagem</label>
                  <div className="relative">
                    <Camera className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      value={newProp.image} 
                      onChange={e => setNewProp({...newProp, image: e.target.value})} 
                      className="w-full bg-slate-50 rounded-xl p-4 pl-12 border-none font-bold text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all" 
                      placeholder="https://..." 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Preço (MT)</label>
                  <input 
                    type="number" 
                    required 
                    value={newProp.price} 
                    onChange={e => setNewProp({...newProp, price: Number(e.target.value)})} 
                    className="w-full bg-slate-50 border-none rounded-xl p-4 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all" 
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Localização</label>
                  <input 
                    required 
                    value={newProp.location} 
                    onChange={e => setNewProp({...newProp, location: e.target.value})} 
                    className="w-full bg-slate-50 border-none rounded-xl p-4 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all" 
                    placeholder="Bairro Macuti..." 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo</label>
                  <select 
                    value={newProp.type} 
                    onChange={e => setNewProp({...newProp, type: e.target.value as any})} 
                    className="w-full bg-slate-50 rounded-xl p-4 font-bold text-sm border-none outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
                  >
                    <option>Casa</option><option>Apartamento</option><option>Hotel</option><option>Terreno</option><option>Condomínio</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Modalidade</label>
                  <select 
                    value={newProp.dealType} 
                    onChange={e => setNewProp({...newProp, dealType: e.target.value as any})} 
                    className="w-full bg-slate-50 rounded-xl p-4 font-bold text-sm border-none outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
                  >
                    <option value="Venda">Venda</option><option value="Aluguel">Aluguel</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3 md:col-span-2">
                   <div className="space-y-1.5">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">Quartos</label>
                      <input type="number" value={newProp.beds} onChange={e => setNewProp({...newProp, beds: Number(e.target.value)})} className="w-full bg-slate-50 rounded-lg p-3 font-bold text-xs outline-none"/>
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">WCs</label>
                      <input type="number" value={newProp.baths} onChange={e => setNewProp({...newProp, baths: Number(e.target.value)})} className="w-full bg-slate-50 rounded-lg p-3 font-bold text-xs outline-none"/>
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">Área m²</label>
                      <input type="number" value={newProp.area} onChange={e => setNewProp({...newProp, area: Number(e.target.value)})} className="w-full bg-slate-50 rounded-lg p-3 font-bold text-xs outline-none"/>
                   </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  disabled={isSubmitting} 
                  type="submit" 
                  className="flex-1 py-5 bg-blue-600 text-white font-black rounded-xl shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 text-xs active:scale-95 disabled:opacity-70"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <><Check size={20} /> Sincronizar Portfólio</>}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="px-8 py-5 bg-slate-100 text-slate-500 font-black rounded-xl text-xs hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogView;
