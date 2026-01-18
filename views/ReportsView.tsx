
import React from 'react';
import { BarChart3, PieChart, FileText, Download } from 'lucide-react';

const ReportsView: React.FC = () => {
  const reports = [
    { title: 'Fluxo de Caixa Consolidado', icon: <BarChart3 size={24} />, description: 'Resumo mensal de entradas e saídas.' },
    { title: 'Custos por Departamento', icon: <PieChart size={24} />, description: 'Distribuição de gastos por centro de custo.' },
    { title: 'Performance de Projetos', icon: <FileText size={24} />, description: 'KPIs e prazos de entregas recentes.' },
    { title: 'Folha de Pagamento', icon: <Download size={24} />, description: 'Detalhado de salários e benefícios.' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Relatórios & Insights</h1>
          <p className="text-slate-500">Exporte dados detalhados para sua tomada de decisão.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => (
          <div key={report.title} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all flex items-start gap-4 cursor-pointer group">
            <div className="p-4 bg-slate-50 rounded-2xl text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
              {report.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{report.title}</h3>
              <p className="text-sm text-slate-500 mb-4">{report.description}</p>
              <div className="flex gap-2">
                <button className="text-xs font-bold text-blue-600 hover:underline">Ver Agora</button>
                <span className="text-slate-300">•</span>
                <button className="text-xs font-bold text-blue-600 hover:underline">Baixar PDF</button>
                <span className="text-slate-300">•</span>
                <button className="text-xs font-bold text-blue-600 hover:underline">Excel</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportsView;
