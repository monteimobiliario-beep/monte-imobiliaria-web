
import React, { useState, useEffect } from 'react';
import { UserRole, User } from './types';
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
  const [systemLogo, setSystemLogo] = useState(localStorage.getItem('monte_custom_logo') || 'https://i.ibb.co/LzfNdf7Y/building-logo.png');

  const ADMIN_GERAL_EMAIL = 'monteimobiliario@gmail.com';

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('monte_theme');
    
    const handleLogoUpdate = (e: any) => {
      if (e.detail) setSystemLogo(e.detail);
    };
    window.addEventListener('monteLogoUpdated', handleLogoUpdate);
    return () => window.removeEventListener('monteLogoUpdated', handleLogoUpdate);
  }, []);

  useEffect(() => {
    checkUser();
    const handleInternalNav = (e: any) => { if (e.detail) setCurrentPath(e.detail); };
    window.addEventListener('navigate', handleInternalNav);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        await fetchAndSetUser(session.user);
      } else {
        setCurrentUser(null);
        const erpPaths = ['dashboard', 'finance', 'hr', 'projects', 'plans', 'reports', 'admin', 'catalog', 'fleet', 'overview', 'beneficiaries'];
        if (erpPaths.includes(currentPath)) setCurrentPath('home');
      }
    });
    return () => {
      subscription.unsubscribe();
      window.removeEventListener('navigate', handleInternalNav);
    };
  }, []);

  async function checkUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) await fetchAndSetUser(session.user);
    } catch (err) {} finally { setIsInitializing(false); }
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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-white rounded-[3rem] flex items-center justify-center p-5 shadow-[0_0_80px_rgba(255,255,255,0.05)] animate-pulse overflow-hidden">
          <img src={systemLogo} className="w-full h-full object-contain" alt="Loading" />
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
          {/* Otimização de Espaço: Padding reduzido de p-14 para p-4 md:p-8 */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
            <div className="max-w-[1800px] mx-auto">{renderContent()}</div>
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
    </div>
  );
};

export default App;
