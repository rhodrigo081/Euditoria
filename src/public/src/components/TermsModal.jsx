import React from 'react';
import { ShieldCheck, X, CheckCircle, FileText, Lock, Building, Scale, Mail } from 'lucide-react';

export default function TermsModal({ isOpen, onClose, onAccept }) {
  if (!isOpen) return null;

  return (
    <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-slate-950 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-5 relative max-h-[88vh] flex flex-col">
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          class="absolute right-5 top-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X class="w-5 h-5" />
        </button>

        {/* Cabeçalho */}
        <div class="border-b border-slate-800 pb-4 shrink-0">
          <div class="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
            <ShieldCheck class="w-4 h-4 text-sky-400" />
            <span>Governança &amp; Proteção de Dados • Lei 13.709/2018 (LGPD)</span>
          </div>
          <h2 class="text-xl font-bold text-white mt-1">
            Termos de Serviço &amp; Política de Privacidade
          </h2>
          <p class="text-xs text-slate-400 mt-0.5">
            Versão 2026.1 • Diretrizes de segurança da informação, finalidades de auditoria prévia e direitos dos titulares.
          </p>
        </div>

        {/* Conteúdo com Scroll */}
        <div class="overflow-y-auto pr-2 space-y-5 text-xs text-slate-300 leading-relaxed text-justify font-sans">
          {/* Seção 1 */}
          <div class="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <h3 class="font-bold text-sm text-white flex items-center gap-2">
              <FileText class="w-4 h-4 text-sky-400 shrink-0" />
              1. Objeto e Definições Legais
            </h3>
            <p>
              A Plataforma <strong>Euditoria</strong> provê serviços especializados de auditoria preventiva de arquivos digitais do <strong>eSocial</strong>, conferência matemática de totalizadores tributários (S-5001 a S-5013), validação de regras de precedência trabalhista e geração de protocolos auditáveis com carimbo criptográfico SHA-256.
            </p>
            <p>
              Em observância ao <strong>Art. 5º da Lei Geral de Proteção de Dados (LGPD)</strong>, define-se que a <strong>Empresa Usuária</strong> atua na qualidade de <strong>Controladora</strong> dos dados pessoais dos seus colaboradores e prestadores, cabendo à Euditoria a função de <strong>Operadora</strong>, que processa os dados exclusivamente em cumprimento às instruções do Controlador e às normas fiscais vigentes.
            </p>
          </div>

          {/* Seção 2 */}
          <div class="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <h3 class="font-bold text-sm text-white flex items-center gap-2">
              <Scale class="w-4 h-4 text-emerald-400 shrink-0" />
              2. Bases Legais e Finalidades do Tratamento
            </h3>
            <p>
              O processamento de dados realizado na Euditoria está estritamente fundamentado nas hipóteses legais dos <strong>Artigos 7º e 11 da LGPD</strong>:
            </p>
            <ul class="list-disc pl-5 space-y-1 text-slate-400">
              <li><strong>Cumprimento de obrigação legal ou regulatória (Art. 7º, II):</strong> transmissão íntegra de dados ao eSocial, apuração de encargos previdenciários e retenções de IRRF perante a Receita Federal e Ministério do Trabalho;</li>
              <li><strong>Execução de contrato de trabalho (Art. 7º, V):</strong> cálculo e conferência de remunerações, férias, afastamentos e verbas rescisórias;</li>
              <li><strong>Legítimo interesse do Controlador (Art. 7º, IX):</strong> auditoria preventiva para evitar autuações fiscais, glosas e contingências trabalhistas.</li>
            </ul>
            <p class="text-[11px] text-emerald-400 font-semibold mt-1">
              ✔ É expressamente vedada a comercialização, compartilhamento não autorizado ou utilização dos dados para finalidades estranhas à auditoria fiscal.
            </p>
          </div>

          {/* Seção 3 */}
          <div class="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <h3 class="font-bold text-sm text-white flex items-center gap-2">
              <Lock class="w-4 h-4 text-indigo-400 shrink-0" />
              3. Medidas Técnicas de Segurança e Criptografia
            </h3>
            <p>
              Em conformidade com o <strong>Art. 46 da LGPD</strong>, a Euditoria emprega medidas técnicas de classe corporativa:
            </p>
            <ul class="list-disc pl-5 space-y-1 text-slate-400">
              <li><strong>Criptografia Forte:</strong> tráfego protegido por TLS 1.3 e dados em repouso protegidos por algoritmo AES-256;</li>
              <li><strong>Isolamento Multi-Tenant:</strong> segregação lógica de banco de dados por organização com políticas de <em>Row Level Security (RLS)</em>;</li>
              <li><strong>Carimbo SHA-256:</strong> lotes auditados recebem carimbo criptográfico imutável para comprovação de integridade perante fiscalizações;</li>
              <li><strong>Blindagem de Logs (RFC 7807):</strong> ausência de dados sensíveis e stacktraces em relatórios de erro;</li>
              <li><strong>Prevenção de Ataques (DoS):</strong> rate-limiting ativo por organização para garantia contínua de disponibilidade.</li>
            </ul>
          </div>

          {/* Seção 4 */}
          <div class="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <h3 class="font-bold text-sm text-white flex items-center gap-2">
              <Mail class="w-4 h-4 text-sky-400 shrink-0" />
              4. Direitos dos Titulares e Contato com o DPO
            </h3>
            <p>
              Os titulares de dados podem exercer seus direitos de confirmação de tratamento, acesso, correção ou eliminação através do canal oficial do nosso <strong>Encarregado de Proteção de Dados (DPO)</strong>:
            </p>
            <div class="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs flex items-center justify-between">
              <div>
                <span class="text-slate-500 block text-[10px]">Canal de Atendimento ao Titular:</span>
                <span class="text-sky-300 font-bold">dpo@euditoria.com.br</span>
              </div>
              <span class="text-[10px] text-slate-400">Resposta em até 15 dias úteis</span>
            </div>
          </div>
        </div>

        {/* Rodapé do Modal */}
        <div class="border-t border-slate-800 pt-4 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span class="text-[11px] text-slate-500 text-center sm:text-left">
            Ao aceitar, você concorda com o tratamento de dados segundo as finalidades acima expostas.
          </span>

          <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              class="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-slate-300 hover:text-white transition"
            >
              Fechar
            </button>
            {onAccept && (
              <button
                type="button"
                onClick={() => {
                  onAccept();
                  onClose();
                }}
                class="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
              >
                <CheckCircle class="w-4 h-4" />
                Concordo e Aceito os Termos
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
