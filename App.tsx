
import React, { useState, useEffect } from 'react';
import { UserRole, User } from './types';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { supabase, db } from './supabaseClient';

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

import { useBranding } from './BrandingContext';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPath, setCurrentPath] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const { settings } = useBranding();
  // Using settings.logoUrl instead of local state

  const ADMIN_GERAL_EMAIL = 'monteimobiliario@gmail.com';

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('monte_theme');
    
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth Event:", event);
      if (session) {
        await fetchAndSetUser(session.user);
      } else {
        setCurrentUser(null);
        lastFetchedEmail.current = null;
        // We handle navigation in a separate effect that watches currentUser
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleInternalNav = (e: any) => { if (e.detail) setCurrentPath(e.detail); };
    window.addEventListener('navigate', handleInternalNav);
    
    return () => {
      window.removeEventListener('navigate', handleInternalNav);
    };
  }, []);

  useEffect(() => {
    // Se estivermos numa rota de ERP e o utilizador não estiver logado (e não estiver inicializando)
    if (!isInitializing && !currentUser) {
      const erpPaths = ['dashboard', 'finance', 'hr', 'projects', 'plans', 'reports', 'admin', 'catalog', 'fleet', 'overview', 'beneficiaries'];
      if (erpPaths.includes(currentPath)) {
        console.log("Redirecting to home: ERP route protected");
        setCurrentPath('home');
      }
    }
  }, [currentUser, currentPath, isInitializing]);

  useEffect(() => {
    if (currentUser && currentPath === 'login') {
      setCurrentPath('dashboard');
    }
  }, [currentUser, currentPath]);

  const isChecking = React.useRef(false);

  async function checkUser() {
    if (isChecking.current) return;
    isChecking.current = true;

    try {
      console.log("Checking session status...");
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        if (error.message?.includes('Lock broken')) {
          console.warn("Auth synchronization lock info (expected in preview).");
          // If lock is broken, we should still try to get the user as it might work where getSession failed
          const { data: { user } } = await supabase.auth.getUser();
          if (user) await fetchAndSetUser(user);
          return;
        }
        console.warn("Session Verification Warning:", error.message);
        if (error.message.includes('Refresh Token Not Found') || error.message.includes('invalid') || error.message.includes('not found')) {
          await supabase.auth.signOut();
        }
        return;
      }
      
      if (session?.user) {
        console.log("Found session for:", session.user.email);
        await fetchAndSetUser(session.user);
      } else {
        // Safe check with getUser to verify if session exists but somehow didn't return in getSession due to lock
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await fetchAndSetUser(user);
        } else {
          console.log("No active session detected.");
        }
      }
    } catch (err: any) {
      if (err.message?.includes('Lock broken')) {
        console.warn("Caught lock error in checkUser, skipping gracefully.");
      } else {
        console.error("Critical error in checkUser:", err);
      }
    } finally { 
      isChecking.current = false;
      // Ensure we always stop initialize, but give a small grace for the user fetch
      setTimeout(() => setIsInitializing(false), 500);
    }
  }

  const lastFetchedEmail = React.useRef<string | null>(null);

  async function fetchAndSetUser(sbUser: any) {
    if (!sbUser || lastFetchedEmail.current === sbUser.email) return;
    
    try {
      lastFetchedEmail.current = sbUser.email;
      let emp = null;
      
      try {
        const { data, error: empError } = await db.hr('employees').select('*').eq('email', sbUser.email).maybeSingle();
        if (!empError) {
          emp = data;
        } else {
          console.warn("DICA: Se o erro for 'schema not found', lembre-se de expor os esquemas em Project Settings > API > Exposed schemas no Supabase.");
        }
      } catch (e) {
        console.warn("Esquema HR ainda não acessível via API. Verifique a configuração de 'Exposed schemas' no Supabase.");
      }

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
      console.error("fetchAndSetUser error:", err);
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
