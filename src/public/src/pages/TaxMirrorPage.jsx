import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  CheckCircle2, 
  AlertTriangle, 
  FileSpreadsheet, 
  HelpCircle, 
  Layers, 
  Scale,
  DollarSign
} from 'lucide-react';
import { api } from '../services/api';
import { formatCurrency } from '../utils/masks';

export default function TaxMirrorPage({ selectedBatch, selectedTenant }) {
  const [batches, setBatches] = useState([]);
  const [currentBatchId, setCurrentBatchId] = useState(selectedBatch?.batchId || '');
  const [taxMirror, setTaxMirror] = useState(null);
  const [loading, setLoading] = useState(false);

  // Simulador de Apuração em Tempo Real
  const [simBase, setSimBase] = useState('4500.00');
  const [simInssDeclarado, setSimInssDeclarado] = useState('450.00'); // valor propositalmente errado para mostrar divergência
  const [simResult, setSimResult] = useState(null);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    api.getBatches(selectedTenant)
      .then((list) => {
        setBatches(list);
        if (!currentBatchId && list.length > 0) {
          setCurrentBatchId(list[0].batchId);
          loadMirror(list[0].batchId);
        }
      })
      .catch(console.error);
  }, [selectedTenant]);

  useEffect(() => {
    if (selectedBatch) {
      setCurrentBatchId(selectedBatch.batchId);
      loadMirror(selectedBatch.batchId);
    }
  }, [selectedBatch]);

  const loadMirror = async (bId) => {
    setLoading(true);
    try {
      const mirror = await api.getTaxMirror(bId, selectedTenant);
      setTaxMirror(mirror);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const res = await api.calculateTaxPreview(
        parseFloat(simBase) || 0,
        parseFloat(simInssDeclarado) || 0,
        0,
        0
      );
      setSimResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  useEffect(() => {
    handleSimulate();
  }, []);

  return (
    <div class="space-y-6">
      {/* Top Header */}
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 uppercase tracking-widest border border-sky-500/20">
            RF03 – Motor de Apuração Fiscal
          </span>
          <h2 class="text-xl font-bold text-white mt-1">Espelho de Conferência e Apuração de Totalizadores</h2>
          <p class="text-xs text-slate-400">
            Reconstituição matemática dos totalizadores S-5001, S-5002, S-5003, S-5011 e S-5013 a partir das rubricas declaradas.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <span class="text-xs text-slate-400 font-medium">Lote Auditado:</span>
          <select
            value={currentBatchId}
            onChange={(e) => {
              setCurrentBatchId(e.target.value);
              loadMirror(e.target.value);
            }}
            class="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-sky-300 font-mono focus:outline-none focus:border-sky-500"
          >
            {batches.map((b) => (
              <option key={b.batchId} value={b.batchId}>
                {b.batchId} ({b.taxMirror?.possuiDivergencias ? 'Divergente' : 'Conforme'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {taxMirror && (
        <div class="space-y-6">
          {/* Banner de Integridade */}
          <div class={`p-4 rounded-xl border flex items-start gap-3 text-xs ${
            taxMirror.possuiDivergencias
              ? 'bg-rose-950/40 border-rose-800 text-rose-200'
              : 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
          }`}>
            {taxMirror.possuiDivergencias ? (
              <AlertTriangle class="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 class="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            )}
            <div>
              <span class="font-bold text-sm block mb-1">
                {taxMirror.possuiDivergencias ? 'Divergência Fiscal Detectada pelo Servidor' : 'Conformidade Fiscal Atestada'}
              </span>
              <p class="leading-relaxed text-slate-300">
                {taxMirror.memoriaCalculoTexto}
              </p>
            </div>
          </div>

          {/* Grid de Totalizadores Oficiais */}
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* S-5001: INSS Segurado */}
            <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                <span class="text-xs font-bold text-sky-400 font-mono">S-5001 • INSS Segurado</span>
                <span class="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">Trabalhador</span>
              </div>
              <div class="space-y-1.5 text-xs">
                <div class="flex justify-between text-slate-400">
                  <span>Base de Cálculo:</span>
                  <span class="font-mono text-slate-200">{formatCurrency(taxMirror.baseCalculoInssSegurado)}</span>
                </div>
                <div class="flex justify-between text-slate-400">
                  <span>Declarado no Lote:</span>
                  <span class="font-mono text-slate-200">{formatCurrency(taxMirror.inssSeguradoDeclarado)}</span>
                </div>
                <div class="flex justify-between text-slate-400">
                  <span>Apurado (Euditoria):</span>
                  <span class="font-mono font-bold text-emerald-400">{formatCurrency(taxMirror.inssSeguradoApurado)}</span>
                </div>
                <div class="pt-2 border-t border-slate-800 flex justify-between font-semibold">
                  <span class="text-slate-300">Divergência:</span>
                  <span class={`font-mono ${taxMirror.divergenciaInssSegurado?.abs() > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}`}>
                    {formatCurrency(taxMirror.divergenciaInssSegurado)}
                  </span>
                </div>
              </div>
            </div>

            {/* S-5002: IRRF */}
            <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                <span class="text-xs font-bold text-indigo-400 font-mono">S-5002 • IRRF Retido</span>
                <span class="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">Trabalhador</span>
              </div>
              <div class="space-y-1.5 text-xs">
                <div class="flex justify-between text-slate-400">
                  <span>Base Tributável:</span>
                  <span class="font-mono text-slate-200">{formatCurrency(taxMirror.baseCalculoIrrf)}</span>
                </div>
                <div class="flex justify-between text-slate-400">
                  <span>Declarado no Lote:</span>
                  <span class="font-mono text-slate-200">{formatCurrency(taxMirror.irrfDeclarado)}</span>
                </div>
                <div class="flex justify-between text-slate-400">
                  <span>Apurado (Euditoria):</span>
                  <span class="font-mono font-bold text-emerald-400">{formatCurrency(taxMirror.irrfApurado)}</span>
                </div>
                <div class="pt-2 border-t border-slate-800 flex justify-between font-semibold">
                  <span class="text-slate-300">Divergência:</span>
                  <span class={`font-mono ${taxMirror.divergenciaIrrf?.abs() > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}`}>
                    {formatCurrency(taxMirror.divergenciaIrrf)}
                  </span>
                </div>
              </div>
            </div>

            {/* S-5003: FGTS */}
            <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                <span class="text-xs font-bold text-amber-400 font-mono">S-5003 • FGTS (8%)</span>
                <span class="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">Trabalhador</span>
              </div>
              <div class="space-y-1.5 text-xs">
                <div class="flex justify-between text-slate-400">
                  <span>Remuneração FGTS:</span>
                  <span class="font-mono text-slate-200">{formatCurrency(taxMirror.baseCalculoFgts)}</span>
                </div>
                <div class="flex justify-between text-slate-400">
                  <span>Declarado no Lote:</span>
                  <span class="font-mono text-slate-200">{formatCurrency(taxMirror.fgtsDeclarado)}</span>
                </div>
                <div class="flex justify-between text-slate-400">
                  <span>Apurado (Euditoria):</span>
                  <span class="font-mono font-bold text-emerald-400">{formatCurrency(taxMirror.fgtsApurado)}</span>
                </div>
                <div class="pt-2 border-t border-slate-800 flex justify-between font-semibold">
                  <span class="text-slate-300">Divergência:</span>
                  <span class={`font-mono ${taxMirror.divergenciaFgts?.abs() > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}`}>
                    {formatCurrency(taxMirror.divergenciaFgts)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* S-5011 & S-5013: Encargos Consolidados do Empregador */}
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 class="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Scale class="w-4 h-4 text-sky-400" />
              S-5011 &amp; S-5013 • Contribuições Sociais Patronais e FGTS Consolidado
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
              <div class="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl">
                <span class="text-[11px] text-slate-400 block font-medium">Patronal Previdenciária (20%)</span>
                <span class="text-lg font-bold font-mono text-white mt-1 block">
                  {formatCurrency(taxMirror.patronalPrevidenciariaApurada)}
                </span>
                <span class="text-[10px] text-slate-500">Folha RGPS</span>
              </div>

              <div class="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl">
                <span class="text-[11px] text-slate-400 block font-medium">RAT Ajustado (2% × FAP)</span>
                <span class="text-lg font-bold font-mono text-white mt-1 block">
                  {formatCurrency(taxMirror.ratApurado)}
                </span>
                <span class="text-[10px] text-slate-500">Riscos Ambientais</span>
              </div>

              <div class="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl">
                <span class="text-[11px] text-slate-400 block font-medium">Terceiros / Outras Entidades (5,8%)</span>
                <span class="text-lg font-bold font-mono text-white mt-1 block">
                  {formatCurrency(taxMirror.outrasEntidadesTerceirosApurado)}
                </span>
                <span class="text-[10px] text-slate-500">Sal. Educação / SESI / SENAI</span>
              </div>

              <div class="bg-gradient-to-br from-sky-950/60 to-indigo-950/60 border border-sky-800/60 p-4 rounded-xl">
                <span class="text-[11px] text-sky-300 block font-bold">Total Patronal Consolidado</span>
                <span class="text-lg font-extrabold font-mono text-sky-400 mt-1 block">
                  {formatCurrency(taxMirror.totalPatronalApurado)}
                </span>
                <span class="text-[10px] text-sky-300/80">Guia DAE / DCTFWeb</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Simulador Interativo de Regras Fiscais */}
      <div class="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div class="border-b border-slate-800 pb-3 flex items-center justify-between">
          <div>
            <h3 class="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <DollarSign class="w-4 h-4 text-emerald-400" />
              Simulador Fiscal de Integridade (Servidor)
            </h3>
            <p class="text-xs text-slate-400">
              Teste o motor de recálculo com valores arbitrários e veja o servidor apontar subfaturamento ou acerto.
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label class="text-xs text-slate-400 font-semibold block mb-1">Salário Base (R$)</label>
            <input
              type="number"
              step="0.01"
              value={simBase}
              onChange={(e) => setSimBase(e.target.value)}
              class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label class="text-xs text-slate-400 font-semibold block mb-1">INSS Informado no XML (R$)</label>
            <input
              type="number"
              step="0.01"
              value={simInssDeclarado}
              onChange={(e) => setSimInssDeclarado(e.target.value)}
              class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div class="flex items-end">
            <button
              onClick={handleSimulate}
              disabled={simulating}
              class="w-full py-2 bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold rounded-lg transition shadow-md shadow-sky-500/30"
            >
              {simulating ? 'Calculando...' : 'Recalcular no Servidor'}
            </button>
          </div>
        </div>

        {simResult && (
          <div class="mt-4 p-4 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div>
              <span class="text-slate-500 block">INSS Calculado pelo Servidor:</span>
              <span class="text-sm font-bold text-emerald-400">{formatCurrency(simResult.inssSeguradoApurado)}</span>
            </div>
            <div>
              <span class="text-slate-500 block">Diferença Encontrada:</span>
              <span class={`text-sm font-bold ${simResult.possuiDivergencias ? 'text-rose-400' : 'text-emerald-400'}`}>
                {formatCurrency(simResult.divergenciaInssSegurado)}
              </span>
            </div>
            <div>
              <span class="text-slate-500 block">Diagnóstico de Integridade:</span>
              <span class={`text-xs font-bold ${simResult.possuiDivergencias ? 'text-rose-400' : 'text-emerald-400'}`}>
                {simResult.possuiDivergencias ? 'DIVERGÊNCIA FISCAL' : 'CONFORME (100%)'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}