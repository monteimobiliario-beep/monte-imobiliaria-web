
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  UserCircle, 
  Phone, 
  Mail, 
  Tag, 
  Trash2, 
  Edit3, 
  X, 
  Check, 
  Loader2, 
  AlertCircle,
  Building2,
  Users2,
  CheckCircle2,
  UserCheck2,
  Factory
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Beneficiary } from '../types';

const BeneficiariesView: React.FC = () => {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Beneficiary>>({
    name: '',
    category: 'Cliente',
    phone: '',
    email: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('beneficiaries').select('*').order('name');
      if (error) throw error;
      setBeneficiaries(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const filteredData = useMemo(() => {
    return beneficiaries.filter(b => {
      const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           b.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'Todas' || b.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [beneficiaries, searchTerm, categoryFilter]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    setSaving(true);
    try {
      if (editingId) {
        await supabase.from('beneficiaries').update(form).eq('id', editingId);
      } else {
        await supabase.from('beneficiaries').insert([form]);
      }
      setShowModal(false);
      fetchData();
    } catch (e) {
      alert("Erro ao gravar dados.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover esta entidade do sistema?")) return;
    try {
      await supabase.from('beneficiaries').delete().eq('id', id);
      fetchData();
    } catch (e) {
      alert("Erro ao eliminar.");
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Cliente': return <UserCheck2 size={16} className="text-emerald-500" />;
      case 'Fornecedor': return <Factory size={16} className="text-blue-500" />;
      default: return <Building2 size={16} className="text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10">
      
      {/* HEADER - Compacted */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <Users2 size={20} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Entidades & Contactos</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Base de Dados Centralizada</p>
          </div>
        </div>
        <button 
          onClick={() => { setEditingId(null); setForm({ name: '', category: 'Cliente', phone: '', email: '' }); setShowModal(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all"
        >
          <Plus size={16} /> Novo Registo
        </button>
      </div>

      {/* FILTROS - Thinner */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Pesquisar..." 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border-none font-bold text-xs outline-none focus:ring-2 focus:ring-emerald-100" 
          />
        </div>
        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 min-w-[150px]">
          <Tag size={12} className="text-emerald-500" />
          <select 
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-transparent font-black text-[9px] uppercase tracking-widest text-slate-600 outline-none cursor-pointer w-full"
          >
            <option>Todas</option>
            <option>Cliente</option>
            <option>Fornecedor</option>
            <option>Parceiro</option>
          </select>
        </div>
      </div>

      {/* LISTA EM CARDS - More compact grid and padding */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="animate-spin text-emerald-600" size={32} />
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sincronizando...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {filteredData.map((item) => (
            <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all relative group">
              <div className="flex justify-between items-start mb-4">
                 <div className={`p-3 rounded-lg bg-slate-50 shadow-inner`}>
                    {getCategoryIcon(item.category)}
                 </div>
                 <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-md border border-slate-100">{item.category}</span>
              </div>
              
              <h3 className="text-sm font-black text-slate-900 leading-tight mb-4 line-clamp-1">{item.name}</h3>
              
              <div className="space-y-2 mb-6">
                 <div className="flex items-center gap-2 text-slate-500">
                    <Phone size={12} className="text-emerald-500" />
                    <span className="text-[10px] font-bold">{item.phone || 'Sem tel.'}</span>
                 </div>
                 <div className="flex items-center gap-2 text-slate-500">
                    <Mail size={12} className="text-emerald-500" />
                    <span className="text-[10px] font-bold truncate">{item.email || 'Sem e-mail'}</span>
                 </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
                 <button 
                  onClick={() => { setEditingId(item.id); setForm(item); setShowModal(true); }}
                  className="flex-1 py-2 bg-slate-50 text-slate-400 hover:text-emerald-600 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all"
                 >
                   Editar
                 </button>
                 <button 
                  onClick={() => handleDelete(item.id)}
                  className="p-2 bg-slate-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all"
                 >
                   <Trash2 size={12} />
                 </button>
              </div>
            </div>
          ))}
          
          {filteredData.length === 0 && (
            <div className="col-span-full py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center">
               <AlertCircle size={32} className="text-slate-200 mb-2" />
               <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Vazio</p>
            </div>
          )}
        </div>
      )}

      {/* MODAL - Simplified padding */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative border-t-8 border-emerald-600">
              <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 p-2 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-xl transition-all"><X size={20} /></button>
              
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shadow-inner"><UserCircle size={24} /></div>
                 <div>
                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight italic">{editingId ? 'Actualizar Registo' : 'Nova Entidade'}</h2>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Sincronização Cloud Monte</p>
                 </div>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome / Razão Social</label>
                    <input 
                      required 
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-xl p-4 font-bold text-xs outline-none focus:ring-2 focus:ring-emerald-100" 
                    />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoria</label>
                       <select 
                        value={form.category}
                        onChange={e => setForm({...form, category: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-xl p-4 font-bold text-xs outline-none focus:ring-2 focus:ring-emerald-100 cursor-pointer"
                       >
                          <option>Cliente</option>
                          <option>Fornecedor</option>
                          <option>Parceiro</option>
                       </select>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Telefone</label>
                       <input 
                        value={form.phone}
                        onChange={e => setForm({...form, phone: e.target.value})}
                        placeholder="8X XXX XXXX"
                        className="w-full bg-slate-50 border-none rounded-xl p-4 font-bold text-xs outline-none" 
                       />
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail</label>
                    <input 
                      type="email"
                      value={form.email}
                      onChange={e => setForm({...form, email: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-xl p-4 font-bold text-xs outline-none" 
                    />
                 </div>

                 <div className="pt-6 border-t border-slate-100 flex gap-3">
                    <button 
                      type="submit" 
                      disabled={saving}
                      className="flex-1 py-4 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-slate-900 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                    >
                       {saving ? <Loader2 className="animate-spin" size={16} /> : <><Check size={16} /> Gravar</>}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setShowModal(false)}
                      className="px-6 py-4 bg-slate-100 text-slate-500 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
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

export default BeneficiariesView;
