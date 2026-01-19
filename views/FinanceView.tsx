
import React, { useState } from 'react';
import { MOCK_TRANSACTIONS as initialTransactions, MOCK_EMPLOYEES } from '../constants';
import { ArrowUpCircle, ArrowDownCircle, Filter, Download, Plus, DollarSign, PieChart, CreditCard, ChevronRight, X, User } from 'lucide-react';
import { Transaction } from '../types';

const FinanceView: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [showModal, setShowModal] = useState(false);
  const [newLaunch, setNewLaunch] = useState({
    description: '',
    category: 'Vendas',
    amount: '',
    type: 'DESPESA' as 'RECEITA' | 'DESPESA',
    employeeId: '',
  });

  const handleLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    let finalDesc = newLaunch.description;
    if (newLaunch.category === 'Salários' && newLaunch.employeeId) {
      const emp = MOCK_EMPLOYEES.find(e => e.id === newLaunch.employeeId);
      finalDesc = `Salário: ${emp?.name || 'Funcionário'}`;
    }

    const transaction: Transaction = {
      id: Math.random().toString(),
      description: finalDesc,
      category: newLaunch.category,
      amount: Number(newLaunch.amount),
      type: newLaunch.type,
      date: new Date().toISOString().split('T')[0],
    };
    setTransactions([transaction, ...transactions]);
    setShowModal(false);
    setNewLaunch({ description: '', category: 'Vendas', amount: '', type: 'DESPESA', employeeId: '' });
  };

  const totals = transactions.reduce((acc, curr) => {
    if (curr.type === 'RECEITA') acc.receita += curr.amount;
    else acc.despesa += curr.amount;
    return acc;
  }, { receita: 0, despesa: 0 });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Financeiro (MT)</h1>
          <p className="text-slate-500 font-medium">Controlo absoluto de fluxo e liquidez Monte & Chaisa.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/30 active:scale-95"
        >
          <Plus size={20} /> Novo Lançamento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
              <ArrowUpCircle size={24} />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Receitas</span>
          </div>
          <p className="text-3xl font-black text-green-600">{totals.receita.toLocaleString()} MT</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
              <ArrowDownCircle size={24} />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Despesas</span>
          </div>
          <p className="text-3xl font-black text-red-600">{totals.despesa.toLocaleString()} MT</p>
        </div>

        <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
              <DollarSign size={24} />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Saldo</span>
          </div>
          <p className="text-3xl font-black text-white">{(totals.receita - totals.despesa).toLocaleString()} MT</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-xl font-black text-slate-900">Extrato Consolidado</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <th className="px-8 py-5">Detalhes</th>
                <th className="px-8 py-5">Categoria</th>
                <th className="px-8 py-5">Data</th>
                <th className="px-8 py-5 text-right">Valor (MT)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition-all group">
                  <td className="px-8 py-6 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'RECEITA' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {t.type === 'RECEITA' ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{t.description}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6"><span className="text-[11px] font-bold px-3 py-1 bg-slate-100 text-slate-600 rounded-full">{t.category}</span></td>
                  <td className="px-8 py-6 text-sm font-medium text-slate-500">{t.date}</td>
                  <td className={`px-8 py-6 text-right font-black ${t.type === 'RECEITA' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'RECEITA' ? '+' : '-'} {t.amount.toLocaleString()} MT
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl relative">
            <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900"><X size={24} /></button>
            <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Novo Lançamento</h2>
            <form onSubmit={handleLaunch} className="space-y-6">
              <div className="flex p-1 bg-slate-100 rounded-2xl">
                <button type="button" onClick={() => setNewLaunch({...newLaunch, type: 'RECEITA'})} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${newLaunch.type === 'RECEITA' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Receita</button>
                <button type="button" onClick={() => setNewLaunch({...newLaunch, type: 'DESPESA'})} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${newLaunch.type === 'DESPESA' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Despesa</button>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoria</label>
                <select value={newLaunch.category} onChange={e => setNewLaunch({...newLaunch, category: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-900 appearance-none">
                  <option>Vendas</option>
                  <option>Aluguer</option>
                  <option>Manutenção</option>
                  <option>Salários</option>
                  <option>Impostos</option>
                </select>
              </div>
              {newLaunch.category === 'Salários' ? (
                <div className="space-y-1.5 animate-in slide-in-from-top-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Funcionário M&C</label>
                  <select required value={newLaunch.employeeId} onChange={e => setNewLaunch({...newLaunch, employeeId: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-900 appearance-none">
                    <option value="">Selecionar Funcionário...</option>
                    {MOCK_EMPLOYEES.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.department})</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descrição</label>
                  <input required value={newLaunch.description} onChange={e => setNewLaunch({...newLaunch, description: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-900" />
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Montante (MT)</label>
                <input required type="number" value={newLaunch.amount} onChange={e => setNewLaunch({...newLaunch, amount: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-900 text-xl" />
              </div>
              <button type="submit" className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3">Confirmar Lançamento <Plus size={20} /></button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceView;
