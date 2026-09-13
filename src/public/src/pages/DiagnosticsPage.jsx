import React, { useState, useEffect } from 'react';
import { 
  FileCode2, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Sparkles, 
  ShieldAlert,
  Terminal,
  Zap
} from 'lucide-react';
import { api } from '../services/api';

export default function DiagnosticsPage({ selectedBatch, selectedTenant, onBatchUpdated }) {
  const [batches, setBatches] = useState([]);
  const [currentBatchId, setCurrentBatchId] = useState(selectedBatch?.batchId || '');
  const [currentBatch, setCurrentBatch] = useState(selectedBatch || null);
  const [xmlCode, setXmlCode] = useState('');
  const [diagnostics, setDiagnostics] = useState([]);
  const [reprocessing, setReprocessing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Carrega a lista de lotes disponíveis
  useEffect(() => {
    api.getBatches(selectedTenant)
      .then((list) => {
        setBatches(list);
        if (!currentBatchId && list.length > 0) {
          // Prefere o lote com erros para demonstrar o editor
          const nonCompliant = list.find((b) => b.status === 'NON_COMPLIANT') || list[0];
          setCurrentBatchId(nonCompliant.batchId);
          loadBatch(nonCompliant.batchId);
        }
      })
      .catch(console.error);
  }, [selectedTenant]);

  useEffect(() => {
    if (selectedBatch && selectedBatch.batchId !== currentBatchId) {
      setCurrentBatchId(selectedBatch.batchId);
      loadBatch(selectedBatch.batchId);
    }
  }, [selectedBatch]);

  const loadBatch = async (bId) => {
    try {
      const b = await api.getBatchDetails(bId, selectedTenant);
      setCurrentBatch(b);
      setXmlCode(b.xmlContent || '');
      setDiagnostics(b.diagnostics || []);
      setFeedbackMsg('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleBatchChange = (e) => {
    const bId = e.target.value;
    setCurrentBatchId(bId);
    loadBatch(bId);
  };

  // RF06: Reprocessamento Imediato no Editor XML Integrado
  const handleReprocess = async () => {
    if (!currentBatchId) return;
    setReprocessing(true);
    setFeedbackMsg('');
    try {
      const updated = await api.reprocessXml(currentBatchId, xmlCode, selectedTenant);
      setCurrentBatch(updated);
      setDiagnostics(updated.diagnostics || []);
      if (updated.status === 'COMPLIANT') {
        setFeedbackMsg('Parabéns! O lote foi reprocessado com sucesso e 100% de conformidade foi atingida!');
      } else {
        setFeedbackMsg(`Reprocessado: ${updated.diagnostics.length} inconsistência(s) remanescente(s).`);
      }
      if (onBatchUpdated) onBatchUpdated(updated);
    } catch (err) {
      setFeedbackMsg(`Erro ao reprocessar: ${err.message}`);
    } finally {
      setReprocessing(false);
    }
  };

  // Corrige automaticamente os erros do exemplo para demonstrar a revalidação imediata
  const handleAutoFix = () => {
    let fixed = xmlCode;
    // Corrige CPF inválido 11122233344 para CPF válido 52998224725
    fixed = fixed.replace('11122233344', '52998224725');
    // Adiciona bloco de admissão prévio para sanar precedência do S-2299
    if (fixed.includes('evtDeslig') && !fixed.includes('evtAdmissao')) {
      fixed = fixed.replace('<evento Id="ID1123456780001952026091300000088">', 
        `<!-- Evento S-2200 Admissao adicionado para sanar precedencia -->
      <evento Id="ID1123456780001952026091300000087">
        <eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtAdmissao/v_S_01_02_00">
          <evtAdmissao Id="ID1123456780001952026091300000087">
            <ideEmpregador><nrInsc>12345678000195</nrInsc></ideEmpregador>
            <trabalhador><cpfTrab>52998224725</cpfTrab></trabalhador>
            <vinculo><matricula>MAT-9999</matricula><dtAdm>2022-01-10</dtAdm></vinculo>
          </evtAdmissao>
        </eSocial>
      </evento>
      <evento Id="ID1123456780001952026091300000088">`);
    }
    // Ajusta rubrica de INSS
    fixed = fixed.replace('<vrRubr>150.00</vrRubr>', '<vrRubr>761.59</vrRubr>');
    setXmlCode(fixed);
  };

  const lines = xmlCode.split('\n');
  const errorLines = new Set(diagnostics.map(d => d.lineNumber));

  return (
    <div class="space-y-6">
      {/* Top Header */}
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 uppercase tracking-widest border border-sky-500/20">
            RF02 &amp; RF06 – Central de Diagnóstico &amp; Editor XML
          </span>
          <h2 class="text-xl font-bold text-white mt-1">Editor XML com Diagnóstico e Reprocessamento Imediato</h2>
          <p class="text-xs text-slate-400">
            Identificação de falhas de schema XSD, regras de negócio e reprocessamento em tempo real.
          </p>
        </div>

        {/* Seletor de Lotes */}
        <div class="flex items-center gap-3">
          <span class="text-xs text-slate-400 font-medium">Lote Ativo:</span>
          <select
            value={currentBatchId}
            onChange={handleBatchChange}
            class="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-sky-300 font-mono focus:outline-none focus:border-sky-500"
          >
            {batches.map((b) => (
              <option key={b.batchId} value={b.batchId}>
                {b.batchId} ({b.status === 'COMPLIANT' ? 'Conforme' : `${b.diagnostics?.length || 0} Erros`})
              </option>
            ))}
          </select>
        </div>
      </div>

      {feedbackMsg && (
        <div class={`p-4 rounded-xl border text-xs flex items-center justify-between gap-3 ${
          currentBatch?.status === 'COMPLIANT'
            ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
            : 'bg-amber-950/60 border-amber-800 text-amber-300'
        }`}>
          <div class="flex items-center gap-2 font-medium">
            {currentBatch?.status === 'COMPLIANT' ? (
              <CheckCircle2 class="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle class="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span>{feedbackMsg}</span>
          </div>
        </div>
      )}

      {/* Editor & Painel Lateral */}
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor XML Integrado */}
        <div class="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
          <div class="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs">
            <div class="flex items-center gap-2 font-mono text-slate-300">
              <Terminal class="w-4 h-4 text-sky-400" />
              <span>{currentBatch?.fileName || 'editor.xml'}</span>
              <span class="text-slate-500">({lines.length} linhas)</span>
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAutoFix}
                class="px-2.5 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-[11px] font-semibold transition flex items-center gap-1.5"
                title="Aplica correções conhecidas de CPF e encadeamento para teste"
              >
                <Sparkles class="w-3.5 h-3.5 text-indigo-400" />
                Auto-Correção Sugerida
              </button>

              <button
                type="button"
                onClick={handleReprocess}
                disabled={reprocessing}
                class="px-3 py-1 bg-sky-500 hover:bg-sky-400 text-white rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 shadow-md shadow-sky-500/30 disabled:opacity-50"
              >
                <Zap class={`w-3.5 h-3.5 ${reprocessing ? 'animate-spin' : ''}`} />
                {reprocessing ? 'Reprocessando...' : 'Reprocessar Imediatamente'}
              </button>
            </div>
          </div>

          {/* Área de Código com Numeração */}
          <div class="relative flex-1 min-h-[460px] max-h-[580px] overflow-auto flex text-xs font-mono">
            {/* Números das Linhas */}
            <div class="w-12 bg-slate-900/50 py-3 text-right pr-3 select-none text-slate-600 border-r border-slate-800 shrink-0">
              {lines.map((_, i) => {
                const lineNum = i + 1;
                const hasError = errorLines.has(lineNum);
                return (
                  <div
                    key={lineNum}
                    class={`leading-6 ${hasError ? 'text-rose-400 font-bold bg-rose-950/40' : ''}`}
                  >
                    {lineNum}
                  </div>
                );
              })}
            </div>

            {/* Editor Textarea */}
            <textarea
              value={xmlCode}
              onChange={(e) => setXmlCode(e.target.value)}
              spellCheck="false"
              class="w-full bg-transparent text-slate-200 p-3 leading-6 resize-none focus:outline-none focus:ring-0 whitespace-pre font-mono text-xs selection:bg-sky-700/60"
            />
          </div>
        </div>

        {/* Painel Lateral de Diagnósticos */}
        <div class="lg:col-span-4 space-y-4">
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div class="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 class="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <AlertTriangle class="w-4 h-4 text-amber-400" />
                Diagnóstico de Auditoria ({diagnostics.length})
              </h3>
              <span class={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                diagnostics.length === 0
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                {diagnostics.length === 0 ? 'CONFORME' : 'IRREGULAR'}
              </span>
            </div>

            <div class="mt-4 space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {diagnostics.length === 0 ? (
                <div class="text-center py-10 space-y-3 text-slate-400">
                  <CheckCircle2 class="w-10 h-10 text-emerald-400 mx-auto" />
                  <p class="text-xs font-semibold text-slate-200">
                    Nenhuma irregularidade detectada!
                  </p>
                  <p class="text-[11px] text-slate-400">
                    O lote atende integralmente aos esquemas XSD e às regras fiscais e semânticas vigentes.
                  </p>
                </div>
              ) : (
                diagnostics.map((diag, index) => {
                  const isCrit = diag.severity === 'CRITICAL';
                  const isErr = diag.severity === 'ERROR';
                  return (
                    <div
                      key={diag.id || index}
                      class={`p-3.5 rounded-xl border transition ${
                        isCrit
                          ? 'bg-rose-950/40 border-rose-800/80 text-rose-200'
                          : isErr
                          ? 'bg-amber-950/40 border-amber-800/80 text-amber-200'
                          : 'bg-sky-950/40 border-sky-800/80 text-sky-200'
                      }`}
                    >
                      <div class="flex items-center justify-between text-[10px] font-mono mb-1">
                        <span class="font-bold px-1.5 py-0.5 rounded bg-black/40">
                          Linha {diag.lineNumber || 'N/A'} : &lt;{diag.nodeName}&gt;
                        </span>
                        <span class="uppercase tracking-widest font-bold text-[9px] px-1.5 py-0.5 rounded bg-black/40">
                          {diag.severity}
                        </span>
                      </div>

                      <div class="text-xs font-semibold mt-1">
                        {diag.message}
                      </div>

                      {diag.suggestedFix && (
                        <div class="mt-2 text-[11px] bg-black/40 p-2 rounded-lg border border-white/5 text-slate-300">
                          <span class="font-bold text-sky-400 block mb-0.5">Sugestão de Correção:</span>
                          {diag.suggestedFix}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}