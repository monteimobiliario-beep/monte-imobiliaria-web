
import React, { useState, useEffect, useRef } from 'react';
import { User, Property, UserRole } from '../types';
import { Bell, Search, LogOut, Menu, Loader2, MapPin, X } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onOpenSidebar: () => void;
  onViewProperty: (id: string) => void;
}

const NOTIFICATION_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

const Header: React.FC<HeaderProps> = ({ user, onLogout, onOpenSidebar, onViewProperty }) => {
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

  useEffect(() => {
    audioRef.current = new Audio(NOTIFICATION_SOUND);
    fetchInitialUnread();

    const channel = supabase
      .channel('header_notifications')
      .on('postgres_changes', { event: 'INSERT', table: 'job_applications' }, () => {
        setUnreadApplications(prev => prev + 1);
        setShowNotificationPopup(true);
        if (audioRef.current) audioRef.current.play().catch(() => {});
        setTimeout(() => setShowNotificationPopup(false), 5000);
      })
      .on('postgres_changes', { event: 'INSERT', table: 'properties' }, (payload) => {
        const adminRoles = [UserRole.ADMIN, UserRole.CEO, UserRole.MANAGER];
        if (adminRoles.includes(user.role)) {
          setLastAddedProperty(payload.new as Property);
          setShowPropertyNotification(true);
          if (audioRef.current) audioRef.current.play().catch(() => {});
          setTimeout(() => setShowPropertyNotification(false), 8000);
        }
      })
      .on('postgres_changes', { event: 'UPDATE', table: 'job_applications' }, () => {
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
    onViewProperty(id);
    setQuery('');
    setShowResults(false);
  };

  return (
    <header className="h-20 border-b flex items-center justify-between px-4 md:px-8 shrink-0 relative z-[60] bg-white border-slate-200">
      <div className="flex items-center gap-4 flex-1">
        <button onClick={onOpenSidebar} className="md:hidden text-slate-500 p-2 hover:bg-slate-100 rounded-lg">
          <Menu size={24} />
        </button>
        
        <div ref={searchRef} className="hidden sm:flex relative max-w-xs md:max-w-md w-full">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
            {isSearching ? <Loader2 size={18} className="animate-spin text-blue-600" /> : <Search size={18} />}
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setShowResults(true)}
            placeholder="Pesquisar catálogo..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 border transition-all text-sm font-medium bg-slate-50 border-slate-200 text-slate-900"
          />
          {query && (
            <button 
              onClick={() => {setQuery(''); setResults([]);}} 
              className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          )}

          {showResults && (query.length >= 2) && (
            <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl shadow-2xl border overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 bg-white border-slate-100 shadow-slate-200/50">
              <div className="p-3 border-b flex items-center justify-between bg-slate-50 border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cloud Index</span>
              </div>
              
              <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                {results.length > 0 ? (
                  results.map((prop) => (
                    <button
                      key={prop.id}
                      onClick={() => handleSelectResult(prop.id)}
                      className="w-full flex items-center gap-4 p-4 transition-colors text-left border-b last:border-0 group hover:bg-slate-50 border-slate-50"
                    >
                      <img 
                        src={prop.image} 
                        alt="" 
                        className="w-12 h-12 rounded-lg object-cover shadow-sm group-hover:scale-105 transition-transform"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate group-hover:text-indigo-400 transition-colors text-slate-900">{prop.title}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                          <MapPin size={10} className="text-indigo-500" />
                          <span className="truncate">{prop.location}</span>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-500">Nenhum resultado.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <button className="relative p-2.5 rounded-xl transition-all group text-slate-500 hover:bg-slate-50">
          <Bell size={20} className={unreadApplications > 0 ? "text-indigo-400 animate-pulse" : ""} />
          {unreadApplications > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[8px] font-black text-white shadow-sm">
              {unreadApplications > 9 ? '+9' : unreadApplications}
            </span>
          )}
        </button>
        
        <div className="h-8 w-px bg-slate-200"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black leading-none text-slate-900">{user.name}</p>
            <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-tighter">{user.role}</p>
          </div>
          <div className="relative">
             <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-100" />
             <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
          </div>
          <button 
            onClick={onLogout}
            className="ml-2 p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
            title="Sair do sistema"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
