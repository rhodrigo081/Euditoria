import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Calendar, 
  Filter, 
  Search, 
  User, 
  Plus, 
  FileSpreadsheet, 
  Receipt, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  TrendingUp, 
  FileText,
  Trash2,
  Building2,
  Layers,
  ArrowRight
} from 'lucide-react';
import { payrollService } from '../services/supabase';
import { formatCurrency, maskCpf } from '../utils/masks';
import MaskedInput from '../components/MaskedInput';

export default function PayrollPage({ selectedTenant }) {
  const [payrollList, setPayrollList] = useState([]);
  const [availableCompetencies, setAvailableCompetencies] = useState([]);
  const [selectedCompetency, setSelectedCompetency] = useState('2026-09');
  const [searchTerm, setSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Modais
  const [activePayslip, setActivePayslip] = useState(null); // Colaborador para modal de holerite
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Formulário de Novo Lançamento
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newCpf, setNewCpf] = useState('');
  const [newCargo, setNewCargo] = useState('Analista Fiscal');
  const [newMatricula, setNewMatricula] = useState('');
  const [newGross, setNewGross] = useState('5000.00');
  const [newCompetency, setNewCompetency] = useState('2026-09');
  const [newEventType, setNewEventType] = useState('S-1200');

  // Carrega lista de pagamentos
  const loadPayrollData = async () => {
    setLoading(true);
    try {
      const records = await payrollService.getPayroll(selectedTenant, selectedCompetency);
      setPayrollList(records);

      const comps = await payrollService.getCompetencies(selectedTenant);
      // Garante que a competência atual esteja nas opções
      const allComps = Array.from(new Set(['2026-09', '2026-08', '2026-07', ...comps])).sort().reverse();
      setAvailableCompetencies(allComps);
    } catch (err) {
      console.error('[PayrollPage] Erro ao carregar folha:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayrollData();
  }, [selectedTenant, selectedCompetency]);

  // Cálculos dinâmicos tributários básicos para o formulário
  const calculatePayrollValues = (gross) => {
    const val = parseFloat(gross) || 0;
    // INSS aproximado (tabela progressiva)
    let inss = 0;
    if (val <= 1518.00) inss = val * 0.075;
    else if (val <= 2793.88) inss = (1518 * 0.075) + ((val - 1518) * 0.09);
    else if (val <= 4190.83) inss = (1518 * 0.075) + ((2793.88 - 1518) * 0.09) + ((val - 2793.88) * 0.12);
    else inss = Math.min(990.58, (1518 * 0.075) + ((2793.88 - 1518) * 0.09) + ((4190.83 - 2793.88) * 0.12) + ((val - 4190.83) * 0.14));

    // Base IRRF = Bruto - INSS
    const baseIrrf = Math.max(0, val - inss);
    let irrf = 0;
    if (baseIrrf > 2259.20 && baseIrrf <= 2826.65) irrf = (baseIrrf * 0.075) - 169.44;
    else if (baseIrrf > 2826.65 && baseIrrf <= 3751.05) irrf = (baseIrrf * 0.15) - 381.44;
    else if (baseIrrf > 3751.05 && baseIrrf <= 4664.68) irrf = (baseIrrf * 0.225) - 662.77;
    else if (baseIrrf > 4664.68) irrf = (baseIrrf * 0.275) - 896.00;
    irrf = Math.max(0, irrf);

    const fgts = val * 0.08;
    const net = val - inss - irrf;

    return {
      gross: val,
      inss: Number(inss.toFixed(2)),
      irrf: Number(irrf.toFixed(2)),
      fgts: Number(fgts.toFixed(2)),
      net: Number(net.toFixed(2)),
    };
  };

  const handleCreatePayrollSubmit = async (e) => {
    e.preventDefault();
    if (!newEmployeeName || !newCpf) return;

    const calc = calculatePayrollValues(newGross);
    const rubrics = [
      { code: '1000', name: 'Salário Base Contratual', type: 'PROVENTO', value: calc.gross },
      { code: '9201', name: 'Contribuição Previdenciária INSS', type: 'DESCONTO', value: calc.inss },
      { code: '9210', name: 'Imposto de Renda Retido na Fonte (IRRF)', type: 'DESCONTO', value: calc.irrf },
    ];

    await payrollService.insertPayroll({
      tenant_id: selectedTenant,
      competency: newCompetency,
      employee_name: newEmployeeName,
      cpf: newCpf,
      cargo: newCargo,
      matricula: newMatricula || 'MAT-' + Math.floor(1000 + Math.random() * 9000),
      event_type: newEventType,
      gross_amount: calc.gross,
      inss_amount: calc.inss,
      irrf_amount: calc.irrf,
      fgts_amount: calc.fgts,
      net_amount: calc.net,
      status: 'CONFORME',
      rubrics,
    });

    setIsNewModalOpen(false);
    setNewEmployeeName('');
    setNewCpf('');
    setNewMatricula('');
    loadPayrollData();
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('Tem certeza que deseja remover este lançamento salarial?')) {
      await payrollService.deletePayroll(id);
      loadPayrollData();
    }
  };

  // Filtragem local por texto de busca e tipo de evento
  const filteredList = payrollList.filter((item) => {
    const term = searchTerm.toLowerCase();
    const matchText = 
      (item.employee_name || '').toLowerCase().includes(term) ||
      (item.cpf || '').includes(term) ||
      (item.cargo || '').toLowerCase().includes(term) ||
      (item.matricula || '').toLowerCase().includes(term);

    const matchEvent = eventTypeFilter === 'ALL' || item.event_type === eventTypeFilter;
    return matchText && matchEvent;
  });

  // Totalizadores calculados sobre a lista da competência
  const totalGross = filteredList.reduce((acc, curr) => acc + (Number(curr.gross_amount) || 0), 0);
  const totalNet = filteredList.reduce((acc, curr) => acc + (Number(curr.net_amount) || 0), 0);
  const totalInss = filteredList.reduce((acc, curr) => acc + (Number(curr.inss_amount) || 0), 0);
  const totalIrrf = filteredList.reduce((acc, curr) => acc + (Number(curr.irrf_amount) || 0), 0);
  const totalFgts = filteredList.reduce((acc, curr) => acc + (Number(curr.fgts_amount) || 0), 0);

  return (
    <div class="space-y-6">
      {/* Top Header */}
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 uppercase tracking-widest border border-sky-500/20">
            Gestão de Folha &amp; Remunerações
          </span>
          <h2 class="text-xl font-bold text-white mt-1">Apuração Salarial e Encargos por Competência</h2>
          <p class="text-xs text-slate-400">
            Acompanhamento de eventos periódicos eSocial (S-1200 Remuneração, S-1210 Pagamentos) com apuração de bases tributáveis.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            onClick={() => setIsNewModalOpen(true)}
            class="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-sky-500/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus class="w-4 h-4" />
            Lançar Pagamento
          </button>
        </div>
      </div>

      {/* Barra de Filtros: Competência (Ano/Mês) e Busca */}
      <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Seletor de Competência */}
        <div class="flex items-center gap-3 w-full md:w-auto">
          <div class="flex items-center gap-2 text-xs text-slate-300 font-semibold shrink-0">
            <Calendar class="w-4 h-4 text-sky-400" />
            <span>Filtrar Competência:</span>
          </div>

          <select
            value={selectedCompetency}
            onChange={(e) => setSelectedCompetency(e.target.value)}
            class="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-sky-300 focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            <option value="TODAS">Todas as Competências</option>
            {availableCompetencies.map((comp) => (
              <option key={comp} value={comp}>
                {comp} ({comp.split('-')[1]}/{comp.split('-')[0]})
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Evento eSocial */}
        <div class="flex items-center gap-2 w-full md:w-auto">
          <span class="text-xs text-slate-400 font-medium">Evento:</span>
          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            class="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            <option value="ALL">Todos os Eventos</option>
            <option value="S-1200">S-1200 (Remuneração)</option>
            <option value="S-1210">S-1210 (Pagamento)</option>
            <option value="S-2299">S-2299 (Rescisão)</option>
          </select>
        </div>

        {/* Campo de Busca por Colaborador */}
        <div class="relative w-full md:w-72">
          <Search class="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por colaborador, CPF ou matrícula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            class="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* KPI Cards de Totalizadores Oficiais da Competência */}
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span class="text-[11px] text-slate-400 font-medium block">Total Bruto da Folha</span>
          <span class="text-xl font-black font-mono text-white mt-1 block">
            {formatCurrency(totalGross)}
          </span>
          <span class="text-[10px] text-slate-500 mt-1 block">Base de Salários</span>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span class="text-[11px] text-slate-400 font-medium block">Total Líquido Pago</span>
          <span class="text-xl font-black font-mono text-emerald-400 mt-1 block">
            {formatCurrency(totalNet)}
          </span>
          <span class="text-[10px] text-emerald-500/80 mt-1 block">Creditado em conta</span>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span class="text-[11px] text-slate-400 font-medium block">INSS dos Segurados</span>
          <span class="text-xl font-black font-mono text-sky-400 mt-1 block">
            {formatCurrency(totalInss)}
          </span>
          <span class="text-[10px] text-sky-500/80 mt-1 block">Retenção S-5001</span>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span class="text-[11px] text-slate-400 font-medium block">IRRF Retido na Fonte</span>
          <span class="text-xl font-black font-mono text-indigo-400 mt-1 block">
            {formatCurrency(totalIrrf)}
          </span>
          <span class="text-[10px] text-indigo-500/80 mt-1 block">Retenção S-5002</span>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span class="text-[11px] text-slate-400 font-medium block">FGTS Provisionado (8%)</span>
          <span class="text-xl font-black font-mono text-amber-400 mt-1 block">
            {formatCurrency(totalFgts)}
          </span>
          <span class="text-[10px] text-amber-500/80 mt-1 block">Guia FGTS Digital</span>
        </div>
      </div>

      {/* Tabela de Lançamentos de Folha */}
      <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div class="p-4 border-b border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Receipt class="w-4 h-4 text-sky-400" />
            <h3 class="text-xs font-bold text-white uppercase tracking-wider">
              Demonstrativo de Remunerações • Competência {selectedCompetency} ({filteredList.length} registros)
            </h3>
          </div>
        </div>

        {filteredList.length > 0 ? (
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-950/70 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <th class="py-3 px-4 font-semibold">Colaborador</th>
                  <th class="py-3 px-4 font-semibold">Competência</th>
                  <th class="py-3 px-4 font-semibold">Evento eSocial</th>
                  <th class="py-3 px-4 font-semibold">Salário Bruto</th>
                  <th class="py-3 px-4 font-semibold">INSS Retido</th>
                  <th class="py-3 px-4 font-semibold">IRRF Retido</th>
                  <th class="py-3 px-4 font-semibold">Líquido a Receber</th>
                  <th class="py-3 px-4 font-semibold">Status</th>
                  <th class="py-3 px-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800 text-xs">
                {filteredList.map((item) => (
                  <tr key={item.id} class="hover:bg-slate-800/40 transition">
                    <td class="py-3 px-4">
                      <div class="font-bold text-white">{item.employee_name}</div>
                      <div class="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                        <span>CPF: {maskCpf(item.cpf)}</span>
                        <span>•</span>
                        <span>{item.cargo}</span>
                      </div>
                    </td>
                    <td class="py-3 px-4 font-mono text-sky-300 font-semibold">
                      {item.competency}
                    </td>
                    <td class="py-3 px-4">
                      <span class="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30">
                        {item.event_type}
                      </span>
                    </td>
                    <td class="py-3 px-4 font-mono font-semibold text-slate-200">
                      {formatCurrency(item.gross_amount)}
                    </td>
                    <td class="py-3 px-4 font-mono text-rose-300">
                      - {formatCurrency(item.inss_amount)}
                    </td>
                    <td class="py-3 px-4 font-mono text-indigo-300">
                      - {formatCurrency(item.irrf_amount)}
                    </td>
                    <td class="py-3 px-4 font-mono font-bold text-emerald-400">
                      {formatCurrency(item.net_amount)}
                    </td>
                    <td class="py-3 px-4">
                      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 class="w-3 h-3" />
                        {item.status || 'CONFORME'}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => setActivePayslip(item)}
                        class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 font-semibold text-[11px] transition inline-flex items-center gap-1 cursor-pointer"
                        title="Ver Demonstrativo de Pagamento e Rubricas"
                      >
                        <FileText class="w-3.5 h-3.5" />
                        Holerite
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        class="p-1 rounded-lg bg-slate-800/80 hover:bg-rose-950/80 text-slate-400 hover:text-rose-300 transition inline-flex items-center cursor-pointer"
                        title="Remover Lançamento"
                      >
                        <Trash2 class="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Empty state limpo sem dados mockados */
          <div class="text-center py-16 px-4 space-y-3">
            <Receipt class="w-12 h-12 text-slate-600 mx-auto" />
            <h4 class="text-sm font-bold text-white">Nenhum lançamento para a competência {selectedCompetency}</h4>
            <p class="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Você ainda não possui pagamentos ou remunerações cadastrados para este mês/ano. Cadastre um novo lançamento ou selecione outra competência.
            </p>
            <div class="pt-2">
              <button
                onClick={() => setIsNewModalOpen(true)}
                class="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs rounded-xl transition shadow-md shadow-sky-500/20 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus class="w-4 h-4" />
                Cadastrar Primeiro Lançamento
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: DEMONSTRATIVO DE PAGAMENTO / HOLERITE DETALHADO COM RUBRICAS */}
      {activePayslip && (
        <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-slate-950 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActivePayslip(null)}
              class="absolute right-5 top-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X class="w-5 h-5" />
            </button>

            {/* Cabeçalho do Holerite */}
            <div class="border-b border-slate-800 pb-4">
              <div class="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
                <Receipt class="w-4 h-4" />
                <span>Demonstrativo Oficial de Pagamento • eSocial {activePayslip.event_type}</span>
              </div>
              <h3 class="text-xl font-bold text-white mt-1">{activePayslip.employee_name}</h3>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-400 font-mono mt-2">
                <div><span class="text-slate-500">CPF:</span> {maskCpf(activePayslip.cpf)}</div>
                <div><span class="text-slate-500">Matrícula:</span> {activePayslip.matricula}</div>
                <div><span class="text-slate-500">Cargo:</span> {activePayslip.cargo}</div>
                <div><span class="text-slate-500">Competência:</span> {activePayslip.competency}</div>
              </div>
            </div>

            {/* Tabela de Rubricas */}
            <div class="space-y-2">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                Composição de Rubricas e Eventos de Remuneração:
              </span>
              <div class="border border-slate-800 rounded-xl overflow-hidden">
                <table class="w-full text-xs text-left">
                  <thead class="bg-slate-900 text-slate-400 text-[11px] uppercase tracking-wider">
                    <tr>
                      <th class="py-2.5 px-3">Cód. Rubrica</th>
                      <th class="py-2.5 px-3">Descrição da Rubrica</th>
                      <th class="py-2.5 px-3">Tipo</th>
                      <th class="py-2.5 px-3 text-right">Proventos (R$)</th>
                      <th class="py-2.5 px-3 text-right">Descontos (R$)</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-800 font-mono">
                    <tr class="hover:bg-slate-900/40">
                      <td class="py-2.5 px-3 text-sky-400 font-bold">1000</td>
                      <td class="py-2.5 px-3 text-slate-200 font-sans">Salário Base Mensal</td>
                      <td class="py-2.5 px-3 text-emerald-400 font-sans font-semibold">Provento</td>
                      <td class="py-2.5 px-3 text-right text-emerald-400">{formatCurrency(activePayslip.gross_amount)}</td>
                      <td class="py-2.5 px-3 text-right text-slate-600">-</td>
                    </tr>
                    <tr class="hover:bg-slate-900/40">
                      <td class="py-2.5 px-3 text-sky-400 font-bold">9201</td>
                      <td class="py-2.5 px-3 text-slate-200 font-sans">Contribuição Previdenciária INSS</td>
                      <td class="py-2.5 px-3 text-rose-400 font-sans font-semibold">Desconto</td>
                      <td class="py-2.5 px-3 text-right text-slate-600">-</td>
                      <td class="py-2.5 px-3 text-right text-rose-400">{formatCurrency(activePayslip.inss_amount)}</td>
                    </tr>
                    <tr class="hover:bg-slate-900/40">
                      <td class="py-2.5 px-3 text-sky-400 font-bold">9210</td>
                      <td class="py-2.5 px-3 text-slate-200 font-sans">Imposto de Renda Retido na Fonte (IRRF)</td>
                      <td class="py-2.5 px-3 text-rose-400 font-sans font-semibold">Desconto</td>
                      <td class="py-2.5 px-3 text-right text-slate-600">-</td>
                      <td class="py-2.5 px-3 text-right text-rose-400">{formatCurrency(activePayslip.irrf_amount)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bases de Cálculo */}
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/80 p-4 rounded-xl text-xs font-mono">
              <div>
                <span class="text-slate-500 block text-[10px] uppercase">Base INSS:</span>
                <span class="font-bold text-slate-200">{formatCurrency(activePayslip.gross_amount)}</span>
              </div>
              <div>
                <span class="text-slate-500 block text-[10px] uppercase">Base FGTS:</span>
                <span class="font-bold text-slate-200">{formatCurrency(activePayslip.gross_amount)}</span>
              </div>
              <div>
                <span class="text-slate-500 block text-[10px] uppercase">FGTS Recolhido:</span>
                <span class="font-bold text-amber-400">{formatCurrency(activePayslip.fgts_amount)}</span>
              </div>
              <div>
                <span class="text-slate-500 block text-[10px] uppercase">Base IRRF:</span>
                <span class="font-bold text-slate-200">{formatCurrency(activePayslip.gross_amount - activePayslip.inss_amount)}</span>
              </div>
            </div>

            {/* Totais Finais */}
            <div class="border-t border-slate-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div class="space-y-1 text-xs font-mono">
                <div class="text-slate-400">Total Proventos: <strong class="text-white">{formatCurrency(activePayslip.gross_amount)}</strong></div>
                <div class="text-slate-400">Total Descontos: <strong class="text-rose-400">{formatCurrency(activePayslip.inss_amount + activePayslip.irrf_amount)}</strong></div>
              </div>

              <div class="bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/40 px-5 py-3 rounded-2xl text-right">
                <span class="text-[10px] uppercase tracking-wider text-emerald-400 font-bold block">Valor Líquido a Receber</span>
                <span class="text-2xl font-black font-mono text-emerald-300">{formatCurrency(activePayslip.net_amount)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NOVO LANÇAMENTO DE FOLHA */}
      {isNewModalOpen && (
        <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-slate-950 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 relative">
            <button
              onClick={() => setIsNewModalOpen(false)}
              class="absolute right-5 top-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X class="w-5 h-5" />
            </button>

            <div>
              <div class="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
                <Plus class="w-4 h-4" />
                <span>Novo Lançamento de Remuneração</span>
              </div>
              <h3 class="text-lg font-bold text-white mt-1">Registrar Folha de Pagamento</h3>
              <p class="text-xs text-slate-400">
                Os cálculos de INSS, IRRF, FGTS e Líquido são apurados automaticamente pela regra fiscal de 2026.
              </p>
            </div>

            <form onSubmit={handleCreatePayrollSubmit} class="space-y-4">
              <div class="grid grid-cols-2 gap-3">
                <div class="flex flex-col gap-1 w-full">
                  <label class="text-xs text-slate-300 font-semibold">Competência (Ano/Mês)</label>
                  <input
                    type="text"
                    required
                    placeholder="2026-09"
                    value={newCompetency}
                    onChange={(e) => setNewCompetency(e.target.value)}
                    class="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div class="flex flex-col gap-1 w-full">
                  <label class="text-xs text-slate-300 font-semibold">Evento eSocial</label>
                  <select
                    value={newEventType}
                    onChange={(e) => setNewEventType(e.target.value)}
                    class="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="S-1200">S-1200 (Remuneração)</option>
                    <option value="S-1210">S-1210 (Pagamento)</option>
                    <option value="S-2299">S-2299 (Rescisão)</option>
                  </select>
                </div>
              </div>

              <div class="flex flex-col gap-1 w-full">
                <label class="text-xs text-slate-300 font-semibold">Nome Completo do Colaborador</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Roberto Carlos Mendonça"
                  value={newEmployeeName}
                  onChange={(e) => setNewEmployeeName(e.target.value)}
                  class="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <MaskedInput
                  label="CPF do Colaborador"
                  mask="cpf"
                  required
                  value={newCpf}
                  onChange={setNewCpf}
                  placeholder="000.000.000-00"
                />

                <div class="flex flex-col gap-1 w-full">
                  <label class="text-xs text-slate-300 font-semibold">Cargo / Função</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Auditor Júnior"
                    value={newCargo}
                    onChange={(e) => setNewCargo(e.target.value)}
                    class="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div class="flex flex-col gap-1 w-full">
                <label class="text-xs text-slate-300 font-semibold">Salário Base Bruto (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newGross}
                  onChange={(e) => setNewGross(e.target.value)}
                  class="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm font-mono text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Preview dos cálculos fiscais automáticos */}
              {newGross && (
                <div class="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono space-y-1">
                  <span class="text-[10px] text-slate-500 uppercase tracking-wider block font-sans">Apuração Preliminar:</span>
                  <div class="flex justify-between text-slate-400">
                    <span>Desconto INSS:</span>
                    <span class="text-rose-400">- {formatCurrency(calculatePayrollValues(newGross).inss)}</span>
                  </div>
                  <div class="flex justify-between text-slate-400">
                    <span>Retenção IRRF:</span>
                    <span class="text-indigo-400">- {formatCurrency(calculatePayrollValues(newGross).irrf)}</span>
                  </div>
                  <div class="flex justify-between text-slate-200 font-bold border-t border-slate-800 pt-1">
                    <span>Líquido Estimado:</span>
                    <span class="text-emerald-400">{formatCurrency(calculatePayrollValues(newGross).net)}</span>
                  </div>
                </div>
              )}

              <div class="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  class="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-slate-400 hover:text-white transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  class="px-5 py-2 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-white transition shadow-lg shadow-sky-500/25"
                >
                  Salvar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
