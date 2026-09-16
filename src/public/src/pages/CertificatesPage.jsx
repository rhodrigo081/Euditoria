import React, { useState, useEffect } from 'react';
import { 
  Award, 
  ShieldCheck, 
  Download, 
  FileCheck2, 
  QrCode, 
  ExternalLink,
  Hash,
  Calendar,
  Building2,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight
} from 'lucide-react';
import { api } from '../services/api';
import { certificateService, batchService } from '../services/supabase';
import { generateCertificatePdf } from '../utils/pdfGenerator';

export default function CertificatesPage({ selectedBatch, selectedTenant, setTab }) {
  const [batches, setBatches] = useState([]);
  const [certificateList, setCertificateList] = useState([]);
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const loadCertificates = async () => {
    setLoading(true);
    try {
      // 1. Tenta carregar do backend REST
      let compliantBatches = [];
      try {
        const list = await api.getBatches(selectedTenant);
        compliantBatches = list.filter((b) => b.certificate);
        setBatches(compliantBatches);
      } catch (err) {
        // Fallback para serviço Supabase / Local
        const sbBatches = await batchService.getBatches(selectedTenant);
        compliantBatches = sbBatches.filter((b) => b.certificate || b.status === 'COMPLIANT');
        setBatches(compliantBatches);
      }

      // 2. Carrega lista de certificados
      const certs = await certificateService.getCertificates(selectedTenant);
      setCertificateList(certs);

      if (selectedBatch && selectedBatch.certificate) {
        setCertificate(selectedBatch.certificate);
      } else if (compliantBatches.length > 0 && compliantBatches[0].certificate) {
        setCertificate(compliantBatches[0].certificate);
      } else if (certs.length > 0) {
        setCertificate(certs[0]);
      } else {
        setCertificate(null);
      }
    } catch (err) {
      console.error('[CertificatesPage] Erro ao carregar certificados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCertificates();
  }, [selectedTenant]);

  useEffect(() => {
    if (selectedBatch && selectedBatch.certificate) {
      setCertificate(selectedBatch.certificate);
    }
  }, [selectedBatch]);

  const handleDownloadPdf = () => {
    if (!certificate) return;
    setGeneratingPdf(true);
    setDownloadSuccess(false);

    try {
      generateCertificatePdf(certificate);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('[PDF Generator] Erro ao gerar PDF:', err);
      alert('Erro ao gerar documento PDF: ' + err.message);
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <div class="space-y-6">
      {/* Top Header */}
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 uppercase tracking-widest border border-emerald-500/20">
           Emissão de Certificados Oficiais
          </span>
          <h2 class="text-xl font-bold text-white mt-1">Certificação Técnica de Conformidade Prévia</h2>
          <p class="text-xs text-slate-400">
            Documento em formato PDF oficial com carimbo criptográfico SHA-256 e identificador oficial para lotes 100% conformes.
          </p>
        </div>

        {certificate && (
          <div class="flex items-center gap-3">
            <button
              onClick={handleDownloadPdf}
              disabled={generatingPdf}
              class="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
            >
              <Download class="w-4 h-4" />
              {generatingPdf ? 'Gerando Documento PDF...' : 'Baixar Certificado Oficial (PDF)'}
            </button>
          </div>
        )}
      </div>

      {downloadSuccess && (
        <div class="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-700 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 class="w-4 h-4 text-emerald-400" />
          <span>Certificado emitido com sucesso! O download do arquivo PDF foi concluído.</span>
        </div>
      )}

      {certificate ? (
        /* Certificado Oficial Estilizado na Interface */
        <div class="max-w-3xl mx-auto bg-slate-950 border-2 border-emerald-500/40 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          {/* Marca d'água de fundo */}
          <div class="absolute -right-20 -top-20 opacity-5 pointer-events-none select-none">
            <ShieldCheck class="w-96 h-96 text-emerald-400" />
          </div>

          {/* Cabeçalho do Certificado */}
          <div class="text-center space-y-2 border-b border-slate-800 pb-6 relative z-10">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-600 mx-auto flex items-center justify-center shadow-xl shadow-emerald-500/30">
              <Award class="w-9 h-9 text-white" />
            </div>
            <h1 class="text-2xl font-black text-white tracking-tight uppercase mt-3">
              Certificado de Conformidade Técnica
            </h1>
            <p class="text-xs text-emerald-400 font-semibold tracking-widest uppercase">
              Plataforma Integrada Euditoria • Auditoria eSocial
            </p>
            <div class="pt-2">
              <span class="font-mono text-xs px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-sky-300 font-bold">
                {certificate.certificateId || certificate.certificate_id}
              </span>
            </div>
          </div>

          {/* Corpo do Certificado */}
          <div class="py-8 space-y-6 text-xs text-slate-300 relative z-10 leading-relaxed">
            <p class="text-sm">
              Certificamos que o lote de eventos do <strong class="text-white">eSocial</strong> abaixo identificado foi submetido à auditoria prévia e obteve <strong class="text-emerald-400 font-bold">Aprovação Integral (100%)</strong>, em total observância aos esquemas técnicos XSD vigentes, às regras semânticas de cruzamento do CNPJ/CPF e à integridade das tabelas tributárias progressivas.
            </p>

            <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span class="text-slate-500 block text-[11px]">Organização / Empregador:</span>
                <span class="font-bold text-white text-xs">{certificate.razaoSocial || certificate.company_name}</span>
              </div>

              <div>
                <span class="text-slate-500 block text-[11px]">Inscrição CNPJ/CPF:</span>
                <span class="font-mono font-semibold text-slate-200 text-xs">{certificate.cnpj}</span>
              </div>

              <div>
                <span class="text-slate-500 block text-[11px]">Número do Protocolo:</span>
                <span class="font-mono font-bold text-sky-400 text-xs">{certificate.protocolNumber || certificate.protocol_number}</span>
              </div>

              <div>
                <span class="text-slate-500 block text-[11px]">Eventos Validados:</span>
                <span class="font-bold text-slate-200 text-xs">{certificate.totalEventsValidated || certificate.total_events || 0} eventos analisados</span>
              </div>
            </div>

            {/* Assinatura Criptográfica SHA-256 */}
            <div class="space-y-1">
              <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Carimbo Criptográfico do Lote Auditado (SHA-256):
              </span>
              <div class="p-3 bg-black/60 rounded-xl border border-slate-800 font-mono text-[11px] break-all text-emerald-400">
                {certificate.sha256Hash || certificate.sha256_hash}
              </div>
            </div>
          </div>

          {/* Rodapé e Autenticação */}
          <div class="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 relative z-10 text-xs text-slate-400">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-white p-1 rounded-lg shrink-0 flex items-center justify-center">
                <QrCode class="w-10 h-10 text-black" />
              </div>
              <div>
                <span class="text-[11px] text-slate-500 block">Validação pública online:</span>
                <a
                  href={certificate.verificationUrl || certificate.verification_url}
                  target="_blank"
                  rel="noreferrer"
                  class="text-sky-400 hover:underline font-mono text-[11px] flex items-center gap-1"
                >
                  {certificate.verificationUrl || certificate.verification_url}
                  <ExternalLink class="w-3 h-3" />
                </a>
              </div>
            </div>

            <div class="text-right">
              <span class="inline-flex items-center gap-1 text-emerald-400 font-bold text-xs">
                <CheckCircle2 class="w-4 h-4" />
                Autenticidade Certificada
              </span>
              <span class="block text-[10px] text-slate-500 mt-0.5">
                Emitido em: {new Date(certificate.issuedAt || certificate.issued_at || Date.now()).toLocaleString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State Real Limpo */
        <div class="text-center py-16 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 max-w-2xl mx-auto p-8">
          <div class="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Award class="w-8 h-8 text-slate-500" />
          </div>
          <div>
            <h3 class="text-base font-bold text-white">Nenhum certificado emitido até o momento</h3>
            <p class="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
              Certificados de conformidade técnica são gerados automaticamente assim que um lote de eventos do eSocial atinge 100% de conformidade técnica (sem erros estruturais XSD ou tributários).
            </p>
          </div>
          {setTab && (
            <div class="pt-2">
              <button
                onClick={() => setTab('ingestao')}
                class="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-sky-500/20 inline-flex items-center gap-2"
              >
                Auditar Lote para Emissão
                <ArrowUpRight class="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}