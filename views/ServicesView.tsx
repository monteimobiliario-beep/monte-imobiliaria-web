
import React, { useState, useEffect } from 'react';
import { MOCK_PARTNERS, MOCK_PROJECTS } from '../constants';
import * as LucideIcons from 'lucide-react';
import { supabase } from '../supabaseClient';
import { RealEstateService } from '../types';

interface ServiceDetail extends RealEstateService {
  longDescription?: string;
  benefits?: string[];
}

const ServicesView: React.FC = () => {
  const [services, setServices] = useState<ServiceDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<ServiceDetail | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('title');
      
      if (!error && data && data.length > 0) {
        setServices(data);
      } else {
        // Fallback enriquecido com dados para o "Saber Mais"
        setServices([
          { 
            id: '1', 
            title: 'Manutenção Técnica', 
            description: 'Equipa multidisciplinar para canalização, eletricidade e sistemas de climatização.', 
            icon: 'Wrench',
            longDescription: 'A Monte Imobiliária oferece um serviço de manutenção técnica 360º. Garantimos que a infraestrutura do seu imóvel ou unidade hoteleira opere com máxima eficiência, prevenindo falhas críticas e reduzindo custos operacionais a longo prazo.',
            benefits: ['Atendimento de Emergência 24/7', 'Relatórios de Estado Técnico', 'Peças de Reposição Genuínas', 'Técnicos Certificados']
          },
          { 
            id: '2', 
            title: 'Consultoria Imobiliária', 
            description: 'Avaliação de ativos, regularização documental e gestão de arrendamentos premium.', 
            icon: 'Building2',
            longDescription: 'Nossa consultoria vai além da venda. Analisamos o potencial de valorização, tratamos de toda a burocracia documental em Moçambique e garantimos que o seu investimento esteja juridicamente protegido.',
            benefits: ['Avaliação Patrimonial Realista', 'Regularização na Conservatória', 'Gestão de Inquilinos de Elite', 'Estratégias de Saída de Investimento']
          },
          { 
            id: '3', 
            title: 'Gestão Hoteleira', 
            description: 'Operação completa de Guest Houses e unidades hoteleiras com foco em rentabilidade.', 
            icon: 'Hotel',
            longDescription: 'Transformamos o seu imóvel numa unidade de alojamento de alta performance. Cuidamos desde o Check-in à gestão financeira, focando na experiência do cliente e no Retorno sobre Investimento (ROI).',
            benefits: ['Gestão de Canais (Booking/Airbnb)', 'Padrão de Limpeza Hoteleiro', 'Controlo de Custos Operacionais', 'Marketing Digital Especializado']
          },
          { 
            id: '4', 
            title: 'Pintura & Acabamentos', 
            description: 'Execução de pintura industrial e residencial com materiais de alta performance.', 
            icon: 'Paintbrush',
            longDescription: 'Utilizamos técnicas avançadas e tintas de alta resistência adaptadas ao clima da Beira. Seja para renovação estética ou proteção industrial, entregamos acabamentos impecáveis.',
            benefits: ['Garantia de Durabilidade', 'Limpeza Pós-Obra Rigorosa', 'Consultoria de Cores e Estilos', 'Equipamento de Proteção Individual']
          },
          { 
            id: '5', 
            title: 'Gestão de Condomínios', 
            description: 'Administração técnica e financeira de condomínios residenciais e comerciais.', 
            icon: 'ShieldCheck',
            longDescription: 'Paz de espírito para proprietários e moradores. Administramos as contas, gerimos os funcionários comuns e asseguramos que as regras do condomínio sejam cumpridas com transparência total.',
            benefits: ['Transparência Financeira Mensal', 'Manutenção das Áreas Comuns', 'Segurança e Vigilância Ativa', 'Assembleias Organizadas']
          },
          { 
            id: '6', 
            title: 'Projetos de Engenharia', 
            description: 'Supervisão de obras e elaboração de projetos técnicos de engenharia civil.', 
            icon: 'Cpu',
            longDescription: 'Suporte técnico de engenharia para novas construções ou reformas estruturais. Garantimos que cada etapa do projeto siga as normas moçambicanas de segurança e qualidade.',
            benefits: ['Fiscalização de Obra', 'Cálculos Estruturais', 'Otimização de Materiais', 'Gestão de Cronogramas']
          }
        ]);
      }
    } catch (err) {
      console.error("Erro ao carregar serviços:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-in fade-in duration-700">
      {/* Hero Section */}
      <section className="w-full relative h-[250px] md:h-[320px] flex items-center justify-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=1600" 
            className="w-full h-full object-cover opacity-30" 
            alt="Monte Imobiliária Engineering" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-950"></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 backdrop-blur-xl border border-blue-400/20 px-5 py-2 rounded-full text-blue-400 text-[9px] font-black uppercase tracking-[0.4em] mb-4">
            <LucideIcons.Settings size={12} className="animate-spin-slow" /> Hub de Soluções
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-3 tracking-tighter">
            Excelência em <span className="text-blue-500">Serviços Técnicos</span>
          </h1>
          <p className="text-slate-400 text-xs md:text-sm font-medium max-w-xl mx-auto leading-relaxed">
            Unindo engenharia, gestão de ativos e suporte imobiliário num ecossistema único na Beira.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto -mt-10 relative z-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white rounded-[3rem] shadow-xl">
            <LucideIcons.Loader2 className="animate-spin text-blue-600" size={40} />
            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Sincronizando Módulos...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => {
              const IconComponent = (LucideIcons as any)[service.icon] || LucideIcons.HelpCircle;
              return (
                <div 
                  key={service.id} 
                  className="group p-10 bg-white rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all flex flex-col items-center text-center animate-in zoom-in-95 duration-500"
                >
                  <div className="w-20 h-20 bg-slate-50 text-blue-600 rounded-[2rem] flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner group-hover:shadow-blue-500/20">
                    <IconComponent size={36} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-4 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{service.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-8 flex-1 font-medium italic opacity-80">"{service.description}"</p>
                  <button 
                    onClick={() => setSelectedService(service)}
                    className="px-8 py-3.5 bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-2xl group-hover:bg-blue-600 transition-all flex items-center gap-3 active:scale-95"
                  >
                    Saber Mais <LucideIcons.ArrowRight size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Portfolio Section */}
      <section className="py-20 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto px-4 md:px-8">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
              <div>
                <p className="text-blue-500 font-black text-[10px] uppercase tracking-[0.4em] mb-3">Monte Portfolio</p>
                <h2 className="text-4xl font-black tracking-tighter">Projetos em Destaque</h2>
                <p className="text-slate-400 font-medium text-base mt-2">Demonstração da nossa capacidade técnica e operacional.</p>
              </div>
              <div className="flex gap-4">
                 <button className="p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-all active:scale-95"><LucideIcons.ChevronLeft size={24} /></button>
                 <button className="p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-all active:scale-95"><LucideIcons.ChevronRight size={24} /></button>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {MOCK_PROJECTS.map(proj => (
                <div key={proj.id} className="group relative rounded-[3rem] overflow-hidden aspect-[16/9] bg-slate-800 border border-white/5">
                  <img src={proj.image} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-all duration-1000 group-hover:scale-105" alt={proj.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                  <div className="absolute bottom-10 left-10 right-10">
                    <div className="flex items-center gap-3 mb-3">
                       <span className="px-3 py-1 bg-blue-600 text-white text-[8px] font-black uppercase rounded-lg shadow-lg">{proj.status}</span>
                       <span className="text-[10px] font-bold text-slate-400">Beira, Moçambique</span>
                    </div>
                    <h3 className="text-2xl font-black mb-6 tracking-tight">{proj.name}</h3>
                    <div className="flex items-center justify-between">
                       <div className="w-2/3 bg-white/10 h-1 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full w-[70%] shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                       </div>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Entrega: {proj.deadline}</p>
                    </div>
                  </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-24 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Rede de Parceiros Estratégicos</h2>
            <p className="text-slate-500 font-medium text-sm">Colaboramos com os líderes de mercado para garantir resultados de elite.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            {MOCK_PARTNERS.map(partner => (
              <div key={partner.id} className="group flex flex-col items-center text-center p-8 bg-slate-50 rounded-[3rem] border border-transparent hover:border-blue-100 hover:bg-white hover:shadow-2xl transition-all duration-500">
                <div className="w-24 h-24 rounded-3xl overflow-hidden mb-6 grayscale group-hover:grayscale-0 transition-all duration-700 shadow-md">
                   <img src={partner.logo} className="w-full h-full object-cover" alt={partner.name} />
                </div>
                <h4 className="text-lg font-black text-slate-900 mb-2">{partner.name}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed px-4">{partner.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-black mb-8 tracking-tighter leading-tight">Pronto para iniciar o seu projeto <br/>com a Monte Imobiliária?</h2>
          <p className="text-blue-100 text-lg font-medium mb-12 italic opacity-80 max-w-2xl mx-auto">"Fornecemos soluções integradas para clientes exigentes num mercado em constante evolução."</p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <a href="tel:+258875018283" className="bg-white text-blue-600 px-12 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-2xl hover:bg-blue-50 transition-all flex items-center justify-center gap-3 active:scale-95">
              <LucideIcons.Phone size={20} /> Ligar Diretor Técnico
            </a>
            <a href="https://wa.me/258875018283" target="_blank" rel="noopener noreferrer" className="bg-slate-900 text-white px-12 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-95">
              <LucideIcons.MessageCircle size={20} /> Consultar via WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* MODAL SABER MAIS */}
      {selectedService && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-white rounded-[3.5rem] w-full max-w-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-500 border-t-[12px] border-blue-600">
              <button 
                onClick={() => setSelectedService(null)} 
                className="absolute top-6 right-8 p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all z-10"
              >
                <LucideIcons.X size={24} />
              </button>

              <div className="p-10 md:p-14 overflow-y-auto custom-scrollbar">
                <div className="flex items-center gap-6 mb-10">
                   <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center shadow-inner">
                      {(LucideIcons as any)[selectedService.icon] ? React.createElement((LucideIcons as any)[selectedService.icon], { size: 40 }) : <LucideIcons.HelpCircle size={40} />}
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-1">Dossiê Técnico</p>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">{selectedService.title}</h2>
                   </div>
                </div>

                <div className="space-y-8">
                   <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                      <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                         <LucideIcons.Info size={14} className="text-blue-600" /> Visão Geral
                      </h3>
                      <p className="text-base text-slate-600 font-medium leading-relaxed italic">
                        "{selectedService.longDescription || selectedService.description}"
                      </p>
                   </div>

                   {selectedService.benefits && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedService.benefits.map((benefit, i) => (
                          <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm group">
                             <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                <LucideIcons.CheckCircle2 size={16} />
                             </div>
                             <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">{benefit}</span>
                          </div>
                        ))}
                     </div>
                   )}

                   <div className="pt-8 border-t border-slate-100">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 text-center">Interessado neste serviço?</h3>
                      <div className="flex flex-col sm:flex-row gap-4">
                         <a 
                           href={`https://wa.me/258875018283?text=Olá! Gostaria de saber mais informações sobre o serviço de ${selectedService.title}.`}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active:scale-95"
                         >
                           <LucideIcons.MessageCircle size={18} /> Solicitar Orçamento
                         </a>
                         <button 
                           onClick={() => setSelectedService(null)}
                           className="px-8 py-5 bg-slate-100 text-slate-500 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                         >
                           Fechar
                         </button>
                      </div>
                   </div>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ServicesView;
