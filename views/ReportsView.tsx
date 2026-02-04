
import React, { useState } from 'react';
import { BarChart3, FileText, Download, Loader2, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

const ReportsView: React.FC = () => {
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const headerMappings: Record<string, Record<string, string>> = {
    finance: {
      description: 'Descrição',
      amount: 'Valor (MT)',
      type: 'Tipo de Lançamento',
      category: 'Categoria',
      date: 'Data do Registo',
      beneficiary_name: 'Beneficiário/Responsável'
    },
    staff: {
      name: 'Nome Completo',
      role: 'Cargo/Função',
      department: 'Departamento',
      email: 'E-mail Corporativo',
      phone: 'Telemóvel',
      nuit: 'NUIT',
      niss: 'NISS',
      salary: 'Salário Base (MT)',
      status: 'Estado Contratual',
      join_date: 'Data de Admissão'
    },
    projects: {
      name: 'Nome da Obra',
      status: 'Estado de Execução',
      budget: 'Orçamento Total (MT)',
      spent: 'Valor Gasto (MT)',
      deadline: 'Prazo de Entrega',
      team: 'Equipa Técnica'
    }
  };

  const exportToCSV = (data: any[], type: string, filename: string) => {
    if (data.length === 0) {
      alert("Nenhum dado disponível para exportação na nuvem.");
      return;
    }

    const mapping = headerMappings[type] || {};
    const keys = Object.keys(mapping).length > 0 ? Object.keys(mapping) : Object.keys(data[0]);
    const headers = keys.map(k => mapping[k] || k);

    const csvContent = [
      headers.join(','),
      ...data.map(row => keys.map(key => {
        let value = row[key];
        
        // Formatações Especiais
        if (value === null || value === undefined) value = "";
        if (key === 'team' && Array.isArray(value)) value = value.join('; ');
        if (typeof value === 'string') value = value.replace(/"/g, '""');
        
        return `"${value}"`;
      }).join(','))
    ].join('\r\n');

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 4000);
  };

  const handleExport = async (type: 'finance' | 'staff' | 'projects') => {
    setIsExporting(type);
    try {
      let data: any[] = [];
      let filename = "";

      if (type === 'finance') {
        const { data: res } = await supabase
          .from('transactions')
          .select('*, beneficiary:beneficiaries(name)')
          .order('date', { ascending: false });
        data = (res || []).map(t => ({ ...t, beneficiary_name: t.beneficiary?.name || 'Fluxo Geral' }));
        filename = "Financeiro_Monte";
      } else if (type === 'staff') {
        const { data: res } = await supabase.from('employees').select('*').order('name');
        data = res || [];
        filename = "Recursos_Humanos_Monte";
      } else if (type === 'projects') {
        const { data: res } = await supabase.from('projects').select('*').order('created_at');
        data = res || [];
        filename = "Projetos_Obras_Monte";
      }

      exportToCSV(data, type, filename);
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Central de <span className="text-indigo-600">Exportação</span></h1>
          <p className="text-slate-500 font-medium">Extraia dados estruturados para análise externa ou auditoria.</p>
        </div>
        {showSuccess && (
          <div className="flex items-center gap-3 px-6 py-3 bg-emerald-500 text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg animate-bounce">
             <CheckCircle2 size={16} /> Relatório CSV Gerado com Sucesso
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { id: 'finance', title: 'Fluxo Financeiro', desc: 'Registo integral de entradas e saídas.', icon: <BarChart3 /> },
          { id: 'staff', title: 'Dossiê Staff 360º', desc: 'Dados fiscais, sociais e contratuais.', icon: <FileSpreadsheet /> },
          { id: 'projects', title: 'Performance Obras', desc: 'Custos reais vs orçamentos.', icon: <FileText /> },
        ].map((item) => (
          <div key={item.id} className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl group hover:shadow-2xl transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 opacity-[0.02] rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all mb-8 shadow-inner">
               {item.icon}
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-4">{item.title}</h3>
            <p className="text-sm text-slate-500 mb-10 leading-relaxed font-medium">"{item.desc}"</p>
            <button 
              onClick={() => handleExport(item.id as any)}
              disabled={isExporting !== null}
              className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-50"
            >
              {isExporting === item.id ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              Exportar para CSV
            </button>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 p-16 rounded-[4.5rem] text-white relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-10">
         <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
         <div className="relative z-10 max-w-xl">
            <h2 className="text-3xl font-black mb-4 tracking-tight leading-tight uppercase italic">Auditoria & Transparência</h2>
            <p className="text-slate-400 font-medium text-lg leading-relaxed">
              O ecossistema Monte Cloud garante a integridade de cada byte exportado, permitindo que os seus dados financeiros e de RH estejam sempre prontos para inspeções fiscais em Moçambique.
            </p>
         </div>
         <div className="relative z-10 p-10 bg-white/5 rounded-[3rem] border border-white/10 backdrop-blur-xl">
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest mb-6 text-indigo-400">
               <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div> Status da Base de Dados
            </div>
            <p className="text-3xl font-black tracking-tighter">100% Sincronizado</p>
         </div>
      </div>
    </div>
  );
};

export default ReportsView;
