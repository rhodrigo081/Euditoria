import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  CheckCircle2, 
  AlertTriangle, 
  User, 
  Calendar, 
  Hash, 
  ShieldAlert,
  Search,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import MaskedInput from '../components/MaskedInput';

export default function TimelinePage({ selectedTenant }) {
  const [cpf, setCpf] = useState('111.222.333-44'); // Default com quebra de precedência para demonstrar RF05
  const [timelineData, setTimelineData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadTimeline = async (targetCpf) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await api.getWorkerTimeline(targetCpf, selectedTenant);
      setTimelineData(data);
    } catch (err) {
      setErrorMsg(err.message || 'Erro ao carregar linha do tempo do trabalhador.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimeline(cpf);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadTimeline(cpf);
  };

  return (
    <div class="space-y-6">
      {/* Top Header */}
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 uppercase tracking-widest border border-sky-500/20">
            RF05 – Rastreabilidade da Linha do Tempo
          </span>
          <h2 class="text-xl font-bold text-white mt-1">Histórico Cronológico e Auditoria de Precedência</h2>
          <p class="text-xs text-slate-400">
            Reconstituição cronológica de eventos (S-2200, S-2206, S-2230, S-2299) acusando quebras de encadeamento legal.
          </p>
        </div>

        {/* Atalhos Rápidos para Demonstração */}
        <div class="flex items-center gap-2">
          <button
            type="button"
            onClick={() => { setCpf('111.222.333-44'); loadTimeline('111.222.333-44'); }}
            class="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold transition"
          >
            Mariana (Com Violação)
          </button>
          <button
            type="button"
            onClick={() => { setCpf('529.982.247-25'); loadTimeline('529.982.247-25'); }}
            class="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold transition"
          >
            Carlos (Conforme)
          </button>
        </div>
      </div>

      {/* Busca por CPF com Máscara Estrita */}
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <form onSubmit={handleSearch} class="flex flex-col sm:flex-row items-end gap-3 max-w-xl">
          <div class="w-full">
            <MaskedInput
              label="Consultar Trabalhador por CPF"
              mask="cpf"
              value={cpf}
              onChange={setCpf}
              required
              placeholder="000.000.000-00"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            class="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-sky-500/30 shrink-0"
          >
            <Search class="w-3.5 h-3.5" />
            {loading ? 'Consultando...' : 'Rastrear Histórico'}
          </button>
        </form>
      </div>

      {errorMsg && (
        <div class="p-4 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle class="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Exibição da Linha do Tempo */}
      {timelineData && (
        <div class="space-y-6">
          {/* Ficha do Trabalhador */}
          <div class="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
                <User class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-sm font-bold text-white">{timelineData.workerName}</h3>
                <div class="flex items-center gap-3 text-xs text-slate-400 font-mono mt-0.5">
                  <span>CPF: {timelineData.cpf}</span>
                  <span>•</span>
                  <span>Matrícula: {timelineData.matricula}</span>
                </div>
              </div>
            </div>

            <div>
              {timelineData.hasPrecedenceViolations ? (
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                  <ShieldAlert class="w-4 h-4" />
                  Quebra de Precedência Legal Detectada
                </span>
              ) : (
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 class="w-4 h-4" />
                  Encadeamento Cronológico Regular
                </span>
              )}
            </div>
          </div>

          {/* Timeline Visual Vertical */}
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative">
            <div class="space-y-8 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-slate-800">
              {timelineData.events.map((evt, idx) => {
                const isViolation = evt.precedenceViolation;
                return (
                  <div key={evt.id || idx} class="relative flex items-start gap-6 group">
                    {/* Marcador */}
                    <div class={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ring-4 ring-slate-900 ${
                      isViolation
                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40'
                        : 'bg-slate-800 text-sky-400 border border-slate-700'
                    }`}>
                      {isViolation ? (
                        <AlertTriangle class="w-5 h-5" />
                      ) : (
                        <GitBranch class="w-5 h-5" />
                      )}
                    </div>

                    {/* Conteúdo do Evento */}
                    <div class={`flex-1 p-4 rounded-xl border transition ${
                      isViolation
                        ? 'bg-rose-950/30 border-rose-800/80 text-rose-200'
                        : 'bg-slate-950/60 border-slate-800 text-slate-200'
                    }`}>
                      <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div class="flex items-center gap-2">
                          <span class="font-bold font-mono px-2 py-0.5 rounded bg-slate-800 text-sky-400 border border-slate-700">
                            {evt.eventType}
                          </span>
                          <span class="font-bold text-white text-sm">{evt.description}</span>
                        </div>

                        <div class="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                          <span class="flex items-center gap-1">
                            <Calendar class="w-3.5 h-3.5" />
                            {evt.eventDate}
                          </span>
                          <span class="flex items-center gap-1">
                            <Hash class="w-3.5 h-3.5" />
                            {evt.receiptNumber}
                          </span>
                        </div>
                      </div>

                      {/* Detalhes da Violação de Precedência */}
                      {isViolation && (
                        <div class="mt-3 p-3 rounded-lg bg-rose-950/70 border border-rose-700 text-xs text-rose-200 font-medium">
                          <span class="font-bold text-rose-300 block mb-1">Inconsistência Legal:</span>
                          {evt.violationDetails}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}