import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  FileCheck2, 
  Clock, 
  TrendingUp, 
  ArrowUpRight, 
  RefreshCw, 
  FileCode, 
  Building2,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../services/api';
import { batchService } from '../services/supabase';
import { formatCurrency } from '../utils/masks';

export default function DashboardPage({ setTab, selectedTenant, userSession, onSelectBatch }) {
  const [batches, setBatches] = useState([]);
  const [tenantUsage, setTenantUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  const profile = userSession?.profile;

  const loadData = async () => {
    setLoading(true);
    try {
      let batchList = [];
      try {
        const [apiBatches, usage] = await Promise.all([
          api.getBatches(selectedTenant),
          api.getTenantUsage(selectedTenant)
        ]);
        batchList = apiBatches || [];
        setTenantUsage(usage);
      } catch (err) {
        // Fallback para o serviço Supabase / Local
        batchList = await batchService.getBatches(selectedTenant);
      }
      setBatches(batchList);
    } catch (err) {
      console.error('[Dashboard] Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedTenant]);

  const compliantCount = batches.filter(b => b.status === 'COMPLIANT').length;
  const nonCompliantCount = batches.filter(b => b.status === 'NON_COMPLIANT').length;
  const totalEvents = batches.reduce((acc, b) => acc + (b.eventsCount || b.events_count || 0), 0);
  const complianceRate = batches.length ? Math.round((compliantCount / batches.length) * 100) : 100;

  return (
    <div class="space-y-6">
      {/* Top Banner de Governança */}
      <div class="bg-gradient-to-r from-sky-950 via-slate-900 to-slate-950 border border-sky-800/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div class="absolute -right-10 -bottom-10 opacity-10">
          <ShieldCheck class="w-72 h-72 text-sky-400" />
        </div>
        <div class="max-w-2xl relative z-10">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold mb-3">
            <Building2 class="w-3.5 h-3.5" />
            {profile?.fullName || tenantUsage?.tenantName || 'Organização Ativa'}
            {profile?.accessRole === 'PROCURADOR' && (
              <span class="text-indigo-300 font-bold ml-1">
                (Procurador de {profile.outorganteName || profile.outorganteDocument})
              </span>
            )}
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Auditoria Prévia &amp; Governança eSocial
          </h1>
          <p class="text-sm text-slate-300 mt-2 leading-relaxed">
            Certificação técnica e apuração de inconsistências fiscais, estruturais (XSD) e encadeamento da folha antes do envio ao ambiente do governo.
          </p>
          <div class="flex flex-wrap items-center gap-3 mt-4">
            <button
              onClick={() => setTab('ingestao')}
              class="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-sky-500/20 flex items-center gap-2 cursor-pointer"
            >
              Auditar Novo Lote XML
              <ArrowUpRight class="w-4 h-4" />
            </button>
            <button
              onClick={() => setTab('folha')}
              class="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center gap-2 cursor-pointer"
            >
              Ver Folha de Pagamento
            </button>
            <button
              onClick={loadData}
              class="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold rounded-xl border border-slate-800 transition flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw class={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
          <div class="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Índice de Conformidade</span>
            <TrendingUp class="w-4 h-4 text-emerald-400" />
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="text-3xl font-extrabold text-white">{batches.length > 0 ? `${complianceRate}%` : '100%'}</span>
            <span class="text-xs text-emerald-400 font-medium">{compliantCount} lotes íntegros</span>
          </div>
          <div class="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div class="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${complianceRate}%` }} />
          </div>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div class="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Eventos Auditados</span>
            <FileCheck2 class="w-4 h-4 text-sky-400" />
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="text-3xl font-extrabold text-white">{totalEvents}</span>
            <span class="text-xs text-slate-400">processados</span>
          </div>
          <p class="text-xs text-slate-400 mt-3 flex items-center gap-1">
            <Clock class="w-3.5 h-3.5 text-sky-400" /> S-1000, S-2200, S-1200
          </p>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div class="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Inconsistências Retidas</span>
            <AlertTriangle class="w-4 h-4 text-rose-400" />
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="text-3xl font-extrabold text-rose-400">{nonCompliantCount}</span>
            <span class="text-xs text-slate-400">lotes com desvios</span>
          </div>
          <p class="text-xs text-rose-400/90 mt-3 font-medium">
            Erros prevenidos antes da transmissão oficial
          </p>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div class="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Plano &amp; Governança</span>
            <Building2 class="w-4 h-4 text-indigo-400" />
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="text-3xl font-extrabold text-white">
              {tenantUsage ? `${Math.round(tenantUsage.quotaUsagePercentage)}%` : 'Ativo'}
            </span>
            <span class="text-xs text-slate-400">
              {tenantUsage ? `${tenantUsage.monthlyEventsUsed} / ${tenantUsage.monthlyEventQuota}` : 'Cota mensal'}
            </span>
          </div>
          <div class="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              class="bg-indigo-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${tenantUsage ? Math.min(100, tenantUsage.quotaUsagePercentage) : 15}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Tabela de Lotes Recentes */}
      <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div class="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 class="text-sm font-bold text-white uppercase tracking-wider">Histórico Recente de Lotes</h2>
            <p class="text-xs text-slate-400">Auditorias prévias realizadas com espelhos fiscais e diagnósticos</p>
          </div>
          <button
            onClick={() => setTab('ingestao')}
            class="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 cursor-pointer"
          >
            Enviar novo lote &rarr;
          </button>
        </div>

        {batches.length > 0 ? (
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-950/60 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <th class="py-3 px-4 font-semibold">Identificador do Lote</th>
                  <th class="py-3 px-4 font-semibold">Arquivo</th>
                  <th class="py-3 px-4 font-semibold">Eventos</th>
                  <th class="py-3 px-4 font-semibold">Status de Conformidade</th>
                  <th class="py-3 px-4 font-semibold">Espelho Fiscal</th>
                  <th class="py-3 px-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800 text-xs">
                {batches.map((batch) => {
                  const bId = batch.batchId || batch.id;
                  const isCompliant = batch.status === 'COMPLIANT';
                  return (
                    <tr key={bId} class="hover:bg-slate-800/40 transition">
                      <td class="py-3.5 px-4 font-mono font-medium text-sky-400">
                        {bId}
                      </td>
                      <td class="py-3.5 px-4 text-slate-200 font-medium">
                        {batch.fileName || batch.file_name}
                      </td>
                      <td class="py-3.5 px-4 text-slate-300">
                        {batch.eventsCount || batch.events_count || 0} eventos
                      </td>
                      <td class="py-3.5 px-4">
                        {isCompliant ? (
                          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 class="w-3.5 h-3.5" />
                            Conforme (100%)
                          </span>
                        ) : (
                          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <AlertTriangle class="w-3.5 h-3.5" />
                            {batch.diagnostics?.length || 0} Inconsistências
                          </span>
                        )}
                      </td>
                      <td class="py-3.5 px-4">
                        {batch.taxMirror ? (
                          <div class="text-[11px]">
                            <span class="text-slate-300 font-mono">
                              INSS: {formatCurrency(batch.taxMirror.inssSeguradoApurado)}
                            </span>
                            {batch.taxMirror.possuiDivergencias && (
                              <span class="ml-2 text-rose-400 font-bold text-[10px]">DIVERGÊNCIA</span>
                            )}
                          </div>
                        ) : (
                          <span class="text-slate-500">N/A</span>
                        )}
                      </td>
                      <td class="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            if (onSelectBatch) onSelectBatch(batch);
                            setTab('diagnostico');
                          }}
                          class="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 font-semibold text-[11px] transition inline-flex items-center gap-1 cursor-pointer"
                        >
                          <FileCode class="w-3.5 h-3.5" />
                          Editor
                        </button>
                        {isCompliant && (
                          <button
                            onClick={() => {
                              if (onSelectBatch) onSelectBatch(batch);
                              setTab('certificados');
                            }}
                            class="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-semibold text-[11px] transition inline-flex items-center gap-1 cursor-pointer"
                          >
                            Certificado
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Empty state limpo sem dados mockados */
          <div class="text-center py-14 px-4 space-y-3">
            <FileCheck2 class="w-12 h-12 text-slate-600 mx-auto" />
            <h4 class="text-sm font-bold text-white">Nenhum lote enviado ainda</h4>
            <p class="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Submeta seu primeiro arquivo XML para auditoria prévia, conferência do espelho fiscal e geração de protocolo de conformidade.
            </p>
            <div class="pt-2">
              <button
                onClick={() => setTab('ingestao')}
                class="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs rounded-xl transition shadow-md shadow-sky-500/20 inline-flex items-center gap-1.5 cursor-pointer"
              >
                Auditar Primeiro Lote XML
                <ArrowUpRight class="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}