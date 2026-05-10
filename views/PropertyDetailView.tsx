
import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, BedDouble, Bath, Ruler, ArrowLeft, Share2, Heart, X,
  ShieldCheck, ChevronRight, ChevronLeft, MessageSquare, Phone, Mail, 
  Maximize2, Send, Loader2, User, Bot, Sparkles, ZoomIn, Info,
  CheckCircle2, Star, Navigation, Camera, Calendar, Play, Building2,
  Plus, Minus, MessageCircle
} from 'lucide-react';
import { Property } from '../types';
import { db } from '../supabaseClient';
import { useBranding } from '../BrandingContext';
import { useTranslation } from '../src/i18nContext';

import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

interface PropertyDetailViewProps {
  propertyId: string | null;
}

const PropertyDetailView: React.FC<PropertyDetailViewProps> = ({ propertyId }) => {
  const { t } = useTranslation();
  const { settings } = useBranding();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [property, setProperty] = useState<Property | null>(null);
  const [relatedProperties, setRelatedProperties] = useState<Property[]>([]);

  const onBack = () => {
    navigate(-1); // Go back in history
  };
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  
  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const contactFormRef = useRef<HTMLDivElement>(null);
  
  const images = property ? [property.image, ...(property.gallery || [])] : [];

  // Chat States
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: t('detail.chat.initial'), sender: 'agent', timestamp: new Date() }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Video State
  const [showVideo, setShowVideo] = useState(false);
  
  // Zoom State
  const [zoomLevel, setZoomLevel] = useState(1);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel(prev => Math.min(prev + 0.3, 3));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel(prev => Math.max(prev - 0.3, 1));
  };

  useEffect(() => {
    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId]);

  async function fetchProperty() {
    setIsLoading(true);
    try {
      const { data, error } = await db.catalog('properties').select('*').eq('id', propertyId).single();
      if (error) throw error;
      
      const p = {
        ...data,
        gallery: Array.isArray(data.gallery) ? data.gallery : (typeof data.gallery === 'string' ? JSON.parse(data.gallery) : [])
      } as Property;
      
      setProperty(p);
      
      // Fetch related
      const { data: related } = await db.catalog('properties').select('*').neq('id', propertyId).limit(3);
      setRelatedProperties(related || []);
      
    } catch (err) {
      console.error("Erro ao carregar detalhes:", err);
    } finally {
      setIsLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

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
      <p className="text-2xl italic text-market-navy/40">{t('detail.not_found')}</p>
      <button onClick={onBack} className="text-market-blue font-bold uppercase tracking-widest mt-8 hover:underline">{t('detail.back')}</button>
    </div>
  );

  async function handleContactSubmit() {
    if (!contactForm.name || !contactForm.email) {
      alert("Por favor, preencha o seu nome e email.");
      return;
    }
    
    setIsSending(true);
    try {
      // Save interest to DB as a report
      await db.catalog('contact_requests').insert([{
        name: contactForm.name,
        email: contactForm.email,
        message: `Interesse em ${property?.title}: ${contactForm.message}`,
        property_id: propertyId,
        created_at: new Date().toISOString(),
        status: 'Pendente'
      }]);
      
      setContactSuccess(true);
      // Optional: alert or scroll to sidebar
    } catch (err) {
      console.error(err);
      alert("Erro ao registar interesse. Tente novamente.");
    } finally {
      setIsSending(false);
    }
  }

  const getContactMessage = (type: 'whatsapp' | 'email') => {
    const baseUrl = window.location.origin;
    const propertyUrl = `${baseUrl}/?property=${property?.id}`;
    const text = `Olá! Sou *${contactForm.name}* e estou interessado no imóvel *${property?.title}*.
Localização: ${property?.location}
Preço: ${property?.price.toLocaleString('pt-MZ')} MT
Ver Imóvel: ${propertyUrl}
Minha Mensagem: ${contactForm.message || 'Gostaria de agendar uma visita.'}`;

    if (type === 'whatsapp') {
      return `https://wa.me/258875018283?text=${encodeURIComponent(text)}`;
    } else {
      const subject = encodeURIComponent(`Interesse em Imóvel: ${property?.title}`);
      return `mailto:monteimobiliario@gmail.com?subject=${subject}&body=${encodeURIComponent(text.replace(/\*/g, ''))}`;
    }
  };

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
      await db.catalog('contact_requests').insert([{
        name: 'Interessado (Chat)',
        email: 'chat@web.user',
        message: `Dúvida Imóvel: ${property?.title} - ${inputText}`,
        property_id: propertyId,
        created_at: new Date().toISOString()
      }]);

      setIsTyping(true);
      setTimeout(() => {
        const agentMsg: Message = {
          id: (Date.now() + 1).toString(),
          text: t('detail.chat.response'),
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

      {/* Luxury Gallery Modal / Lightbox */}
      {showGallery && (
        <div className="fixed inset-0 z-[200] bg-market-navy/98 backdrop-blur-3xl flex flex-col animate-in fade-in duration-500">
          <div className="flex justify-between items-center p-6 md:p-10 border-b border-white/5">
            <div className="space-y-1">
              <h2 className="text-white font-display font-medium uppercase tracking-[0.5em] text-[10px] opacity-60">{settings.companyName}</h2>
              <p className="text-white/40 text-[9px] font-mono">ID: {property?.id} • {images.length} Ativos</p>
            </div>
            <button 
              onClick={() => setShowGallery(false)} 
              className="group flex items-center gap-4 text-white hover:text-market-blue transition-all font-display font-bold text-[10px] uppercase tracking-widest"
            >
              {t('dash.view_all')} <span className="p-3 bg-white/5 rounded-full group-hover:bg-market-blue transition-all"><X size={18} /></span>
            </button>
          </div>
          
          <div className="flex-1 relative flex items-center justify-center p-4">
             <button onClick={prevImage} className="absolute left-4 md:left-10 z-10 p-4 text-white/20 hover:text-white transition-all"><ChevronLeft size={64} strokeWidth={1} /></button>
             
             <div className="w-full h-full flex items-center justify-center">
                <img 
                  src={images[currentIndex] || undefined} 
                  className="max-h-full max-w-full object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-500" 
                  alt="" 
                />
             </div>

             <button onClick={nextImage} className="absolute right-4 md:right-10 z-10 p-4 text-white/20 hover:text-white transition-all"><ChevronRight size={64} strokeWidth={1} /></button>
          </div>

          <div className="p-6 bg-black/20 backdrop-blur-md">
            <div className="flex gap-3 overflow-x-auto justify-center py-4 custom-scrollbar-dark max-w-5xl mx-auto">
              {images.map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => setCurrentIndex(i)} 
                  className={`relative shrink-0 w-24 h-16 rounded-lg overflow-hidden transition-all duration-300 ${
                    currentIndex === i ? 'ring-2 ring-market-blue scale-110' : 'opacity-40 hover:opacity-100'
                  }`}
                >
                  <img src={img || undefined} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto py-2 px-6 md:px-12 space-y-2 md:space-y-4">
        {/* Navigation & Title Block - Multi-Functional & Ultra-Compact */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-2">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack} 
              className="p-2 bg-slate-50 border border-slate-100 rounded-lg text-market-slate hover:text-market-blue hover:bg-white transition-all shadow-sm group"
              title="Voltar"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
            </button>
            <div className="space-y-0">
              <h1 className="text-xl md:text-2xl font-display font-black text-market-navy tracking-tight truncate max-w-md">
                {property?.title}
              </h1>
              <p className="text-market-slate text-[9px] flex items-center gap-2 font-bold uppercase tracking-widest">
                <MapPin size={10} className="text-market-blue" /> {property?.location}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
                <p className="text-[8px] font-bold text-market-blue uppercase tracking-widest leading-none mb-1">{t('detail.price_label')}</p>
                <p className="text-xl font-display font-black text-market-navy leading-none">
                  {property?.price.toLocaleString('pt-MZ')} <span className="text-[10px] text-market-slate/60 font-medium">MT</span>
                </p>
             </div>
             <div className="flex items-center gap-2">
                <button 
                  onClick={async () => {
                    if (navigator.share) {
                      try {
                        await navigator.share({ title: property?.title, text: property?.description, url: window.location.href });
                      } catch (e) {}
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Link copiado para a área de transferência!');
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-market-navy hover:bg-white hover:text-market-blue hover:shadow-lg transition-all font-display font-bold text-[8px] uppercase tracking-widest"
                >
                  <Share2 size={12} /> <span className="hidden md:inline">{t('detail.share')}</span>
                </button>
                <button 
                  onClick={() => setIsFavorited(!isFavorited)}
                  className={`p-2 border rounded-lg transition-all shadow-sm ${isFavorited ? 'bg-red-50 border-red-100 text-red-500 scale-105 shadow-red-100' : 'bg-slate-50 border-slate-100 text-market-slate hover:text-red-500 hover:bg-white'}`}
                >
                  <Heart size={16} fill={isFavorited ? "currentColor" : "none"} />
                </button>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 overflow-hidden">
          {isLoading ? (
            <LoadingSkeleton />
          ) : property ? (
            <div className="lg:col-span-8 space-y-4 md:space-y-6">
              {/* Hero Imagery Section - Intelligent Height & Optimized for Viewport */}
              <div className="space-y-2 group/gallery">
                <div 
                  className="relative h-[300px] md:h-[50vh] min-h-[300px] max-h-[500px] rounded-[2rem] overflow-hidden shadow-xl bg-slate-50 border border-slate-100"
                >
                  <img 
                    ref={imageRef}
                    src={images[currentIndex] || undefined} 
                    alt={`${property.title}`} 
                    referrerPolicy="no-referrer"
                    style={{
                      transform: `scale(${zoomLevel})`,
                      transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                    className={`w-full h-full object-cover ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100'}`}
                  />

                  {/* Top Badges */}
                  <div className="absolute top-8 left-8 flex flex-wrap gap-3">
                    <span className="bg-market-navy/80 backdrop-blur-md text-white px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest flex items-center gap-2">
                       <ShieldCheck size={14} className="text-market-blue" /> Verificado
                    </span>
                    {property.featured && (
                      <span className="bg-market-accent text-white px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg">
                        <Star size={14} fill="currentColor" /> Prestige
                      </span>
                    )}
                  </div>
                  
                  {/* Luxury Interaction Hub */}
                  <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between pointer-events-none">
                     <div className="flex gap-3 pointer-events-auto">
                        <div className="flex bg-white/90 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                           <button 
                             onClick={handleZoomIn} 
                             className="p-4 hover:bg-market-blue hover:text-white transition-all border-r border-slate-100"
                             title="Aumentar Zoom"
                           >
                             <Plus size={20} />
                           </button>
                           <button 
                             onClick={handleZoomOut} 
                             className="p-4 hover:bg-market-blue hover:text-white transition-all border-r border-slate-100"
                             title="Diminuir Zoom"
                           >
                             <Minus size={20} />
                           </button>
                           <button 
                             onClick={(e) => { e.stopPropagation(); setShowGallery(true); }} 
                             className="p-4 hover:bg-market-blue hover:text-white transition-all"
                             title={t('detail.gallery.title')}
                           >
                             <Maximize2 size={20} />
                           </button>
                        </div>
                        {property.video_url && (
                          <button onClick={(e) => { e.stopPropagation(); setShowVideo(true); }} className="flex items-center gap-3 px-8 p-4 bg-white/90 backdrop-blur-md rounded-2xl text-market-navy font-bold text-[10px] uppercase tracking-widest hover:bg-market-blue hover:text-white transition-all shadow-xl">
                            <Play size={18} fill="currentColor" /> Tour
                          </button>
                        )}
                     </div>
                     <div className="flex gap-2 pointer-events-auto">
                        <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="p-4 bg-black/20 backdrop-blur-md text-white rounded-2xl hover:bg-market-blue transition-all border border-white/10"><ChevronLeft size={24} /></button>
                        <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="p-4 bg-black/20 backdrop-blur-md text-white rounded-2xl hover:bg-market-blue transition-all border border-white/10"><ChevronRight size={24} /></button>
                     </div>
                  </div>

                  {/* Indicators Overlay */}
                  {zoomLevel > 1 && (
                    <div className="absolute top-8 right-8 z-10">
                       <span className="bg-market-blue text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-lg">
                          Zoom: ×{zoomLevel.toFixed(1)}
                       </span>
                    </div>
                  )}
                </div>

                {/* Info Bar under image */}
                <div className="flex items-center justify-between px-6 pt-2">
                   <div className="flex items-center gap-6 text-market-slate text-[10px] font-bold uppercase tracking-widest">
                      <span className="flex items-center gap-2"><Camera size={14} /> Foto {currentIndex + 1} de {images.length}</span>
                      <span className="flex items-center gap-2"><Calendar size={14} /> Ativo em {new Date(property.created_at || Date.now()).toLocaleDateString()}</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${property.status === 'Disponível' ? 'bg-emerald-500' : 'bg-market-accent animate-pulse'}`}></div>
                      <span className="text-[10px] font-bold text-market-navy uppercase tracking-widest">{property.status}</span>
                   </div>
                </div>

                {/* Thumbnails Rail with Glassmorphism */}
                <div ref={scrollContainerRef} className="flex gap-4 overflow-x-auto py-6 px-2 custom-scrollbar mask-gradient-x bg-slate-50/50 rounded-[2.5rem] border border-slate-100 shadow-inner">
                  {images.map((img, i) => (
                    <button 
                      key={i} 
                      onClick={() => { triggerTransition(); setCurrentIndex(i); }} 
                      className={`relative shrink-0 w-32 h-24 rounded-2xl overflow-hidden transition-all duration-500 ease-out ${
                        currentIndex === i 
                        ? 'ring-4 ring-market-blue ring-offset-2 scale-105 opacity-100' 
                        : 'opacity-40 hover:opacity-100'
                      }`}
                    >
                      <img src={img || undefined} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt="" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Core Details & Investment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
                <div className="space-y-8">
                   <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-1 h-6 bg-market-blue rounded-full"></div>
                        <h2 className="text-[9px] font-display font-bold text-market-slate uppercase tracking-[0.4em]">A Narrativa</h2>
                      </div>
                      <p className="text-xl md:text-2xl font-serif text-market-navy italic leading-relaxed tracking-tight text-justify">
                        {property.description}
                      </p>
                   </div>

                   <div className="grid grid-cols-3 gap-8 pt-12 border-t border-slate-100">
                      {[
                        { icon: <BedDouble size={24} />, label: t('detail.suites'), value: property.bedrooms },
                        { icon: <Bath size={24} />, label: t('detail.bathrooms'), value: property.bathrooms },
                        { icon: <Ruler size={24} />, label: t('detail.area'), value: `${property.area} m²` },
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
                   <div className="market-card p-10 bg-white border-2 border-slate-100 relative group overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-market-blue/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-market-blue/10 transition-all duration-1000"></div>
                      <div className="relative space-y-6">
                         <div className="space-y-1">
                           <p className="text-[9px] font-bold text-market-blue uppercase tracking-[0.5em]">Valor de Mercado</p>
                           <h3 className="text-5xl font-display font-black text-market-navy tracking-tighter">
                             {property.price.toLocaleString('pt-MZ')} <span className="text-sm text-market-slate/40 uppercase">MT</span>
                           </h3>
                         </div>
                         
                         <div className="space-y-3 py-6 border-y border-slate-100">
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

                         <button 
                           onClick={() => contactFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                           className="w-full bg-market-navy text-white hover:bg-market-blue py-6 rounded-[2rem] font-display font-bold text-xs uppercase tracking-[0.3em] transition-all transform active:scale-95 shadow-2xl flex items-center justify-center gap-4 group"
                         >
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
                       <h2 className="text-[11px] font-display font-bold text-market-slate uppercase tracking-[0.5em]">{t('detail.proximity')}</h2>
                       <p className="text-3xl font-display font-bold text-market-navy tracking-tighter">{t('detail.mobility')}</p>
                    </div>
                    <div className="space-y-4">
                       {(property.nearby || [
                         { label: 'Aeroporto', distance: '12 min' },
                         { label: 'Centro Financeiro', distance: '5 min' },
                         { label: 'Marina', distance: '8 min' },
                         { label: 'Escola', distance: '15 min' }
                       ]).map((site, i) => (
                         <div key={i} className="p-5 bg-slate-50/50 border border-slate-100 rounded-2xl flex items-center justify-between hover:bg-white hover:shadow-lg transition-all group">
                            <div className="flex items-center gap-3">
                               <div className="p-2 bg-white rounded-lg shadow-sm group-hover:bg-market-blue group-hover:text-white transition-all text-market-blue">
                                  <Navigation size={14} />
                               </div>
                               <span className="text-xs font-bold text-market-navy">{site.label}</span>
                            </div>
                            <span className="text-[9px] font-mono font-bold text-market-slate bg-white px-2 py-0.5 rounded-full border border-slate-100">{site.distance}</span>
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
                       <h2 className="text-3xl md:text-5xl font-display font-black text-market-navy tracking-tighter">{t('detail.continuity')}</h2>
                       <p className="text-market-slate text-lg font-medium">{t('detail.explore_more')}</p>
                    </div>
                    <button onClick={() => { navigate('/imoveis'); window.scrollTo(0, 0); }} className="px-8 py-4 bg-white border border-slate-100 rounded-full text-market-navy font-display font-bold text-[10px] uppercase tracking-widest hover:bg-market-navy hover:text-white transition-all shadow-xl">
                      Ver Portfólio Completo
                    </button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {relatedProperties.map((p) => (
                      <div 
                        key={p.id} 
                        className="market-card group cursor-pointer hover:-translate-y-4" 
                        onClick={() => { navigate(`/imovel/${p.id}`); window.scrollTo(0,0); }}
                      >
                         <div className="relative h-64 overflow-hidden">
                            <img src={p.image || undefined} className="w-full h-full object-cover transition-all duration-[1500ms] group-hover:scale-110" alt="" />
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all"></div>
                            <div className="absolute top-6 right-6 px-4 py-2 bg-white rounded-full text-[9px] font-bold uppercase tracking-widest text-market-navy shadow-2xl">{p.deal_type}</div>
                         </div>
                         <div className="p-10 space-y-6">
                            <div className="space-y-2">
                               <p className="text-[9px] font-bold text-market-blue uppercase tracking-[0.3em]">{p.type}</p>
                               <h4 className="text-xl font-display font-bold text-market-navy truncate group-hover:text-market-blue transition-colors tracking-tight">{p.title}</h4>
                            </div>
                            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                               <p className="text-lg font-display font-bold text-market-navy">{p.price.toLocaleString('pt-MZ')} MT</p>
                               <div className="flex items-center gap-4 text-market-slate">
                                  <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase"><BedDouble size={14} /> {p.bedrooms}</div>
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

          {/* Luxury Sidebar - Slim & Tactical */}
          <aside className="lg:col-span-4 space-y-4">
             <div ref={contactFormRef} className="sticky top-16 space-y-4">
                <div className="bg-market-navy rounded-[2rem] border border-white/10 shadow-xl overflow-hidden flex flex-col transition-all duration-700">
                   {/* Exclusive Concierge Header - Slim */}
                   <div className="p-4 bg-white/5 border-b border-white/5 relative overflow-hidden flex items-center gap-3">
                      <div className="relative z-10">
                        <img src={`https://picsum.photos/seed/concierge_${property?.id}/150`} className="w-10 h-10 rounded-xl object-cover border-2 border-white/10 shadow-xl" alt="" />
                      </div>
                      <div className="relative z-10">
                        <div className="text-lg font-display font-bold text-white tracking-tight leading-none mb-1">{t('detail.concierge')}</div>
                        <div className="text-[7px] font-bold text-market-blue uppercase tracking-widest flex items-center gap-1.5">
                           <div className="w-1 h-1 bg-market-blue rounded-full"></div> {t('detail.specialist')}
                        </div>
                      </div>
                   </div>

                   {/* Manifestar Interesse Form - Integrated */}
                   <div className="p-5 space-y-3">
                      {!contactSuccess ? (
                        <>
                          <div className="space-y-3">
                             <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-market-blue transition-colors" size={14} />
                                <input 
                                  placeholder={t('detail.form.name')} 
                                  value={contactForm.name}
                                  onChange={e => setContactForm({...contactForm, name: e.target.value})}
                                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-white/20 focus:ring-2 focus:ring-market-blue/40 outline-none transition-all" 
                                />
                             </div>
                             <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-market-blue transition-colors" size={14} />
                                <input 
                                  type="email"
                                  placeholder={t('detail.form.email')} 
                                  value={contactForm.email}
                                  onChange={e => setContactForm({...contactForm, email: e.target.value})}
                                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-white/20 focus:ring-2 focus:ring-market-blue/40 outline-none transition-all" 
                                />
                             </div>
                             <textarea 
                               placeholder={t('detail.form.message')} 
                               rows={3}
                               value={contactForm.message}
                               onChange={e => setContactForm({...contactForm, message: e.target.value})}
                               className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-white placeholder:text-white/20 focus:ring-2 focus:ring-market-blue/40 outline-none transition-all resize-none"
                             />
                          </div>

                          <button 
                             onClick={handleContactSubmit}
                             disabled={isSending}
                             className="w-full market-button market-button-primary py-3.5 text-[9px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl relative overflow-hidden group/btn disabled:opacity-50"
                          >
                             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                             {isSending ? <Loader2 size={16} className="animate-spin" /> : <><Sparkles size={14} className="animate-pulse" /> {t('detail.interest')}</>}
                          </button>
                        </>
                      ) : (
                        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                           <div className="text-center py-2">
                              <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full mb-3">
                                 <CheckCircle2 size={24} />
                              </div>
                              <p className="text-white font-bold text-sm">{t('detail.success.title')}</p>
                              <p className="text-white/40 text-[10px] mt-1">{t('detail.success.contact')}</p>
                           </div>
                           
                           <div className="grid grid-cols-1 gap-3">
                              <a 
                                href={getContactMessage('whatsapp')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-[#25D366] hover:bg-[#1db954] text-white py-4 rounded-xl flex items-center justify-center gap-3 font-bold text-[10px] uppercase tracking-widest transition-all shadow-xl active:scale-95"
                              >
                                 <MessageCircle size={18} /> {t('detail.success.whatsapp')}
                              </a>
                              <a 
                                href={getContactMessage('email')}
                                className="w-full bg-white/10 hover:bg-white/20 text-white py-4 rounded-xl flex items-center justify-center gap-3 font-bold text-[10px] uppercase tracking-widest transition-all border border-white/10 active:scale-95"
                              >
                                 <Mail size={18} /> {t('detail.success.email')}
                              </a>
                           </div>
                           
                           <button 
                             onClick={() => {
                               setContactSuccess(false);
                               setContactForm({ name: '', email: '', message: '' });
                             }}
                             className="w-full text-white/30 hover:text-white text-[9px] uppercase tracking-widest py-2 transition-colors font-bold"
                           >
                               {t('detail.success.new_req')}
                           </button>
                        </div>
                      )}
                   </div>
                </div>

                <div className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between group">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-market-blue text-white rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                         <Phone size={18} />
                      </div>
                      <div>
                         <p className="text-[8px] font-bold text-market-slate uppercase tracking-widest leading-none mb-1">Directo</p>
                         <p className="text-sm font-display font-black text-market-navy">+258 84 000 0000</p>
                      </div>
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
