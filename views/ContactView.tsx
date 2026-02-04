
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Loader2, CheckCircle2, AlertCircle, Clock, Globe, Sparkles, ShieldCheck, Headphones } from 'lucide-react';
import { supabase } from '../supabaseClient';

const ContactView: React.FC = () => {
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
    <div className="animate-in fade-in duration-700 pb-20">
      {/* Hero Section - Full Width, Reduced Height */}
      <section className="w-full relative h-[250px] md:h-[320px] flex items-center justify-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1600" 
            className="w-full h-full object-cover opacity-40" 
            alt="Monte Imobiliária Office" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-indigo-950/20 to-slate-50"></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 px-5 py-2 rounded-full text-blue-300 text-[9px] font-black uppercase tracking-[0.4em] mb-4">
            <Globe size={12} className="animate-pulse" /> Suporte ao Cliente
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-3 tracking-tighter">
            Fale com a <span className="text-blue-500">Nossa Equipa</span>
          </h1>
          <p className="text-slate-400 text-xs md:text-sm font-medium max-w-xl mx-auto italic">
            "Sincronizando as suas necessidades com as melhores soluções imobiliárias na Beira."
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Informações de Contacto Left Col */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50">
              <h3 className="text-lg font-black text-slate-900 mb-8 uppercase tracking-tight flex items-center gap-2">
                <Headphones size={20} className="text-blue-600" /> Canais Diretos
              </h3>
              
              <div className="space-y-8">
                <a href="https://wa.me/258875018283" target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 shadow-sm">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">WhatsApp Business</p>
                    <p className="text-sm font-bold text-slate-700">+258 87 501 8283</p>
                  </div>
                </a>

                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Oficial</p>
                    <p className="text-sm font-bold text-slate-700 break-all">monteimobiliario@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-blue-600 transition-all duration-500 shadow-sm">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Localização</p>
                    <p className="text-sm font-bold text-slate-700 leading-relaxed">
                      Bairro Alto da Manga, Unidade 3,<br />Beira, Sofala, Moçambique
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-slate-50">
                 <div className="flex items-center gap-3 text-slate-400">
                    <Clock size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Seg - Sex: 08:00 - 17:00</span>
                 </div>
              </div>
            </div>

            {/* Status Card */}
            <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl"></div>
               <ShieldCheck size={28} className="text-blue-500 mb-4" />
               <h4 className="text-xl font-black mb-2 tracking-tight">Atendimento Seguro</h4>
               <p className="text-slate-400 text-xs font-medium leading-relaxed">
                 Todos os dados enviados são processados pela nossa infraestrutura cloud privada.
               </p>
            </div>
          </div>

          {/* Form Col Right */}
          <div className="lg:col-span-8">
            <div className="bg-white p-10 md:p-14 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
              {status === 'success' ? (
                <div className="py-16 text-center animate-in zoom-in duration-500">
                  <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-emerald-100">
                    <CheckCircle2 size={48} />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tighter">Mensagem Recebida!</h2>
                  <p className="text-slate-500 font-medium max-w-xs mx-auto text-sm">
                    Obrigado por contactar a Monte Imobiliária. Responderemos em breve através do contacto fornecido.
                  </p>
                  <button 
                    onClick={() => setStatus('idle')} 
                    className="mt-10 px-12 py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95"
                  >
                    Enviar Outra Mensagem
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 mb-10">
                     <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><MessageSquare size={24} /></div>
                     <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Envie-nos um Pedido</h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Consultoria Técnica e Imobiliária</p>
                     </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {status === 'error' && (
                      <div className="p-5 bg-rose-50 border-l-4 border-rose-500 rounded-2xl text-rose-700 text-xs font-bold animate-shake flex items-center gap-3">
                        <AlertCircle size={20} className="shrink-0" /> {errorMessage}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                        <input 
                          required 
                          type="text" 
                          value={formData.name} 
                          onChange={(e) => setFormData({...formData, name: e.target.value})} 
                          className="w-full bg-slate-50 border-none rounded-2xl p-5 font-bold text-sm focus:ring-4 focus:ring-blue-100 outline-none transition-all shadow-inner" 
                          placeholder="Ex: João Silveira" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail para Resposta</label>
                        <input 
                          required 
                          type="email" 
                          value={formData.email} 
                          onChange={(e) => setFormData({...formData, email: e.target.value})} 
                          className="w-full bg-slate-50 border-none rounded-2xl p-5 font-bold text-sm focus:ring-4 focus:ring-blue-100 outline-none transition-all shadow-inner" 
                          placeholder="seu@email.com" 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assunto</label>
                      <select 
                        value={formData.subject} 
                        onChange={(e) => setFormData({...formData, subject: e.target.value})} 
                        className="w-full bg-slate-50 border-none rounded-2xl p-5 font-bold text-sm focus:ring-4 focus:ring-blue-100 outline-none transition-all shadow-inner cursor-pointer"
                      >
                        <option>Interesse em Imóvel</option>
                        <option>Gestão de Condomínio</option>
                        <option>Manutenção Técnica / Obras</option>
                        <option>Consultoria Jurídica / Fiscal</option>
                        <option>Outros Assuntos</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mensagem ou Descrição do Caso</label>
                      <textarea 
                        required 
                        rows={5} 
                        value={formData.message} 
                        onChange={(e) => setFormData({...formData, message: e.target.value})} 
                        className="w-full bg-slate-50 border-none rounded-2xl p-5 font-bold text-sm focus:ring-4 focus:ring-blue-100 outline-none transition-all shadow-inner resize-none" 
                        placeholder="Em que podemos ajudar hoje?"
                      ></textarea>
                    </div>

                    <button 
                      disabled={status === 'loading'} 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-slate-900 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all shadow-2xl shadow-blue-500/30 active:scale-[0.98] disabled:opacity-50"
                    >
                      {status === 'loading' ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        <>
                          <Send size={18} /> Submeter para a Cloud
                        </>
                      )}
                    </button>
                    
                    <p className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                       A nossa equipa técnica responderá em até 24 horas úteis.
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
