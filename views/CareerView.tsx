
import React from 'react';
import { Briefcase, MapPin, ArrowRight, UserPlus, Heart, Zap, Globe, Star } from 'lucide-react';

const CareerView: React.FC = () => {
  const jobs = [
    { title: 'Consultor Imobiliário Júnior', area: 'Vendas', type: 'Full-time', location: 'Alto da Manga', salary: 'Comissões + Fixo' },
    { title: 'Gestor de Condomínio', area: 'Operações', type: 'Full-time', location: 'Esturro', salary: 'Negociável' },
    { title: 'Técnico de Manutenção (AC)', area: 'Serviços', type: 'Full-time', location: 'Dondo / Beira', salary: 'Base + Subsídios' },
  ];

  return (
    <div className="animate-in fade-in duration-700">
      {/* Hero Section com Imagem de Fundo Profissional */}
      <section className="relative h-[450px] flex items-center justify-center text-center text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200" 
            alt="Equipa Monte & Chaisa" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-[2px]"></div>
        </div>
        
        <div className="relative z-10 max-w-3xl px-4">
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
            Construa o seu futuro na <span className="text-blue-400">Monte & Chaisa</span>
          </h1>
          <p className="text-blue-100 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-8">
            Estamos em busca de talentos que queiram revolucionar a gestão imobiliária e hoteleira em Moçambique com inovação e ética.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-blue-500/30">
              Ver Vagas Abertas
            </button>
            <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-2xl font-black border border-white/20 transition-all">
              Nossa Cultura
            </button>
          </div>
        </div>
      </section>

      {/* Porquê nós? Section */}
      <section className="py-24 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Porquê trabalhar connosco?</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Valorizamos o crescimento individual tanto quanto o sucesso da empresa.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                title: 'Desenvolvimento', 
                icon: <Zap className="text-yellow-500" />, 
                desc: 'Planos de carreira claros e suporte para formação contínua em gestão e imobiliária.',
                img: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80&w=600'
              },
              { 
                title: 'Impacto Real', 
                icon: <Globe className="text-blue-500" />, 
                desc: 'Trabalhe em projetos que transformam a paisagem urbana da Beira e melhoram a vida dos cidadãos.',
                img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600'
              },
              { 
                title: 'Cultura Inclusiva', 
                icon: <Heart className="text-red-500" />, 
                desc: 'Um ambiente de trabalho dinâmico onde todas as ideias são ouvidas e o staff é respeitado.',
                img: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=600'
              }
            ].map((benefit, idx) => (
              <div key={idx} className="group bg-slate-50 rounded-[2.5rem] overflow-hidden border border-slate-100 transition-all hover:shadow-2xl">
                <div className="h-48 overflow-hidden">
                  <img src={benefit.img} alt={benefit.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="p-8">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-4">{benefit.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vagas Abertas */}
      <section className="py-24 px-4 md:px-8 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600 rounded-2xl text-white">
                <UserPlus size={24} />
              </div>
              <h2 className="text-3xl font-black text-slate-900">Vagas Disponíveis</h2>
            </div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{jobs.length} Oportunidades</span>
          </div>

          <div className="space-y-6">
            {jobs.map((job, idx) => (
              <div key={idx} className="group bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors mb-2">{job.title}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
                     <span className="flex items-center gap-1.5 text-slate-500"><Briefcase size={14} className="text-blue-500" /> {job.area}</span>
                     <span className="flex items-center gap-1.5 text-slate-500"><MapPin size={14} className="text-blue-500" /> {job.location}</span>
                     <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full">{job.type}</span>
                     <span className="text-green-600">{job.salary}</span>
                  </div>
                </div>
                <button className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-blue-600 transition-all whitespace-nowrap">
                  Candidatar-se <ArrowRight size={18} />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-20 bg-gradient-to-br from-slate-900 to-blue-900 p-12 rounded-[3rem] text-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]"></div>
            <h3 className="text-2xl font-black mb-4 relative z-10">Não encontrou a sua vaga?</h3>
            <p className="text-blue-200 text-sm mb-8 relative z-10 font-medium">Envie o seu CV espontâneo. Estamos sempre à procura de novos talentos para o nosso banco de dados.</p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 relative z-10">
              <a href="mailto:monteimobiliario.rh@gmail.com" className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-black text-sm hover:bg-blue-50 transition-all flex items-center gap-2">
                <Mail size={18} /> Enviar por Email
              </a>
              <p className="text-xs font-bold text-slate-400">ou siga-nos no LinkedIn para atualizações.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const Mail = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

export default CareerView;
