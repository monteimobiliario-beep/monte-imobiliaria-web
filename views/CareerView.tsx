
import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, ArrowRight, UserPlus, Mail, Loader2, Info, ChevronDown, ChevronUp, Image as ImageIcon, X, Send, CheckCircle2, Globe, Link as LinkIcon, Phone, ShieldCheck, HelpCircle, AlertCircle, Linkedin } from 'lucide-react';
import { supabase, db } from '../supabaseClient';
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
      const { data, error } = await db.hr('job_vacancies')
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
      const { error } = await db.hr('job_applications').insert([{
        vacancy_id: selectedJob?.id, 
        name: applyForm.name.trim(),
        email: applyForm.email.trim(), 
        phone: applyForm.phone.trim(), 
        resume_url: applyForm.linkedin.trim(), // Reutilizando campo para LINK / CV
        message: applyForm.message.trim(), 
        status: 'Pendente', 
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
          <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200" referrerPolicy="no-referrer" alt="Monte Corporate Environment" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-market-navy/80 backdrop-blur-[2px]"></div>
        </div>
        <div className="relative z-10 max-w-4xl px-4">
          <h1 className="text-3xl md:text-5xl font-bold mb-3 leading-tight tracking-tight">
            Carreira na <span className="text-market-blue">Monte Imobiliária</span>
          </h1>
          <p className="text-white/70 text-xs md:text-sm font-medium max-w-xl mx-auto mb-8 leading-relaxed">
            Construa o futuro do mercado imobiliário em Moçambique connosco.
          </p>
          <a href="#vagas" className="market-button market-button-primary px-10 py-4 text-[11px] uppercase tracking-widest">Ver Oportunidades</a>
        </div>
      </section>

      <section id="vagas" className="py-20 px-4 md:px-8 bg-market-bg">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-2xl font-bold text-market-navy tracking-tight">Vagas em Aberto</h2>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 text-[10px] font-bold text-market-slate uppercase tracking-widest">
               <ShieldCheck size={14} className="text-market-blue" /> Vagas Oficiais
            </div>
          </div>

          <div className="space-y-6">
            {vacancies.length === 0 ? (
              <div className="market-card p-16 text-center border-dashed">
                 <Briefcase size={40} className="mx-auto text-slate-200 mb-4" />
                 <p className="text-market-slate font-bold uppercase text-[10px] tracking-widest">Não existem vagas de momento.</p>
              </div>
            ) : vacancies.map((job) => (
              <div key={job.id} className="market-card overflow-hidden transition-all hover:shadow-xl group">
                <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer" onClick={() => setExpandedId(expandedId === job.id ? null : job.id)}>
                   <div className="flex-1">
                      <h3 className="text-xl font-bold text-market-navy mb-2 group-hover:text-market-blue transition-colors">{job.title}</h3>
                      <div className="flex flex-wrap gap-4 text-[10px] font-bold text-market-slate uppercase tracking-widest">
                         <span className="flex items-center gap-1.5"><MapPin size={12} className="text-market-blue" /> {job.location}</span>
                         <span className="flex items-center gap-1.5"><Briefcase size={12} className="text-market-blue" /> {job.area}</span>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <button onClick={(e) => { e.stopPropagation(); handleOpenApply(job); }} className="market-button market-button-primary px-8 py-3 text-[10px] uppercase tracking-widest">Candidatar</button>
                      <div className={`p-2.5 rounded-full bg-slate-50 text-slate-400 transition-transform border border-slate-100 ${expandedId === job.id ? 'rotate-180' : ''}`}><ChevronDown size={20} /></div>
                   </div>
                </div>
                {expandedId === job.id && (
                  <div className="px-8 pb-8 pt-2 border-t border-slate-100 animate-in slide-in-from-top-2 duration-300">
                     <div className="prose prose-slate max-w-none text-market-slate font-medium whitespace-pre-line leading-relaxed text-sm bg-slate-50 p-8 rounded-2xl border border-slate-100">
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-market-navy/90 backdrop-blur-xl animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 md:p-12 max-w-xl w-full shadow-2xl relative overflow-y-auto max-h-[90vh] border-t-8 border-market-blue">
            <button onClick={() => !isApplying && setShowApplyModal(false)} className="absolute top-8 right-8 p-2 text-slate-400 hover:text-market-navy bg-slate-50 rounded-xl transition-all border border-slate-100"><X size={24} /></button>
            
            {applyStatus === 'success' ? (
              <div className="py-12 text-center">
                <div className="w-20 h-20 bg-emerald-50 text-market-accent rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-inner border border-emerald-100"><CheckCircle2 size={40} /></div>
                <h2 className="text-2xl font-bold text-market-navy mb-3">Candidatura Enviada!</h2>
                <p className="text-market-slate font-medium mb-10">Agradecemos o seu interesse. A nossa equipa de RH irá analisar o seu perfil.</p>
                <button onClick={() => setShowApplyModal(false)} className="market-button market-button-primary px-12 py-4 text-xs uppercase tracking-widest">Fechar</button>
              </div>
            ) : (
              <>
                <div className="mb-10">
                   <h2 className="text-2xl font-bold text-market-navy tracking-tight">Candidatura <br/><span className="text-market-blue text-lg uppercase">{selectedJob?.title}</span></h2>
                   <p className="text-[11px] text-market-slate font-bold uppercase tracking-widest mt-2">Preencha os dados abaixo para iniciar o processo</p>
                </div>

                <form onSubmit={handleApplySubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-market-slate uppercase tracking-widest ml-1">Nome Completo</label>
                      <input required disabled={isApplying} value={applyForm.name} onChange={e => setApplyForm({...applyForm, name: e.target.value})} className="w-full bg-slate-50 rounded-xl p-4 font-medium text-sm outline-none border border-slate-200 focus:ring-2 focus:ring-market-blue/20 focus:border-market-blue transition-all" placeholder="Seu Nome" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-market-slate uppercase tracking-widest ml-1">Email Profissional</label>
                      <input required disabled={isApplying} type="email" value={applyForm.email} onChange={e => setApplyForm({...applyForm, email: e.target.value})} className="w-full bg-slate-50 rounded-xl p-4 font-medium text-sm outline-none border border-slate-200 focus:ring-2 focus:ring-market-blue/20 focus:border-market-blue transition-all" placeholder="exemplo@email.com" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-market-slate uppercase tracking-widest ml-1">LinkedIn ou Portfólio</label>
                    <div className="relative">
                      <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 text-market-blue" size={16} />
                      <input disabled={isApplying} value={applyForm.linkedin} onChange={e => setApplyForm({...applyForm, linkedin: e.target.value})} className="w-full bg-slate-50 rounded-xl p-4 pl-12 font-medium text-sm outline-none border border-slate-200 focus:ring-2 focus:ring-market-blue/20 focus:border-market-blue transition-all" placeholder="linkedin.com/in/perfil" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-market-slate uppercase tracking-widest ml-1">Apresentação</label>
                    <textarea required disabled={isApplying} value={applyForm.message} onChange={e => setApplyForm({...applyForm, message: e.target.value})} rows={4} className="w-full bg-slate-50 rounded-2xl p-6 text-sm font-medium outline-none border border-slate-200 focus:ring-2 focus:ring-market-blue/20 focus:border-market-blue transition-all resize-none" placeholder="Conte-nos brevemente sobre a sua experiência..." />
                  </div>

                  <div className="flex items-start gap-3 p-5 bg-slate-50 rounded-xl border border-slate-200">
                    <input required type="checkbox" checked={hasConsent} onChange={e => setHasConsent(e.target.checked)} className="mt-1 w-4 h-4 rounded border-slate-300 text-market-blue focus:ring-market-blue" />
                    <label className="text-[10px] text-market-slate font-medium leading-relaxed">Autorizo a Monte Imobiliária a processar os meus dados para fins de recrutamento e seleção.</label>
                  </div>

                  <button disabled={isApplying || !hasConsent} type="submit" className="market-button market-button-primary w-full py-5 text-[11px] uppercase tracking-widest flex items-center justify-center gap-3">
                    {isApplying ? <Loader2 className="animate-spin" /> : <><Send size={16} /> Submeter Candidatura</>}
                  </button>
                </form>

                <div className="mt-10 pt-8 border-t border-slate-100">
                   <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 text-center">
                      <p className="text-[10px] font-bold text-market-slate uppercase tracking-widest mb-4">Prefere enviar por email?</p>
                      <a 
                        href={`mailto:monteimobiliario@gmail.com?subject=Candidatura: ${selectedJob?.title} - ${applyForm.name || 'Candidato'}&body=Olá, gostaria de me candidatar à vaga de ${selectedJob?.title}. Segue em anexo o meu currículo.`}
                        className="inline-flex items-center gap-2 text-market-blue font-bold text-[11px] uppercase tracking-widest hover:text-market-navy transition-colors"
                      >
                        <Mail size={18} /> Enviar Candidatura via Email
                      </a>
                      <p className="mt-3 text-[9px] text-market-slate font-medium">Anexe o seu CV em formato PDF (Máx. 5MB).</p>
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
