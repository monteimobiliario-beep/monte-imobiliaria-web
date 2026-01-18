
export enum UserRole {
  ADMIN = 'Administrador',
  MANAGER = 'Gestor',
  FINANCE = 'Financeiro',
  HR = 'RH',
  EMPLOYEE = 'Funcionário'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

export interface Transaction {
  id: string;
  type: 'RECEITA' | 'DESPESA';
  category: string;
  amount: number;
  date: string;
  description: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  salary: number;
  status: 'Ativo' | 'Férias' | 'Inativo';
  avatar: string;
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

export interface Property {
  id: string;
  title: string;
  type: 'Casa' | 'Apartamento' | 'Terreno';
  dealType: 'Venda' | 'Arrendamento';
  price: number;
  location: string;
  beds: number;
  baths: number;
  area: number;
  image: string;
  featured?: boolean;
}

export interface RealEstateService {
  id: string;
  title: string;
  description: string;
  icon: string;
}
