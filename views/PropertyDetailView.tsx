
import React, { useState, useEffect, useRef } from 'react';
import { MOCK_PROPERTIES } from '../constants';
import { 
  MapPin, BedDouble, Bath, Ruler, ArrowLeft, Share2, Heart, 
  ShieldCheck, ChevronRight, ChevronLeft, MessageSquare, Phone, Mail, 
  Maximize2, Send, Loader2, User, Bot, Sparkles, ZoomIn
} from 'lucide-react';
import { supabase } from '../supabaseClient';

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
  const [isLoading, setIsLoading] = useState(true);
  const property = MOCK_PROPERTIES.find(p => p.id === propertyId);
  
  const images = property ? [property.image, ...property.gallery] : [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
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

  // Simulação de busca de dados
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
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
    <div className="py-20 text-center">
      <p>Imóvel não encontrado.</p>
      <button onClick={onBack} className="text-blue-600 font-bold mt-4">Voltar</button>
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
    <div className="lg:col-span-2 space-y-8 animate-pulse">
      <div className="space-y-4">
        <div className="h-[350px] rounded-[2rem] bg-slate-200"></div>
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="shrink-0 w-24 h-16 rounded-xl bg-slate-200"></div>
          ))}
        </div>
      </div>
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
        <div className="h-10 bg-slate-200 rounded-xl w-1/2"></div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-slate-50 rounded-xl"></div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 md:px-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Breadcrumbs & Actions */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold text-sm transition-all group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Voltar
        </button>
        <div className="flex gap-2">
           <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-blue-600 transition-all"><Share2 size={16} /></button>
           <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-red-500 transition-all"><Heart size={16} /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {isLoading ? (
          <LoadingSkeleton />
        ) : property && (
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery Redimensionada para 60% da escala visual anterior */}
            <div className="space-y-4">
              <div className="relative group h-[300px] md:h-[400px] rounded-[2.5rem] overflow-hidden shadow-2xl bg-slate-100">
                <img 
                  src={images[currentIndex]} 
                  alt={`${property.title}`} 
                  className={`w-full h-full object-cover transition-all duration-500 transform ${isTransitioning ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}
                />
                
                <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <button onClick={prevImage} className="p-3 bg-white/90 backdrop-blur-md text-slate-900 rounded-full shadow-lg hover:bg-blue-600 hover:text-white transition-all transform active:scale-90"><ChevronLeft size={20} /></button>
                  <button onClick={nextImage} className="p-3 bg-white/90 backdrop-blur-md text-slate-900 rounded-full shadow-lg hover:bg-blue-600 hover:text-white transition-all transform active:scale-90"><ChevronRight size={20} /></button>
                </div>

                <div className="absolute top-5 left-5 flex gap-2 z-20">
                  <div className="bg-blue-600 text-white px-4 py-1.5 rounded-full font-black text-[9px] uppercase tracking-widest shadow-lg flex items-center gap-1.5">
                     <ShieldCheck size={12} /> {property.dealType}
                  </div>
                  <div className="bg-white/90 backdrop-blur-md text-slate-900 px-4 py-1.5 rounded-full font-black text-[9px] uppercase tracking-widest shadow-lg">
                    {currentIndex + 1} / {images.length}
                  </div>
                </div>
              </div>

              {/* Thumbnail Carousel mais compacto */}
              <div ref={scrollContainerRef} className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide px-1">
                {images.map((img, i) => (
                  <button 
                    key={i} 
                    ref={el => { thumbnailRefs.current[i] = el; }}
                    onClick={() => { triggerTransition(); setCurrentIndex(i); }}
                    className={`relative shrink-0 w-24 h-16 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                      currentIndex === i 
                      ? 'border-blue-600 ring-2 ring-blue-100 scale-95 opacity-100' 
                      : 'border-transparent opacity-60 hover:opacity-100 grayscale hover:grayscale-0'
                    }`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <div>
                    <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">{property.title}</h1>
                    <p className="flex items-center gap-2 text-slate-500 font-bold text-sm uppercase">
                      <MapPin size={18} className="text-blue-600" /> {property.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Preço Final</p>
                    <p className="text-4xl font-black text-blue-600 tracking-tighter">
                      {property.price.toLocaleString('pt-MZ')} MT
                    </p>
                  </div>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8 border-y border-slate-50">
                  {[
                    { icon: <BedDouble size={22} />, label: 'Quartos', value: property.beds },
                    { icon: <Bath size={22} />, label: 'WCs', value: property.baths },
                    { icon: <Ruler size={22} />, label: 'Área', value: `${property.area} m²` },
                    { icon: <ShieldCheck size={22} />, label: 'Vigilância', value: 'SIM' },
                  ].map((stat, i) => (
                    <div key={i} className="flex flex-col items-center text-center p-4 bg-slate-50 rounded-2xl hover:bg-blue-50 transition-all group">
                      <div className="text-blue-600 mb-2">{stat.icon}</div>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                      <span className="text-base font-black text-slate-900">{stat.value}</span>
                    </div>
                  ))}
               </div>

               <div className="mt-8 space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Detalhes</h2>
                  </div>
                  <p className="text-slate-600 leading-relaxed font-medium text-base">
                    {property.description}
                  </p>
               </div>
            </div>
          </div>
        )}

        {/* Sidebar remains same structure but consistent height */}
        <aside className="space-y-6">
           <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col h-[550px] sticky top-24">
              <div className="p-6 bg-slate-900 text-white flex items-center gap-4">
                <div className="relative">
                  <img src={`https://picsum.photos/seed/agent_${property?.id}/100`} className="w-12 h-12 rounded-xl object-cover ring-2 ring-blue-500" alt="" />
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></span>
                </div>
                <div>
                  <p className="text-sm font-black text-white">Consultor Monte</p>
                  <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Disponível</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-slate-50/50">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3.5 rounded-2xl text-xs font-medium shadow-sm ${
                      msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && <div className="flex justify-start"><div className="bg-white p-2 rounded-xl animate-pulse text-[10px] text-slate-400">...</div></div>}
                <div ref={chatEndRef} />
              </div>

              <div className="p-5 bg-white border-t border-slate-100">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <input value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Tire sua dúvida..." className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-blue-600 outline-none" />
                  <button type="submit" disabled={!inputText.trim() || isSending} className="p-3 bg-blue-600 text-white rounded-xl active:scale-95"><Send size={16} /></button>
                </form>
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
};

export default PropertyDetailView;
