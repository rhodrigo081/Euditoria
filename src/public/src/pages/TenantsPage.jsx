import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  ShieldCheck, 
  Activity, 
  Clock, 
  Database, 
  Zap, 
  Check, 
  AlertCircle,
  Building2
} from 'lucide-react';
import { api } from '../services/api';

export default function TenantsPage({ selectedTenant, setTenant }) {
  const [tenantUsage, setTenantUsage] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadUsage = async (tId) => {
    setLoading(true);
    try {
      const data = await api.getTenantUsage(tId);
      setTenantUsage(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsage(selectedTenant);
  }, [selectedTenant]);

  const plans = [
    {
      id: 'STARTER',
      name: 'Starter Tier',
      tagline: 'Empresas em fase inicial ou contabilidades individuais',
      monthlyEvents: '100 eventos/mês',
      rpm: '30 req/min',
      retention: '30 dias de histórico',
      features: [
        'Validação estrutural XSD básica',
        'Conferência de Módulo 11 (CPF/CNPJ)',
        'Suporte por ticket',
      ],
      isCurrent: tenantUsage?.plan === 'STARTER',
    },
    {
      id: 'PROFESSIONAL',
      name: 'Professional Tier',
      tagline: 'Médias empresas e departamentos fiscais especializados',
      monthlyEvents: '5.000 eventos/mês',
      rpm: '120 req/min',
      retention: '1 ano de histórico',
      popular: true,
      features: [
        'Editor XML integrado com diagnóstico visual',
        'Motor completo de apuração fiscal (S-5001 a S-5013)',
        'Rastreabilidade da linha do tempo funcional',
        'Emissão de certificados SHA-256 e protocolos',
      ],
      isCurrent: tenantUsage?.plan === 'PROFESSIONAL',
    },
    {
      id: 'ENTERPRISE',
      name: 'Enterprise Tier',
      tagline: 'Grandes corporações industriais e shared services',
      monthlyEvents: 'Ilimitado (1.000.000+)',
      rpm: '600 req/min',
      retention: '5 anos de histórico legal',
      features: [
        'Fila assíncrona dedicada com throughput prioritário',
        'Isolamento multi-tenant de banco e memória',
        'SLA de 99.9% de disponibilidade garantida',
        'Auditoria contínua e webhooks de evento',
      ],
      isCurrent: tenantUsage?.plan === 'ENTERPRISE',
    },
  ];

  return (
    <div class="space-y-6">
      {/* Top Header */}
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 uppercase tracking-widest border border-sky-500/20">
          RF07 – Gestão Multi-Tenant &amp; Controle de Cotas
        </span>
        <h2 class="text-xl font-bold text-white mt-1">Governança de Planos, Taxas de API e Retenção</h2>
        <p class="text-xs text-slate-400">
          Proteção da disponibilidade do sistema através de Rate-Limiting por organização e controle de cotas mensais de processamento.
        </p>
      </div>

      {/* Uso Atual do Tenant */}
      {tenantUsage && (
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Cota Mensal */}
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div class="flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span>Volume Mensal de Eventos</span>
              <Database class="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <div class="flex items-baseline gap-2">
                <span class="text-2xl font-extrabold text-white">{tenantUsage.monthlyEventsUsed}</span>
                <span class="text-xs text-slate-500">/ {tenantUsage.monthlyEventQuota} eventos</span>
              </div>
              <p class="text-[11px] text-slate-400 mt-1">
                {Math.round(tenantUsage.quotaUsagePercentage)}% da cota contratada utilizada
              </p>
            </div>
            <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                class="bg-sky-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, tenantUsage.quotaUsagePercentage)}%` }}
              />
            </div>
          </div>

          {/* Rate Limiting (Disponibilidade) */}
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div class="flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span>Limite de Requisições / Minuto</span>
              <Zap class="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div class="flex items-baseline gap-2">
                <span class="text-2xl font-extrabold text-white">{tenantUsage.currentRequestsPerMinute}</span>
                <span class="text-xs text-slate-500">/ {tenantUsage.requestsPerMinuteLimit} req/min</span>
              </div>
              <p class="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                <ShieldCheck class="w-3.5 h-3.5" />
                Vazão segura (Prevenção de DoS ativa)
              </p>
            </div>
            <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                class="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(tenantUsage.currentRequestsPerMinute / tenantUsage.requestsPerMinuteLimit) * 100}%` }}
              />
            </div>
          </div>

          {/* Retenção de Histórico */}
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div class="flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span>Retenção de Histórico</span>
              <Clock class="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <div class="flex items-baseline gap-2">
                <span class="text-2xl font-extrabold text-white">{tenantUsage.historyRetentionDays}</span>
                <span class="text-xs text-slate-500">dias de armazenamento</span>
              </div>
              <p class="text-[11px] text-slate-400 mt-1">
                Garantia legal de rastreabilidade para fiscalizações
              </p>
            </div>
            <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div class="bg-indigo-500 h-full rounded-full" style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      )}

      {/* Planos SaaS Multi-tier */}
      <div class="space-y-4 pt-2">
        <h3 class="text-sm font-bold text-white uppercase tracking-wider">
          Planos do Ecossistema Euditoria
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div
              key={p.id}
              class={`rounded-2xl p-6 border relative flex flex-col justify-between transition ${
                p.isCurrent
                  ? 'bg-slate-900 border-sky-500 ring-2 ring-sky-500/20 shadow-xl'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              {p.popular && (
                <span class="absolute -top-3 right-6 bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow">
                  Recomendado
                </span>
              )}

              <div class="space-y-4">
                <div>
                  <h4 class="text-base font-extrabold text-white">{p.name}</h4>
                  <p class="text-xs text-slate-400 mt-1 leading-relaxed">{p.tagline}</p>
                </div>

                <div class="space-y-1.5 pt-2 border-t border-slate-800 text-xs font-mono">
                  <div class="flex justify-between text-slate-300">
                    <span class="text-slate-500">Cota Mensal:</span>
                    <span class="font-bold">{p.monthlyEvents}</span>
                  </div>
                  <div class="flex justify-between text-slate-300">
                    <span class="text-slate-500">Taxa API:</span>
                    <span class="font-bold">{p.rpm}</span>
                  </div>
                  <div class="flex justify-between text-slate-300">
                    <span class="text-slate-500">Armazenamento:</span>
                    <span class="font-bold">{p.retention}</span>
                  </div>
                </div>

                <ul class="space-y-2 pt-3 border-t border-slate-800 text-xs text-slate-300">
                  {p.features.map((feat, idx) => (
                    <li key={idx} class="flex items-center gap-2">
                      <Check class="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div class="pt-6">
                {p.isCurrent ? (
                  <button
                    disabled
                    class="w-full py-2.5 bg-sky-500/20 text-sky-300 border border-sky-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <Check class="w-4 h-4" />
                    Plano Atualmente Ativo
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      // Altera o tenant selecionado para demonstrar outro tier
                      if (p.id === 'STARTER') setTenant('tenant-gamma');
                      if (p.id === 'PROFESSIONAL') setTenant('tenant-alpha');
                      if (p.id === 'ENTERPRISE') setTenant('tenant-beta');
                    }}
                    class="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition"
                  >
                    Alternar para este Perfil
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}