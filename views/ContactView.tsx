
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Loader2, CheckCircle2, AlertCircle, Clock, Globe, Sparkles, ShieldCheck, Headphones } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useTranslation } from '../src/i18nContext';

const ContactView: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Interesse em Imóvel',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setStatus('error');
      setErrorMessage('O campo Nome é obrigatório.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const { error } = await supabase
        .from('contact_requests')
        .insert([
          { 
            name: formData.name.trim(), 
            email: formData.email, 
            subject: formData.subject, 
            message: formData.message,
            destination_email: 'monteimobiliario@gmail.com',
            created_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;
      setStatus('success');
      setFormData({ name: '', email: '', subject: 'Interesse em Imóvel', message: '' });
      setTimeout(() => setStatus('idle'), 6000);
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Falha ao conectar com o servidor cloud.');
    }
  };

  return (
    <div className="animate-in fade-in duration-1000 pb-24">
      {/* Hero Section - Compact & Professional */}
      <section className="w-full relative h-[250px] md:h-[300px] flex items-center justify-center overflow-hidden bg-market-navy">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1600" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-20" 
            alt="Monte Imobiliária Office" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-market-navy/80 via-market-navy/40 to-market-navy/95"></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-market-blue/10 backdrop-blur-md border border-white/5 px-4 py-1.5 rounded-full text-market-blue text-[9px] font-bold uppercase tracking-[0.4em] mb-4">
            <Globe size={12} /> {t('contact.hero.tag')}
          </div>
          <h1 className="text-2xl md:text-4xl font-display font-black text-white tracking-tight">
            {t('contact.hero.title')} <span className="text-market-blue">{t('contact.hero.subtitle')}</span>
          </h1>
          <p className="text-white/30 text-xs md:text-sm max-w-lg mx-auto mt-4 font-medium italic">
            {t('contact.hero.desc')}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Informações de Contacto Left Col - Modern Cards */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-xl">
              <h3 className="text-xl font-bold text-market-navy mb-10 tracking-tight flex items-center gap-3">
                <Headphones size={24} className="text-market-blue" /> {t('contact.channels.title')}
              </h3>
              
              <div className="space-y-8">
                <a href="https://wa.me/258875018283" target="_blank" rel="noopener noreferrer" className="flex items-start gap-5 group">
                  <div className="w-12 h-12 bg-slate-50 text-market-blue rounded-xl flex items-center justify-center shrink-0 group-hover:bg-market-blue group-hover:text-white transition-all shadow-inner">
                    <Phone size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('contact.channels.whatsapp')}</p>
                    <p className="text-base font-bold text-market-navy">+258 87 501 8283</p>
                  </div>
                </a>

                <div className="flex items-start gap-5 group">
                  <div className="w-12 h-12 bg-slate-50 text-market-blue rounded-xl flex items-center justify-center shrink-0 group-hover:bg-market-blue group-hover:text-white transition-all shadow-inner">
                    <Mail size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('contact.channels.email')}</p>
                    <p className="text-base font-bold text-market-navy break-all">monteimobiliario@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-5 group">
                  <div className="w-12 h-12 bg-market-navy text-white rounded-xl flex items-center justify-center shrink-0 group-hover:bg-market-blue transition-all shadow-inner">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('contact.channels.location')}</p>
                    <p className="text-base font-bold text-market-navy leading-relaxed">
                      Bairro Alto da Manga, Unidade 3,<br />Beira, Moçambique
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-slate-100">
                 <div className="flex items-center gap-3 text-slate-400">
                    <Clock size={18} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{t('contact.channels.hours')}</span>
                 </div>
              </div>
            </div>

            {/* Status Card - Modern Dark */}
            <div className="bg-market-navy p-10 rounded-3xl text-white shadow-xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-market-blue/10 rounded-full blur-2xl"></div>
               <ShieldCheck size={32} className="text-market-blue mb-4" />
               <h4 className="text-xl font-bold mb-2 tracking-tight">{t('contact.secure.title')}</h4>
               <p className="text-white/50 text-sm leading-relaxed">
                 {t('contact.secure.desc')}
               </p>
            </div>
          </div>

          {/* Form Col Right - Modern Form */}
          <div className="lg:col-span-8">
            <div className="bg-white p-10 md:p-16 rounded-3xl border border-slate-200 shadow-xl">
              {status === 'success' ? (
                <div className="py-16 text-center animate-in zoom-in duration-500">
                  <div className="w-24 h-24 bg-market-accent/10 text-market-accent rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <CheckCircle2 size={48} />
                  </div>
                  <h2 className="text-3xl font-bold text-market-navy mb-4 tracking-tight">{t('contact.success.title')}</h2>
                  <p className="text-slate-500 text-lg max-w-sm mx-auto">
                    {t('contact.success.desc')}
                  </p>
                  <button 
                    onClick={() => setStatus('idle')} 
                    className="mt-10 market-button market-button-primary px-12 py-4 text-xs uppercase tracking-widest"
                  >
                    {t('contact.success.button')}
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-6 mb-12">
                     <div className="w-14 h-14 bg-slate-50 text-market-blue rounded-2xl flex items-center justify-center shadow-inner"><MessageSquare size={28} /></div>
                     <div>
                        <h2 className="text-2xl font-bold text-market-navy tracking-tight">{t('contact.form.title')}</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t('contact.form.subtitle')}</p>
                     </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    {status === 'error' && (
                      <div className="p-6 bg-rose-50 border-l-4 border-rose-500 rounded-xl text-rose-700 text-sm font-bold animate-shake flex items-center gap-3">
                        <AlertCircle size={20} className="shrink-0" /> {errorMessage}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t('contact.form.name')}</label>
                        <input 
                          required 
                          type="text" 
                          value={formData.name} 
                          onChange={(e) => setFormData({...formData, name: e.target.value})} 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-medium text-market-navy focus:ring-2 focus:ring-market-blue/20 focus:border-market-blue outline-none transition-all" 
                          placeholder="Ex: João Silveira" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t('contact.form.email')}</label>
                        <input 
                          required 
                          type="email" 
                          value={formData.email} 
                          onChange={(e) => setFormData({...formData, email: e.target.value})} 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-medium text-market-navy focus:ring-2 focus:ring-market-blue/20 focus:border-market-blue outline-none transition-all" 
                          placeholder="seu@email.com" 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t('contact.form.subject')}</label>
                      <select 
                        value={formData.subject} 
                        onChange={(e) => setFormData({...formData, subject: e.target.value})} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-medium text-market-navy focus:ring-2 focus:ring-market-blue/20 focus:border-market-blue outline-none transition-all cursor-pointer appearance-none"
                      >
                        <option>Interesse em Imóvel</option>
                        <option>Gestão de Condomínio</option>
                        <option>Manutenção Técnica / Obras</option>
                        <option>Consultoria Jurídica / Fiscal</option>
                        <option>Outros Assuntos</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t('contact.form.message')}</label>
                      <textarea 
                        required 
                        rows={5} 
                        value={formData.message} 
                        onChange={(e) => setFormData({...formData, message: e.target.value})} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 font-medium text-market-navy focus:ring-2 focus:ring-market-blue/20 focus:border-market-blue outline-none transition-all resize-none" 
                        placeholder={t('contact.form.placeholder')}
                      ></textarea>
                    </div>

                    <button 
                      disabled={status === 'loading'} 
                      type="submit" 
                      className="market-button market-button-primary w-full py-5 text-sm uppercase tracking-widest flex items-center justify-center gap-4 active:scale-[0.98] disabled:opacity-50"
                    >
                      {status === 'loading' ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        <>
                          <Send size={20} /> {t('contact.form.submit')}
                        </>
                      )}
                    </button>
                    
                    <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                       {t('contact.form.footer')}
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactView;
