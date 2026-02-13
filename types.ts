
// Fix: Added missing React import to define types using React.ReactNode namespace
import React from 'react';

export enum UserRole {
  ADMIN = 'Administrador de Sistema',
  CEO = 'Director Executivo (CEO)',
  MANAGER = 'Gestor Geral Operacional',
  FINANCE = 'Director Financeiro',
  HR = 'Gestor de Recursos Humanos',
  SALES_LEAD = 'Chefe de Vendas',
  SALES = 'Consultor Imobiliário',
  MAINTENANCE_LEAD = 'Supervisor de Manutenção',
  MAINTENANCE = 'Técnico Especializado',
  IT_MANAGER = 'Gestor de TI & Sistemas',
  MARKETING = 'Marketing & Comunição',
  SECURITY_LEAD = 'Chefe de Segurança',
  RECEPTIONIST = 'Recepcionista / Front Desk',
  EMPLOYEE = 'Colaborador Geral'
}

export type TransactionStatus = 'Pago' | 'Pendente' | 'Vencido' | 'Cancelado';
export type PaymentMethod = 'Banco' | 'M-Pesa' | 'e-Mola' | 'Dinheiro' | 'Cartão' | 'Cheque';

export interface Transaction {
  id: string;
  type: 'RECEITA' | 'DESPESA';
  category: string;
  amount: number;
  date: string;
  due_date?: string;
  payment_date?: string;
  status: TransactionStatus;
  description: string;
  beneficiary_id?: string;
  beneficiary_name?: string; 
  client_supplier_name?: string;
  receipt_url?: string;
  payment_method?: PaymentMethod;
  project_id?: string;
  is_recurring?: boolean;
  recurrence_period?: 'Mensal' | 'Anual' | 'Semanal';
}

export interface Beneficiary {
  id: string;
  name: string;
  category: string;
  phone?: string;
  email?: string;
  created_at?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  permissions: string[];
}

export interface NavItem {
  name: string;
  icon: React.ReactNode;
  path: string;
  roles: UserRole[];
  permission?: string;
}

export interface Property {
  id: string;
  title: string;
  type: string;
  dealType: 'Venda' | 'Aluguel';
  price: number;
  location: string;
  beds: number;
  baths: number;
  area: number;
  image: string;
  gallery: string[];
  description: string;
  featured?: boolean;
}

export interface Project {
  id: string;
  name: string;
  status: 'Planejado' | 'Em Andamento' | 'Concluído';
  budget: number;
  spent: number;
  deadline: string;
  team: string[];
  image?: string;
}

export interface StrategicPlan {
  id: string;
  goal: string;
  kpi: string;
  progress: number;
  responsible: string;
  deadline: string;
}

export interface Employee {
  id: string;
  name: string;
  role: UserRole;
  department: string;
  salary: number;
  status: 'Ativo' | 'Férias' | 'Inativo' | 'Suspenso';
  avatar: string;
  email: string;
  phone: string;
  join_date: string;
  permissions: string[];
  document_type?: string;
  document_number?: string;
  document_expiry?: string;
  payment_method?: PaymentMethod;
  contract_start?: string;
  nuit?: string;
  niss?: string;
  emergency_contact?: string;
  gender?: 'M' | 'F' | 'O';
  address?: string;
}

export interface JobVacancy {
  id: string;
  title: string;
  area: string;
  type: string;
  location: string;
  salary: string;
  description?: string;
  image?: string;
  status: 'Open' | 'Closed';
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'Baixa' | 'Média' | 'Alta';
  due_date: string | null;
  beneficiary_id: string | null;
  created_at?: string;
}

export interface Partner {
  id: string;
  name: string;
  logo: string;
  description: string;
}

export interface MarketingPost {
  id: string;
  title: string;
  platform: string;
  status: 'Published' | 'Scheduled' | 'Draft';
  scheduledDate: string;
  image: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: string;
  location: string;
}

export interface Contract {
  id: string;
  employeeId: string;
  type: string;
  startDate: string;
  endDate?: string;
  salaryBase: number;
  status: string;
}

export interface RealEstateService {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface JobApplication {
  id: string;
  job_id: string;
  job_title: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string;
  applicant_linkedin?: string;
  message: string;
  status: 'Pendente' | 'Aprovado' | 'Rejeitado';
  consent_given: boolean;
  consent_timestamp: string;
  created_at: string;
}

export type PropertyCategory = 'Casa' | 'Apartamento' | 'Guest House' | 'Hotel' | 'Condomínio' | 'Terreno';
