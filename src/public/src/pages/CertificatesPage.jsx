import React, { useState, useEffect } from 'react';
import { 
  Award, 
  ShieldCheck, 
  Printer, 
  FileCheck2, 
  QrCode, 
  ExternalLink,
  Hash,
  Calendar,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';

export default function CertificatesPage({ selectedBatch, selectedTenant }) {
  const [batches, setBatches] = useState([]);
  const [certificate, setCertificate] = useState(null);
  const [currentCertId, setCurrentCertId] = useState('EUD-2026-CERT-B94A7C1E');

  useEffect(() => {
    api.getBatches(selectedTenant)
      .then((list) => {
        const compliantList = list.filter((b) => b.certificate);
        setBatches(compliantList);
        if (compliantList.length > 0) {
          setCertificate(compliantList[0].certificate);
          setCurrentCertId(compliantList[0].certificate.certificateId);
        }
      })
      .catch(console.error);
  }, [selectedTenant]);

  useEffect(() => {
    if (selectedBatch && selectedBatch.certificate) {
      setCertificate(selectedBatch.certificate);
      setCurrentCertId(selectedBatch.certificate.certificateId);
    }
  }, [selectedBatch]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div class="space-y-6">
      {/* Top Header */}
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl no-print">
        <div>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 uppercase tracking-widest border border-sky-500/20">
            RF04 – Emissão de Certificados &amp; Protocolos
          </span>
          <h2 class="text-xl font-bold text-white mt-1">Certificação Técnica de Conformidade Prévia</h2>
          <p class="text-xs text-slate-400">
            Geração de protocolo auditável com hash SHA-256 e identificador oficial para lotes 100% conformes.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button
            onClick={handlePrint}
            class="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <Printer class="w-4 h-4" />
            Imprimir / Exportar Protocolo
          </button>
        </div>
      </div>

      {certificate ? (
        /* Certificado Oficial Estilizado */
        <div class="max-w-3xl mx-auto bg-slate-950 border-2 border-emerald-500/40 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden print:border-black print:text-black print:bg-white print:p-6 print:shadow-none">
          {/* Marca d'água de fundo */}
          <div class="absolute -right-20 -top-20 opacity-5 pointer-events-none select-none">
            <ShieldCheck class="w-96 h-96 text-emerald-400" />
          </div>

          {/* Cabeçalho do Certificado */}
          <div class="text-center space-y-2 border-b border-slate-800 print:border-slate-300 pb-6 relative z-10">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-600 mx-auto flex items-center justify-center shadow-xl shadow-emerald-500/30">
              <Award class="w-9 h-9 text-white" />
            </div>
            <h1 class="text-2xl font-black text-white print:text-black tracking-tight uppercase mt-3">
              Certificado de Conformidade Técnica
            </h1>
            <p class="text-xs text-emerald-400 font-semibold tracking-widest uppercase">
              Plataforma Integrada Euditoria • Auditoria eSocial
            </p>
            <div class="pt-2">
              <span class="font-mono text-xs px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-sky-300 font-bold">
                {certificate.certificateId}
              </span>
            </div>
          </div>

          {/* Corpo do Certificado */}
          <div class="py-8 space-y-6 text-xs text-slate-300 print:text-slate-800 relative z-10 leading-relaxed">
            <p class="text-sm">
              Certificamos que o lote de eventos do <strong class="text-white print:text-black">eSocial</strong> abaixo identificado foi submetido à auditoria prévia e obteve <strong class="text-emerald-400 font-bold">Aprovação Integral (100%)</strong>, em total observância aos esquemas técnicos XSD vigentes, às regras semânticas de cruzamento do CNPJ/CPF, à integridade das tabelas tributárias progressivas e à coerência temporal da linha do tempo.
            </p>

            <div class="bg-slate-900/80 print:bg-slate-100 border border-slate-800 print:border-slate-300 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span class="text-slate-500 block text-[11px]">Organização / Empregador:</span>
                <span class="font-bold text-white print:text-black text-xs">{certificate.razaoSocial}</span>
              </div>

              <div>
                <span class="text-slate-500 block text-[11px]">Inscrição CNPJ:</span>
                <span class="font-mono font-semibold text-slate-200 print:text-slate-900 text-xs">{certificate.cnpj}</span>
              </div>

              <div>
                <span class="text-slate-500 block text-[11px]">Número do Protocolo:</span>
                <span class="font-mono font-bold text-sky-400 print:text-sky-800 text-xs">{certificate.protocolNumber}</span>
              </div>

              <div>
                <span class="text-slate-500 block text-[11px]">Eventos Validados:</span>
                <span class="font-bold text-slate-200 print:text-slate-900 text-xs">{certificate.totalEventsValidated} eventos analisados</span>
              </div>
            </div>

            {/* Assinatura Criptográfica SHA-256 */}
            <div class="space-y-1">
              <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Carimbo Criptográfico do Lote Auditado (SHA-256):
              </span>
              <div class="p-3 bg-black/60 print:bg-slate-100 rounded-xl border border-slate-800 print:border-slate-300 font-mono text-[11px] break-all text-emerald-400 print:text-emerald-800">
                {certificate.sha256Hash}
              </div>
            </div>
          </div>

          {/* Rodapé e Autenticação */}
          <div class="pt-6 border-t border-slate-800 print:border-slate-300 flex flex-wrap items-center justify-between gap-4 relative z-10 text-xs text-slate-400">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-white p-1 rounded-lg shrink-0 flex items-center justify-center">
                <QrCode class="w-10 h-10 text-black" />
              </div>
              <div>
                <span class="text-[11px] text-slate-500 block">Validação pública online:</span>
                <a
                  href={certificate.verificationUrl}
                  target="_blank"
                  rel="noreferrer"
                  class="text-sky-400 hover:underline font-mono text-[11px] flex items-center gap-1"
                >
                  {certificate.verificationUrl}
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
                Emitido em: {new Date(certificate.issuedAt).toLocaleString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div class="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
          <Award class="w-12 h-12 text-slate-500 mx-auto" />
          <h3 class="text-sm font-bold text-white">Nenhum certificado emitido para este lote</h3>
          <p class="text-xs text-slate-400 max-w-md mx-auto">
            Certificados de conformidade só são emitidos quando o lote obtém aprovação absoluta (0 erros críticos ou impeditivos).
          </p>
        </div>
      )}
    </div>
  );
}