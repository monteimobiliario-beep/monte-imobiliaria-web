
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
  FileText
} from 'lucide-react';
import { UserRole, Transaction, Employee, Project, StrategicPlan, Property, RealEstateService } from './types';

export const ERP_NAVIGATION = [
  { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: 'dashboard', roles: Object.values(UserRole) },
  { name: 'Financeiro', icon: <Wallet size={20} />, path: 'finance', roles: [UserRole.ADMIN, UserRole.FINANCE] },
  { name: 'Recursos Humanos', icon: <Users size={20} />, path: 'hr', roles: [UserRole.ADMIN, UserRole.HR] },
  { name: 'Projetos', icon: <Briefcase size={20} />, path: 'projects', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE] },
  { name: 'Plano Estratégico', icon: <Target size={20} />, path: 'plans', roles: [UserRole.ADMIN, UserRole.MANAGER] },
  { name: 'Relatórios', icon: <BarChart3 size={20} />, path: 'reports', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.FINANCE] },
  { name: 'Administração', icon: <ShieldCheck size={20} />, path: 'admin', roles: [UserRole.ADMIN] },
];

export const MOCK_PROPERTIES: Property[] = [
  { id: '1', title: 'Vivenda Moderna T4', type: 'Casa', dealType: 'Venda', price: 12500000, location: 'Alto da Manga', beds: 4, baths: 3, area: 250, image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800', featured: true },
  { id: '2', title: 'Apartamento Central T2', type: 'Apartamento', dealType: 'Arrendamento', price: 45000, location: 'Centro da Cidade', beds: 2, baths: 1, area: 85, image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800', featured: true },
  { id: '3', title: 'Terreno Industrial 1000m²', type: 'Terreno', dealType: 'Venda', price: 3000000, location: 'Munhava', beds: 0, baths: 0, area: 1000, image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800' },
];

export const MOCK_SERVICES: RealEstateService[] = [
  { id: 'paint', title: 'Pintura', description: 'Serviços profissionais de pintura interior e exterior com acabamento premium.', icon: 'Paintbrush' },
  { id: 'plumb', title: 'Canalização', description: 'Reparos, instalações e manutenção preventiva de sistemas hidráulicos.', icon: 'Droplets' },
  { id: 'refri', title: 'Refrigeração', description: 'Instalação e manutenção de Ar Condicionado e sistemas térmicos.', icon: 'Wind' },
  { id: 'consul', title: 'Consultoria', description: 'Apoio especializado na avaliação e regularização de imóveis.', icon: 'FileText' },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', type: 'RECEITA', category: 'Vendas', amount: 15000, date: '2023-11-01', description: 'Consultoria TI' },
  { id: '2', type: 'DESPESA', category: 'Infra', amount: 2500, date: '2023-11-02', description: 'Servidores AWS' },
  { id: '3', type: 'RECEITA', category: 'Assinaturas', amount: 8400, date: '2023-11-03', description: 'Mensalidades SaaS' },
  { id: '4', type: 'DESPESA', category: 'Salários', amount: 12000, date: '2023-11-05', description: 'Folha de Pagamento Nov' },
];

export const MOCK_EMPLOYEES: Employee[] = [
  { id: '1', name: 'Ana Silva', role: 'Dev Sr', department: 'Engenharia', salary: 12000, status: 'Ativo', avatar: 'https://picsum.photos/seed/ana/100' },
  { id: '2', name: 'Bruno Costa', role: 'CFO', department: 'Financeiro', salary: 18000, status: 'Ativo', avatar: 'https://picsum.photos/seed/bruno/100' },
  { id: '3', name: 'Carla Dias', role: 'Designer', department: 'Produto', salary: 8500, status: 'Férias', avatar: 'https://picsum.photos/seed/carla/100' },
  { id: '4', name: 'Diego Lima', role: 'Gerente RH', department: 'RH', salary: 10000, status: 'Ativo', avatar: 'https://picsum.photos/seed/diego/100' },
];

export const MOCK_PROJECTS: Project[] = [
  { id: '1', name: 'Expansão Latam', status: 'Em Andamento', budget: 50000, spent: 32000, deadline: '2024-03-30', team: ['Ana', 'Bruno'] },
  { id: '2', name: 'Novo SaaS v2', status: 'Planejado', budget: 25000, spent: 0, deadline: '2024-06-15', team: ['Carla', 'Ana'] },
  { id: '3', name: 'Rebranding', status: 'Concluído', budget: 15000, spent: 14800, deadline: '2023-10-10', team: ['Carla'] },
];

export const MOCK_PLANS: StrategicPlan[] = [
  { id: '1', goal: 'Aumentar Receita em 20%', kpi: 'MRR', progress: 65, responsible: 'Bruno Costa', deadline: '2024-12-31' },
  { id: '2', goal: 'Reduzir Churn para 2%', kpi: 'Churn Rate', progress: 40, responsible: 'Diego Lima', deadline: '2024-06-30' },
];
