
import React from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  Users, 
  Briefcase, 
  Target, 
  BarChart3, 
  ShieldCheck, 
  Paintbrush, 
  Droplets, 
  Wind, 
  FileText, 
  Building, 
  Key, 
  LayoutTemplate, 
  Truck, 
  BookOpen,
  Contact2 // Novo ícone para beneficiários
} from 'lucide-react';
import { UserRole, Transaction, Employee, Project, StrategicPlan, Property, RealEstateService, Contract, AttendanceRecord, MarketingPost, Partner, NavItem } from './types';

// Todos os papéis têm acesso a todas as rotas por padrão, mas filtrado por permissões granulares
const ALL_ROLES = Object.values(UserRole);

export const ERP_NAVIGATION: NavItem[] = [
  { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: 'dashboard', roles: ALL_ROLES, permission: 'dashboard.view' },
  { name: 'Gestão de Catálogo', icon: <LayoutTemplate size={20} />, path: 'catalog', roles: ALL_ROLES, permission: 'catalog.view' },
  { name: 'Financeiro', icon: <Wallet size={20} />, path: 'finance', roles: ALL_ROLES, permission: 'finance.view' },
  { name: 'Entidades & Contactos', icon: <Contact2 size={20} />, path: 'beneficiaries', roles: ALL_ROLES, permission: 'finance.view' },
  { name: 'Recursos Humanos', icon: <Users size={20} />, path: 'hr', roles: ALL_ROLES, permission: 'hr.view' },
  { name: 'Carreiras', icon: <Briefcase size={20} />, path: 'carreira', roles: ALL_ROLES }, // Acesso público permitido
  { name: 'Gestão de Frota', icon: <Truck size={20} />, path: 'fleet', roles: ALL_ROLES, permission: 'fleet.view' },
  { name: 'Projetos & Obras', icon: <Briefcase size={20} />, path: 'projects', roles: ALL_ROLES, permission: 'projects.view' },
  { name: 'Estratégia Monte Imobiliária', icon: <Target size={20} />, path: 'plans', roles: ALL_ROLES, permission: 'plans.view' },
  { name: 'Guia do Sistema', icon: <BookOpen size={20} />, path: 'overview', roles: ALL_ROLES, permission: 'dashboard.view' },
  { name: 'Administração TI', icon: <ShieldCheck size={20} />, path: 'admin', roles: ALL_ROLES, permission: 'admin.access' },
];

