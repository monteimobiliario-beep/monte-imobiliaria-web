
import React, { useState, useEffect, useRef } from 'react';
import { User, Property, UserRole } from '../types';
import { Bell, Search, LogOut, Menu, Loader2, MapPin, X, Globe } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useBranding } from '../BrandingContext';
import { useTranslation } from '../src/i18nContext';

import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onOpenSidebar: () => void;
}

const NOTIFICATION_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

const Header: React.FC<HeaderProps> = ({ user, onLogout, onOpenSidebar }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Property[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [unreadApplications, setUnreadApplications] = useState(0);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [showPropertyNotification, setShowPropertyNotification] = useState(false);
  const [lastAddedProperty, setLastAddedProperty] = useState<Property | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    audioRef.current = new Audio(NOTIFICATION_SOUND);
    fetchInitialUnread();

    const channel = supabase
      .channel('header_notifications')
      .on('postgres_changes' as any, { event: 'INSERT', table: 'job_applications' }, () => {
        setUnreadApplications(prev => prev + 1);
        setShowNotificationPopup(true);
        if (audioRef.current) audioRef.current.play().catch(() => {});
        setTimeout(() => setShowNotificationPopup(false), 5000);
      })
      .on('postgres_changes' as any, { event: 'INSERT', table: 'properties' }, (payload: any) => {
        const adminRoles = [UserRole.ADMIN, UserRole.CEO, UserRole.MANAGER];
        if (adminRoles.includes(user.role)) {
          setLastAddedProperty(payload.new as Property);
          setShowPropertyNotification(true);
          if (audioRef.current) audioRef.current.play().catch(() => {});
          setTimeout(() => setShowPropertyNotification(false), 8000);
        }
      })
      .on('postgres_changes' as any, { event: 'UPDATE', table: 'job_applications' }, () => {
        fetchInitialUnread();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user.role]);

  async function fetchInitialUnread() {
    const { count, error } = await supabase
      .from('job_applications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Pendente');
    
    if (!error) setUnreadApplications(count || 0);
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .or(`title.ilike.%${query}%,location.ilike.%${query}%`)
          .limit(5);

        if (!error && data) {
          setResults(data);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
        setShowResults(true);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectResult = (id: string) => {
    navigate(`/imovel/${id}`);
    setQuery('');
    setShowResults(false);
  };

  const { settings } = useBranding();
  const { language, setLanguage, t, tRole } = useTranslation();
  const systemLogo = settings.logoUrl;

  const toggleLanguage = () => {
    setLanguage(language === 'pt' ? 'en' : 'pt');
  };

  return (
    <header className="h-12 border-b flex items-center justify-between px-4 md:px-6 shrink-0 relative z-[60] bg-white border-slate-200">
      <div className="flex items-center gap-3 flex-1">
        <button onClick={onOpenSidebar} className="md:hidden text-slate-500 p-1 hover:bg-slate-100 rounded-lg">
          <Menu size={18} />
        </button>
        
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/dashboard')}>
           <div className="w-12 h-12 flex items-center justify-center transition-all">
             <img src={systemLogo || undefined} alt="Logo" className="w-full h-full object-contain" onError={(e) => (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/lucide-react/lucide/main/icons/building-2.svg'} />
           </div>
           <span className="hidden lg:block text-[10px] font-black uppercase tracking-widest text-market-navy">Monte <span className="text-market-blue">Hub</span></span>
        </div>

        <div className="h-4 w-px bg-slate-100 mx-2 hidden sm:block"></div>
        
        <div ref={searchRef} className="hidden sm:flex relative max-w-xs w-full">
          <span className="absolute inset-y-0 left-2.5 flex items-center text-slate-400">
            {isSearching ? <Loader2 size={12} className="animate-spin text-blue-600" /> : <Search size={12} />}
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setShowResults(true)}
            placeholder={t('header.search')}
            className="w-full pl-8 pr-8 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 border transition-all text-[11px] font-bold bg-slate-50 border-slate-200 text-slate-900"
          />
          {query && (
            <button 
              onClick={() => {setQuery(''); setResults([]);}} 
              className="absolute inset-y-0 right-2.5 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X size={12} />
            </button>
          )}

          {showResults && (query.length >= 2) && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-xl shadow-xl border overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200 bg-white border-slate-100 shadow-slate-200/50">
              <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                {results.length > 0 ? (
                  results.map((prop) => (
                    <button
                      key={prop.id}
                      onClick={() => handleSelectResult(prop.id)}
                      className="w-full flex items-center gap-3 p-2.5 transition-colors text-left border-b last:border-0 group hover:bg-slate-50 border-slate-50"
                    >
                      <img 
                        src={prop.image || null} 
                        alt="" 
                        className="w-7 h-7 rounded-md object-cover shadow-sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold truncate text-slate-900">{prop.title}</p>
                        <p className="text-[9px] text-slate-500 truncate">{prop.location}</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-400 text-[10px] italic font-bold">{t('header.no_results')}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-100"
        >
          <Globe size={12} className="text-market-blue" />
          {language.toUpperCase()}
        </button>

        <button className="relative p-1.5 rounded-lg transition-all text-slate-400 hover:text-blue-600 hover:bg-slate-50">
          <Bell size={16} className={unreadApplications > 0 ? "text-indigo-500 animate-pulse" : ""} />
          {unreadApplications > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
          )}
        </button>
        
        <div className="h-4 w-px bg-slate-200 mx-1"></div>

        <div className="flex items-center gap-2 pl-1">
          <div className="text-right hidden sm:block">
            <p className="text-[11px] font-black leading-none text-slate-900">{user.name}</p>
            <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{tRole(user.role)}</p>
          </div>
          <div className="relative shrink-0">
             <img src={user.avatar || null} alt={user.name} className="w-7 h-7 rounded-lg object-cover ring-2 ring-slate-100" />
          </div>
          <button 
            onClick={onLogout}
            title={t('erp.logout')}
            className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
