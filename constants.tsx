
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

export const MOCK_PARTNERS: Partner[] = [];

export const MOCK_POSTS: MarketingPost[] = [];

export const MOCK_EMPLOYEES: Employee[] = [];

export const MOCK_ATTENDANCE: AttendanceRecord[] = [];

export const MOCK_CONTRACTS: Contract[] = [];

export const MOCK_PROPERTIES: Property[] = [];

export const MOCK_SERVICES: RealEstateService[] = [];

export const MOCK_TRANSACTIONS: Transaction[] = [];

export const MOCK_PROJECTS: Project[] = [];

export const MOCK_PLANS: StrategicPlan[] = [];

