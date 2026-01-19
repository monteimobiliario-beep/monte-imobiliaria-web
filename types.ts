
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
  MARKETING = 'Marketing & Comunicação',
  SECURITY_LEAD = 'Chefe de Segurança',
  RECEPTIONIST = 'Recepcionista / Front Desk',
  EMPLOYEE = 'Colaborador Geral'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  permissions: string[];
}

export interface Transaction {
  id: string;
  type: 'RECEITA' | 'DESPESA';
  category: string;
  amount: number;
  date: string;
  description: string;
}

export type AttendanceStatus = 'Presente' | 'Falta' | 'Atraso' | 'Férias' | 'Licença';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: AttendanceStatus;
  location: string;
}

export type ContractType = 'Prazo Certo' | 'Prazo Incerto' | 'Efetivo' | 'Prestação de Serviços' | 'Estágio' | 'Consultoria';

export interface Contract {
  id: string;
  employeeId: string;
  type: ContractType;
  startDate: string;
  endDate?: string;
  salaryBase: number;
  status: 'Ativo' | 'Expirado' | 'Rescindido';
  documentUrl?: string;
  fileSize?: string;
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
  joinDate: string;
  permissions: string[];
}

export interface Project {
  id: string;
  name: string;
  status: 'Planejado' | 'Em Andamento' | 'Concluído';
  budget: number;
  spent: number;
  deadline: string;
  team: string[];
}

export interface StrategicPlan {
  id: string;
  goal: string;
  kpi: string;
  progress: number;
  responsible: string;
  deadline: string;
}

export type PropertyCategory = 'Casa' | 'Apartamento' | 'Terreno' | 'Guest House' | 'Hotel' | 'Condomínio';

export interface Property {
  id: string;
  title: string;
  type: PropertyCategory;
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

export interface RealEstateService {
  id: string;
  title: string;
  description: string;
  icon: string;
}
