
import React, { useState, useEffect } from 'react';
import { UserRole, User } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// ERP Views
import DashboardView from './views/DashboardView';
import FinanceView from './views/FinanceView';
import HRView from './views/HRView';
import ProjectsView from './views/ProjectsView';
import PlansView from './views/PlansView';
import ReportsView from './views/ReportsView';
import AdminView from './views/AdminView';

// Public Views
import HomeView from './views/HomeView';
import PropertyListView from './views/PropertyListView';
import ServicesView from './views/ServicesView';
import ContactView from './views/ContactView';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPath, setCurrentPath] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Sync login state
  useEffect(() => {
    const savedUser = localStorage.getItem('erp_user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('erp_user');
    setCurrentUser(null);
    setCurrentPath('home');
  };

  const handleLogin = (role: UserRole) => {
    const user: User = {
      id: Math.random().toString(),
      name: `${role} User`,
      email: `${role.toLowerCase()}@monte-chaisa.com`,
      role,
      avatar: `https://picsum.photos/seed/${role}/100`
    };
    setCurrentUser(user);
    localStorage.setItem('erp_user', JSON.stringify(user));
    setCurrentPath('dashboard');
  };

  const isERPRoute = ['dashboard', 'finance', 'hr', 'projects', 'plans', 'reports', 'admin'].includes(currentPath);

  const renderContent = () => {
    switch (currentPath) {
      // Public
      case 'home': return <HomeView onNavigate={setCurrentPath} />;
      case 'imoveis': return <PropertyListView />;
      case 'servicos': return <ServicesView />;
      case 'contato': return <ContactView />;
      case 'login': return (
        <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center border border-slate-100">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Monte & Chaisa</h2>
            <p className="text-slate-500 mb-8">Gestão Profissional e Imobiliária</p>
            <div className="space-y-3">
              {Object.values(UserRole).map((role) => (
                <button
                  key={role}
                  onClick={() => handleLogin(role)}
                  className="w-full py-3 px-4 bg-slate-50 hover:bg-blue-600 hover:text-white transition-all rounded-xl font-medium text-slate-700 flex items-center justify-center gap-2 border border-slate-200"
                >
                  Entrar como {role}
                </button>
              ))}
            </div>
            <button onClick={() => setCurrentPath('home')} className="mt-6 text-sm text-blue-600 hover:underline">Voltar para o site</button>
          </div>
        </div>
      );
      // ERP
      case 'dashboard': return <DashboardView />;
      case 'finance': return <FinanceView />;
      case 'hr': return <HRView />;
      case 'projects': return <ProjectsView />;
      case 'plans': return <PlansView />;
      case 'reports': return <ReportsView />;
      case 'admin': return <AdminView />;
      default: return <HomeView onNavigate={setCurrentPath} />;
    }
  };

  if (isERPRoute && currentUser) {
    return (
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <Sidebar 
          currentPath={currentPath} 
          onNavigate={setCurrentPath} 
          userRole={currentUser.role}
          isOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header user={currentUser} onLogout={handleLogout} onOpenSidebar={() => setIsSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto">{renderContent()}</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar currentPath={currentPath} onNavigate={setCurrentPath} isLoggedIn={!!currentUser} />
      <main className="flex-1">
        {renderContent()}
      </main>
      <Footer onNavigate={setCurrentPath} />
    </div>
  );
};

export default App;
