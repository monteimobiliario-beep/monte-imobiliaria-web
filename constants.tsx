
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
  Key
} from 'lucide-react';
import { UserRole, Transaction, Employee, Project, StrategicPlan, Property, RealEstateService, Contract, AttendanceRecord } from './types';

export const ERP_NAVIGATION = [
  { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: 'dashboard', roles: Object.values(UserRole) },
  { name: 'Financeiro', icon: <Wallet size={20} />, path: 'finance', roles: [UserRole.ADMIN, UserRole.CEO, UserRole.FINANCE] },
  { name: 'Recursos Humanos', icon: <Users size={20} />, path: 'hr', roles: [UserRole.ADMIN, UserRole.CEO, UserRole.HR] },
  { name: 'Projetos & Obras', icon: <Briefcase size={20} />, path: 'projects', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.MAINTENANCE_LEAD, UserRole.IT_MANAGER] },
  { name: 'Estratégia M&C', icon: <Target size={20} />, path: 'plans', roles: [UserRole.ADMIN, UserRole.CEO, UserRole.MANAGER] },
  { name: 'Inteligência de Dados', icon: <BarChart3 size={20} />, path: 'reports', roles: [UserRole.ADMIN, UserRole.CEO, UserRole.FINANCE, UserRole.MANAGER] },
  { name: 'Administração TI', icon: <ShieldCheck size={20} />, path: 'admin', roles: [UserRole.ADMIN, UserRole.IT_MANAGER] },
];

export const MOCK_EMPLOYEES: Employee[] = [
  { id: '1', name: 'Ana Silva', role: UserRole.SALES_LEAD, department: 'Vendas Imobiliárias', salary: 65000, status: 'Ativo', avatar: 'https://picsum.photos/seed/ana/100', email: 'ana.silva@monte-chaisa.com', phone: '+258 84 123 4567', joinDate: '2022-01-15', permissions: ['Vendas', 'Gestao_Equipa'] },
  { id: '2', name: 'Bruno Costa', role: UserRole.FINANCE, department: 'Direcção Financeira', salary: 125000, status: 'Ativo', avatar: 'https://picsum.photos/seed/bruno/100', email: 'bruno.costa@monte-chaisa.com', phone: '+258 82 987 6543', joinDate: '2021-06-10', permissions: ['Financeiro_Total', 'Auditoria'] },
  { id: '3', name: 'Carla Dias', role: UserRole.MAINTENANCE, department: 'Manutenção Técnica', salary: 28000, status: 'Férias', avatar: 'https://picsum.photos/seed/carla/100', email: 'carla.dias@monte-chaisa.com', phone: '+258 87 111 2222', joinDate: '2023-03-20', permissions: ['Operacional'] },
  { id: '4', name: 'Diego Lima', role: UserRole.MANAGER, department: 'Gestão de Activos', salary: 85000, status: 'Ativo', avatar: 'https://picsum.photos/seed/diego/100', email: 'diego.lima@monte-chaisa.com', phone: '+258 84 333 4444', joinDate: '2022-11-05', permissions: ['Manager_Assets', 'Relatorios'] },
  { id: '5', name: 'Filipe Beira', role: UserRole.IT_MANAGER, department: 'Tecnologia & Inovação', salary: 95000, status: 'Ativo', avatar: 'https://picsum.photos/seed/filipe/100', email: 'filipe.it@monte-chaisa.com', phone: '+258 85 444 5555', joinDate: '2023-01-01', permissions: ['TI_Total', 'Seguranca_Sistemas'] },
  { id: '6', name: 'Gerson Matsinhe', role: UserRole.SECURITY_LEAD, department: 'Segurança Patrimonial', salary: 45000, status: 'Ativo', avatar: 'https://picsum.photos/seed/gerson/100', email: 'gerson.sec@monte-chaisa.com', phone: '+258 84 999 8888', joinDate: '2023-05-12', permissions: ['Seguranca_Acesso'] },
];