export const MOCK_PARTNERS: Partner[] = [
  { id: '1', name: 'Monte Tecnologia', logo: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=200', description: 'Soluções tecnológicas e infraestrutura de rede.' },
  { id: '2', name: 'FamilySearch', logo: 'https://images.unsplash.com/photo-1590650153855-d9e808231d41?auto=format&fit=crop&q=80&w=200', description: 'Consultoria jurídica e regularização de ativos.' },
  { id: '3', name: 'FastMoz', logo: 'https://images.unsplash.com/photo-1620288627223-53302f4e8c74?auto=format&fit=crop&q=80&w=200', description: 'Logística rápida e transporte de materiais de obra.' },
];

export const MOCK_POSTS: MarketingPost[] = [
  { id: 'p1', title: 'Lançamento Vivenda T4', platform: 'Instagram', status: 'Published', scheduledDate: '2024-05-18', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=400' },
  { id: 'p2', title: 'Promoção Aluguer Centro', platform: 'Facebook', status: 'Scheduled', scheduledDate: '2024-05-25', image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=400' },
  { id: 'p3', title: 'Dicas de Manutenção AC', platform: 'Instagram', status: 'Draft', scheduledDate: '2024-06-01', image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=400' },
];

export const MOCK_EMPLOYEES: Employee[] = [
  { id: '1', name: 'Ana Silva', role: UserRole.SALES_LEAD, department: 'Vendas Imobiliárias', salary: 65000, status: 'Ativo', avatar: 'https://picsum.photos/seed/ana/100', email: 'ana.silva@monteimobiliaria.com', phone: '+258 84 123 4567', join_date: '2022-01-15', permissions: ['Vendas', 'Gestao_Equipa'] },
  { id: '2', name: 'Bruno Costa', role: UserRole.FINANCE, department: 'Direcção Financeira', salary: 125000, status: 'Ativo', avatar: 'https://picsum.photos/seed/bruno/100', email: 'bruno.costa@monteimobiliaria.com', phone: '+258 82 987 6543', join_date: '2021-06-10', permissions: ['Financeiro_Total', 'Auditoria'] },
  { id: '3', name: 'Carla Dias', role: UserRole.MAINTENANCE, department: 'Manutenção Técnica', salary: 28000, status: 'Férias', avatar: 'https://picsum.photos/seed/carla/100', email: 'carla.dias@monteimobiliaria.com', phone: '+258 87 111 2222', join_date: '2023-03-20', permissions: ['Operacional'] },
  { id: '5', name: 'Filipe Beira', role: UserRole.IT_MANAGER, department: 'Tecnologia & Inovação', salary: 95000, status: 'Ativo', avatar: 'https://picsum.photos/seed/filipe/100', email: 'filipe.it@monteimobiliaria.com', phone: '+258 85 444 5555', join_date: '2023-01-01', permissions: ['TI_Total', 'Seguranca_Sistemas'] },
];

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
  { id: 'a1', employeeId: '1', date: '2024-05-20', checkIn: '08:00', checkOut: '17:00', status: 'Presente', location: 'Sede Beira' },
  { id: 'a2', employeeId: '2', date: '2024-05-20', checkIn: '08:15', checkOut: '17:05', status: 'Presente', location: 'Sede Beira' },
  { id: 'a3', employeeId: '5', date: '2024-05-20', checkIn: '08:00', checkOut: '17:00', status: 'Presente', location: 'Sede Beira' },
];

export const MOCK_CONTRACTS: Contract[] = [
  { id: 'c1', employeeId: '1', type: 'Efetivo', startDate: '2022-01-15', salaryBase: 65000, status: 'Ativo' },
  { id: 'c2', employeeId: '2', type: 'Efetivo', startDate: '2021-06-10', salaryBase: 125000, status: 'Ativo' },
  { id: 'c3', employeeId: '5', type: 'Prazo Certo', startDate: '2023-01-01', endDate: '2024-12-31', salaryBase: 95000, status: 'Ativo' },
];

export const MOCK_PROPERTIES: Property[] = [
  { 
    id: '1', 
    title: 'Vivenda Moderna T4', 
    type: 'Casa', 
    dealType: 'Venda', 
    price: 12500000, 
    location: 'Alto da Manga', 
    beds: 4, 
    baths: 3, 
    area: 250, 
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800', 
    gallery: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1600607687940-4e524cb35297?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Magnífica vivenda com acabamentos de luxo.',
    featured: true 
  },
  { 
    id: '2', 
    title: 'Apartamento Central T2', 
    type: 'Apartamento', 
    dealType: 'Aluguel', 
    price: 45000, 
    location: 'Centro da Cidade', 
    beds: 2, 
    baths: 1, 
    area: 85, 
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800', 
    gallery: [],
    description: 'Apartamento prático e central.',
    featured: true 
  },
];

export const MOCK_SERVICES: RealEstateService[] = [
  { id: 'paint', title: 'Pintura', description: 'Serviços profissionais de pintura interior e exterior.', icon: 'Paintbrush' },
  { id: 'plumb', title: 'Canalização', description: 'Reparos e instalações hidráulicas.', icon: 'Droplets' },
  { id: 'refri', title: 'Refrigeração', description: 'Manutenção de Ar Condicionado.', icon: 'Wind' },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  // Fix: Added missing required status property to ensure Transaction interface compliance
  { id: '1', type: 'RECEITA', category: 'Vendas', amount: 15000, date: '2023-11-01', description: 'Consultoria TI', status: 'Pago' },
];

export const MOCK_PROJECTS: Project[] = [
  { id: '1', name: 'Reforma Condomínio Mar', status: 'Em Andamento', budget: 500000, spent: 320000, deadline: '2024-07-30', team: ['Ana', 'Bruno'], image: 'https://images.unsplash.com/photo-1503387762-592dea58ef23?auto=format&fit=crop&q=80&w=800' },
  { id: '2', name: 'Pintura Fachada Hotel', status: 'Em Andamento', budget: 120000, spent: 45000, deadline: '2024-06-15', team: ['Carla'], image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800' },
];

export const MOCK_PLANS: StrategicPlan[] = [
  { id: '1', goal: 'Aumentar Portfólio em 15%', kpi: 'Inventory', progress: 45, responsible: 'Ana Silva', deadline: '2024-12-31' },
];
