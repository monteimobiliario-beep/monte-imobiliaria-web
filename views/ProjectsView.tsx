
import React, { useState, useEffect } from 'react';
import { 
  Calendar, Users, DollarSign, ArrowRight, Clock, 
  Loader2, Plus, X, Save, Edit3, Trash2, Camera, 
  CheckCircle2, AlertTriangle, Building, AlertCircle,
  UserPlus, TrendingUp, TrendingDown
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Project } from '../types';

const ProjectsView: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState<Partial<Project>>({
    name: '',
    status: 'Planejado',
    budget: 0,
    spent: 0,
    deadline: '',
    image: '',
    team: []
  });

  const [teamInput, setTeamInput] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error) setProjects(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenModal = (project: Project | null = null) => {
    setMessage(null);
    if (project) {
      setEditingProject(project);
      setFormData(project);
      setTeamInput(project.team ? project.team.join(', ') : '');
    } else {
      setEditingProject(null);
      setFormData({
        name: '',
        status: 'Planejado',
        budget: 0,
        spent: 0,
        deadline: '',
        image: '',
        team: []
      });
      setTeamInput('');
    }
    setShowModal(true);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const teamArray = teamInput.split(',').map(name => name.trim()).filter(name => name !== '');

    const payload = {
      ...formData,
      team: teamArray,
      image: formData.image || 'https://images.unsplash.com/photo-1503387762-592dea58ef23?auto=format&fit=crop&q=80&w=800'
    };

    try {
      const { error } = editingProject 
        ? await supabase.from('projects').update(payload).eq('id', editingProject.id)
        : await supabase.from('projects').insert([payload]);

      if (error) throw error;

      setMessage({ 
        type: 'success', 
        text: editingProject ? 'Projeto atualizado com sucesso!' : 'Obra iniciada com sucesso na Cloud.' 
      });
      setShowModal(false);
      fetchProjects();
      
      setTimeout(() => setMessage(null), 5000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro ao processar solicitação.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este projeto?')) {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (!error) {
        setMessage({ type: 'success', text: 'Projeto removido com sucesso.' });
        setTimeout(() => setMessage(null), 3000);
        fetchProjects();
      }
    }
  };

  // Função centralizada para estilos de progresso solicitada
  const getProgressStyles = (percent: number) => {
    if (percent >= 100) {
      return { 
        bar: 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]', 
        text: 'text-rose-600',
        label: 'Excedido' 
      };
    }
    if (percent >= 80) {
      return { 
        bar: 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.3)]', 
        text: 'text-amber-600',
        label: 'Crítico' 
      };
    }
    return { 
      bar: 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]', 
      text: 'text-emerald-600',
      label: 'Saudável' 
    };
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
            <Building size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Projetos & Obras</h1>
            <p className="text-slate-500 font-medium">Controle financeiro e execução em tempo real.</p>
          </div>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-[2rem] font-black text-sm shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all hover:scale-105"
        >
          <Plus size={20} /> Iniciar Obra
        </button>
      </div>

      {message && (
        <div className={`p-5 rounded-[2rem] border-l-4 flex items-center justify-between gap-4 animate-in slide-in-from-top-4 ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-rose-50 border-rose-500 text-rose-800'
        }`}>
          <div className="flex items-center gap-4">
            {message.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            <p className="text-sm font-black uppercase tracking-tight">{message.text}</p>
          </div>
          <button onClick={() => setMessage(null)} className="p-2 hover:bg-black/5 rounded-full transition-colors"><X size={18} /></button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => {
            const spentPercent = project.budget > 0 ? Math.round((Number(project.spent) / Number(project.budget)) * 100) : 0;
            const remaining = Number(project.budget) - Number(project.spent);
            const isOverBudget = spentPercent >= 100;
            const styles = getProgressStyles(spentPercent);

            return (
              <div key={project.id} className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-500 group">
                <div className="h-48 relative overflow-hidden">
                  <img src={project.image || 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80&w=800'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={project.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-xl text-[10px] font-black uppercase text-blue-600 shadow-sm">
                    {project.status}
                  </div>
                  <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-white">
                    <div className="flex -space-x-2">
                      {project.team?.slice(0, 3).map((member, i) => (
                        <img key={i} src={`https://picsum.photos/seed/${member}/100`} className="w-8 h-8 rounded-full border-2 border-white object-cover" title={member} alt="" />
                      ))}
                      {project.team && project.team.length > 3 && (
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-800 flex items-center justify-center text-[10px] font-black">+{project.team.length - 3}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase">
                       <Calendar size={12} className="text-blue-400" /> {project.deadline}
                    </div>
                  </div>
                </div>

                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-xl font-black text-slate-900 line-clamp-1 flex-1">{project.name}</h3>
                    <div className="flex gap-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenModal(project)} className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-lg transition-all"><Edit3 size={16} /></button>
                      <button onClick={() => handleDeleteProject(project.id)} className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <DollarSign size={10} className="text-blue-500" /> Orçamento
                      </p>
                      <p className="text-sm font-black text-slate-900">{Number(project.budget).toLocaleString()} MT</p>
                    </div>
                    <div className={`p-4 rounded-2xl ${isOverBudget ? 'bg-rose-50' : 'bg-blue-50'}`}>
                      <p className={`text-[9px] font-black uppercase tracking-widest mb-1 flex items-center gap-1 ${isOverBudget ? 'text-rose-600' : 'text-blue-600'}`}>
                        {isOverBudget ? <TrendingUp size={10} /> : <TrendingDown size={10} />} Saldo
                      </p>
                      <p className={`text-sm font-black ${isOverBudget ? 'text-rose-700' : 'text-blue-700'}`}>
                        {remaining.toLocaleString()} MT
                      </p>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <div className="flex justify-between items-end mb-3">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Saúde Financeira</p>
                        <p className={`text-sm font-black ${styles.text} ${isOverBudget ? 'animate-pulse' : ''}`}>
                          {styles.label} ({spentPercent}%)
                        </p>
                      </div>
                      <div className={`text-xl font-black tracking-tighter ${styles.text}`}>
                        {spentPercent}%
                      </div>
                    </div>
                    
                    <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden relative shadow-inner">
                      <div 
                        className={`h-full transition-all duration-1000 ease-out relative ${styles.bar}`} 
                        style={{ width: `${Math.min(spentPercent, 100)}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 blur-[1px]"></div>
                        <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-r from-transparent to-white/30 skew-x-[-20deg]"></div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between mt-3 text-[10px] font-bold">
                      <span className="text-slate-400 uppercase">Gasto: <span className="text-slate-900">{Number(project.spent).toLocaleString()} MT</span></span>
                      {isOverBudget && (
                        <span className="text-rose-600 flex items-center gap-1 uppercase font-black">
                          <AlertTriangle size={10}/> Risco Crítico
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-[4rem] p-12 max-w-2xl w-full shadow-2xl relative overflow-y-auto max-h-[90vh]">
            <button onClick={() => setShowModal(false)} className="absolute top-10 right-10 p-2 text-slate-400 hover:text-slate-900 bg-slate-50 rounded-xl"><X size={24} /></button>
            <h2 className="text-2xl font-black text-slate-900 mb-10 flex items-center gap-3"><Building className="text-blue-600" /> {editingProject ? 'Editar Projeto' : 'Nova Obra Monte'}</h2>
            <form onSubmit={handleSaveProject} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Projeto</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-5 border-none focus:ring-2 focus:ring-blue-600 font-bold outline-none" placeholder="Ex: Reforma Condomínio Mar" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><UserPlus size={14} className="text-blue-600" /> Equipa (Nomes separados por vírgula)</label>
                  <input value={teamInput} onChange={e => setTeamInput(e.target.value)} className="w-full bg-slate-50 rounded-2xl p-5 border-none focus:ring-2 focus:ring-blue-600 font-bold outline-none" placeholder="Ex: Ana Silva, Bruno Costa" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">URL da Imagem da Obra</label>
                  <div className="relative">
                    <Camera className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-5 pl-14 border-none focus:ring-2 focus:ring-blue-600 font-bold outline-none" placeholder="https://images.unsplash.com/..." />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Orçamento Total (MT)</label>
                  <input required type="number" value={formData.budget} onChange={e => setFormData({...formData, budget: Number(e.target.value)})} className="w-full bg-slate-50 rounded-2xl p-5 border-none focus:ring-2 focus:ring-blue-600 font-bold outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor Gasto Atual (MT)</label>
                  <input required type="number" value={formData.spent} onChange={e => setFormData({...formData, spent: Number(e.target.value)})} className="w-full bg-slate-50 rounded-2xl p-5 border-none focus:ring-2 focus:ring-blue-600 font-bold outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status Atual</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full bg-slate-50 rounded-2xl p-5 border-none font-bold outline-none cursor-pointer">
                    <option>Planejado</option><option>Em Andamento</option><option>Concluído</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data de Entrega</label>
                  <input required type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-5 border-none focus:ring-2 focus:ring-blue-600 font-bold outline-none" />
                </div>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full py-6 bg-blue-600 text-white font-black rounded-[2.5rem] shadow-2xl hover:bg-blue-700 transition-all flex items-center justify-center disabled:opacity-50">
                {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Save size={20} className="mr-2" />}
                {editingProject ? 'Guardar Alterações' : 'Iniciar Projeto na Cloud'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsView;
