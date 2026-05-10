
import React, { useState, useEffect } from 'react';
import { UserRole, User } from './types';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Routes, Route, useNavigate, useLocation, Navigate, useParams } from 'react-router-dom';
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

// Helper for Property Detail with params
const PropertyDetailWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  return <PropertyDetailView propertyId={id || null} onBack={() => navigate('/imoveis')} />;
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const { settings } = useBranding();
  const navigate = useNavigate();
  const location = useLocation();

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
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth Event:", event);
      if (session) {
        if (lastFetchedEmail.current !== session.user.email) {
          fetchAndSetUser(session.user);
        }
      } else {
        setCurrentUser(null);
        lastFetchedEmail.current = null;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Protected Routes logic
    const erpPaths = [
      '/dashboard', '/finance', '/hr', '/projects', '/plans', 
      '/reports', '/admin', '/catalog', '/fleet', '/overview', '/beneficiaries'
    ];
    
    if (!isInitializing && !currentUser && erpPaths.some(path => location.pathname.startsWith(path))) {
      console.log("Redirecting to login: ERP route protected");
      navigate('/login');
    }
  }, [currentUser, location.pathname, isInitializing, navigate]);

  useEffect(() => {
    if (currentUser && location.pathname === '/login') {
      navigate('/dashboard');
    }
  }, [currentUser, location.pathname, navigate]);

  const isChecking = React.useRef(false);

  async function checkUser() {
    if (isChecking.current) return;
    isChecking.current = true;

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        if (error.message?.includes('Lock broken')) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) await fetchAndSetUser(user);
          return;
        }
        if (error.message.includes('Refresh Token Not Found') || error.message.includes('invalid') || error.message.includes('not found')) {
          await supabase.auth.signOut();
        }
        return;
      }
      
      if (session?.user) {
        await fetchAndSetUser(session.user);
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) await fetchAndSetUser(user);
      }
    } catch (err: any) {
      console.warn("Soft error in checkUser:", err.message);
    } finally { 
      isChecking.current = false;
      setIsInitializing(false);
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
        }
      } catch (e) {
        console.warn("Esquema HR ainda não acessível via API.");
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
    } catch (err) {
      console.error("fetchAndSetUser error:", err);
      setCurrentUser({ id: sbUser.id, name: sbUser.email.split('@')[0], email: sbUser.email, role: UserRole.EMPLOYEE, avatar: `https://picsum.photos/seed/${sbUser.id}/100`, permissions: [] });
    }
  }

  const handleLogout = async () => { 
    await supabase.auth.signOut(); 
    setCurrentUser(null); 
    navigate('/'); 
  };

  const currentERPPath = location.pathname.substring(1); // e.g. "dashboard"
  const isERPRoute = ['dashboard', 'finance', 'hr', 'projects', 'plans', 'reports', 'admin', 'catalog', 'fleet', 'overview', 'beneficiaries'].includes(currentERPPath);

  if (isInitializing) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[9999]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
          className="w-32 h-32 flex items-center justify-center p-4"
        >
          <img src={settings.logoUrl || undefined} alt="Carregando..." className="w-full h-full object-contain" />
        </motion.div>
        <div className="mt-8 flex flex-col items-center">
          <div className="w-48 h-1 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-market-blue"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <span className="mt-3 text-[10px] font-black uppercase tracking-[0.2em] text-market-navy animate-pulse">
            Monte Imobiliária <span className="text-market-blue">Hub</span>
          </span>
        </div>
      </div>
    );
  }

  const publicLayout = (content: React.ReactNode) => (
    <div className={`min-h-screen flex flex-col bg-white text-slate-900`}>
      <Navbar isLoggedIn={!!currentUser} />
      <main className="flex-1">{content}</main>
      <Footer />

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

  const erpLayout = (content: React.ReactNode) => (
    <div className={`flex h-screen overflow-hidden bg-slate-50 relative`}>
      <Sidebar user={currentUser!} isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header 
          user={currentUser!} 
          onLogout={handleLogout} 
          onOpenSidebar={() => setIsSidebarOpen(true)} 
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-[1800px] mx-auto min-h-[calc(100vh-theme(spacing.40))]">{content}</div>
          <div className="mt-12 -mx-4 md:-mx-8">
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={publicLayout(<HomeView />)} />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="/imoveis" element={publicLayout(<PropertyListView />)} />
      <Route path="/imovel/:id" element={publicLayout(<PropertyDetailWrapper />)} />
      <Route path="/servicos" element={publicLayout(<ServicesView />)} />
      <Route path="/contato" element={publicLayout(<ContactView />)} />
      <Route path="/sobre" element={publicLayout(<AboutView />)} />
      <Route path="/carreira" element={publicLayout(<CareerView />)} />
      <Route path="/login" element={
        <LoginView 
          onLoginSuccess={(u) => { setCurrentUser(u); navigate('/dashboard'); }} 
          onBack={() => navigate('/')} 
        />
      } />

      {/* ERP Routes */}
      <Route path="/dashboard" element={currentUser ? erpLayout(<DashboardView />) : <Navigate to="/login" replace />} />
      <Route path="/catalog" element={currentUser ? erpLayout(<CatalogView />) : <Navigate to="/login" replace />} />
      <Route path="/finance" element={currentUser ? erpLayout(<FinanceView />) : <Navigate to="/login" replace />} />
      <Route path="/beneficiaries" element={currentUser ? erpLayout(<BeneficiariesView />) : <Navigate to="/login" replace />} />
      <Route path="/hr" element={currentUser ? erpLayout(<HRView />) : <Navigate to="/login" replace />} />
      <Route path="/fleet" element={currentUser ? erpLayout(<FleetView />) : <Navigate to="/login" replace />} />
      <Route path="/projects" element={currentUser ? erpLayout(<ProjectsView />) : <Navigate to="/login" replace />} />
      <Route path="/plans" element={currentUser ? erpLayout(<PlansView />) : <Navigate to="/login" replace />} />
      <Route path="/reports" element={currentUser ? erpLayout(<ReportsView />) : <Navigate to="/login" replace />} />
      <Route path="/overview" element={currentUser ? erpLayout(<OverviewView />) : <Navigate to="/login" replace />} />
      <Route path="/admin" element={currentUser ? erpLayout(<AdminView currentUser={currentUser} />) : <Navigate to="/login" replace />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
