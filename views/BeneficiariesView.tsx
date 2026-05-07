
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
import { db } from '../supabaseClient';
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
      const { data, error } = await db.finance('beneficiaries').select('*').order('name');
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
        await db.finance('beneficiaries').update(form).eq('id', editingId);
      } else {
        await db.finance('beneficiaries').insert([form]);
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
      await db.finance('beneficiaries').delete().eq('id', id);
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
    <div className="space-y-6 animate-in fade-in duration-700 pb-16">
      
      {/* HEADER - Compacted */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-market-blue rounded-xl flex items-center justify-center text-white shadow-xl shadow-market-blue/20">
            <Users2 size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-market-navy tracking-tight leading-none mb-1.5">Entidades & Contactos</h1>
            <p className="text-[10px] text-market-slate font-bold uppercase tracking-widest">Base de Dados Centralizada</p>
          </div>
        </div>
        <button 
          onClick={() => { setEditingId(null); setForm({ name: '', category: 'Cliente', phone: '', email: '' }); setShowModal(true); }}
          className="market-button market-button-primary px-8 py-3 text-[10px] uppercase tracking-widest flex items-center gap-2"
        >
          <Plus size={18} /> Novo Registo
        </button>
      </div>

      {/* FILTROS - Thinner */}
      <div className="market-card p-5 flex flex-col md:flex-row items-center gap-5 border-slate-100">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-market-slate" size={16} />
          <input 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por nome ou email..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 font-medium text-sm outline-none focus:ring-2 focus:ring-market-blue/20 focus:border-market-blue transition-all" 
          />
        </div>
        <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-xl border border-slate-200 min-w-[180px] w-full md:w-auto">
          <Tag size={14} className="text-market-blue" />
          <select 
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-transparent font-bold text-[10px] uppercase tracking-widest text-market-navy outline-none cursor-pointer w-full"
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
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="animate-spin text-market-blue" size={40} />
          <p className="text-[11px] font-bold text-market-slate uppercase tracking-widest animate-pulse">Sincronizando Entidades...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
          {filteredData.map((item) => (
            <div key={item.id} className="market-card p-6 border-slate-100 hover:shadow-xl transition-all relative group">
              <div className="flex justify-between items-start mb-5">
                 <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 shadow-inner text-market-blue">
                    {getCategoryIcon(item.category)}
                 </div>
                 <span className="text-[9px] font-bold text-market-slate uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">{item.category}</span>
              </div>
              
              <h3 className="text-base font-bold text-market-navy leading-tight mb-5 line-clamp-1 group-hover:text-market-blue transition-colors">{item.name}</h3>
              
              <div className="space-y-3 mb-8">
                 <div className="flex items-center gap-3 text-market-slate">
                    <Phone size={14} className="text-market-blue" />
                    <span className="text-[11px] font-medium">{item.phone || 'Sem contacto'}</span>
                 </div>
                 <div className="flex items-center gap-3 text-market-slate">
                    <Mail size={14} className="text-market-blue" />
                    <span className="text-[11px] font-medium truncate">{item.email || 'Sem e-mail'}</span>
                 </div>
              </div>

              <div className="flex items-center gap-3 pt-5 border-t border-slate-50">
                 <button 
                  onClick={() => { setEditingId(item.id); setForm(item); setShowModal(true); }}
                  className="flex-1 py-2.5 bg-slate-50 text-market-slate hover:text-market-blue hover:bg-market-blue/5 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all border border-slate-100"
                 >
                   Editar
                 </button>
                 <button 
                  onClick={() => handleDelete(item.id)}
                  className="p-2.5 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all border border-slate-100"
                 >
                   <Trash2 size={14} />
                 </button>
              </div>
            </div>
          ))}
          
          {filteredData.length === 0 && (
            <div className="col-span-full py-24 bg-white rounded-3xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center">
               <AlertCircle size={40} className="text-slate-200 mb-3" />
               <p className="text-market-slate font-bold uppercase tracking-widest text-[10px]">Nenhum registo encontrado</p>
            </div>
          )}
        </div>
      )}

      {/* MODAL - Simplified padding */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-market-navy/80 backdrop-blur-xl animate-in fade-in">
           <div className="bg-white rounded-3xl p-8 md:p-10 max-w-lg w-full shadow-2xl relative border-t-8 border-market-blue">
              <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 p-2 bg-slate-50 text-slate-400 hover:text-market-navy rounded-xl transition-all border border-slate-100"><X size={24} /></button>
              
              <div className="flex items-center gap-5 mb-10">
                 <div className="w-14 h-14 bg-slate-50 text-market-blue rounded-2xl flex items-center justify-center shadow-inner border border-slate-100"><UserCircle size={32} /></div>
                 <div>
                    <h2 className="text-xl font-bold text-market-navy tracking-tight">{editingId ? 'Actualizar Registo' : 'Nova Entidade'}</h2>
                    <p className="text-[10px] font-bold text-market-slate uppercase tracking-widest mt-1.5">Sincronização Cloud Monte</p>
                 </div>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-market-slate uppercase tracking-widest ml-1">Nome / Razão Social</label>
                    <input 
                      required 
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-medium text-sm outline-none focus:ring-2 focus:ring-market-blue/20 focus:border-market-blue transition-all" 
                    />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-market-slate uppercase tracking-widest ml-1">Categoria</label>
                       <select 
                        value={form.category}
                        onChange={e => setForm({...form, category: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-medium text-sm outline-none focus:ring-2 focus:ring-market-blue/20 focus:border-market-blue transition-all cursor-pointer"
                       >
                          <option>Cliente</option>
                          <option>Fornecedor</option>
                          <option>Parceiro</option>
                       </select>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-market-slate uppercase tracking-widest ml-1">Telefone</label>
                       <input 
                        value={form.phone}
                        onChange={e => setForm({...form, phone: e.target.value})}
                        placeholder="8X XXX XXXX"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-medium text-sm outline-none focus:ring-2 focus:ring-market-blue/20 focus:border-market-blue transition-all" 
                       />
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-market-slate uppercase tracking-widest ml-1">E-mail</label>
                    <input 
                      type="email"
                      value={form.email}
                      onChange={e => setForm({...form, email: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-medium text-sm outline-none focus:ring-2 focus:ring-market-blue/20 focus:border-market-blue transition-all" 
                      placeholder="exemplo@dominio.com"
                    />
                 </div>

                 <div className="pt-8 border-t border-slate-100 flex gap-4">
                    <button 
                      type="submit" 
                      disabled={saving}
                      className="market-button market-button-primary flex-1 py-4 text-[11px] uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                       {saving ? <Loader2 className="animate-spin" size={18} /> : <><Check size={18} /> Gravar Registo</>}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setShowModal(false)}
                      className="market-button market-button-outline px-8 py-4 text-[11px] uppercase tracking-widest"
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
