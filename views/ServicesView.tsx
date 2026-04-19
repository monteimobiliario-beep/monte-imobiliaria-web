
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
    <div className="animate-in fade-in duration-1000">
      {/* Hero Section - Compact & Professional */}
      <section className="w-full relative h-[250px] md:h-[300px] flex items-center justify-center overflow-hidden bg-market-navy">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=1600" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-20" 
            alt="Monte Imobiliária Engineering" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-market-navy/80 via-market-navy/40 to-market-navy/95"></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-market-blue/10 backdrop-blur-md border border-white/5 px-4 py-1.5 rounded-full text-market-blue text-[9px] font-bold uppercase tracking-[0.4em] mb-4">
            <LucideIcons.Settings size={12} /> Soluções Profissionais
          </div>
          <h1 className="text-2xl md:text-4xl font-display font-black text-white tracking-tight">
            Serviços <span className="text-market-blue">Premium</span>
          </h1>
          <p className="text-white/30 text-xs md:text-sm max-w-lg mx-auto mt-4 font-medium italic">
            Gestão técnica, consultoria e manutenção com alto padrão de qualidade.
          </p>
        </div>
      </section>

      {/* Services Grid - Modern Cards */}
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto -mt-16 relative z-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white rounded-3xl shadow-xl border border-slate-200">
            <LucideIcons.Loader2 className="animate-spin text-market-blue" size={40} />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">A carregar serviços...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => {
              const IconComponent = (LucideIcons as any)[service.icon] || LucideIcons.HelpCircle;
              return (
                <div 
                  key={service.id} 
                  className="market-card group p-10 flex flex-col items-center text-center"
                >
                  <div className="w-20 h-20 bg-slate-50 text-market-blue rounded-2xl flex items-center justify-center mb-8 group-hover:bg-market-blue group-hover:text-white transition-all duration-300 shadow-inner">
                    <IconComponent size={36} />
                  </div>
                  <h3 className="text-xl font-bold text-market-navy mb-4 group-hover:text-market-blue transition-colors">{service.title}</h3>
                  <p className="text-slate-500 leading-relaxed mb-8 flex-1">{service.description}</p>
                  <button 
                    onClick={() => setSelectedService(service)}
                    className="market-button market-button-primary w-full flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
                  >
                    Detalhes do Serviço <LucideIcons.ArrowRight size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Portfolio Section - Modern Dark */}
      <section className="py-24 bg-market-navy text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-16">
              <div>
                <p className="text-market-blue font-bold text-xs uppercase tracking-widest mb-4">Portfólio de Obras</p>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Projetos Concluídos</h2>
                <p className="text-white/50 text-lg mt-4">Resultados reais da nossa equipa técnica em Moçambique.</p>
              </div>
              <div className="flex gap-4">
                 <button className="p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-all"><LucideIcons.ChevronLeft size={24} /></button>
                 <button className="p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-all"><LucideIcons.ChevronRight size={24} /></button>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {MOCK_PROJECTS.map(proj => (
                <div key={proj.id} className="group relative rounded-3xl overflow-hidden aspect-video bg-slate-900 border border-white/5">
                  <img src={proj.image} referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-70 transition-all duration-700 group-hover:scale-105" alt={proj.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-market-navy via-transparent to-transparent"></div>
                  <div className="absolute bottom-10 left-10 right-10">
                    <div className="flex items-center gap-3 mb-4">
                       <span className="px-4 py-1.5 bg-market-blue text-white text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-lg">{proj.status}</span>
                       <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Beira, MZ</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-6 tracking-tight">{proj.name}</h3>
                    <div className="flex items-center justify-between gap-8">
                       <div className="flex-1 bg-white/5 h-2 rounded-full overflow-hidden">
                          <div className="h-full bg-market-blue rounded-full w-[75%] shadow-[0_0_15px_rgba(0,82,255,0.4)]"></div>
                       </div>
                       <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest shrink-0">Entrega: {proj.deadline}</p>
                    </div>
                  </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Partners Section - Professional */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-market-navy tracking-tight mb-4">Parceiros Estratégicos</h2>
            <p className="text-market-slate text-lg">Trabalhamos com os melhores para entregar o melhor.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {MOCK_PARTNERS.map(partner => (
              <div key={partner.id} className="group flex flex-col items-center text-center p-10 bg-white rounded-3xl border border-slate-200 hover:shadow-lg transition-all">
                <div className="w-24 h-24 rounded-2xl overflow-hidden mb-8 grayscale group-hover:grayscale-0 transition-all duration-500 shadow-md">
                   <img src={partner.logo} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt={partner.name} />
                </div>
                <h4 className="text-xl font-bold text-market-navy mb-3">{partner.name}</h4>
                <p className="text-xs text-market-slate font-semibold uppercase tracking-widest leading-relaxed px-4">{partner.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Professional Blue */}
      <section className="py-24 px-6 bg-market-blue text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">Pronto para elevar o nível do seu imóvel?</h2>
          <p className="text-white/80 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">Fale com um dos nossos especialistas técnicos e descubra como podemos valorizar o seu património.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <a href="tel:+258875018283" className="bg-market-navy text-white px-10 py-4 rounded-xl font-bold text-sm uppercase tracking-widest shadow-xl hover:bg-white hover:text-market-navy transition-all flex items-center justify-center gap-3 active:scale-95">
              <LucideIcons.Phone size={20} /> Ligar Agora
            </a>
            <a href="https://wa.me/258875018283" target="_blank" rel="noopener noreferrer" className="bg-white text-market-blue px-10 py-4 rounded-xl font-bold text-sm uppercase tracking-widest shadow-xl hover:bg-market-navy hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95">
              <LucideIcons.MessageCircle size={20} /> WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* MODAL SABER MAIS - Modern */}
      {selectedService && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-market-navy/80 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
              <button 
                onClick={() => setSelectedService(null)} 
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-market-navy hover:bg-slate-100 rounded-xl transition-all z-10"
              >
                <LucideIcons.X size={24} />
              </button>

              <div className="p-8 md:p-12 overflow-y-auto custom-scrollbar">
                <div className="flex items-center gap-6 mb-10">
                   <div className="w-16 h-16 bg-market-blue/10 text-market-blue rounded-2xl flex items-center justify-center shadow-inner">
                      {(LucideIcons as any)[selectedService.icon] ? React.createElement((LucideIcons as any)[selectedService.icon], { size: 32 }) : <LucideIcons.HelpCircle size={32} />}
                   </div>
                   <div>
                      <p className="text-[11px] font-bold text-market-blue uppercase tracking-widest mb-1">Ficha de Serviço</p>
                      <h2 className="text-2xl font-bold text-market-navy tracking-tight">{selectedService.title}</h2>
                   </div>
                </div>

                <div className="space-y-10">
                   <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
                      <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                         <LucideIcons.Info size={16} className="text-market-blue" /> Descrição Detalhada
                      </h3>
                      <p className="text-market-navy leading-relaxed">
                        {selectedService.longDescription || selectedService.description}
                      </p>
                   </div>

                   {selectedService.benefits && (
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {selectedService.benefits.map((benefit, i) => (
                          <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                             <div className="w-8 h-8 bg-market-accent/10 text-market-accent rounded-lg flex items-center justify-center">
                                <LucideIcons.CheckCircle2 size={16} />
                             </div>
                             <span className="text-xs font-bold text-market-navy uppercase tracking-wider">{benefit}</span>
                          </div>
                        ))}
                     </div>
                   )}

                   <div className="pt-8 border-t border-slate-100">
                      <div className="flex flex-col sm:flex-row gap-4">
                         <a 
                           href={`https://wa.me/258875018283?text=Olá! Gostaria de saber mais informações sobre o serviço de ${selectedService.title}.`}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="flex-1 py-4 bg-market-blue text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active:scale-95"
                         >
                           <LucideIcons.MessageCircle size={18} /> Solicitar Orçamento
                         </a>
                         <button 
                           onClick={() => setSelectedService(null)}
                           className="px-8 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
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
