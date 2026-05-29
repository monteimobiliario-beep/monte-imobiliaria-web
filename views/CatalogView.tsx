
import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit3, Trash2, X, Check, Camera, 
  Loader2, Building2, MapPin, Star,
  CheckCircle2, AlertCircle, Image as ImageIcon
} from 'lucide-react';
import { supabase, db } from '../supabaseClient';
import { Property } from '../types';
import { ImageUploadField } from '../components/ImageUploadField';
import { formatImageUrl } from '../imageUtils';

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
    deal_type: 'Venda', 
    price: 0, 
    location: '', 
    bedrooms: 1, 
    bathrooms: 1, 
    area: 0, 
    description: '', 
    image: '',
    gallery: [],
    featured: false,
    status: 'Disponível',
    is_active: true,
    is_promo: false,
    old_price: undefined
  });

  const [galleryInput, setGalleryInput] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const { data, error } = await db.catalog('properties').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setProperties((data || []).map(p => ({
        ...p,
        gallery: Array.isArray(p.gallery) ? p.gallery : (typeof p.gallery === 'string' ? JSON.parse(p.gallery) : []),
        is_active: p.is_active !== false, // Fallback to true if null/undefined
        is_promo: !!p.is_promo,
        old_price: p.old_price !== null ? Number(p.old_price) : undefined
      })));
    } catch (err: any) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteProp = async (id: string) => {
    if(confirm('Eliminar este imóvel permanentemente?')) {
      try {
        const { error } = await db.catalog('properties').delete().eq('id', id);
        if (error) throw error;
        setMessage({ type: 'success', text: 'Imóvel removido.' });
        setTimeout(() => setMessage(null), 3000);
        fetchData();
      } catch (err: any) {
        setMessage({ type: 'error', text: 'Erro ao eliminar: ' + err.message });
      }
    }
  };

  const handleAddGalleryImage = () => {
    if (galleryInput.trim()) {
      setNewProp(prev => ({
        ...prev,
        gallery: [...(prev.gallery || []), galleryInput.trim()]
      }));
      setGalleryInput('');
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    setNewProp(prev => ({
      ...prev,
      gallery: (prev.gallery || []).filter((_, i) => i !== index)
    }));
  };

  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsSubmitting(true);
    let attempts = 0;
    const maxAttempts = 2;

    const executeSave = async (): Promise<void> => {
      try {
        const payload: any = {
          ...newProp,
          price: Number(newProp.price),
          area: Number(newProp.area),
          bedrooms: Number(newProp.bedrooms),
          bathrooms: Number(newProp.bathrooms),
          image: newProp.image?.trim() || defaultPlaceholder,
          gallery: newProp.gallery || [],
          is_active: newProp.is_active !== undefined ? newProp.is_active : true,
          is_promo: newProp.is_promo !== undefined ? newProp.is_promo : false,
          old_price: newProp.is_promo && newProp.old_price ? Number(newProp.old_price) : null
        };

        const result = editingItem 
          ? await db.catalog('properties').update(payload).eq('id', editingItem.id)
          : await db.catalog('properties').insert([payload]);

        if (result.error) {
          const errMsg = result.error.message || '';
          // If custom columns don't exist in Supabase yet, retry with sanitized standard payload gracefully
          if (errMsg.includes('column') || errMsg.includes('not exist') || errMsg.includes('missing')) {
            console.warn("New columns not found in database, retrying without is_active / promo fields...");
            const safePayload = { ...payload };
            delete safePayload.is_active;
            delete safePayload.is_promo;
            delete safePayload.old_price;

            const retryResult = editingItem
              ? await db.catalog('properties').update(safePayload).eq('id', editingItem.id)
              : await db.catalog('properties').insert([safePayload]);

            if (retryResult.error) throw retryResult.error;
            setMessage({ type: 'success', text: 'Imóvel guardado! (Nota: Adicione as novas colunas is_active / promo no Supabase para ativar controlo completo)' });
          } else {
            throw result.error;
          }
        } else {
          setMessage({ type: 'success', text: 'Operação concluída com sucesso!' });
        }

        setShowModal(false);
        setEditingItem(null);
        fetchData();
        setTimeout(() => setMessage(null), 5000);
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
      setMessage({ type: 'error', text: 'Erro: ' + (err.message || 'Falha na rede') });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-16 max-w-[1800px] mx-auto">
      {message && (
        <div className={`fixed top-24 right-8 z-[150] p-4 rounded-2xl flex items-center gap-3 shadow-2xl animate-in slide-in-from-right-10 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="text-sm font-bold">{message.text}</span>
        </div>
      )}

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
          onClick={() => { 
            setShowModal(true); 
            setEditingItem(null); 
            setNewProp({title:'', type:'Casa', deal_type:'Venda', price:0, location:'', bedrooms:1, bathrooms:1, area:0, description:'', image:'', gallery: [], featured: false, status: 'Disponível'}); 
          }} 
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
            <div key={prop.id} className={`group market-card overflow-hidden transition-all hover:shadow-xl relative border border-slate-100 bg-white ${prop.is_active === false ? 'opacity-60 bg-slate-50' : ''}`}>
              <div className="h-40 relative overflow-hidden">
                <img 
                  src={formatImageUrl(prop.image || defaultPlaceholder)} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  alt={prop.title} 
                  referrerPolicy="no-referrer" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = defaultPlaceholder;
                  }}
                />
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                  <div className="bg-market-navy/90 backdrop-blur-md px-2.5 py-1 rounded text-[8px] font-bold uppercase text-white shadow-sm w-fit">
                    {prop.deal_type}
                  </div>
                  {prop.is_active === false ? (
                    <div className="bg-slate-500/90 backdrop-blur-md px-2.5 py-1 rounded text-[8px] font-bold uppercase text-white shadow-sm w-fit">
                      Inativo (Oculto)
                    </div>
                  ) : (
                    <div className="bg-emerald-600/90 backdrop-blur-md px-2.5 py-1 rounded text-[8px] font-bold uppercase text-white shadow-sm w-fit">
                      Ativo
                    </div>
                  )}
                  {prop.is_promo && (
                    <div className="bg-rose-600/95 backdrop-blur-md px-2.5 py-1 rounded text-[8px] font-bold uppercase text-white shadow-sm animate-pulse flex items-center gap-1 w-fit">
                      % Promoção
                    </div>
                  )}
                  {prop.featured && (
                    <div className="bg-market-gold/90 backdrop-blur-md px-2.5 py-1 rounded text-[8px] font-bold uppercase text-white shadow-sm flex items-center gap-1 w-fit">
                      <Star size={8} fill="currentColor" /> Destaque
                    </div>
                  )}
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                   <p className="text-[9px] font-bold text-market-slate uppercase tracking-widest">{prop.type}</p>
                   <div className="text-right">
                     {prop.is_promo && prop.old_price && (
                       <p className="text-[8px] line-through text-slate-400 font-medium mb-0.5">{Number(prop.old_price).toLocaleString()} MT</p>
                     )}
                     <p className="text-market-blue font-bold text-xs">{Number(prop.price).toLocaleString()} MT</p>
                   </div>
                </div>
                <h3 className="text-sm font-bold text-market-navy mb-2 truncate leading-none group-hover:text-market-blue transition-colors">{prop.title}</h3>
                
                <div className="flex items-center gap-1.5 text-[9px] text-market-slate font-medium mb-4">
                  <MapPin size={10} className="text-market-blue" /> {prop.location || 'N/D'}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                   <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400">
                     <span>{prop.bedrooms} Q</span>
                     <span>{prop.area}m²</span>
                   </div>
                   <div className="flex items-center gap-1.5">
                     <button onClick={() => { setEditingItem(prop); setNewProp(prop); setShowModal(true); }} className="p-1.5 bg-slate-50 text-slate-400 hover:text-market-blue hover:bg-market-blue/5 rounded-lg transition-all border border-slate-100"><Edit3 size={12} /></button>
                     <button onClick={() => handleDeleteProp(prop.id)} className="p-1.5 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all border border-slate-100"><Trash2 size={12} /></button>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal - Robust Management */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-market-navy/80 backdrop-blur-xl animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 md:p-10 max-w-4xl w-full shadow-2xl relative border-t-8 border-market-blue max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 p-2 text-slate-400 hover:text-market-navy bg-slate-50 rounded-xl transition-all border border-slate-100"><X size={24} /></button>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-market-navy flex items-center gap-3">
                <Camera size={28} className="text-market-blue" /> {editingItem ? 'Editar Ativo' : 'Novo Ativo Imobiliário'}
              </h2>
              <p className="text-[10px] text-market-slate font-bold uppercase mt-1 tracking-widest">Preencha todos os campos técnicos</p>
            </div>

            <form onSubmit={handleSaveProperty} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold text-market-slate uppercase tracking-widest ml-1">Título Comercial</label>
                  <input required value={newProp.title} onChange={e => setNewProp({...newProp, title: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-medium text-sm outline-none focus:ring-2 focus:ring-market-blue/20 focus:border-market-blue transition-all" placeholder="Ex: Apartamento T3 na Polana" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-market-slate uppercase tracking-widest ml-1">Tipo de Activo</label>
                  <select value={newProp.type} onChange={e => setNewProp({...newProp, type: e.target.value as any})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-medium text-sm outline-none focus:ring-2 focus:ring-market-blue/20 focus:border-market-blue transition-all">
                    <option>Casa</option><option>Apartamento</option><option>Hotel</option><option>Terreno</option><option>Guest House</option><option>Condomínio</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-market-slate uppercase tracking-widest ml-1">Finalidade</label>
                  <select value={newProp.deal_type} onChange={e => setNewProp({...newProp, deal_type: e.target.value as any})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-medium text-sm outline-none focus:ring-2 focus:ring-market-blue/20 focus:border-market-blue transition-all">
                    <option value="Venda">Venda</option>
                    <option value="Aluguel">Aluguel</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-market-slate uppercase tracking-widest ml-1">
                    {newProp.is_promo ? 'Preço Promocional / Recente (MT)' : 'Preço (MT)'}
                  </label>
                  <input type="number" required value={newProp.price} onChange={e => setNewProp({...newProp, price: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-medium text-sm outline-none focus:ring-2 focus:ring-market-blue/20 focus:border-market-blue transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-market-slate uppercase tracking-widest ml-1">Área (m²)</label>
                  <input type="number" required value={newProp.area} onChange={e => setNewProp({...newProp, area: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-medium text-sm outline-none focus:ring-2 focus:ring-market-blue/20 focus:border-market-blue transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-market-slate uppercase tracking-widest ml-1">Endereço / Localização</label>
                  <input required value={newProp.location} onChange={e => setNewProp({...newProp, location: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-medium text-sm outline-none focus:ring-2 focus:ring-market-blue/20 focus:border-market-blue transition-all" placeholder="Ex: Beira, Alto da Manga" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-market-slate uppercase tracking-widest ml-1">Quartos</label>
                  <input type="number" value={newProp.bedrooms} onChange={e => setNewProp({...newProp, bedrooms: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-medium text-sm outline-none focus:ring-2 focus:ring-market-blue/20 focus:border-market-blue transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-market-slate uppercase tracking-widest ml-1">Banheiros</label>
                  <input type="number" value={newProp.bathrooms} onChange={e => setNewProp({...newProp, bathrooms: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-medium text-sm outline-none focus:ring-2 focus:ring-market-blue/20 focus:border-market-blue transition-all" />
                </div>

                <div className="md:col-span-3">
                  <ImageUploadField 
                    label="Imagem de Destaque (Principal)"
                    value={newProp.image || ''}
                    onChange={(url) => setNewProp({...newProp, image: url})}
                    placeholder="Cole um link (Google Drive, etc) ou carregue da galeria..."
                  />
                </div>

                <div className="md:col-span-3 space-y-4">
                  <label className="text-[10px] font-bold text-market-navy uppercase tracking-widest ml-1">Galeria de Imagens Complementares (Álbum)</label>
                  
                  <div className="flex flex-col gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <ImageUploadField 
                          label="Adicionar Nova Foto"
                          value={galleryInput}
                          onChange={setGalleryInput}
                          placeholder="Link da imagem..."
                        />
                      </div>
                      <button 
                        type="button" 
                        onClick={handleAddGalleryImage} 
                        disabled={!galleryInput}
                        className="self-end px-6 h-[46px] bg-market-navy text-white rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all hover:bg-market-blue disabled:opacity-50"
                      >
                        Adicionar ao Álbum
                      </button>
                    </div>
                  
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                      {newProp.gallery?.map((url, i) => (
                        <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                          <img src={formatImageUrl(url) || undefined} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                          <button 
                            type="button" 
                            onClick={() => handleRemoveGalleryImage(i)}
                            className="absolute inset-0 bg-rose-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="md:col-span-3 space-y-1.5">
                  <label className="text-[10px] font-bold text-market-slate uppercase tracking-widest ml-1">Descrição do Ativo</label>
                  <textarea value={newProp.description} onChange={e => setNewProp({...newProp, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 font-medium text-sm outline-none focus:ring-2 focus:ring-market-blue/20 focus:border-market-blue transition-all h-32 resize-none" placeholder="Narritiva comercial do imóvel..." />
                </div>

                {/* Painel de Visibilidade e Promoção */}
                <div className="md:col-span-3 bg-slate-50/50 p-6 rounded-2xl border border-slate-150 space-y-6">
                  <h3 className="text-[11px] font-bold text-market-navy uppercase tracking-wider border-b border-slate-100 pb-2">Configurações de Visibilidade & Preço Promocional</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-market-slate uppercase tracking-widest ml-1">Estado de Visibilidade do Imóvel</label>
                      <select 
                        value={newProp.is_active === false ? 'false' : 'true'} 
                        onChange={e => setNewProp({...newProp, is_active: e.target.value === 'true'})} 
                        className="w-full bg-white border border-slate-200 rounded-xl p-4 font-medium text-sm outline-none focus:ring-2 focus:ring-market-blue/20 focus:border-market-blue transition-all cursor-pointer"
                      >
                        <option value="true">🟢 Ativo (Aparece no site para Clientes)</option>
                        <option value="false">🔴 Inativo (Ocultado dos Clientes / Rascunho)</option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-market-slate uppercase tracking-widest ml-1 block">Campanha Promocional</label>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-12 h-6 rounded-full transition-all relative ${newProp.is_promo ? 'bg-rose-500' : 'bg-slate-200'}`}>
                           <input type="checkbox" checked={!!newProp.is_promo} onChange={e => setNewProp({...newProp, is_promo: e.target.checked})} className="hidden" />
                           <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${newProp.is_promo ? 'left-7' : 'left-1'}`}></div>
                        </div>
                        <span className="text-[10px] font-bold text-market-navy uppercase tracking-widest">Ativar Preço de Promoção</span>
                      </label>
                    </div>
                  </div>

                  {newProp.is_promo && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 animate-in fade-in slide-in-from-top-1">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-rose-600 uppercase tracking-widest ml-1 flex items-center gap-1">
                          Preço Anterior (Antes da Promoção em MT)
                        </label>
                        <input 
                          type="number" 
                          required={!!newProp.is_promo} 
                          value={newProp.old_price || ''} 
                          onChange={e => setNewProp({...newProp, old_price: e.target.value ? Number(e.target.value) : undefined})} 
                          className="w-full bg-white border border-rose-200 text-slate-500 line-through rounded-xl p-4 font-medium text-sm outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-mono" 
                          placeholder="Ex: Preço de 1200000 antes da promoção"
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest ml-1">
                          Preço de Promoção Atual (Recente em MT)
                        </label>
                        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-150 font-mono font-bold text-[13px] text-emerald-700">
                          {newProp.price ? Number(newProp.price).toLocaleString() : '0'} MT
                        </div>
                        <p className="text-[9px] text-slate-400 font-medium">Nota: O preço acima é definido no campo principal "Preço".</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="md:col-span-3">
                   <label className="flex items-center gap-3 cursor-pointer group">
                     <div className={`w-12 h-6 rounded-full transition-all relative ${newProp.featured ? 'bg-market-gold' : 'bg-slate-200'}`}>
                        <input type="checkbox" checked={newProp.featured} onChange={e => setNewProp({...newProp, featured: e.target.checked})} className="hidden" />
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${newProp.featured ? 'left-7' : 'left-1'}`}></div>
                     </div>
                     <span className="text-[10px] font-bold text-market-navy uppercase tracking-widest">Activo em Destaque na Home</span>
                   </label>
                </div>
              </div>

              <div className="pt-8 flex gap-4 border-t border-slate-100">
                <button disabled={isSubmitting} type="submit" className="market-button market-button-primary flex-1 py-5 text-[11px] uppercase tracking-[0.2em]">
                  {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={24} /> : (editingItem ? 'Actualizar Registo' : 'Confirmar Cadastro')}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="market-button market-button-outline px-10 py-5 text-[11px] uppercase tracking-[0.2em]">Descartar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogView;
