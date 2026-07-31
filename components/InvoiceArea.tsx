import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Printer, 
  Save, 
  Search, 
  PlusCircle, 
  RefreshCw, 
  ChevronRight, 
  FileCheck2, 
  UserPlus2, 
  Coins, 
  Calendar, 
  UserCheck2,
  AlertTriangle,
  Copy,
  Receipt
} from 'lucide-react';
import { db } from '../supabaseClient';
import { Transaction, Beneficiary } from '../types';

interface InvoiceItem {
  description: string;
  qty: number;
  price: number;
}

interface ClientData {
  id: string;
  name: string;
  nuit: string;
  address: string;
  phone: string;
  email: string;
}

interface Invoice {
  id: string;
  invoiceNo: string;
  status: 'Pendente' | 'Paga' | 'Vencida' | 'Cancelado';
  issueDate: string;
  dueDate: string;
  companyName: string;
  companyTax: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  clientName: string;
  clientTax: string;
  clientAddress: string;
  clientPhone: string;
  clientEmail: string;
  servicePeriod: string;
  currency: string;
  items: InvoiceItem[];
  taxRate: number;
  discount: number;
  paymentInfo: string;
  notes: string;
  subtotal: number;
  taxAmount: number;
  total: number;
}

const MONTE_DEFAULT_PAYMENT = `Banco: BIM - Banco Internacional de Moçambique, SA
Conta: 473486683
Titular: Jose Manuel Augusto Panaca
M-Pesa / E-Mola: 875018283 / 846018283`;

