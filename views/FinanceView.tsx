
import React from 'react';
import { MOCK_TRANSACTIONS } from '../constants';
import { ArrowUpCircle, ArrowDownCircle, Filter, Download, Plus } from 'lucide-react';

const FinanceView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestão Financeira</h1>
          <p className="text-slate-500">Controle suas receitas, despesas e fluxo de caixa.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
          <Plus size={20} />
          Novo Lançamento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <p className="text-sm font-medium text-slate-500 mb-1">Total Receber</p>
          <p className="text-2xl font-bold text-green-600">R$ 23.400,00</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <p className="text-sm font-medium text-slate-500 mb-1">Total Pagar</p>
          <p className="text-2xl font-bold text-red-600">R$ 14.500,00</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <p className="text-sm font-medium text-slate-500 mb-1">Saldo Previsto</p>
          <p className="text-2xl font-bold text-blue-600">R$ 8.900,00</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-bold text-slate-900">Transações Recentes</h3>
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"><Filter size={18} /></button>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"><Download size={18} /></button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Descrição</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_TRANSACTIONS.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {t.type === 'RECEITA' ? (
                      <span className="flex items-center gap-2 text-green-600 font-medium">
                        <ArrowUpCircle size={18} /> Receita
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-red-600 font-medium">
                        <ArrowDownCircle size={18} /> Despesa
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-slate-900">{t.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs px-2 py-1 bg-slate-100 rounded-full text-slate-600">{t.category}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{t.date}</td>
                  <td className={`px-6 py-4 text-right font-bold ${t.type === 'RECEITA' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'RECEITA' ? '+' : '-'} R$ {t.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinanceView;
