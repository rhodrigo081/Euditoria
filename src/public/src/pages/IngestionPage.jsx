import React, { useState } from "react";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Send,
  Loader2,
} from "lucide-react";
import { api } from "../services/api";
import MaskedInput from "../components/MaskedInput";
import CharacterCountInput from "../components/CharacterCountInput";
import {
  validateCpf,
  validateEmail,
  validateRequired,
} from "../utils/validators";

export default function IngestionPage({
  setTab,
  selectedTenant,
  onBatchCreated,
}) {
  const [activeMode, setActiveMode] = useState("upload"); // 'upload' | 'raw'
  const [selectedFile, setSelectedFile] = useState(null);
  const [rawXml, setRawXml] = useState("");

  // Dados do formulário de auditoria com segurança no frontend
  const [nomeResponsavel, setNomeResponsavel] = useState("");
  const [emailNotificacao, setEmailNotificacao] = useState("");
  const [telefoneContato, setTelefoneContato] = useState("");
  const [cpfResponsavel, setCpfResponsavel] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successResult, setSuccessResult] = useState(null);

  // Verificação de consistência de estado antes do processamento (Frontend Security)
  const isFormValid = () => {
    if (!validateRequired(nomeResponsavel)) return false;
    if (!validateEmail(emailNotificacao)) return false;
    if (!validateCpf(cpfResponsavel)) return false;
    if (!validateRequired(telefoneContato) || telefoneContato.length < 14)
      return false;
    if (activeMode === "upload" && !selectedFile) return false;
    if (activeMode === "raw" && !validateRequired(rawXml)) return false;
    return true;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith(".xml")) {
        setErrorMessage(
          "Formato inválido: apenas arquivos com extensão .xml são aceitos.",
        );
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        setErrorMessage("O arquivo excede o limite máximo permitido de 20MB.");
        return;
      }
      setSelectedFile(file);
      setErrorMessage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      setErrorMessage(
        "Preencha todos os campos obrigatórios com informações válidas antes de submeter.",
      );
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessResult(null);

    try {
      let res;
      if (activeMode === "upload") {
        res = await api.uploadBatch(selectedFile, selectedTenant);
      } else {
        res = await api.uploadRawXml(
          "lote_digitado.xml",
          rawXml,
          selectedTenant,
        );
      }

      setSuccessResult(res);
      if (onBatchCreated) {
        onBatchCreated(res);
      }
    } catch (err) {
      setErrorMessage(err.message || "Falha ao processar ingestão do lote.");
    } finally {
      setLoading(false);
    }
  };

  const loadSampleXml = () => {
    const sample = `<?xml version="1.0" encoding="UTF-8"?>
<eSocial xmlns="http://www.esocial.gov.br/schema/lote/eventos/envio/v1_1_1">
  <envioLoteEventos grupo="1">
    <ideEmpregador>
      <tpInsc>1</tpInsc>
      <nrInsc>12345678000195</nrInsc>
    </ideEmpregador>
    <eventos>
      <evento Id="ID1123456780001952026091300000001">
        <eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtRemun/v_S_01_02_00">
          <evtRemun Id="ID1123456780001952026091300000001">
            <ideTrabalhador>
              <cpfTrab>52998224725</cpfTrab>
              <infoComplem><nmTrab>Carlos Eduardo da Silva</nmTrab></infoComplem>
            </ideTrabalhador>
            <dmDev>
              <infoPerApur>
                <ideEstabLot>
                  <remunPerApur>
                    <matricula>MAT-9821</matricula>
                    <itensRemun>
                      <codRubr>1000</codRubr>
                      <vrRubr>4500.00</vrRubr>
                    </itensRemun>
                  </remunPerApur>
                </ideEstabLot>
              </infoPerApur>
            </dmDev>
          </evtRemun>
        </eSocial>
      </evento>
    </eventos>
  </envioLoteEventos>
</eSocial>`;
    setRawXml(sample);
  };

  return (
    <div class="max-w-4xl mx-auto space-y-6">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div class="border-b border-slate-800 pb-4 mb-6">
          <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 uppercase tracking-widest border border-sky-500/20">
            Ingestão Automatizada
          </span>
          <h2 class="text-xl font-bold text-white mt-2">
            Recepção de Lote e Início da Auditoria Prévia
          </h2>
          <p class="text-xs text-slate-400 mt-1">
            Envie o arquivo XML do eSocial para validação de esquemas XSD,
            cruzamento da linha do tempo e apuração fiscal em fila assíncrona.
          </p>
        </div>

        {errorMessage && (
          <div class="mb-6 p-4 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-3">
            <ShieldAlert class="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successResult && (
          <div class="mb-6 p-5 rounded-xl bg-emerald-950/50 border border-emerald-800/80 text-emerald-300 text-xs space-y-2">
            <div class="flex items-center gap-2 font-bold text-sm text-emerald-400">
              <CheckCircle2 class="w-5 h-5" />
              Lote Recepcionado com Sucesso! Ticket: {successResult.batchId}
            </div>
            <p class="text-slate-300">
              Status atual:{" "}
              <span class="font-mono font-bold text-white">
                {successResult.status}
              </span>{" "}
              ({successResult.estimatedEvents} eventos estimados).
            </p>
            <div class="pt-2 flex gap-3">
              <button
                onClick={() => setTab("diagnostico")}
                class="px-3 py-1.5 bg-emerald-500 text-slate-950 font-bold rounded-lg hover:bg-emerald-400 transition"
              >
                Ver Diagnóstico &amp; Editor XML
              </button>
              <button
                onClick={() => setTab("apuracao")}
                class="px-3 py-1.5 bg-slate-800 text-slate-200 font-semibold rounded-lg hover:bg-slate-700 transition"
              >
                Conferir Espelho Fiscal
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} class="space-y-6">
          {/* Dados do Solicitante (Segurança no Frontend) */}
          <div class="bg-slate-950/60 border border-slate-800 p-5 rounded-xl space-y-4">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <FileText class="w-4 h-4 text-sky-400" />
              Dados do Auditor / Responsável Técnico
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex flex-col gap-1.5 w-full h-full">
                <label class="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                  <span>Nome Completo do Responsável</span>
                  <span class="text-rose-400 font-bold">*</span>
                </label>
                <input
                  type="text"
                  value={nomeResponsavel}
                  onChange={(e) => setNomeResponsavel(e.target.value)}
                  required
                  maxLength={60}
                  placeholder="Juliana Silveira"
                  class="px-3.5 py-2.5 rounded-lg bg-slate-800/90 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
                />
              </div>

              {/* Tipagem Semântica nativa do navegador */}
              <div class="flex flex-col gap-1.5 w-full h-full">
                <label class="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                  <span>E-mail para Notificação e Protocolo</span>
                  <span class="text-rose-400 font-bold">*</span>
                </label>
                <input
                  type="email"
                  value={emailNotificacao}
                  onChange={(e) => setEmailNotificacao(e.target.value)}
                  required
                  maxLength={80}
                  placeholder="auditor@empresa.com.br"
                  class="px-3.5 py-2.5 rounded-lg bg-slate-800/90 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
                />
              </div>

              <MaskedInput
                label="CPF do Responsável"
                mask="cpf"
                value={cpfResponsavel}
                onChange={setCpfResponsavel}
                required
                placeholder="000.000.000-00"
              />

              <MaskedInput
                label="Telefone Corporativo"
                mask="phone"
                value={telefoneContato}
                onChange={setTelefoneContato}
                required
                placeholder="(00) 0 0000-0000"
              />
            </div>

            <div class="grid gap-4">
              <div class="flex flex-col gap-1.5 w-full h-full">
                <label class="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                  <span>Observação</span>
                  <span class="text-rose-400 font-bold">*</span>
                </label>
                <textarea
                  label="Observações da Auditoria (Opcional)"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  maxLength={200}
                  placeholder="Ex: Auditoria prévia referente à folha mensal da filial 02..."
                  helperText="Limite de 200 caracteres"
                  class="px-3.5 py-2.5 rounded-lg bg-slate-800/90 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Seletor de Modo de Envio */}
          <div class="flex border-b border-slate-800">
            <button
              type="button"
              onClick={() => setActiveMode("upload")}
              class={`px-4 py-2.5 text-xs font-bold border-b-2 transition ${
                activeMode === "upload"
                  ? "border-sky-500 text-sky-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Upload de Arquivo XML (.xml)
            </button>
            <button
              type="button"
              onClick={() => setActiveMode("raw")}
              class={`px-4 py-2.5 text-xs font-bold border-b-2 transition ${
                activeMode === "raw"
                  ? "border-sky-500 text-sky-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Inserção Direta de XML (Texto)
            </button>
          </div>

          {activeMode === "upload" ? (
            <div class="border-2 border-dashed border-slate-700 hover:border-sky-500/60 rounded-xl p-8 text-center bg-slate-950/40 transition">
              <UploadCloud class="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p class="text-sm font-semibold text-slate-200">
                {selectedFile
                  ? selectedFile.name
                  : "Arraste o arquivo XML ou clique para selecionar"}
              </p>
              <p class="text-xs text-slate-500 mt-1">
                Tamanho máximo permitido: 20MB | Formatos suportados: .xml
              </p>
              <input
                type="file"
                accept=".xml,text/xml"
                onChange={handleFileChange}
                class="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                class="mt-4 inline-block px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 font-semibold text-xs rounded-lg cursor-pointer border border-slate-700 transition"
              >
                {selectedFile ? "Trocar Arquivo" : "Escolher Arquivo"}
              </label>
            </div>
          ) : (
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-xs text-slate-400 font-medium">
                  Cole o envelope XML do lote eSocial abaixo:
                </span>
                <button
                  type="button"
                  onClick={loadSampleXml}
                  class="text-xs text-sky-400 hover:underline font-semibold"
                >
                  Carregar Exemplo Válido
                </button>
              </div>
              <CharacterCountInput
                value={rawXml}
                onChange={setRawXml}
                maxLength={50000}
                isTextarea
                rows={10}
                required
                placeholder="<eSocial>...</eSocial>"
              />
            </div>
          )}

          {/* Botão de Envio com Bloqueio de Inconsistência */}
          <div class="flex items-center justify-between pt-4 border-t border-slate-800">
            <div class="text-xs text-slate-400 flex items-center gap-1.5">
              <AlertCircle class="w-4 h-4 text-amber-400" />
              <span>
                O botão só é habilitado com todos os dados íntegros e validados.
              </span>
            </div>

            <button
              type="submit"
              disabled={!isFormValid() || loading}
              class={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition ${
                isFormValid() && !loading
                  ? "bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/25 cursor-pointer"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 class="w-4 h-4 animate-spin" />
                  Processando Lote Assincronamente...
                </>
              ) : (
                <>
                  <Send class="w-4 h-4" />
                  Submeter Lote para Auditoria Prévia
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
