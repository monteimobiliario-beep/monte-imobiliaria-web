
import React, { useState, useEffect, useRef } from 'react';
import { MOCK_PROPERTIES } from '../constants';
import { 
  MapPin, BedDouble, Bath, Ruler, ArrowLeft, Share2, Heart, 
  ShieldCheck, ChevronRight, ChevronLeft, MessageSquare, Phone, Mail, 
  Maximize2, Send, Loader2, User, Bot, Sparkles, ZoomIn, Info,
  CheckCircle2, Star, Navigation, Camera, Calendar, Play, Building2
} from 'lucide-react';
import { Property } from '../types';
import { supabase } from '../supabaseClient';
import { useBranding } from '../BrandingContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

interface PropertyDetailViewProps {
  propertyId: string | null;
  onBack: () => void;
}

const PropertyDetailView: React.FC<PropertyDetailViewProps> = ({ propertyId, onBack }) => {
  const { settings } = useBranding();
  const [isLoading, setIsLoading] = useState(true);
  const property = MOCK_PROPERTIES.find(p => p.id === propertyId);
  const relatedProperties = MOCK_PROPERTIES.filter(p => p.id !== propertyId).slice(0, 3);
  
  const images = property ? [property.image, ...property.gallery] : [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Chat States
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Olá! Como posso ajudar com este imóvel?', sender: 'agent', timestamp: new Date() }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Video State
  const [showVideo, setShowVideo] = useState(false);

  // Simulação de busca de dados
  useEffect(() => {
    setIsLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [propertyId]);

  // Navegação via Teclado
  useEffect(() => {
    if (isLoading) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isLoading]);

  // Scroll automático para miniatura ativa
  useEffect(() => {
    if (!isLoading && thumbnailRefs.current[currentIndex] && scrollContainerRef.current) {
      thumbnailRefs.current[currentIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [currentIndex, isLoading]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!property && !isLoading) return (
    <div className="py-32 text-center">
      <p className="text-2xl italic text-market-navy/40">Imóvel não encontrado.</p>
      <button onClick={onBack} className="text-market-blue font-bold uppercase tracking-widest mt-8 hover:underline">Voltar ao Catálogo</button>
    </div>
  );

  const nextImage = () => {
    triggerTransition();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    triggerTransition();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const triggerTransition = () => {
    setIsTransitioning(true);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsSending(true);

    try {
      await supabase.from('contact_requests').insert([{
        name: 'Interessado (Chat)',
        email: 'chat@web.user',
        subject: `Dúvida Imóvel: ${property?.title}`,
        message: inputText,
        created_at: new Date().toISOString()
      }]);

      setIsTyping(true);
      setTimeout(() => {
        const agentMsg: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Recebemos a sua mensagem! Um dos nossos consultores irá analisar o seu pedido e responder via WhatsApp ou Email brevemente. Posso ajudar com mais alguma coisa?',
          sender: 'agent',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, agentMsg]);
        setIsTyping(false);
      }, 1500);

    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setIsSending(false);
    }
  };

  const LoadingSkeleton = () => (
    <div className="lg:col-span-2 space-y-20 animate-pulse">
      <div className="space-y-10">
        <div className="h-[600px] rounded-[4rem] bg-slate-100"></div>
        <div className="flex gap-6 overflow-hidden px-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="shrink-0 w-48 h-32 rounded-3xl bg-slate-100"></div>
          ))}
        </div>
      </div>
      <div className="space-y-12">
        <div className="h-20 bg-slate-100 rounded-full w-3/4"></div>
        <div className="grid grid-cols-4 gap-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-40 bg-slate-50 rounded-[2.5rem]"></div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCFB] selection:bg-market-blue/10">
      {/* Full-screen Video Modal */}
      {showVideo && property?.video_url && (
        <div className="fixed inset-0 z-[300] bg-black flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-500">
           <button 
             onClick={() => setShowVideo(false)} 
             className="absolute top-10 right-10 text-white hover:scale-110 transition-transform z-10 p-4 bg-white/10 rounded-full backdrop-blur-md"
           >
             <ArrowLeft size={24} className="rotate-180" />
           </button>
           <div className="w-full h-full max-w-6xl aspect-video rounded-[3rem] overflow-hidden shadow-2xl relative">
              <iframe 
                src={`${property.video_url.replace('watch?v=', 'embed/')}?autoplay=1`}
                className="w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
              ></iframe>
           </div>
        </div>
      )}

      {/* Luxury Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 z-[200] bg-market-navy/98 backdrop-blur-3xl flex flex-col p-6 animate-in fade-in zoom-in-95 duration-500">
          <div className="flex justify-between items-center mb-12 px-10">
            <div className="space-y-1">
              <h2 className="text-white font-display font-medium uppercase tracking-[0.5em] text-[10px] opacity-60">{settings.companyName}</h2>
              <p className="text-white/40 text-[9px] font-mono">ID: {property?.id} • {images.length} Ativos Visuais</p>
            </div>
            <button 
              onClick={() => setShowGallery(false)} 
              className="group flex items-center gap-4 text-white/60 hover:text-white transition-all font-display font-bold text-[10px] uppercase tracking-widest"
            >
              Fechar <div className="p-3 bg-white/5 rounded-full group-hover:bg-white/10 transition-all"><ArrowLeft size={18} className="rotate-180" /></div>
            </button>
          </div>
          
          <div className="flex-1 relative flex items-center justify-center overflow-hidden">
            <div className="relative group max-w-6xl w-full h-full flex items-center justify-center">
               <img 
                 src={images[currentIndex]} 
                 className="max-h-[75vh] w-auto object-contain rounded-[2rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] transition-all duration-1000 transform scale-100 group-hover:scale-[1.02]" 
                 alt="" 
               />
               <div className="absolute inset-0 flex items-center justify-between px-4 md:-mx-20">
                 <button onClick={prevImage} className="p-8 text-white/20 hover:text-market-blue transition-all transform hover:scale-125 focus:outline-none"><ChevronLeft size={64} strokeWidth={1} /></button>
                 <button onClick={nextImage} className="p-8 text-white/20 hover:text-market-blue transition-all transform hover:scale-125 focus:outline-none"><ChevronRight size={64} strokeWidth={1} /></button>
               </div>
            </div>
          </div>

          <div className="flex gap-4 overflow-x-auto py-12 justify-center custom-scrollbar-dark max-w-5xl mx-auto">
            {images.map((img, i) => (
              <button 
                key={i} 
                onClick={() => setCurrentIndex(i)} 
                className={`relative shrink-0 w-28 h-20 rounded-2xl overflow-hidden transition-all duration-700 ${
                  currentIndex === i ? 'ring-4 ring-market-blue ring-offset-4 ring-offset-market-navy scale-110' : 'opacity-30 grayscale hover:grayscale-0 hover:opacity-100'
                }`}
              >
                <img src={img} className="w-full h-full object-cover" alt="" />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-[1800px] mx-auto py-12 md:py-24 px-6 md:px-16 space-y-16 md:space-y-24">
        {/* Navigation & Title Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
          <button 
            onClick={onBack} 
            className="flex items-center gap-6 text-market-slate hover:text-market-navy font-display font-bold text-[10px] uppercase tracking-[0.3em] transition-all group w-fit"
          >
            <div className="p-3 bg-white border border-slate-100 rounded-full group-hover:bg-market-blue group-hover:text-white group-hover:border-market-blue transition-all shadow-sm">
              <ArrowLeft size={16} /> 
            </div>
            Explorar Legados
          </button>
          <div className="flex items-center gap-6 self-end md:self-auto">
             <button className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-100 rounded-full text-market-slate hover:text-market-blue hover:shadow-xl hover:-translate-y-1 transition-all font-display font-bold text-[9px] uppercase tracking-widest">
               <Share2 size={16} /> Compartilhar
             </button>
             <button className="p-4 bg-white border border-slate-100 rounded-full text-market-slate hover:text-red-500 hover:shadow-xl hover:-translate-y-1 transition-all">
               <Heart size={20} />
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 xl:gap-24">
          {isLoading ? (
            <LoadingSkeleton />
          ) : property ? (
            <div className="lg:col-span-8 space-y-20 md:space-y-32">
              {/* Hero Imagery Section */}
              <div className="space-y-10 group/gallery">
                <div className="relative h-[500px] md:h-[800px] rounded-[4.5rem] overflow-hidden shadow-[0_40px_100px_rgba(15,23,42,0.15)] bg-slate-50">
                  <img 
                    src={images[currentIndex]} 
                    alt={`${property.title}`} 
                    referrerPolicy="no-referrer"
                    className={`w-full h-full object-cover transition-all duration-[1200ms] cubic-bezier(0.4, 0, 0.2, 1) transform ${isTransitioning ? 'scale-105 opacity-80 blur-sm' : 'scale-100 opacity-100'}`}
                  />
                  
                  {/* Luxury Overlays */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-market-navy via-market-navy/40 to-transparent p-12 md:p-20 pt-40">
                     <div className="flex flex-wrap items-center gap-4 mb-8">
                        <span className="bg-market-accent/90 backdrop-blur-md text-white px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-2xl">
                          <ShieldCheck size={14} /> Ativo Verificado
                        </span>
                        {property.featured && (
                          <span className="bg-market-gold/90 backdrop-blur-md text-white px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-2xl border border-white/20">
                            <Star size={14} fill="currentColor" /> Edição Prestige
                          </span>
                        )}
                        <span className="bg-white/10 backdrop-blur-md text-white px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/20">
                          {property.dealType}
                        </span>
                     </div>
                     <h1 className="text-5xl md:text-8xl font-display font-black text-white tracking-tighter leading-[0.9] mb-8 animate-in slide-in-from-bottom-5 duration-700">
                        {property.title}
                     </h1>
                     <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-12">
                        <p className="flex items-center gap-4 text-white/80 text-lg font-medium">
                          <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10">
                            <MapPin size={20} className="text-market-blue" />
                          </div>
                          {property.location}
                        </p>
                        <div className="flex items-center gap-4">
                           <button onClick={() => setShowGallery(true)} className="flex items-center gap-3 text-[11px] font-bold text-white bg-white/10 hover:bg-white/20 backdrop-blur-md px-6 py-3 rounded-full uppercase tracking-widest transition-all border border-white/10">
                             <Camera size={18} /> Galeria ({images.length})
                           </button>
                           {property.video_url && (
                             <button onClick={() => setShowVideo(true)} className="flex items-center gap-3 text-[11px] font-bold text-market-navy bg-white hover:bg-market-blue hover:text-white px-6 py-3 rounded-full uppercase tracking-widest transition-all shadow-2xl">
                               <Play size={18} fill="currentColor" /> Tour Virtual
                             </button>
                           )}
                        </div>
                     </div>
                  </div>

                  {/* Quick Navigation Arrows */}
                  <div className="absolute inset-y-0 left-10 flex items-center opacity-0 group-hover/gallery:opacity-100 transition-opacity">
                    <button onClick={prevImage} className="p-6 bg-white/10 backdrop-blur-xl text-white rounded-full hover:bg-market-blue transition-all transform hover:scale-110 active:scale-90 border border-white/10 shadow-2xl"><ChevronLeft size={32} /></button>
                  </div>
                  <div className="absolute inset-y-0 right-10 flex items-center opacity-0 group-hover/gallery:opacity-100 transition-opacity">
                    <button onClick={nextImage} className="p-6 bg-white/10 backdrop-blur-xl text-white rounded-full hover:bg-market-blue transition-all transform hover:scale-110 active:scale-90 border border-white/10 shadow-2xl"><ChevronRight size={32} /></button>
                  </div>
                </div>

                {/* Thumbnails Rail */}
                <div ref={scrollContainerRef} className="flex gap-6 overflow-x-auto pb-4 px-2 custom-scrollbar mask-gradient-x">
                  {images.map((img, i) => (
                 <button 
                   key={i} 
                   onClick={() => { triggerTransition(); setCurrentIndex(i); }} 
                   className={`relative shrink-0 w-56 h-36 rounded-[2.5rem] overflow-hidden border-4 transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) ${
                     currentIndex === i 
                     ? 'border-market-blue ring-8 ring-market-blue/5 -translate-y-2 opacity-100' 
                     : 'border-transparent opacity-40 hover:opacity-100 hover:-translate-y-1'
                   }`}
                 >
                   <img src={img} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt="" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                 </button>
                  ))}
                </div>
              </div>

              {/* Core Details & Investment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
                <div className="space-y-12">
                   <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-1.5 h-10 bg-market-blue rounded-full"></div>
                        <h2 className="text-[11px] font-display font-bold text-market-slate uppercase tracking-[0.5em]">A Narrativa</h2>
                      </div>
                      <p className="text-2xl md:text-3xl font-serif text-market-navy italic leading-relaxed tracking-tight text-justify">
                        {property.description}
                      </p>
                   </div>

                   <div className="grid grid-cols-3 gap-8 pt-12 border-t border-slate-100">
                      {[
                        { icon: <BedDouble size={24} />, label: 'Suítes Privativas', value: property.beds },
                        { icon: <Bath size={24} />, label: 'Banheiros', value: property.baths },
                        { icon: <Ruler size={24} />, label: 'Área do Terreno', value: `${property.area} m²` },
                      ].map((stat, i) => (
                        <div key={i} className="text-center group cursor-default">
                           <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-market-blue mx-auto mb-4 group-hover:bg-market-blue group-hover:text-white transition-all duration-500 shadow-sm border border-slate-100">
                              {stat.icon}
                           </div>
                           <p className="text-xl font-display font-bold text-market-navy">{stat.value}</p>
                           <p className="text-[9px] font-bold text-market-slate uppercase tracking-widest mt-1">{stat.label}</p>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="space-y-10">
                   <div className="market-card p-12 bg-white border-2 border-slate-100 relative group overflow-hidden">
                      <div className="absolute top-0 right-0 w-40 h-40 bg-market-blue/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-market-blue/10 transition-all duration-1000"></div>
                      <div className="relative space-y-8">
                         <div className="space-y-2">
                           <p className="text-[10px] font-bold text-market-blue uppercase tracking-[0.5em]">Valor do Legado</p>
                           <h3 className="text-6xl font-display font-black text-market-navy tracking-tighter">
                             {property.price.toLocaleString('pt-MZ')} <span className="text-xl text-market-slate/40 uppercase">MT</span>
                           </h3>
                         </div>
                         
                         <div className="space-y-4 py-8 border-y border-slate-100">
                            {[
                              { label: 'Condomínio Mensal', value: 'Sob Consulta', icon: <Building2 size={14} /> },
                              { label: 'Documentação do Imóvel', value: property.status === 'Vendido' ? 'Indisponível' : 'Averbação Pronta', icon: <CheckCircle2 size={14} /> },
                              { label: 'Custos Transacionais', value: 'Taxas Notariais Incluídas', icon: <Info size={14} /> }
                            ].map((item, i) => (
                              <div key={i} className="flex items-center justify-between text-[11px]">
                                <span className="text-market-slate flex items-center gap-2 font-medium">{item.icon} {item.label}</span>
                                <span className="font-bold text-market-navy">{item.value}</span>
                              </div>
                            ))}
                         </div>

                         <button className="w-full bg-market-navy text-white hover:bg-market-blue py-6 rounded-[2rem] font-display font-bold text-xs uppercase tracking-[0.3em] transition-all transform active:scale-95 shadow-2xl flex items-center justify-center gap-4 group">
                           Manifestar Interesse
                           <ArrowLeft size={18} className="rotate-180 group-hover:translate-x-2 transition-transform" />
                         </button>
                      </div>
                   </div>
                   
                   <p className="text-[10px] text-market-slate font-medium text-center italic opacity-60">Ref: MH-{property.id}-2026 • Actualizado recentemente</p>
                </div>
              </div>

              {/* Advanced Technical Specifications */}
              <div className="space-y-12">
                 <div className="flex items-center justify-between border-b border-slate-100 pb-8">
                    <h2 className="text-2xl font-display font-bold text-market-navy tracking-tight uppercase tracking-widest text-xs">Atributos & Conveniências</h2>
                    <span className="text-[10px] font-bold text-market-blue bg-market-blue/5 px-4 py-1.5 rounded-full uppercase tracking-widest">{property.amenities?.length || 'Exclusivo'} Itens Premium</span>
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {(property.amenities || ['Segurança 24/7 ARM', 'Abast. Água Próprio', 'Grupo Gerador 100kVA', 'Cozinha Industrial', 'Domótica Residencial', 'Piscina Olímpica']).map((amenity, i) => (
                      <div key={i} className="flex flex-col gap-4 p-8 bg-white border border-slate-100 rounded-[2.5rem] hover:border-market-blue/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all group">
                         <div className="w-12 h-12 bg-market-blue/5 text-market-blue rounded-2xl flex items-center justify-center group-hover:bg-market-blue group-hover:text-white transition-all duration-500">
                           <CheckCircle2 size={24} />
                         </div>
                         <p className="text-[13px] font-bold text-market-navy leading-tight">{amenity}</p>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Location Matrix */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 md:gap-24 items-start">
                 <div className="space-y-10 order-2 xl:order-1">
                    <div className="space-y-3">
                       <h2 className="text-[11px] font-display font-bold text-market-slate uppercase tracking-[0.5em]">Proximidade</h2>
                       <p className="text-3xl font-display font-bold text-market-navy tracking-tighter">Mobilidade Estratégica</p>
                    </div>
                    <div className="space-y-4">
                       {(property.nearby || [
                         { label: 'Aeroporto Internacional', distance: '12 min' },
                         { label: 'Centro Financeiro', distance: '5 min' },
                         { label: 'Marina de Luxo', distance: '8 min' },
                         { label: 'Escola Americana', distance: '15 min' }
                       ]).map((site, i) => (
                         <div key={i} className="p-6 bg-slate-50/50 border border-slate-100 rounded-[2rem] flex items-center justify-between hover:bg-white hover:shadow-xl transition-all group">
                            <div className="flex items-center gap-4">
                               <div className="p-3 bg-white rounded-xl shadow-sm group-hover:bg-market-blue group-hover:text-white transition-all">
                                  <Navigation size={18} />
                               </div>
                               <span className="text-sm font-bold text-market-navy">{site.label}</span>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-market-slate bg-white px-3 py-1 rounded-full border border-slate-100">{site.distance}</span>
                         </div>
                       ))}
                    </div>
                 </div>
                 
                 <div className="space-y-10 order-1 xl:order-2">
                    <div className="relative aspect-square md:aspect-video xl:aspect-square rounded-[4rem] overflow-hidden shadow-2xl group border-[1.5rem] border-white ring-1 ring-slate-100">
                       <img 
                          src={`https://picsum.photos/seed/map_${property.id}/1200/1200?grayscale`}
                          className="w-full h-full object-cover transition-all duration-[3000ms] group-hover:scale-110 group-hover:rotate-1"
                          alt="Map"
                       />
                       <div className="absolute inset-0 bg-market-navy/20"></div>
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                          <div className="relative flex items-center justify-center">
                             <div className="absolute w-20 h-20 bg-market-blue/40 rounded-full animate-ping"></div>
                             <div className="absolute w-12 h-12 bg-market-blue/60 rounded-full animate-ping delay-300"></div>
                             <div className="w-8 h-8 bg-market-blue rounded-full border-4 border-white shadow-2xl relative z-20 flex items-center justify-center">
                                <MapPin size={16} className="text-white" />
                             </div>
                          </div>
                       </div>
                       <div className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white/20 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
                          <p className="text-[10px] font-bold text-market-blue uppercase tracking-widest mb-2">Ponto de Referência</p>
                          <p className="text-[13px] text-market-navy font-bold leading-tight">{property.location}</p>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Similar Portfolios */}
              <div className="pt-20 border-t border-slate-100">
                 <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div className="space-y-4">
                       <h2 className="text-3xl md:text-5xl font-display font-black text-market-navy tracking-tighter">Continuidade</h2>
                       <p className="text-market-slate text-lg font-medium">Explore outros ativos da prestigiada coleção Monte Hub.</p>
                    </div>
                    <button onClick={() => { onBack(); window.scrollTo(0, 0); }} className="px-8 py-4 bg-white border border-slate-100 rounded-full text-market-navy font-display font-bold text-[10px] uppercase tracking-widest hover:bg-market-navy hover:text-white transition-all shadow-xl">
                      Ver Portfólio Completo
                    </button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {relatedProperties.map((p) => (
                      <div 
                        key={p.id} 
                        className="market-card group cursor-pointer hover:-translate-y-4" 
                        onClick={() => { onBack(); window.scrollTo(0,0); }}
                      >
                         <div className="relative h-64 overflow-hidden">
                            <img src={p.image} className="w-full h-full object-cover transition-all duration-[1500ms] group-hover:scale-110" alt="" />
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all"></div>
                            <div className="absolute top-6 right-6 px-4 py-2 bg-white rounded-full text-[9px] font-bold uppercase tracking-widest text-market-navy shadow-2xl">{p.dealType}</div>
                         </div>
                         <div className="p-10 space-y-6">
                            <div className="space-y-2">
                               <p className="text-[9px] font-bold text-market-blue uppercase tracking-[0.3em]">{p.type}</p>
                               <h4 className="text-xl font-display font-bold text-market-navy truncate group-hover:text-market-blue transition-colors tracking-tight">{p.title}</h4>
                            </div>
                            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                               <p className="text-lg font-display font-bold text-market-navy">{p.price.toLocaleString('pt-MZ')} MT</p>
                               <div className="flex items-center gap-4 text-market-slate">
                                  <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase"><BedDouble size={14} /> {p.beds}</div>
                                  <div className="h-4 w-px bg-slate-200"></div>
                                  <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase"><Maximize2 size={14} /> {p.area}m²</div>
                               </div>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          ) : null}

          {/* Luxury Sidebar */}
          <aside className="lg:col-span-4 space-y-10 group/sidebar">
             <div className="sticky top-32 space-y-10">
                <div className="bg-market-navy rounded-[4rem] border border-white/10 shadow-[0_50px_100px_rgba(15,23,42,0.3)] overflow-hidden flex flex-col h-[800px] transition-all duration-700 group-hover/sidebar:shadow-[0_50px_100px_rgba(0,82,255,0.15)]">
                   {/* Exclusive Concierge Header */}
                   <div className="p-10 bg-white/5 border-b border-white/5 relative overflow-hidden flex items-center gap-6">
                      <div className="absolute top-0 right-0 p-4 opacity-[0.03] rotate-12 -translate-y-8 translate-x-8">
                         <Star size={200} fill="currentColor" />
                      </div>
                      <div className="relative z-10">
                        <div className="relative">
                           <img src={`https://picsum.photos/seed/concierge_${property?.id}/150`} className="w-24 h-24 rounded-[2.5rem] object-cover border-4 border-white/10 ring-1 ring-white/5 shadow-2xl" alt="" />
                           <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-market-accent border-4 border-market-navy rounded-full animate-pulse shadow-2xl"></div>
                        </div>
                      </div>
                      <div className="relative z-10 space-y-2">
                        <p className="text-2xl font-display font-bold text-white tracking-tight leading-none">Concierge VIP</p>
                        <p className="text-[9px] font-bold text-market-blue uppercase tracking-[0.4em] flex items-center gap-2">
                           <div className="w-1.5 h-1.5 bg-market-blue rounded-full"></div> Especialista Beira
                        </p>
                      </div>
                   </div>

                   {/* Immersive Chat View */}
                   <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar-dark bg-black/40">
                      {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[90%] p-8 rounded-[2.5rem] text-sm leading-[1.6] shadow-2xl ${
                            msg.sender === 'user' 
                            ? 'bg-market-blue text-white rounded-tr-none border border-white/10' 
                            : 'bg-white/5 text-white/90 border border-white/10 backdrop-blur-xl rounded-tl-none font-serif italic'
                          }`}>
                            {msg.text}
                            <div className={`mt-3 text-[8px] font-mono tracking-widest opacity-30 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      ))}
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-3xl flex gap-1.5 items-center backdrop-blur-md">
                             <div className="w-1.5 h-1.5 bg-market-blue rounded-full animate-bounce"></div>
                             <div className="w-1.5 h-1.5 bg-market-blue rounded-full animate-bounce [animation-delay:200ms]"></div>
                             <div className="w-1.5 h-1.5 bg-market-blue rounded-full animate-bounce [animation-delay:400ms]"></div>
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                   </div>

                   {/* Advanced Interaction Input */}
                   <div className="p-10 bg-market-navy border-t border-white/5 relative z-10">
                      <form onSubmit={handleSendMessage} className="space-y-4">
                        <div className="relative group">
                           <input 
                             value={inputText} 
                             onChange={(e) => setInputText(e.target.value)} 
                             placeholder="Solicitar informações reservadas..." 
                             className="w-full bg-white/5 border border-white/10 rounded-[2rem] pl-8 pr-16 py-6 text-sm text-white placeholder:text-white/20 focus:bg-white/10 focus:ring-2 focus:ring-market-blue outline-none transition-all duration-500 shadow-inner italic"
                           />
                           <button 
                             type="submit" 
                             disabled={!inputText.trim() || isSending} 
                             className="absolute right-3 top-1/2 -translate-y-1/2 p-4 bg-market-blue text-white rounded-2xl active:scale-95 shadow-2xl hover:bg-white hover:text-market-navy disabled:opacity-30 disabled:hover:bg-market-blue transition-all duration-500"
                           >
                             {isSending ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
                           </button>
                        </div>
                        <div className="flex gap-4">
                           <button type="button" className="flex-1 py-4 bg-white/5 border border-white/10 rounded-[1.5rem] text-[10px] font-display font-bold uppercase tracking-[0.2em] text-white/60 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-3 group">
                              <Calendar size={14} className="group-hover:text-market-blue transition-colors" /> Agendar Visita
                           </button>
                           <button type="button" className="p-4 bg-market-accent/10 border border-market-accent/20 rounded-[1.5rem] text-market-accent hover:bg-market-accent hover:text-white transition-all shadow-xl">
                              <Phone size={18} />
                           </button>
                        </div>
                      </form>
                   </div>
                </div>

                {/* Technical Dossier Card */}
                <div className="market-card p-12 space-y-8 bg-white border border-slate-100 shadow-2xl relative overflow-hidden group/dossier">
                   <div className="absolute -top-10 -left-10 w-24 h-24 bg-market-blue/5 rounded-full group-hover/dossier:scale-150 transition-all duration-1000"></div>
                   <div className="relative space-y-6">
                      <div className="flex items-center justify-between">
                         <h3 className="text-[11px] font-display font-bold text-market-slate uppercase tracking-[0.4em]">Dossiê do Ativo</h3>
                         <div className="p-2 bg-slate-50 rounded-lg"><Info size={14} className="text-market-blue" /></div>
                      </div>
                      <div className="space-y-4">
                         {[
                           { label: 'Exclusividade', value: 'Monte Hub Premium', color: 'text-market-gold' },
                           { label: 'Construção', value: 'Primeira Linha', color: 'text-market-navy' },
                           { label: 'Tipologia', value: property?.type, color: 'text-market-navy' },
                           { label: 'Ocupação', value: property?.status || 'Imediata', color: 'text-market-accent' }
                         ].map((spec, i) => (
                           <div key={i} className="flex justify-between items-center py-3 border-b border-dotted border-slate-200 text-xs font-medium">
                              <span className="text-market-slate">{spec.label}</span>
                              <span className={`font-bold ${spec.color}`}>{spec.value}</span>
                           </div>
                         ))}
                      </div>
                      <button className="w-full py-5 rounded-[2rem] border-2 border-slate-100 text-market-navy hover:border-market-blue hover:text-market-blue font-display font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all">
                        <Maximize2 size={16} /> Download Ficha Técnica (PDF)
                      </button>
                   </div>
                </div>
             </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailView;
