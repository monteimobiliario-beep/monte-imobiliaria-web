
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
  MoreVertical,
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
      case 'Cliente': return <UserCheck2 size={18} className="text-emerald-500" />;
      case 'Fornecedor': return <Factory size={18} className="text-blue-500" />;
      default: return <Building2 size={18} className="text-slate-400" />;
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
            <Users2 size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Entidades & Contactos</h1>
            <p className="text-slate-500 font-medium italic">Gestão centralizada de clientes e fornecedores Monte.</p>
          </div>
        </div>
        <button 
          onClick={() => { setEditingId(null); setForm({ name: '', category: 'Cliente', phone: '', email: '' }); setShowModal(true); }}
          className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl active:scale-95"
        >
          <Plus size={18} /> Novo Registo
        </button>
      </div>

      {/* FILTROS */}
      <div className="bg-white p-6 rounded-[3rem] border border-slate-100 shadow-xl flex flex-col md:flex-row items-center gap-6">
        <div className="relative flex-1">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por nome ou e-mail..." 
            className="w-full pl-16 pr-6 py-5 bg-slate-50 rounded-[2rem] border-none font-bold text-sm outline-none focus:ring-4 focus:ring-emerald-100 shadow-inner" 
          />
        </div>
        <div className="flex items-center gap-3 bg-slate-50 px-6 py-2 rounded-[2rem] border border-slate-100 min-w-[200px]">
          <Tag size={16} className="text-emerald-500" />
          <select 
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-transparent font-black text-[10px] uppercase tracking-widest text-slate-600 outline-none py-3 cursor-pointer w-full"
          >
            <option>Todas</option>
            <option>Cliente</option>
            <option>Fornecedor</option>
            <option>Parceiro</option>
            <option>Governo</option>
          </select>
        </div>
      </div>

      {/* LISTA EM CARDS */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-emerald-600" size={48} />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sincronizando Base de Dados...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredData.map((item) => (
            <div key={item.id} className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all relative group">
              <div className="flex justify-between items-start mb-6">
                 <div className={`p-4 rounded-2xl bg-slate-50 shadow-inner group-hover:scale-110 transition-transform`}>
                    {getCategoryIcon(item.category)}
                 </div>
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">{item.category}</span>
              </div>
              
              <h3 className="text-lg font-black text-slate-900 leading-tight mb-6 line-clamp-1">{item.name}</h3>
              
              <div className="space-y-4 mb-8">
                 <div className="flex items-center gap-3 text-slate-500">
                    <Phone size={14} className="text-emerald-500" />
                    <span className="text-xs font-bold">{item.phone || 'Sem telefone'}</span>
                 </div>
                 <div className="flex items-center gap-3 text-slate-500">
                    <Mail size={14} className="text-emerald-500" />
                    <span className="text-xs font-bold truncate">{item.email || 'Sem e-mail'}</span>
                 </div>
              </div>

              <div className="flex items-center gap-2 pt-6 border-t border-slate-50">
                 <button 
                  onClick={() => { setEditingId(item.id); setForm(item); setShowModal(true); }}
                  className="flex-1 py-3 bg-slate-50 text-slate-400 hover:text-emerald-600 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                 >
                   Editar
                 </button>
                 <button 
                  onClick={() => handleDelete(item.id)}
                  className="p-3 bg-slate-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all"
                 >
                   <Trash2 size={16} />
                 </button>
              </div>
            </div>
          ))}
          
          {filteredData.length === 0 && (
            <div className="col-span-full py-32 bg-white rounded-[4rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center">
               <AlertCircle size={48} className="text-slate-200 mb-4" />
               <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">Nenhuma entidade encontrada.</p>
            </div>
          )}
        </div>
      )}

      {/* MODAL ADICIONAR / EDITAR */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white rounded-[4rem] p-10 md:p-14 max-w-2xl w-full shadow-2xl relative border-t-[16px] border-emerald-600">
              <button onClick={() => setShowModal(false)} className="absolute top-10 right-10 p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all"><X size={24} /></button>
              
              <div className="flex items-center gap-5 mb-12">
                 <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-[1.5rem] flex items-center justify-center shadow-inner"><UserCircle size={32} /></div>
                 <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">{editingId ? 'Actualizar Entidade' : 'Novo Registo Monte'}</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mt-2">Dossiê de Contactos Digital</p>
                 </div>
              </div>

              <form onSubmit={handleSave} className="space-y-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nome Completo / Razão Social</label>
                    <input 
                      required 
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl p-6 font-bold text-sm outline-none focus:ring-4 focus:ring-emerald-100 shadow-inner" 
                    />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Categoria</label>
                       <select 
                        value={form.category}
                        onChange={e => setForm({...form, category: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-2xl p-6 font-bold text-sm outline-none focus:ring-4 focus:ring-emerald-100 shadow-inner cursor-pointer"
                       >
                          <option>Cliente</option>
                          <option>Fornecedor</option>
                          <option>Parceiro</option>
                          <option>Prestador</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Telefone (+258)</label>
                       <input 
                        value={form.phone}
                        onChange={e => setForm({...form, phone: e.target.value})}
                        placeholder="8X XXX XXXX"
                        className="w-full bg-slate-50 border-none rounded-2xl p-6 font-bold text-sm outline-none focus:ring-4 focus:ring-emerald-100 shadow-inner" 
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">E-mail</label>
                    <input 
                      type="email"
                      value={form.email}
                      onChange={e => setForm({...form, email: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl p-6 font-bold text-sm outline-none focus:ring-4 focus:ring-emerald-100 shadow-inner" 
                    />
                 </div>

                 <div className="pt-8 border-t border-slate-100 flex gap-4">
                    <button 
                      type="submit" 
                      disabled={saving}
                      className="flex-1 py-6 bg-emerald-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-slate-900 transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50"
                    >
                       {saving ? <Loader2 className="animate-spin" size={20} /> : <><Check size={20} /> Sincronizar Registo</>}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setShowModal(false)}
                      className="px-10 py-6 bg-slate-100 text-slate-500 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
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