export const MOCK_CONTRACTS: Contract[] = [
  { id: 'c1', employeeId: '1', type: 'Efetivo', startDate: '2022-01-15', salaryBase: 65000, status: 'Ativo' },
  { id: 'c2', employeeId: '3', type: 'Prazo Certo', startDate: '2023-03-20', endDate: '2024-03-20', salaryBase: 28000, status: 'Ativo' },
];

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
  { id: 'a1', employeeId: '1', date: '2024-05-20', checkIn: '08:00', checkOut: '17:00', status: 'Presente', location: 'Sede Beira' },
  { id: 'a2', employeeId: '2', date: '2024-05-20', checkIn: '08:15', checkOut: '17:30', status: 'Atraso', location: 'Sede Beira' },
  { id: 'a3', employeeId: '4', date: '2024-05-20', checkIn: '07:50', checkOut: '16:00', status: 'Presente', location: 'Condomínio Palmeiras' },
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
      'https://images.unsplash.com/photo-1600607687940-4e524cb35297?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6f3ea?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Esta magnífica vivenda T4 localizada no prestigiado bairro Alto da Manga oferece o máximo em conforto e modernidade. Com acabamentos de primeira qualidade, uma cozinha americana totalmente equipada e uma área de lazer privativa com piscina. Ideal para famílias que buscam segurança e sofisticação.',
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
    gallery: [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Apartamento T2 moderno situado no coração da Beira. Próximo a todos os serviços essenciais, bancos e centros comerciais. Conta com segurança 24h, estacionamento privativo e uma vista incrível para a cidade.',
    featured: true 
  },
  { 
    id: '4', 
    title: 'Guest House Beira Mar', 
    type: 'Guest House', 
    dealType: 'Aluguel', 
    price: 120000, 
    location: 'Macuti', 
    beds: 8, 
    baths: 6, 
    area: 400, 
    image: 'https://images.unsplash.com/photo-1544124499-58912cbddada?auto=format&fit=crop&q=80&w=800', 
    gallery: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Oportunidade única de investimento em Macuti. Esta Guest House totalmente mobilada conta com 8 suítes decoradas com bom gosto, área de pequeno-almoço e proximidade imediata com a praia.',
    featured: true 
  },
  { 
    id: '5', 
    title: 'Hotel Monte Chaisa', 
    type: 'Hotel', 
    dealType: 'Venda', 
    price: 85000000, 
    location: 'Ponta Gea', 
    beds: 25, 
    baths: 25, 
    area: 1200, 
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800', 
    gallery: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Emblemático Hotel Monte Chaisa em Ponta Gea disponível para venda. Uma infraestrutura completa com restaurante, sala de conferências e ocupação histórica elevada. Perfeito para grupos hoteleiros em expansão.',
    featured: true 
  },
];

export const MOCK_SERVICES: RealEstateService[] = [
  { id: 'paint', title: 'Pintura', description: 'Serviços profissionais de pintura interior e exterior com acabamento premium.', icon: 'Paintbrush' },
  { id: 'plumb', title: 'Canalização', description: 'Reparos, instalações e manutenção preventiva de sistemas hidráulicos.', icon: 'Droplets' },
  { id: 'refri', title: 'Refrigeração', description: 'Instalação e manutenção de Ar Condicionado e sistemas térmicos.', icon: 'Wind' },
  { id: 'consul', title: 'Consultoria Imobiliária', description: 'Apoio especializado na avaliação e regularização de imóveis.', icon: 'FileText' },
  { id: 'hotel_mgmt', title: 'Gestão de Hotel', description: 'Administração profissional e operacional de unidades hoteleiras.', icon: 'Building' },
  { id: 'condo_mgmt', title: 'Gestão de Condomínio', description: 'Gestão completa de condomínios residenciais e comerciais.', icon: 'Key' },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', type: 'RECEITA', category: 'Vendas', amount: 15000, date: '2023-11-01', description: 'Consultoria TI' },
  { id: '2', type: 'DESPESA', category: 'Infra', amount: 2500, date: '2023-11-02', description: 'Servidores AWS' },
  { id: '3', type: 'RECEITA', category: 'Assinaturas', amount: 8400, date: '2023-11-03', description: 'Mensalidades SaaS' },
  { id: '4', type: 'DESPESA', category: 'Salários', amount: 12000, date: '2023-11-05', description: 'Folha de Pagamento Nov' },
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
