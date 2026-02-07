
import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, ArrowRight, UserPlus, Mail, Loader2, Info, ChevronDown, ChevronUp, Image as ImageIcon, X, Send, CheckCircle2, Globe, Link as LinkIcon, Phone, ShieldCheck, HelpCircle, AlertCircle, Linkedin } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { JobVacancy } from '../types';

const CareerView: React.FC = () => {
  const [vacancies, setVacancies] = useState<JobVacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobVacancy | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applyStatus, setApplyStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [hasConsent, setHasConsent] = useState(false);
  const [applyForm, setApplyForm] = useState({ name: '', email: '', phone: '', linkedin: '', message: '' });

  useEffect(() => {
    fetchVacancies();
  }, []);

  async function fetchVacancies() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('job_vacancies')
        .select('*')
        .eq('status', 'Open')
        .order('created_at', { ascending: false });
      if (!error) setVacancies(data || []);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenApply = (job: JobVacancy) => {
    setSelectedJob(job);
    setApplyStatus('idle');
    setHasConsent(false);
    setApplyForm({ name: '', email: '', phone: '', linkedin: '', message: '' });
    setShowApplyModal(true);
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasConsent) return;
    setIsApplying(true);
    setApplyStatus('idle');

    try {
      const now = new Date().toISOString();
      const { error } = await supabase.from('job_applications').insert([{
        job_id: selectedJob?.id, 
        job_title: selectedJob?.title, 
        applicant_name: applyForm.name.trim(),
        applicant_email: applyForm.email.trim(), 
        applicant_phone: applyForm.phone.trim(), 
        applicant_linkedin: applyForm.linkedin.trim(),
        message: applyForm.message.trim(), 
        status: 'Pendente', 
        consent_given: true,
        consent_timestamp: now,
        created_at: now
      }]);
      if (error) throw error;
      setApplyStatus('success');
    } catch (err) {
      console.error("Erro na candidatura:", err);
      setApplyStatus('error');
    } finally {
      setIsApplying(false);
    }
  };

  if (loading) return (
    <div className="py-32 flex flex-col items-center gap-4 bg-white min-h-[60vh]">
       <Loader2 className="animate-spin text-blue-600" size={48} />
       <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Sincronizando com a Monte Imobiliária...</p>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-700" role="main">
      <section className="relative h-[240px] md:h-[300px] flex items-center justify-center text-center text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200" alt="Monte Corporate Environment" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-slate-900/75 backdrop-blur-[1px]"></div>
        </div>
        <div className="relative z-10 max-w-4xl px-4">
          <h1 className="text-3xl md:text-5xl font-black mb-3 leading-tight tracking-tighter">
            Carreira na <span className="text-blue-400">Monte Imobiliária</span>
          </h1>
          <p className="text-slate-300 text-xs md:text-sm font-medium max-w-xl mx-auto mb-6 leading-relaxed italic opacity-80">
            Construa o futuro do mercado imobiliário em Moçambique connosco.
          </p>
          <a href="#vagas" className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all shadow-2xl">Ver Oportunidades</a>
        </div>
      </section>

      <section id="vagas" className="py-16 px-4 md:px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Vagas em Aberto</h2>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 text-[9px] font-black text-slate-400 uppercase tracking-widest">
               <ShieldCheck size={12} className="text-blue-600" /> Vagas Oficiais
            </div>
          </div>

          <div className="space-y-4">
            {vacancies.length === 0 ? (
              <div className="bg-white p-12 rounded-[2.5rem] border border-dashed border-slate-200 text-center">
                 <Briefcase size={32} className="mx-auto text-slate-200 mb-3" />
                 <p className="text-slate-400 font-bold uppercase text-[9px]">Não existem vagas de momento.</p>
              </div>
            ) : vacancies.map((job) => (
              <div key={job.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-lg">
                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer" onClick={() => setExpandedId(expandedId === job.id ? null : job.id)}>
                   <div className="flex-1">
                      <h3 className="text-xl font-black text-slate-900 mb-1">{job.title}</h3>
                      <div className="flex flex-wrap gap-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                         <span className="flex items-center gap-1"><MapPin size={10} className="text-blue-600" /> {job.location}</span>
                         <span className="flex items-center gap-1"><Briefcase size={10} className="text-blue-600" /> {job.area}</span>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <button onClick={(e) => { e.stopPropagation(); handleOpenApply(job); }} className="px-6 py-3 bg-blue-600 text-white rounded-[1rem] font-black text-[9px] uppercase tracking-widest hover:bg-slate-900 transition-all">Candidatar</button>
                      <div className={`p-2 rounded-full bg-slate-50 text-slate-400 transition-transform ${expandedId === job.id ? 'rotate-180' : ''}`}><ChevronDown size={18} /></div>
                   </div>
                </div>
                {expandedId === job.id && (
                  <div className="px-8 pb-8 pt-2 border-t border-slate-50 animate-in slide-in-from-top-2 duration-300">
                     <div className="prose prose-slate max-w-none text-slate-600 font-medium whitespace-pre-line leading-relaxed text-xs bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        {job.description || "Dossiê em atualização."}
                     </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {showApplyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl animate-in fade-in">
          <div className="bg-white rounded-[3rem] p-8 md:p-10 max-w-xl w-full shadow-2xl relative overflow-y-auto max-h-[90vh] border-t-8 border-blue-600">
            <button onClick={() => !isApplying && setShowApplyModal(false)} className="absolute top-6 right-6 p-1.5 text-slate-400 hover:text-slate-900 bg-slate-50 rounded-xl transition-all"><X size={24} /></button>
            
            {applyStatus === 'success' ? (
              <div className="py-12 text-center">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner"><CheckCircle2 size={40} /></div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Candidatura Enviada!</h2>
                <p className="text-slate-500 font-medium mb-8 text-sm">Boa sorte!</p>
                <button onClick={() => setShowApplyModal(false)} className="px-10 py-4 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl">Fechar</button>
              </div>
            ) : (
              <>
                <div className="mb-8">
                   <h2 className="text-2xl font-black text-slate-900 tracking-tight">Candidatura <br/><span className="text-blue-600 text-lg uppercase">{selectedJob?.title}</span></h2>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Preencha os dados ou candidate-se por email abaixo</p>
                </div>

                <form onSubmit={handleApplySubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                      <input required disabled={isApplying} value={applyForm.name} onChange={e => setApplyForm({...applyForm, name: e.target.value})} className="w-full bg-slate-50 rounded-xl p-4 font-bold text-xs outline-none focus:ring-2 focus:ring-blue-100" placeholder="Seu Nome" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                      <input required disabled={isApplying} type="email" value={applyForm.email} onChange={e => setApplyForm({...applyForm, email: e.target.value})} className="w-full bg-slate-50 rounded-xl p-4 font-bold text-xs outline-none focus:ring-2 focus:ring-blue-100" placeholder="exemplo@email.com" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Link de Perfil (LinkedIn ou CV Online)</label>
                    <div className="relative">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={14} />
                      <input disabled={isApplying} value={applyForm.linkedin} onChange={e => setApplyForm({...applyForm, linkedin: e.target.value})} className="w-full bg-slate-50 rounded-xl p-4 pl-12 font-bold text-xs outline-none focus:ring-2 focus:ring-blue-100" placeholder="https://linkedin.com/in/perfil..." />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Carta de Apresentação / Mensagem</label>
                    <textarea required disabled={isApplying} value={applyForm.message} onChange={e => setApplyForm({...applyForm, message: e.target.value})} rows={3} className="w-full bg-slate-50 rounded-2xl p-6 text-xs font-medium outline-none resize-none shadow-inner" placeholder="Conte-nos brevemente sobre sua experiência..." />
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <input required type="checkbox" checked={hasConsent} onChange={e => setHasConsent(e.target.checked)} className="mt-1 w-4 h-4 rounded text-blue-600" />
                    <label className="text-[9px] text-slate-500 font-medium leading-tight">Autorizo a Monte Imobiliária a processar os meus dados para fins de recrutamento conforme a política de privacidade.</label>
                  </div>

                  <button disabled={isApplying || !hasConsent} type="submit" className="w-full py-5 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-slate-900 transition-all flex items-center justify-center gap-2 active:scale-95">
                    {isApplying ? <Loader2 className="animate-spin" /> : <><Send size={14} /> Submeter Candidatura Cloud</>}
                  </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100">
                   <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Preferência por Email?</p>
                      <a 
                        href={`mailto:monteimobiliario@gmail.com?subject=Candidatura: ${selectedJob?.title} - ${applyForm.name || 'Candidato'}`}
                        className="inline-flex items-center gap-2 text-blue-600 font-black text-[11px] uppercase tracking-widest hover:text-slate-900 transition-colors"
                      >
                        <Mail size={16} /> Enviar Candidatura via Correio Eletrónico
                      </a>
                      <p className="mt-2 text-[8px] text-slate-400 font-medium">Lembre-se de anexar o seu CV em PDF.</p>
                   </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerView;