const InvoiceArea: React.FC = () => {
  // Navigation & view state
  const [currentMode, setCurrentMode] = useState<'create' | 'history' | 'clients'>('create');
  
  // Invoice list state
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    try {
      const saved = localStorage.getItem('monte_invoices_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Client database state
  const [clients, setClients] = useState<ClientData[]>(() => {
    try {
      const saved = localStorage.getItem('monte_extended_clients');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [dbBeneficiaries, setDbBeneficiaries] = useState<Beneficiary[]>([]);
  const [loadingDbClients, setLoadingDbClients] = useState(false);

  // Form parameters
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [invoiceNo, setInvoiceNo] = useState('');
  const [status, setStatus] = useState<'Pendente' | 'Paga' | 'Vencida' | 'Cancelado'>('Pendente');
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().slice(0, 10);
  });
  
  const [companyName, setCompanyName] = useState('Monte Imobiliária');
  const [companyTax, setCompanyTax] = useState('150031281');
  const [companyAddress, setCompanyAddress] = useState('Avenida Julius Nyerere, Maputo, Moçambique');
  const [companyPhone, setCompanyPhone] = useState('+258 87 501 8283');
  const [companyEmail, setCompanyEmail] = useState('info@monteimobiliaria.co.mz');

  const [clientName, setClientName] = useState('');
  const [clientTax, setClientTax] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');

  const [servicePeriod, setServicePeriod] = useState(() => {
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const d = new Date();
    return `${months[d.getMonth()]} / ${d.getFullYear()}`;
  });
  const [currency, setCurrency] = useState('MT');
  const [items, setItems] = useState<InvoiceItem[]>([{ description: 'Prestação de Consultoria Imobiliária', qty: 1, price: 0 }]);
  const [taxRate, setTaxRate] = useState(16);
  const [discount, setDiscount] = useState(0);
  const [paymentInfo, setPaymentInfo] = useState(MONTE_DEFAULT_PAYMENT);
  const [notes, setNotes] = useState('A falta de pagamento dentro do prazo poderá resultar em cobrança adicional. Documento processado por computador da Monte Imobiliária.');

  // Searching history
  const [searchHistoryTerm, setSearchHistoryTerm] = useState('');
  const [searchClientTerm, setSearchClientTerm] = useState('');

  // Fetch central clients database from Supabase beneficiaries
  const fetchDbClients = async () => {
    setLoadingDbClients(true);
    try {
      const { data, error } = await db.finance('beneficiaries').select('*').order('name');
      if (!error && data) {
        // filter or preserve
        setDbBeneficiaries(data);
        
        // Auto-feed missing database clients to clients list
        setClients(prev => {
          const updated = [...prev];
          data.forEach(ben => {
            if (ben.category === 'Cliente' && !updated.some(c => c.name.toLowerCase() === ben.name.toLowerCase())) {
              updated.push({
                id: ben.id,
                name: ben.name,
                nuit: '',
                address: '',
                phone: ben.phone || '',
                email: ben.email || ''
              });
            }
          });
          return updated;
        });
      }
    } catch (e) {
      console.warn("Could not load beneficiaries from Supabase DB, using localStorage backup.", e);
    } finally {
      setLoadingDbClients(false);
    }
  };

  useEffect(() => {
    fetchDbClients();
  }, []);

  // Save clients list to localStorage when changed
  useEffect(() => {
    localStorage.setItem('monte_extended_clients', JSON.stringify(clients));
  }, [clients]);

  // Save invoices to localStorage when changed
  useEffect(() => {
    localStorage.setItem('monte_invoices_history', JSON.stringify(invoices));
  }, [invoices]);

  // Auto-generate next invoice number helper
  const generateNextInvoiceNo = () => {
    const year = new Date().getFullYear();
    const lastNum = invoices.reduce((max, inv) => {
      const match = inv.invoiceNo.match(/FT-\d+-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 0);
    const nextNo = `FT-${year}-${String(lastNum + 1).padStart(4, '0')}`;
    setInvoiceNo(nextNo);
  };

  useEffect(() => {
    if (!invoiceNo) {
      generateNextInvoiceNo();
    }
  }, [invoices]);

  // Calculations
  const calculatedValues = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
    const postDiscount = Math.max(0, subtotal - discount);
    const taxAmount = (postDiscount * taxRate) / 100;
    const total = postDiscount + taxAmount;
    return { subtotal, taxAmount, total };
  }, [items, taxRate, discount]);

  // Form triggers
  const handleAddItem = () => {
    setItems([...items, { description: 'Prestação de Serviço de Mediação', qty: 1, price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...items];
    if (field === 'qty') {
      updated[index].qty = Math.max(0, parseFloat(value) || 0);
    } else if (field === 'price') {
      updated[index].price = Math.max(0, parseFloat(value) || 0);
    } else {
      updated[index].description = value;
    }
    setItems(updated);
  };

  // Select Client prefill
  const handleSelectClient = (client: ClientData) => {
    setClientName(client.name);
    setClientTax(client.nuit || '');
    setClientAddress(client.address || '');
    setClientPhone(client.phone || '');
    setClientEmail(client.email || '');
  };

  // Add client to extended database
  const handleSaveClientToDb = async () => {
    if (!clientName.trim()) {
      alert("Por favor introduza o nome do cliente");
      return;
    }

    const existIndex = clients.findIndex(c => c.name.toLowerCase() === clientName.trim().toLowerCase());
    const newClient: ClientData = {
      id: existIndex >= 0 ? clients[existIndex].id : crypto.randomUUID(),
      name: clientName,
      nuit: clientTax,
      address: clientAddress,
      phone: clientPhone,
      email: clientEmail
    };

    if (existIndex >= 0) {
      const updated = [...clients];
      updated[existIndex] = newClient;
      setClients(updated);
    } else {
      setClients([newClient, ...clients]);
    }

    // Attempt sync with Supabase beneficiaries
    try {
      const payload = {
        name: clientName,
        category: 'Cliente',
        phone: clientPhone,
        email: clientEmail
      };
      
      const matchInDb = dbBeneficiaries.find(b => b.name.toLowerCase() === clientName.toLowerCase());
      if (matchInDb) {
        await db.finance('beneficiaries').update(payload).eq('id', matchInDb.id);
      } else {
        await db.finance('beneficiaries').insert([payload]);
      }
      fetchDbClients();
      alert(`Cliente "${clientName}" registado e sincronizado com o banco de dados central com sucesso!`);
    } catch (e: any) {
      console.warn("Could not insert beneficiary online. Saved locally.", e);
      alert(`Cliente "${clientName}" guardado offline com sucesso.`);
    }
  };

  // Delete general client
  const handleDeleteClient = async (id: string, name: string) => {
    if (!confirm(`Deseja mesmo remover o cliente ${name} da base de dados?`)) return;
    setClients(clients.filter(c => c.id !== id));
    
    try {
      const match = dbBeneficiaries.find(b => b.name.toLowerCase() === name.toLowerCase());
      if (match) {
        await db.finance('beneficiaries').delete().eq('id', match.id);
      }
      fetchDbClients();
    } catch {
      console.warn("Could not delete from database, deleted locally.");
    }
  };

  // Save changes to invoice
  const handleSaveInvoice = () => {
    if (!clientName.trim()) {
      alert("Por favor introduza os dados do cliente.");
      return;
    }

    const currentInvoiceData: Invoice = {
      id: invoiceId || crypto.randomUUID(),
      invoiceNo,
      status,
      issueDate,
      dueDate,
      companyName,
      companyTax,
      companyAddress,
      companyPhone,
      companyEmail,
      clientName,
      clientTax,
      clientAddress,
      clientPhone,
      clientEmail,
      servicePeriod,
      currency,
      items,
      taxRate,
      discount,
      paymentInfo,
      notes,
      subtotal: calculatedValues.subtotal,
      taxAmount: calculatedValues.taxAmount,
      total: calculatedValues.total
    };

    if (invoiceId) {
      // update
      setInvoices(invoices.map(inv => inv.id === invoiceId ? currentInvoiceData : inv));
      alert("Fatura atualizada com sucesso no histórico!");
    } else {
      // create new
      setInvoices([currentInvoiceData, ...invoices]);
      setInvoiceId(currentInvoiceData.id);
      alert("Nova fatura guardada com sucesso no histórico de faturamento!");
    }
  };

  // Launch Invoice inside the global financial system
  const handleLaunchToFinance = async (inv: Invoice) => {
    const confirmLaunch = confirm(`Deseja lançar o valor correspondente de ${inv.total.toLocaleString()} ${inv.currency} como receita no fluxo de caixa geral da operadora?`);
    if (!confirmLaunch) return;

    try {
      const payload: Partial<Transaction> = {
        description: `Ref Fatura ${inv.invoiceNo} - ${inv.clientName}`,
        category: 'Vendas',
        amount: inv.total,
        type: 'RECEITA',
        status: inv.status === 'Paga' ? 'Pago' : 'Pendente',
        due_date: inv.dueDate,
        client_supplier_name: inv.clientName,
        date: new Date(inv.issueDate).toISOString()
      };

      const { error } = await db.finance('transactions').insert([payload]);
      if (error) throw error;
      alert(`A fatura ${inv.invoiceNo} foi registada com sucesso no módulo Financeiro!`);
    } catch (e: any) {
      alert("Erro ao sincronizar eletronicamente no financeiro: " + e.message);
    }
  };

  // Clear / reset form for new invoice
  const handleNewInvoice = () => {
    setInvoiceId(null);
    generateNextInvoiceNo();
    setStatus('Pendente');
    setIssueDate(new Date().toISOString().slice(0, 10));
    const d = new Date();
    d.setDate(d.getDate() + 15);
    setDueDate(d.toISOString().slice(0, 10));
    setClientName('');
    setClientTax('');
    setClientAddress('');
    setClientPhone('');
    setClientEmail('');
    setItems([{ description: 'Prestação de Consultoria Imobiliária', qty: 1, price: 0 }]);
    setDiscount(0);
    setPaymentInfo(MONTE_DEFAULT_PAYMENT);
    setNotes('A falta de pagamento dentro do prazo poderá resultar em cobrança adicional. Documento processado por computador da Monte Imobiliária.');
  };

  // Edit action
  const handleEditInvoiceFromHistory = (inv: Invoice) => {
    setInvoiceId(inv.id);
    setInvoiceNo(inv.invoiceNo);
    setStatus(inv.status);
    setIssueDate(inv.issueDate);
    setDueDate(inv.dueDate);
    setCompanyName(inv.companyName);
    setCompanyTax(inv.companyTax);
    setCompanyAddress(inv.companyAddress);
    setCompanyPhone(inv.companyPhone);
    setCompanyEmail(inv.companyEmail);
    setClientName(inv.clientName);
    setClientTax(inv.clientTax);
    setClientAddress(inv.clientAddress);
    setClientPhone(inv.clientPhone || '');
    setClientEmail(inv.clientEmail || '');
    setServicePeriod(inv.servicePeriod);
    setCurrency(inv.currency);
    setItems(inv.items);
    setTaxRate(inv.taxRate);
    setDiscount(inv.discount);
    setPaymentInfo(inv.paymentInfo);
    setNotes(inv.notes);

    setCurrentMode('create');
  };

  // Delete invoice with prompt
  const handleDeleteInvoice = (id: string, no: string) => {
    if (!confirm(`Tem a certeza que deseja eliminar de forma definitiva a Fatura ${no}?`)) return;
    setInvoices(invoices.filter(inv => inv.id !== id));
    if (invoiceId === id) {
      handleNewInvoice();
    }
  };

  // Format Helper
  const formatMoney = (val: number, cur: string) => {
    return `${cur} ${val.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Printable screen trigger
  const handlePrint = () => {
    window.print();
  };

  // Filter lists
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => 
      inv.invoiceNo.toLowerCase().includes(searchHistoryTerm.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(searchHistoryTerm.toLowerCase()) ||
      inv.servicePeriod.toLowerCase().includes(searchHistoryTerm.toLowerCase())
    );
  }, [invoices, searchHistoryTerm]);

  const filteredClients = useMemo(() => {
    const activeClientsFromDb = dbBeneficiaries.filter(b => b.category === 'Cliente');
    
    // Joint list of local clients and db status
    const combined: ClientData[] = [...clients];
    activeClientsFromDb.forEach(dbC => {
      if (!combined.some(c => c.name.toLowerCase() === dbC.name.toLowerCase())) {
        combined.push({
          id: dbC.id,
          name: dbC.name,
          nuit: '',
          address: '',
          phone: dbC.phone || '',
          email: dbC.email || ''
        });
      }
    });

    return combined.filter(c => 
      c.name.toLowerCase().includes(searchClientTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchClientTerm.toLowerCase()) ||
      c.phone.includes(searchClientTerm)
    );
  }, [clients, dbBeneficiaries, searchClientTerm]);

  return (
    <div className="space-y-6">
      {/* Dynamic Style injection for clean printouts */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-invoice-sheet, #printable-invoice-sheet * {
            visibility: visible;
          }
          #printable-invoice-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />

      {/* SUB MENU (Navigation inside Invoicing module) */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3 no-print">
        <div className="flex gap-2">
          <button 
            type="button"
            onClick={() => setCurrentMode('create')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${currentMode === 'create' ? 'bg-market-blue text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
          >
            Emitir Fatura
          </button>
          <button 
            type="button"
            onClick={() => setCurrentMode('history')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${currentMode === 'history' ? 'bg-market-blue text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
          >
            Histórico ({invoices.length})
          </button>
          <button 
            type="button"
            onClick={() => setCurrentMode('clients')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${currentMode === 'clients' ? 'bg-market-blue text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
          >
            Base de Clientes
          </button>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleNewInvoice}
            className="px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-xl bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-1.5 transition-all"
          >
            <PlusCircle size={15} /> Nova Limpa
          </button>
        </div>
      </div>

      {/* VIEW 1: CREATION AND PREVIEW SHEET */}
      {currentMode === 'create' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          
          {/* PANEL 1: FORMS (xl:col-span-4) - Left Hand side */}
          <div className="xl:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 max-h-[85vh] overflow-y-auto custom-scrollbar no-print">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase text-market-navy">Parâmetros da Fatura</h3>
              <span className="text-[10px] bg-slate-100 px-2 py-1 rounded font-bold text-slate-500 uppercase">
                {invoiceId ? 'Editando Gravada' : 'Nova Rascunho'}
              </span>
            </div>

            {/* Quick prefill client */}
            <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-market-navy block">Preenchimento Rápido (Cliente Registado)</label>
              <select 
                onChange={(e) => {
                  const selected = clients.find(c => c.id === e.target.value);
                  if (selected) handleSelectClient(selected);
                }}
                className="w-full text-xs p-2 rounded-xl bg-white border border-slate-200 text-slate-700 outline-none"
              >
                <option value="">-- Selecione para preencher os dados do cliente --</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name} {c.nuit ? `(NUIT: ${c.nuit})` : ''}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Número da Fatura</label>
                <input 
                  type="text" 
                  value={invoiceNo} 
                  onChange={(e) => setInvoiceNo(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-market-blue/20"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Estado do Pagamento</label>
                <select 
                  value={status} 
                  onChange={(e: any) => setStatus(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-market-blue/20 cursor-pointer"
                >
                  <option value="Pendente">⚡ Pendente</option>
                  <option value="Paga">✅ Paga</option>
                  <option value="Vencida">⚠️ Vencida</option>
                  <option value="Cancelado">❌ Cancelado</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Data de Emissão</label>
                <input 
                  type="date" 
                  value={issueDate} 
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Data de Vencimento</label>
                <input 
                  type="date" 
                  value={dueDate} 
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                />
              </div>
            </div>

            {/* Issuer (Pre-fixed with Monte values) */}
            <div className="border border-slate-100 p-4 rounded-2xl bg-slate-50/50 space-y-4">
              <h4 className="text-xs font-black text-market-navy uppercase border-b border-slate-100 pb-2">Identidade Monte Imobiliária (Emitente)</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Nome da Empresa</label>
                  <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">NUIT Emissor</label>
                    <input type="text" value={companyTax} onChange={e => setCompanyTax(e.target.value)} className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Período de Serviço</label>
                    <input type="text" value={servicePeriod} onChange={e => setServicePeriod(e.target.value)} placeholder="Ex: Junho / 2026" className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Endereço Fiscal</label>
                  <input type="text" value={companyAddress} onChange={e => setCompanyAddress(e.target.value)} className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Telefone Celular</label>
                    <input type="text" value={companyPhone} onChange={e => setCompanyPhone(e.target.value)} className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Email Corporativo</label>
                    <input type="text" value={companyEmail} onChange={e => setCompanyEmail(e.target.value)} className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 outline-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Client input */}
            <div className="border border-slate-200 p-4 rounded-2xl space-y-4 bg-white shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="text-xs font-black text-market-navy uppercase">Dados do Cliente Destinatário</h4>
                <button
                  type="button"
                  onClick={handleSaveClientToDb}
                  className="text-[10px] px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-market-accent border border-emerald-200 rounded font-black uppercase flex items-center gap-1 transition-all"
                  title="Salvar este cliente na base de dados para preenchimentos futuros"
                >
                  <UserPlus2 size={11} /> Registar Cliente
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Nome Completo / Firma do Cliente</label>
                  <input 
                    type="text" 
                    value={clientName} 
                    onChange={e => setClientName(e.target.value)} 
                    placeholder="Ex: José da Silva Augusto"
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">NUIT Cliente</label>
                    <input 
                      type="text" 
                      value={clientTax} 
                      onChange={e => setClientTax(e.target.value)} 
                      placeholder="Ex: 112345678"
                      className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Moeda da Fatura</label>
                    <select 
                      value={currency} 
                      onChange={e => setCurrency(e.target.value)} 
                      className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none cursor-pointer"
                    >
                      <option value="MT">MT (Meticais Moçambique)</option>
                      <option value="USD">USD (Dólares Americanos)</option>
                      <option value="ZAR">ZAR (Rands Sul-Africano)</option>
                      <option value="EUR">EUR (Euros União Europeia)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Endereço do Cliente</label>
                  <textarea 
                    value={clientAddress} 
                    onChange={e => setClientAddress(e.target.value)} 
                    placeholder="Ex: Av. Eduardo Mondlane, Prédio 1234, R/C, Maputo"
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none min-h-[50px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Celular Cliente</label>
                    <input 
                      type="text" 
                      value={clientPhone} 
                      onChange={e => setClientPhone(e.target.value)} 
                      placeholder="Ex: +258 84 123 4567"
                      className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Email Cliente</label>
                    <input 
                      type="email" 
                      value={clientEmail} 
                      onChange={e => setClientEmail(e.target.value)} 
                      placeholder="Ex: cliente@email.com"
                      className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none" 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Line items list */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b pb-1">
                <span className="text-xs font-bold text-market-navy uppercase">Lista de Serviços prestados</span>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="text-[10px] px-3 py-1 bg-market-blue/5 hover:bg-market-blue/15 text-market-blue rounded-xl font-bold uppercase flex items-center gap-1 transition-all"
                >
                  <Plus size={12} /> Adicionar Linha
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl relative space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400">SERVIÇO #{idx + 1}</span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 hover:bg-rose-100 rounded text-rose-500 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="text-[9px] text-slate-400 font-black uppercase">Descrição do Serviço / Imóvel</label>
                      <input 
                        type="text" 
                        value={item.description}
                        onChange={e => handleItemChange(idx, 'description', e.target.value)}
                        placeholder="Ex: Comissão de corretagem imobiliária ou arrendamento..."
                        className="w-full text-xs p-2 rounded-lg bg-white border border-slate-200 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] text-slate-400 font-black uppercase">Quant. dserviços</label>
                        <input 
                          type="number" 
                          step="any"
                          value={item.qty}
                          onChange={e => handleItemChange(idx, 'qty', e.target.value)}
                          className="w-full text-xs p-2 rounded-lg bg-white border border-slate-200 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-400 font-black uppercase">Preço Unitário ({currency})</label>
                        <input 
                          type="number" 
                          step="any"
                          value={item.price}
                          onChange={e => handleItemChange(idx, 'price', e.target.value)}
                          className="w-full text-xs p-2 rounded-lg bg-white border border-slate-200 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tax & Discount rates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">IVA (%)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={taxRate} 
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Desconto Comercial ({currency})</label>
                <input 
                  type="number" 
                  step="any"
                  value={discount} 
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                />
              </div>
            </div>

            {/* Payment coordinates default */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Dados de Pagamento Monte Imobiliária</label>
              <textarea 
                value={paymentInfo} 
                onChange={e => setPaymentInfo(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none min-h-[90px] font-mono leading-relaxed text-slate-700"
              />
            </div>

            {/* Observations */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Cláusulas & Observações</label>
              <textarea 
                value={notes} 
                onChange={e => setNotes(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none min-h-[70px] text-slate-700"
              />
            </div>

            {/* BUTTON CONTROLS */}
            <div className="grid grid-cols-2 gap-3 pt-3">
              <button
                type="button"
                onClick={handleSaveInvoice}
                className="w-full py-3.5 bg-market-blue hover:bg-market-navy text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
              >
                <Save size={16} /> Guardar no Histórico
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
              >
                <Printer size={16} /> Imprimir / PDF
              </button>
            </div>

            {invoiceId && (
              <button
                type="button"
                onClick={() => handleLaunchToFinance(invoices.find(iv => iv.id === invoiceId)!)}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow flex items-center justify-center gap-2 transition-all mt-2"
              >
                <Coins size={15} /> Registar como Receita ERP
              </button>
            )}

          </div>

          {/* PANEL 2: LIVE SHEET PREVIEW (xl:col-span-8) - Right Hand side */}
          <div className="xl:col-span-7 flex flex-col justify-start">
            <span className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest no-print">Pré-visualização A4 de Ativos Premium</span>
            
            {/* Sheet wrapper */}
            <div className="bg-slate-100 p-2 md:p-8 rounded-[2rem] border border-slate-200 flex justify-center overflow-auto max-h-[85vh] custom-scrollbar no-print">
              
              {/* Actual A4 Sheet */}
              <div 
                id="printable-invoice-sheet"
                className="bg-white w-[210mm] min-h-[297mm] p-12 text-slate-900 shadow-2xl relative flex flex-col justify-between font-sans leading-relaxed text-sm"
              >
                
                {/* Stamp element */}
                {status === 'Paga' && (
                  <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 border-8 border-emerald-600 text-emerald-600 font-sans font-black text-6xl tracking-[0.15em] py-4 px-10 rounded-3xl uppercase opacity-25 rotate-[-12deg] pointer-events-none select-none z-50">
                    PAGA
                  </div>
                )}
                {status === 'Vencida' && (
                  <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 border-8 border-rose-600 text-rose-600 font-sans font-black text-[3.5rem] tracking-[0.12em] py-4 px-8 rounded-3xl uppercase opacity-25 rotate-[-10deg] pointer-events-none select-none z-50">
                    VENCIDA
                  </div>
                )}
                {status === 'Cancelado' && (
                  <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 border-8 border-slate-600 text-slate-600 font-sans font-black text-5xl tracking-[0.1em] py-4 px-8 rounded-3xl uppercase opacity-20 rotate-[-15deg] pointer-events-none select-none z-50">
                    CANCELADA
                  </div>
                )}

                {/* Primary header area of the A4 layout */}
                <div>
                  <div className="flex justify-between items-start border-b-4 border-slate-900 pb-6 mb-8">
                    
                    {/* Brand logo & coordinates */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <img 
                          src="https://i.ibb.co/324wtnf/fivicom-monte.png" 
                          alt="Monte Imobiliária Logo" 
                          className="h-14 w-14 object-contain"
                          onError={(e) => {
                            // Fallback if logo.svg is unavailable or broken
                            (e.target as any).src = 'https://raw.githubusercontent.com/lucide-react/lucide/main/icons/building-2.svg';
                          }}
                        />
                        <div>
                          <h1 className="text-2xl font-extrabold tracking-tighter text-slate-900 uppercase leading-none">{companyName}</h1>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Legados de Prestígio</p>
                        </div>
                      </div>
                      
                      <div className="text-[10px] text-slate-600 leading-normal font-medium space-y-0.5">
                        <p><strong>NUIT:</strong> {companyTax}</p>
                        <p>{companyAddress}</p>
                        <p><strong>Tel:</strong> {companyPhone} | <strong>Email:</strong> {companyEmail}</p>
                      </div>
                    </div>

                    {/* Invoice details title */}
                    <div className="text-right">
                      <h2 className="text-3xl font-black tracking-tight text-slate-900">FATURA / RECIBO</h2>
                      <div className="mt-3 inline-block border-2 border-slate-900 px-4 py-2 font-black text-base tracking-widest bg-slate-50">
                        {invoiceNo}
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase mt-2 tracking-widest">
                        Estado: <span className={
                          status === 'Paga' ? 'text-emerald-700 font-extrabold' : 
                          status === 'Vencida' ? 'text-rose-600 font-extrabold' : 'text-slate-700'
                        }>{status}</span>
                      </p>
                    </div>

                  </div>

                  {/* Customer / Billing details blocks */}
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    
                    {/* Customer */}
                    <div className="border border-slate-900 rounded-lg p-4 space-y-2">
                      <h3 className="text-xs font-black bg-slate-900 text-white p-1.5 px-3 rounded uppercase tracking-wider mb-2 -mx-4 -mt-4">
                        Dados do Cliente S.S
                      </h3>
                      <div className="space-y-1.5 text-xs text-slate-700 leading-normal">
                        <p><strong>Cliente:</strong> <span className="font-bold text-slate-900">{clientName || "---"}</span></p>
                        <p><strong>NUIT/NIF:</strong> {clientTax || "---"}</p>
                        <p><strong>Endereço:</strong> <span className="whitespace-pre-line">{clientAddress || "---"}</span></p>
                        {clientPhone && <p><strong>Tel Celular:</strong> {clientPhone}</p>}
                        {clientEmail && <p><strong>Email:</strong> {clientEmail}</p>}
                      </div>
                    </div>

                    {/* Meta Invoice details */}
                    <div className="border border-slate-900 rounded-lg p-4 space-y-2">
                      <h3 className="text-xs font-black bg-slate-900 text-white p-1.5 px-3 rounded uppercase tracking-wider mb-2 -mx-4 -mt-4">
                        Detalhes de Facturação
                      </h3>
                      <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs text-slate-700 leading-normal">
                        <div>
                          <strong>Data de Emissão:</strong>
                          <p className="font-bold mt-0.5">{new Date(issueDate).toLocaleDateString('pt-MZ')}</p>
                        </div>
                        <div>
                          <strong>Vencimento Limite:</strong>
                          <p className="font-bold text-rose-600 mt-0.5">{new Date(dueDate).toLocaleDateString('pt-MZ')}</p>
                        </div>
                        <div>
                          <strong>Período de Referência:</strong>
                          <p className="font-bold mt-0.5">{servicePeriod}</p>
                        </div>
                        <div>
                          <strong>Moeda Oficial:</strong>
                          <p className="font-bold mt-0.5">{currency}</p>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Line items tables */}
                  <table className="w-full text-xs text-left border-collapse border border-slate-900">
                    <thead>
                      <tr className="bg-slate-100 uppercase font-black text-slate-800 border-b border-slate-900">
                        <th className="p-3 border border-slate-900">Descrição do Serviço Prestado / Referência Monetária</th>
                        <th className="p-3 text-center border border-slate-900 w-16">Qtd.</th>
                        <th className="p-3 text-right border border-slate-900 w-32">Preço Unitário</th>
                        <th className="p-3 text-right border border-slate-900 w-36">Total Líquido</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => {
                        const totalItem = item.qty * item.price;
                        return (
                          <tr key={index} className="border-b border-slate-900 hover:bg-slate-50">
                            <td className="p-3 font-semibold text-slate-800 border border-slate-900">{item.description}</td>
                            <td className="p-3 text-center font-bold text-slate-700 border border-slate-900">{item.qty}</td>
                            <td className="p-3 text-right font-mono border border-slate-900">{formatMoney(item.price, currency)}</td>
                            <td className="p-3 text-right font-mono font-bold border border-slate-900">{formatMoney(totalItem, currency)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Pricing Financial Summary tables */}
                  <div className="flex justify-end mt-4">
                    <table className="w-80 border-collapse border border-slate-900 text-xs">
                      <tbody>
                        <tr className="border-b border-slate-400">
                          <td className="p-2 font-bold bg-slate-50 border-r border-slate-900">Subtotal</td>
                          <td className="p-2 text-right font-mono font-bold">{formatMoney(calculatedValues.subtotal, currency)}</td>
                        </tr>
                        {discount > 0 && (
                          <tr className="border-b border-slate-400 text-rose-600">
                            <td className="p-2 font-bold bg-slate-50 border-r border-slate-900">Desconto Comercial</td>
                            <td className="p-2 text-right font-mono font-bold">-{formatMoney(discount, currency)}</td>
                          </tr>
                        )}
                        <tr className="border-b border-slate-405">
                          <td className="p-2 font-bold bg-slate-50 border-r border-slate-900">IVA / Imposto ({taxRate}%)</td>
                          <td className="p-2 text-right font-mono font-bold">{formatMoney(calculatedValues.taxAmount, currency)}</td>
                        </tr>
                        <tr className="bg-slate-900 text-white font-bold text-sm">
                          <td className="p-3 uppercase border-r border-slate-900 tracking-wider">TOTAL DA FATURA</td>
                          <td className="p-3 text-right font-mono">{formatMoney(calculatedValues.total, currency)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                </div>

                {/* Footer and payment detail rules */}
                <div className="space-y-6 mt-10">
                  
                  <div className="grid grid-cols-2 gap-6 text-[11px] leading-relaxed">
                    {/* Payment accounts */}
                    <div className="border border-slate-400 rounded p-3 bg-slate-50">
                      <h4 className="font-extrabold uppercase text-slate-900 mb-1 border-b pb-1">Coordenadas de Pagamento</h4>
                      <p className="whitespace-pre-line font-medium text-slate-700">{paymentInfo}</p>
                    </div>

                    {/* Obs */}
                    <div className="border border-slate-400 rounded p-3 bg-slate-50">
                      <h4 className="font-extrabold uppercase text-slate-900 mb-1 border-b pb-1">Observações Adicionais</h4>
                      <p className="text-slate-600 font-medium">{notes}</p>
                    </div>
                  </div>

                  {/* Signatures */}
                  <div className="flex justify-between items-end pt-8 font-sans font-medium text-xs">
                    <div className="text-center w-56">
                      <div className="border-t border-slate-900 pt-1 text-slate-700 uppercase font-bold tracking-widest text-[9px]">
                        Autorizado por
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">Monte Imobiliária, Lda</p>
                    </div>
                    
                    <div className="text-center text-[10px] text-slate-400">
                      Emitido em plataforma digital de investimentos.
                    </div>

                    <div className="text-center w-56">
                      <div className="border-t border-slate-900 pt-1 text-slate-700 uppercase font-bold tracking-widest text-[9px]">
                        Assinatura do Cliente
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">Data: ____/____/2026</p>
                    </div>
                  </div>

                </div>

              </div>
              
            </div>

            {/* Helper notice in development frame */}
            <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex gap-3 text-xs text-amber-800 no-print">
              <AlertTriangle size={32} className="shrink-0 text-amber-500" />
              <div>
                <p className="font-bold">Dica de Exportação PDF:</p>
                <p className="mt-1">Ao carregar em "Imprimir / PDF", na janela de impressão do seu navegador, escolha "Guardar como PDF" e active a opção <strong>"Imprimir gráficos de fundo"</strong> para reter o carimbo PAGA e os sombreados corporativos.</p>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* VIEW 2: HISTÓRICO DE FATURAS */}
      {currentMode === 'history' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl space-y-6 animate-in zoom-in-95">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h3 className="text-lg font-bold text-market-navy">Histórico de Facturação Registada</h3>
              <p className="text-xs text-market-slate font-medium">Lista de todos os documentos gerados e rascunhos guardados no ERP.</p>
            </div>
            
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input 
                type="text"
                placeholder="Pesquisar por Código, Cliente ou Período..."
                value={searchHistoryTerm}
                onChange={e => setSearchHistoryTerm(e.target.value)}
                className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 outline-none"
              />
            </div>
          </div>

          {filteredInvoices.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <Receipt className="mx-auto text-slate-300" size={48} />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Nenhuma fatura encontrada no histórico</p>
              <button 
                onClick={() => setCurrentMode('create')}
                className="market-button market-button-primary px-6 py-2.5 text-[10px] uppercase tracking-widest"
              >
                Criar Primeira Fatura
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] uppercase font-black text-slate-400 tracking-wider">
                    <th className="py-4 px-4">Fatura Nº</th>
                    <th className="py-4 px-4">Cliente</th>
                    <th className="py-4 px-4">Período</th>
                    <th className="py-4 px-4">Emissão / Vencimento</th>
                    <th className="py-4 px-4">Estado</th>
                    <th className="py-4 px-4 text-right">Total com Impostos</th>
                    <th className="py-4 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50/50 group transition-all font-semibold">
                      <td className="py-4 px-4 font-black text-market-navy">{inv.invoiceNo}</td>
                      <td className="py-4 px-4">
                        <p className="text-[13px] font-bold text-market-navy leading-none mb-1">{inv.clientName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">NUIT: {inv.clientTax || 'Sem registo'}</p>
                      </td>
                      <td className="py-4 px-4 text-slate-600">{inv.servicePeriod}</td>
                      <td className="py-4 px-4 text-slate-600">
                        <p>{new Date(inv.issueDate).toLocaleDateString('pt-MZ')}</p>
                        <p className="text-[10px] font-bold text-rose-400 uppercase mt-0.5">Vence: {new Date(inv.dueDate).toLocaleDateString('pt-MZ')}</p>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          inv.status === 'Paga' ? 'bg-emerald-50 text-market-accent border border-emerald-100' :
                          inv.status === 'Vencida' ? 'bg-rose-50 text-rose-600 border border-rose-100 animate-pulse' :
                          inv.status === 'Cancelado' ? 'bg-slate-100 text-slate-500' :
                          'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right font-mono font-black text-[13px] text-market-navy">
                        {formatMoney(inv.total, inv.currency)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2 items-center justify-center">
                          <button
                            onClick={() => handleEditInvoiceFromHistory(inv)}
                            className="p-1.5 hover:bg-market-blue/10 rounded text-market-blue transition-colors"
                            title="Editar Parâmetros"
                          >
                            <FileText size={15} />
                          </button>
                          <button
                            onClick={() => handleLaunchToFinance(inv)}
                            className="p-1.5 hover:bg-emerald-50 hover:text-market-accent text-slate-500 rounded transition-colors"
                            title="Lançar como Receita de Caixa"
                          >
                            <Coins size={15} />
                          </button>
                          <button
                            onClick={() => {
                              handleEditInvoiceFromHistory(inv);
                              setTimeout(() => window.print(), 300);
                            }}
                            className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition-colors"
                            title="Imprimir / PDF direto"
                          >
                            <Printer size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteInvoice(inv.id, inv.invoiceNo)}
                            className="p-1.5 hover:bg-rose-50 rounded text-rose-500 transition-colors"
                            title="Remover do Histórico"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: CLIENTS DATABASE (BASE DE CLIENTES) */}
      {currentMode === 'clients' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl space-y-6 animate-in zoom-in-95">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h3 className="text-lg font-bold text-market-navy">Registos de Clientes Autorizados</h3>
              <p className="text-xs text-market-slate font-medium">Contactos corporativos carregados centralizadamente no banco de dados.</p>
            </div>
            
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input 
                type="text"
                placeholder="Pesquisar por Nome, Email ou Telefone..."
                value={searchClientTerm}
                onChange={e => setSearchClientTerm(e.target.value)}
                className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 outline-none"
              />
            </div>
          </div>

          {loadingDbClients ? (
            <div className="flex flex-col items-center py-20 gap-4 opacity-70">
              <RefreshCw size={28} className="animate-spin text-market-blue" />
              <span className="text-[10px] uppercase tracking-widest font-bold">Consultando Servidores Centralizados...</span>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <UserCheck2 className="mx-auto text-slate-300" size={48} />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Nenhum cliente cadastrado ainda</p>
              <button 
                onClick={() => {
                  const name = prompt("Nome completo do cliente:");
                  if (name) {
                    setClientName(name);
                    setCurrentMode('create');
                  }
                }}
                className="market-button market-button-primary px-6 py-2.5 text-[10px] uppercase tracking-widest"
              >
                Registar Novo Cliente
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] uppercase font-black text-slate-400 tracking-wider">
                    <th className="py-4 px-4">Nome do Cliente</th>
                    <th className="py-4 px-4">NUIT / NIF</th>
                    <th className="py-4 px-4">Celular</th>
                    <th className="py-4 px-4">Endereço de Facturação</th>
                    <th className="py-4 px-4">Contacto de Email</th>
                    <th className="py-4 px-4 text-center">Atalhos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredClients.map((c, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 group transition-all font-semibold text-slate-700">
                      <td className="py-4 px-4 text-market-navy font-bold text-[13px]">{c.name}</td>
                      <td className="py-4 px-4 font-mono font-bold text-slate-500">{c.nuit || <span className="text-slate-300 text-[10px]">Não Registado</span>}</td>
                      <td className="py-4 px-4 text-[12px]">{c.phone || <span className="text-slate-300 text-[10px]">---</span>}</td>
                      <td className="py-4 px-4 text-[12px] leading-relaxed truncate max-w-[200px]" title={c.address}>{c.address || <span className="text-slate-300 text-[10px]">---</span>}</td>
                      <td className="py-4 px-4 text-market-blue font-medium">{c.email || <span className="text-slate-300 text-[10px]">---</span>}</td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => {
                              handleSelectClient(c);
                              setCurrentMode('create');
                            }}
                            className="px-3 py-1 bg-market-blue/5 hover:bg-market-blue text-market-blue hover:text-white transition-all text-[11px] uppercase tracking-widest font-black rounded-lg"
                            title="Iniciar Facturação de Ativos"
                          >
                            Passar Fatura
                          </button>
                          <button
                            onClick={() => handleDeleteClient(c.id, c.name)}
                            className="p-1.5 hover:bg-rose-100 text-rose-500 rounded transition-all"
                            title="Excluir do Banco de Dados"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default InvoiceArea;
