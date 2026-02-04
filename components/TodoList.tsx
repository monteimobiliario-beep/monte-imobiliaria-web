
import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  ChevronDown, 
  AlertCircle,
  LayoutList,
  Search,
  Calendar,
  AlertTriangle,
  RotateCcw,
  Loader2,
  X,
  RefreshCw,
  User,
  CheckSquare,
  Square,
  Zap,
  Check,
  AlignLeft,
  Filter,
  CloudUpload,
  Settings2,
  FileText,
  MousePointer2,
  Sparkles,
  Wand2
} from 'lucide-react';
import { Task, Beneficiary } from '../types';
import { supabase } from '../supabaseClient';
import { suggestTaskFromPrompt, enrichTaskDescription } from '../geminiService';

const TodoList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskBeneficiary, setNewTaskBeneficiary] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const [lastSavedId, setLastSavedId] = useState<string | null>(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchTasks();
    fetchBeneficiaries();
  }, []);

  async function fetchBeneficiaries() {
    const { data } = await supabase.from('beneficiaries').select('*').order('name');
    if (data) setBeneficiaries(data);
  }

  async function fetchTasks() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        setTasks(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleAiTaskSuggestion = async () => {
    if (!newTaskTitle.trim()) {
      alert("Digite uma ideia básica no campo de título para a IA expandir.");
      return;
    }
    setIsAiLoading(true);
    try {
      const aiResponse = await suggestTaskFromPrompt(newTaskTitle);
      // Parsing básico da resposta da IA
      const titleMatch = aiResponse.match(/TITULO:\s*(.*)/i);
      const priorityMatch = aiResponse.match(/PRIORIDADE:\s*(.*)/i);
      const descMatch = aiResponse.match(/DESCRICAO:\s*([\s\S]*)/i);

      if (titleMatch) setNewTaskTitle(titleMatch[1].trim());
      
      const suggestedDesc = descMatch ? descMatch[1].trim() : "";
      
      // Cria a tarefa imediatamente com a sugestão da IA
      const newTask = { 
        title: titleMatch ? titleMatch[1].trim() : newTaskTitle, 
        description: suggestedDesc, 
        completed: false, 
        priority: (priorityMatch?.[1].includes('Alta') ? 'Alta' : priorityMatch?.[1].includes('Baixa') ? 'Baixa' : 'Média') as any, 
        due_date: newTaskDueDate || null,
        beneficiary_id: newTaskBeneficiary || null
      };

      const { data, error } = await supabase.from('tasks').insert([newTask]).select();
      if (!error && data) {
        setTasks([data[0], ...tasks]);
        setNewTaskTitle('');
        setExpandedId(data[0].id);
      }
    } catch (err) {
      console.error("AI Error:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleEnrichDescription = async (task: Task) => {
    setIsAiLoading(true);
    try {
      const enriched = await enrichTaskDescription(task.title, task.description);
      await updateDescription(task.id, enriched);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask = { 
      title: newTaskTitle, 
      description: '', 
      completed: false, 
      priority: 'Média' as const, 
      due_date: newTaskDueDate || null,
      beneficiary_id: newTaskBeneficiary || null
    };
    try {
      const { data, error } = await supabase.from('tasks').insert([newTask]).select();
      if (!error && data) {
        setTasks([data[0], ...tasks]);
        setNewTaskTitle('');
        setNewTaskBeneficiary('');
        setNewTaskDueDate('');
        setExpandedId(data[0].id);
      }
    } catch (e) { console.error(e); }
  };

  const toggleComplete = async (task: Task) => {
    try {
      const newStatus = !task.completed;
      await supabase.from('tasks').update({ completed: newStatus }).eq('id', task.id);
      setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: newStatus } : t));
    } catch (e) { console.error(e); }
  };

  const toggleSelectTask = (id: string) => {
    const next = new Set(selectedTaskIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedTaskIds(next);
  };

  const handleSelectAll = () => {
    const visibleTaskIds = filteredTasks.map(t => t.id);
    const allVisibleSelected = visibleTaskIds.every(id => selectedTaskIds.has(id));
    const next = new Set(selectedTaskIds);
    if (allVisibleSelected) visibleTaskIds.forEach(id => next.delete(id));
    else visibleTaskIds.forEach(id => next.add(id));
    setSelectedTaskIds(next);
  };

  const updateDescription = async (id: string, description: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, description } : t));
    setIsSyncing(id);
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(async () => {
      try { 
        await supabase.from('tasks').update({ description }).eq('id', id); 
        setIsSyncing(null);
        setLastSavedId(id);
        setTimeout(() => setLastSavedId(null), 2500);
      } catch (e) { setIsSyncing(null); }
    }, 1000);
  };

  const updatePriority = async (id: string, priority: 'Baixa' | 'Média' | 'Alta') => {
    setTasks(tasks.map(t => t.id === id ? { ...t, priority } : t));
    try { await supabase.from('tasks').update({ priority }).eq('id', id); } catch (e) {}
  };

  const updateDueDate = async (id: string, dueDate: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, due_date: dueDate } : t));
    setIsSyncing(id);
    try { 
      await supabase.from('tasks').update({ due_date: dueDate }).eq('id', id); 
      setIsSyncing(null);
      setLastSavedId(id);
      setTimeout(() => setLastSavedId(null), 2000);
    } catch (e) { setIsSyncing(null); }
  };

  const updateTaskBeneficiary = async (taskId: string, beneficiaryId: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, beneficiary_id: beneficiaryId } : t));
    try { await supabase.from('tasks').update({ beneficiary_id: beneficiaryId }).eq('id', taskId); } catch (e) {}
  };

  const confirmDeletion = async () => {
    if (!deletingTaskId || isDeleting) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', deletingTaskId);
      if (!error) {
        setTasks(tasks.filter(t => t.id !== deletingTaskId));
        setDeletingTaskId(null);
      }
    } catch (e) {} finally { setIsDeleting(false); }
  };

  const handleBulkPriorityUpdate = async (priority: 'Baixa' | 'Média' | 'Alta') => {
    const ids = Array.from(selectedTaskIds);
    if (ids.length === 0) return;
    setIsBulkUpdating(true);
    try {
      await supabase.from('tasks').update({ priority }).in('id', ids);
      setTasks(tasks.map(t => ids.includes(t.id) ? { ...t, priority } : t));
      setSelectedTaskIds(new Set());
    } finally { setIsBulkUpdating(false); }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedTaskIds);
    if (ids.length === 0) return;
    if (!confirm(`Eliminar ${ids.length} tarefas?`)) return;
    setIsBulkUpdating(true);
    try {
      await supabase.from('tasks').delete().in('id', ids);
      setTasks(tasks.filter(t => !ids.includes(t.id)));
      setSelectedTaskIds(new Set());
    } finally { setIsBulkUpdating(false); }
  };

  const getPriorityColorClass = (priority: string, completed: boolean) => {
    if (completed) return 'bg-emerald-400';
    switch (priority) {
      case 'Alta': return 'bg-red-500';
      case 'Média': return 'bg-blue-500';
      case 'Baixa': return 'bg-slate-400';
      default: return 'bg-blue-500';
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = statusFilter === 'all' ? true : statusFilter === 'completed' ? task.completed : !task.completed;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full relative">
      
      {/* BULK BAR */}
      {selectedTaskIds.size > 0 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-xl animate-in slide-in-from-bottom-10 duration-500">
          <div className="bg-slate-900/95 backdrop-blur-xl text-white p-4 rounded-[2.5rem] shadow-2xl flex items-center justify-between border border-white/10">
            <div className="flex items-center gap-4 pl-2">
               <button onClick={() => setSelectedTaskIds(new Set())} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X size={18} /></button>
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Seleção Ativa</p>
                  <p className="text-sm font-bold">{selectedTaskIds.size} Itens</p>
               </div>
            </div>
            <div className="flex items-center gap-2 pr-1">
               {isBulkUpdating ? <Loader2 className="animate-spin text-blue-400 mx-10" /> : (
                 <>
                   <div className="flex items-center bg-white/5 rounded-2xl p-1 gap-1">
                      <button onClick={() => handleBulkPriorityUpdate('Alta')} className="p-2.5 hover:bg-red-500 text-red-400 hover:text-white rounded-xl transition-all"><Zap size={16} /></button>
                      <button onClick={() => handleBulkPriorityUpdate('Média')} className="p-2.5 hover:bg-blue-600 text-blue-400 hover:text-white rounded-xl transition-all"><Zap size={16} /></button>
                   </div>
                   <button onClick={handleBulkDelete} className="p-3 bg-red-500/10 hover:bg-red-500 text-red-500 rounded-2xl transition-all"><Trash2 size={18} /></button>
                 </>
               )}
            </div>
          </div>
        </div>
      )}

      <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
        <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <LayoutList className="text-blue-600" size={20} /> Afazeres Operacionais
        </h3>
        <div className="flex items-center gap-2">
          <button onClick={handleSelectAll} className={`p-2.5 rounded-xl transition-all flex items-center gap-2 ${filteredTasks.length > 0 && filteredTasks.every(t => selectedTaskIds.has(t.id)) ? 'text-blue-600 bg-blue-50 border border-blue-100' : 'text-slate-400 hover:bg-slate-100 border border-transparent'}`}>
            <CheckSquare size={18} />
          </button>
          <button onClick={fetchTasks} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><RefreshCw size={16} /></button>
        </div>
      </div>

      <div className="p-6 border-b border-slate-50 bg-slate-50/40 space-y-4">
        <form onSubmit={handleAddTask} className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 relative group">
               <input 
                 type="text" 
                 value={newTaskTitle}
                 onChange={(e) => setNewTaskTitle(e.target.value)}
                 placeholder="O que precisa ser feito? Use a IA para expandir..."
                 className="w-full bg-white rounded-2xl px-5 py-4 text-sm font-bold border border-slate-200 focus:ring-2 focus:ring-blue-600 outline-none pr-14 transition-all shadow-sm"
               />
               <button 
                 type="button"
                 onClick={handleAiTaskSuggestion}
                 disabled={isAiLoading}
                 className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all disabled:opacity-50 group-hover:rotate-12"
                 title="Gerar Estrutura via IA (Gemini Pro)"
               >
                 {isAiLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
               </button>
            </div>
            <button type="submit" className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 shadow-lg active:scale-95 transition-all flex items-center gap-2">
              <Plus size={24} />
            </button>
          </div>
        </form>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Localizar tarefa..." className="w-full pl-12 pr-4 py-3 text-xs font-bold bg-white rounded-2xl border border-slate-100 outline-none" />
          </div>
          <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-slate-100 shadow-sm shrink-0">
             <button onClick={() => setStatusFilter('all')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${statusFilter === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Todas</button>
             <button onClick={() => setStatusFilter('pending')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${statusFilter === 'pending' ? 'bg-amber-100 text-amber-600' : 'text-slate-400'}`}>Pendentes</button>
             <button onClick={() => setStatusFilter('completed')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${statusFilter === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'text-slate-400'}`}>Feitas</button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-white pb-32">
        {loading ? (
           <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600" /></div>
        ) : filteredTasks.map((task) => {
          const isExpanded = expandedId === task.id;
          const isSelected = selectedTaskIds.has(task.id);
          const assignedBeneficiary = beneficiaries.find(b => b.id === task.beneficiary_id);
          const priorityColor = getPriorityColorClass(task.priority, task.completed);
          
          return (
            <div key={task.id} className={`group border rounded-[2rem] transition-all duration-500 relative overflow-hidden ${task.completed ? 'bg-emerald-50/20 border-emerald-100' : isSelected ? 'border-blue-500 bg-blue-50/40 shadow-lg' : isExpanded ? 'bg-white border-blue-200 shadow-xl' : 'bg-white border-slate-100 hover:border-blue-100'}`}>
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${priorityColor} transition-all`}></div>
              
              <div className="p-6 pl-8 flex items-start gap-4">
                <div className="flex items-center gap-3 pt-1">
                  <button onClick={(e) => { e.stopPropagation(); toggleSelectTask(task.id); }} className={`transition-all transform active:scale-90 ${isSelected ? 'text-blue-600' : 'text-slate-300'}`}>
                    {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                  </button>
                  <button onClick={() => toggleComplete(task)} className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all transform active:scale-75 shadow-sm border ${task.completed ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-white text-slate-300 border-slate-100'}`}>
                    {task.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                  </button>
                </div>
                
                <div className="flex-1 min-w-0">
                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <p className={`text-base font-black truncate transition-all duration-500 ${task.completed ? 'text-emerald-700 opacity-60 line-through' : 'text-slate-900'}`}>{task.title}</p>
                      <div className="flex items-center gap-2 group/date relative">
                         <label className="text-[8px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-2 border bg-slate-50 text-slate-400 border-slate-100 hover:bg-white hover:border-blue-300 cursor-pointer">
                            <Calendar size={10} /> {task.due_date ? new Date(task.due_date).toLocaleDateString('pt-MZ') : 'Definir Data'}
                            <input type="date" className="absolute inset-0 opacity-0 cursor-pointer" value={task.due_date || ''} onChange={(e) => updateDueDate(task.id, e.target.value)} />
                         </label>
                      </div>
                   </div>

                   <div className="relative group/desc mb-3">
                     <textarea 
                        value={task.description} 
                        onChange={e => updateDescription(task.id, e.target.value)}
                        placeholder="Notas ou detalhes técnicos..."
                        rows={isExpanded ? 5 : 2}
                        className={`w-full bg-slate-50/50 rounded-2xl p-4 text-[11px] font-bold text-slate-600 border-none outline-none focus:ring-2 focus:ring-blue-100 transition-all resize-none shadow-inner leading-relaxed ${task.completed ? 'opacity-40 grayscale pointer-events-none' : ''}`}
                     />
                     {!task.completed && (
                        <button 
                          onClick={() => handleEnrichDescription(task)}
                          disabled={isAiLoading}
                          className="absolute bottom-2 right-2 p-2 bg-indigo-600 text-white rounded-lg shadow-xl opacity-0 group-hover/desc:opacity-100 transition-all hover:scale-110 active:scale-95"
                          title="Enriquecer com Gemini Pro"
                        >
                          {isAiLoading && isSyncing === task.id ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                        </button>
                     )}
                   </div>

                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        {assignedBeneficiary && (
                          <div className="flex items-center gap-1.5 text-[9px] font-black px-2.5 py-1 rounded-lg border bg-blue-50 text-blue-600 border-blue-100/50">
                            <User size={10} /> {assignedBeneficiary.name}
                          </div>
                        )}
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${task.completed ? 'text-emerald-500 border-emerald-100' : task.priority === 'Alta' ? 'text-rose-500 border-rose-100' : 'text-slate-400 border-slate-100'}`}>
                          {task.completed ? 'Finalizada' : task.priority}
                        </span>
                     </div>
                     <button onClick={() => setExpandedId(isExpanded ? null : task.id)} className="px-3 py-1.5 rounded-xl transition-all flex items-center gap-2 border bg-white text-slate-500 hover:text-blue-600">
                        <ChevronDown className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} size={12} />
                     </button>
                   </div>
                </div>
              </div>

              {isExpanded && (
                <div className="px-14 pb-10 pt-6 border-t border-slate-100 animate-in slide-in-from-top-2 duration-300 space-y-8 bg-slate-50/30">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Responsável</label>
                        <select 
                          value={task.beneficiary_id || ''} 
                          onChange={e => updateTaskBeneficiary(task.id, e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-[10px] font-black uppercase outline-none shadow-sm cursor-pointer"
                        >
                          <option value="">Não Atribuído</option>
                          {beneficiaries.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Prioridade</label>
                        <div className="flex gap-1.5 bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
                          {(['Baixa', 'Média', 'Alta'] as const).map(p => (
                            <button key={p} onClick={() => updatePriority(task.id, p)} className={`flex-1 py-2.5 text-[8px] font-black uppercase rounded-lg transition-all ${task.priority === p ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>{p}</button>
                          ))}
                        </div>
                      </div>
                   </div>
                   <div className="flex justify-end gap-3 pt-4 border-t border-slate-100/50">
                     <button onClick={() => setDeletingTaskId(task.id)} className="px-5 py-2.5 bg-rose-50 text-rose-500 rounded-xl text-[9px] font-black uppercase hover:bg-rose-500 hover:text-white transition-all">Eliminar Registo</button>
                   </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {deletingTaskId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white rounded-[3.5rem] p-10 max-w-sm w-full shadow-2xl text-center border-t-[10px] border-red-500 animate-in zoom-in-95">
              <h4 className="text-2xl font-black text-slate-900 mb-2">Confirmar?</h4>
              <p className="text-sm font-medium text-slate-500 mb-10">Esta ação é irreversível.</p>
              <div className="flex flex-col gap-3">
                 <button onClick={confirmDeletion} className="w-full py-5 bg-red-500 text-white rounded-[2rem] font-black text-xs uppercase shadow-xl">Eliminar</button>
                 <button onClick={() => setDeletingTaskId(null)} className="w-full py-5 bg-slate-100 text-slate-600 rounded-[2rem] font-black text-xs uppercase">Cancelar</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default TodoList;
