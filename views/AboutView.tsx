
import React from 'react';
import { Target, Users, Heart, History } from 'lucide-react';

const AboutView: React.FC = () => {
  return (
    <div className="animate-in fade-in duration-700">
      <section className="bg-slate-900 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6">Sobre a Monte Imobiliária</h1>
          <p className="text-slate-300 text-lg leading-relaxed">
            Mais do que uma imobiliária, somos parceiros estratégicos na realização de sonhos e na gestão de ativos em Moçambique.
          </p>
        </div>
      </section>

      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 mb-6 flex items-center gap-3">
             <History className="text-blue-600" /> Nossa História
          </h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            Fundada no coração do Alto da Manga, a Monte Imobiliária nasceu da necessidade de um serviço imobiliário que unisse transparência, tecnologia e suporte técnico especializado. 
          </p>
          <p className="text-slate-600 leading-relaxed">
            Ao longo dos anos, expandimos nossa atuação para incluir gestão hoteleira e de condomínios, tornando-nos um ecossistema completo para proprietários e investidores.
          </p>
        </div>
        <div className="rounded-3xl overflow-hidden shadow-2xl">
          <img src="https://images.unsplash.com/photo-1577412647305-991150c7d163?auto=format&fit=crop&q=80&w=800" alt="Office" className="w-full h-full object-cover" />
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Nossa Missão', icon: <Target />, desc: 'Transformar o mercado imobiliário local através da excelência técnica e ética.' },
            { title: 'Nossos Valores', icon: <Heart />, desc: 'Transparência, inovação e compromisso com o desenvolvimento da Beira.' },
            { title: 'Nossa Equipa', icon: <Users />, desc: 'Especialistas em imobiliária, engenharia e gestão hoteleira prontos para servir.' },
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">{item.title}</h3>
              <p className="text-slate-500 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AboutView;
