
import React, { useState, useEffect } from 'react';
import { UserRole, User } from './types';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { supabase } from './supabaseClient';

// ERP Views
import DashboardView from './views/DashboardView';
import FinanceView from './views/FinanceView';
import HRView from './views/HRView';
import ProjectsView from './views/ProjectsView';
import PlansView from './views/PlansView';
import ReportsView from './views/ReportsView';
import AdminView from './views/AdminView';
import CatalogView from './views/CatalogView';
import FleetView from './views/FleetView';
import LoginView from './views/LoginView';
import OverviewView from './views/OverviewView';
import BeneficiariesView from './views/BeneficiariesView'; 

// Public Views
import HomeView from './views/HomeView';
import PropertyListView from './views/PropertyListView';
import PropertyDetailView from './views/PropertyDetailView';
import ServicesView from './views/ServicesView';
import ContactView from './views/ContactView';
import AboutView from './views/AboutView';
import CareerView from './views/CareerView';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPath, setCurrentPath] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // URL da Logo Corrigida (Evitando 404) e com suporte a Customização
  const DEFAULT_LOGO = 'https://raw.githubusercontent.com/lucide-react/lucide/main/icons/building-2.svg';
  const [systemLogo, setSystemLogo] = useState(localStorage.getItem('monte_custom_logo') || DEFAULT_LOGO);

  const ADMIN_GERAL_EMAIL = 'monteimobiliario@gmail.com';

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('monte_theme');
    
    // Listener Global para atualização da Logomarca em tempo real entre componentes
    const handleLogoUpdate = (e: any) => {
      if (e.detail) setSystemLogo(e.detail);
    };
    window.addEventListener('monteLogoUpdated', handleLogoUpdate);

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('monteLogoUpdated', handleLogoUpdate);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    checkUser();
    const handleInternalNav = (e: any) => { if (e.detail) setCurrentPath(e.detail); };
    window.addEventListener('navigate', handleInternalNav);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        await fetchAndSetUser(session.user);
      } else {
        // Se não há sessão, limpamos o utilizador se ele estava logado ou se foi um logout explícito
        setCurrentUser(null);
        
        // Se estivermos numa rota de ERP, voltamos para home
        const erpPaths = ['dashboard', 'finance', 'hr', 'projects', 'plans', 'reports', 'admin', 'catalog', 'fleet', 'overview', 'beneficiaries'];
        if (erpPaths.includes(currentPath)) {
          setCurrentPath('home');
        }
      }
    });
    return () => {
      subscription.unsubscribe();
      window.removeEventListener('navigate', handleInternalNav);
    };
  }, [currentPath]);

  useEffect(() => {
    if (currentUser && currentPath === 'login') {
      setCurrentPath('dashboard');
    }
  }, [currentUser, currentPath]);

  async function checkUser() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Session Error:", error.message);
        if (error.message.includes('Refresh Token Not Found') || error.message.includes('invalid') || error.message.includes('not found')) {
          await supabase.auth.signOut();
        }
        return;
      }
      if (session?.user) await fetchAndSetUser(session.user);
    } catch (err) {
      console.error("CheckUser catch:", err);
    } finally { 
      setIsInitializing(false); 
    }
  }

  async function fetchAndSetUser(sbUser: any) {
    try {
      const { data: emp } = await supabase.from('employees').select('*').eq('email', sbUser.email).maybeSingle();
      const isOwner = sbUser.email === ADMIN_GERAL_EMAIL;
      const user: User = {
        id: sbUser.id,
        name: isOwner ? 'Administrador Geral' : (emp?.name || sbUser.email.split('@')[0]),
        email: sbUser.email,
        role: isOwner ? UserRole.ADMIN : (emp?.role || UserRole.EMPLOYEE),
        avatar: emp?.avatar || `https://picsum.photos/seed/${sbUser.id}/100`,
        permissions: isOwner ? ['dashboard.view', 'catalog.view', 'catalog.manage', 'finance.view', 'finance.manage', 'projects.view', 'projects.manage', 'hr.view', 'hr.manage', 'fleet.view', 'fleet.manage', 'plans.view', 'plans.manage', 'admin.access', 'system.repair'] : (emp?.permissions || [])
      };
      setCurrentUser(user);
      if (currentPath === 'login') setCurrentPath('dashboard');
    } catch (err) {
      setCurrentUser({ id: sbUser.id, name: sbUser.email.split('@')[0], email: sbUser.email, role: UserRole.EMPLOYEE, avatar: `https://picsum.photos/seed/${sbUser.id}/100`, permissions: [] });
    }
  }

  const handleLogout = async () => { await supabase.auth.signOut(); setCurrentUser(null); setCurrentPath('home'); };

  const handleViewProperty = (id: string) => { setSelectedPropertyId(id); setCurrentPath('imovel-detalhes'); window.scrollTo(0, 0); };

  const isERPRoute = ['dashboard', 'finance', 'hr', 'projects', 'plans', 'reports', 'admin', 'catalog', 'fleet', 'overview', 'beneficiaries'].includes(currentPath);

  const renderContent = () => {
    switch (currentPath) {
      case 'home': return <HomeView onNavigate={setCurrentPath} onViewProperty={handleViewProperty} />;
      case 'imoveis': return <PropertyListView onViewProperty={handleViewProperty} />;
      case 'imovel-detalhes': return <PropertyDetailView propertyId={selectedPropertyId} onBack={() => setCurrentPath('imoveis')} />;
      case 'servicos': return <ServicesView />;
      case 'contato': return <ContactView />;
      case 'sobre': return <AboutView />;
      case 'carreira': return <CareerView />;
      case 'login': return (
        <LoginView 
          onLoginSuccess={(u) => { setCurrentUser(u); setCurrentPath('dashboard'); }} 
          onBack={() => setCurrentPath('home')} 
        />
      );
      case 'dashboard': return <DashboardView />;
      case 'catalog': return <CatalogView />;
      case 'finance': return <FinanceView />;
      case 'beneficiaries': return <BeneficiariesView />;
      case 'hr': return <HRView />;
      case 'fleet': return <FleetView />;
      case 'projects': return <ProjectsView />;
      case 'plans': return <PlansView />;
      case 'reports': return <ReportsView />;
      case 'overview': return <OverviewView />;
      case 'admin': return <AdminView currentUser={currentUser} />;
      default: return <HomeView onNavigate={setCurrentPath} onViewProperty={handleViewProperty} />;
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-market-blue rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-market-accent rounded-full blur-[120px] animate-pulse delay-700"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center gap-8">
          <div className="relative">
            <div className="w-28 h-28 bg-white rounded-[2.5rem] flex items-center justify-center p-6 shadow-[0_0_100px_rgba(255,255,255,0.1)] relative z-20 overflow-hidden">
              <motion.img 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                src={systemLogo} 
                className="w-full h-full object-contain" 
                alt="Monte" 
              />
            </div>
            {/* Spinning ring */}
            <div className="absolute inset-[-10px] border-2 border-dashed border-white/10 rounded-[3rem] animate-[spin_10s_linear_infinite]"></div>
          </div>

          <div className="space-y-3">
            <h2 className="text-white font-bold text-lg tracking-widest uppercase">Monte Imobiliária</h2>
            <div className="flex items-center justify-center gap-2">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      height: [4, 12, 4],
                      opacity: [0.3, 1, 0.3]
                    }}
                    transition={{ 
                      duration: 1, 
                      repeat: Infinity, 
                      delay: i * 0.2 
                    }}
                    className="w-1 bg-market-blue rounded-full"
                  />
                ))}
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Sincronizando Ecossistema Cloud</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isERPRoute && currentUser) {
    return (
      <div className={`flex h-screen overflow-hidden bg-slate-50 relative`}>
        <Sidebar currentPath={currentPath} onNavigate={setCurrentPath} user={currentUser} isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header 
            user={currentUser} 
            onLogout={handleLogout} 
            onOpenSidebar={() => setIsSidebarOpen(true)} 
            onViewProperty={handleViewProperty}
          />
          <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
            <div className="max-w-[1800px] mx-auto min-h-[calc(100vh-theme(spacing.40))]">{renderContent()}</div>
            <div className="mt-12 -mx-4 md:-mx-8">
              <Footer onNavigate={setCurrentPath} />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col bg-white text-slate-900`}>
      <Navbar currentPath={currentPath} onNavigate={setCurrentPath} isLoggedIn={!!currentUser} />
      <main className="flex-1">{renderContent()}</main>
      <Footer onNavigate={setCurrentPath} />

      {/* Scroll to Top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 right-8 z-[100] w-12 h-12 bg-market-blue text-white rounded-2xl shadow-2xl flex items-center justify-center hover:bg-market-navy hover:-translate-y-2 transition-all"
          >
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
