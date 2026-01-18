
import React from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';

const ContactView: React.FC = () => {
  return (
    <div className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div>
          <h1 className="text-5xl font-black text-slate-900 mb-8">Estamos aqui para ajudar</h1>
          <p className="text-slate-500 text-lg mb-12">
            Tem alguma dúvida sobre um imóvel ou precisa de manutenção especializada? Nossa equipa está pronta para responder.
          </p>

          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                <Phone size={24} />
              </div>
              <div>
                <h4 className="font-black text-slate-900 mb-1">Telefone</h4>
                <p className="text-slate-600 text-lg">+258 87 501 8283</p>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Disponível 24/7 p/ Emergências</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                <Mail size={24} />
              </div>
              <div>
                <h4 className="font-black text-slate-900 mb-1">Email</h4>
                <p className="text-slate-600 text-lg">monteimobiliario@gmail.com</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                <MapPin size={24} />
              </div>
              <div>
                <h4 className="font-black text-slate-900 mb-1">Localização</h4>
                <p className="text-slate-600 text-lg leading-relaxed">Alto da Manga, Beira<br />Moçambique</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-[40px] border border-slate-100 shadow-2xl">
          <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
            <MessageSquare className="text-blue-600" /> Envie-nos uma mensagem
          </h3>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase">Nome</label>
                <input type="text" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Seu nome" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase">Email</label>
                <input type="email" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="seu@email.com" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase">Assunto</label>
              <select className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                <option>Interesse em Imóvel</option>
                <option>Solicitar Manutenção</option>
                <option>Consultoria</option>
                <option>Outros</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase">Mensagem</label>
              <textarea rows={4} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Como podemos ajudar?"></textarea>
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white p-5 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-500/20">
              <Send size={18} /> Enviar Mensagem
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactView;
