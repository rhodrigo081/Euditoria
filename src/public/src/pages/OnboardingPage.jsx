import React, { useState } from 'react';
import { 
  ShieldCheck, 
  User, 
  Building2, 
  Lock, 
  Mail, 
  Phone,
  ArrowRight, 
  ArrowLeft,
  CheckCircle2, 
  AlertCircle,
  FileSignature,
  Database,
  Briefcase,
  FileText,
  UserCheck,
  ExternalLink
} from 'lucide-react';
import MaskedInput from '../components/MaskedInput';
import TermsModal from '../components/TermsModal';
import { validateCpf, validateCnpj, validateEmail, validateRequired } from '../utils/validators';
import { authService, isSupabaseConfigured } from '../services/supabase';

export default function OnboardingPage({ 
  onLoginSuccess, 
  initialStep = 1, 
  currentSession = null,
  onCancelSwitch = null
}) {
  // Step 1: Acesso/Cadastro da Empresa | Step 2: Selecionar Próprio Perfil ou Procuração
  const [step, setStep] = useState(initialStep);

  // Sub-modo do Passo 1: 'login' (Entrar com conta existente) ou 'register' (Cadastrar nova empresa)
  const [authMode, setAuthMode] = useState('login');

  // --- DADOS DA SUA EMPRESA (PASSO 1) ---
  const [userType, setUserType] = useState(currentSession?.profile?.userType || 'PJ');
  const [documentNumber, setDocumentNumber] = useState(currentSession?.profile?.documentNumber || '');
  const [fullName, setFullName] = useState(currentSession?.profile?.fullName || '');
  const [responsavelNome, setResponsavelNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState(currentSession?.user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Consentimento LGPD
  const [agreedLgpd, setAgreedLgpd] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  // --- DADOS DE SESSÃO AUTENTICADA (MEMÓRIA DO PASSO 1) ---
  const [authenticatedCompany, setAuthenticatedCompany] = useState(
    currentSession ? currentSession.profile : null
  );

  // --- DADOS DA PROCURAÇÃO (PASSO 2) ---
  const [selectedRole, setSelectedRole] = useState(currentSession?.profile?.accessRole || 'TITULAR');
  const [outorganteType, setOutorganteType] = useState(currentSession?.profile?.outorganteType || 'PJ');
  const [outorganteDocument, setOutorganteDocument] = useState(currentSession?.profile?.outorganteDocument || '');
  const [outorganteName, setOutorganteName] = useState(currentSession?.profile?.outorganteName || '');
  const [procuracaoNumero, setProcuracaoNumero] = useState(currentSession?.profile?.procuracaoNumero || '');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const supabaseActive = isSupabaseConfigured();

  // ==========================================
  // VALIDAÇÃO E SUBMISSÃO DO PASSO 1 (LOGIN OU CADASTRO)
  // ==========================================
  const validateStep1 = () => {
    setErrorMessage('');

    if (authMode === 'login') {
      if (!validateRequired(email)) {
        setErrorMessage('Informe seu e-mail corporativo ou documento (CNPJ/CPF) cadastrado.');
        return false;
      }
      if (!password || password.length < 6) {
        setErrorMessage('A senha deve possuir ao menos 6 caracteres.');
        return false;
      }
      return true;
    }

    // Validações do modo 'register' (Cadastro de Nova Empresa)
    if (userType === 'PF') {
      if (!validateCpf(documentNumber)) {
        setErrorMessage('CPF inválido. Verifique os dígitos informados.');
        return false;
      }
    } else {
      if (!validateCnpj(documentNumber)) {
        setErrorMessage('CNPJ inválido. Verifique a inscrição da empresa informada.');
        return false;
      }
    }

    if (!validateRequired(fullName)) {
      setErrorMessage(userType === 'PJ' ? 'Informe a razão social da sua empresa.' : 'Informe seu nome completo.');
      return false;
    }

    if (!validateRequired(responsavelNome)) {
      setErrorMessage('Informe o nome do responsável técnico ou administrador da conta.');
      return false;
    }

    if (!validateRequired(telefone) || telefone.length < 14) {
      setErrorMessage('Informe um telefone ou WhatsApp corporativo válido para contato.');
      return false;
    }

    if (!validateEmail(email)) {
      setErrorMessage('Informe um e-mail corporativo válido (ex: contato@empresa.com.br).');
      return false;
    }

    if (!password || password.length < 6) {
      setErrorMessage('A senha deve possuir ao menos 6 caracteres.');
      return false;
    }

    if (password !== confirmPassword) {
      setErrorMessage('A confirmação de senha não confere com a senha digitada.');
      return false;
    }

    if (!agreedLgpd) {
      setErrorMessage('É obrigatório ler e concordar com os Termos de Serviço e a Política de Privacidade (LGPD) para cadastrar sua empresa.');
      return false;
    }

    return true;
  };

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    if (!validateStep1()) return;

    setLoading(true);
    setErrorMessage('');

    try {
      let session = null;
      if (authMode === 'register') {
        session = await authService.register({
          userType,
          documentNumber,
          fullName,
          responsavelNome,
          telefone,
          email,
          password,
          agreedLgpd,
        });
      } else {
        session = await authService.login({
          email,
          password,
        });
      }

      setAuthenticatedCompany(session.profile);

      // Transiciona imediatamente para o Passo 2: Escolha de Perfil ou Procuração
      setStep(2);
    } catch (err) {
      setErrorMessage(err.message || 'Falha ao processar acesso da empresa.');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // VALIDAÇÃO E SUBMISSÃO DO PASSO 2 (PERFIL)
  // ==========================================
  const handleProceedAsTitular = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const finalSession = await authService.switchAccessContext({
        accessRole: 'TITULAR',
        outorganteType: null,
        outorganteDocument: null,
        outorganteName: null,
        procuracaoNumero: null,
      });

      if (onLoginSuccess) {
        onLoginSuccess(finalSession);
      }
    } catch (err) {
      setErrorMessage('Erro ao prosseguir no próprio perfil: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProceedAsProcurador = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (outorganteType === 'PF') {
      if (!validateCpf(outorganteDocument)) {
        setErrorMessage('Informe um CPF válido da pessoa com procuração.');
        return false;
      }
    } else {
      if (!validateCnpj(outorganteDocument)) {
        setErrorMessage('Informe um CNPJ válido da empresa que concedeu a procuração.');
        return false;
      }
    }

    if (!validateRequired(outorganteName)) {
      setErrorMessage('Informe a razão social ou nome da empresa representada.');
      return false;
    }

    setLoading(true);

    try {
      const finalSession = await authService.switchAccessContext({
        accessRole: 'PROCURADOR',
        outorganteType,
        outorganteDocument,
        outorganteName,
        procuracaoNumero,
      });

      if (onLoginSuccess) {
        onLoginSuccess(finalSession);
      }
    } catch (err) {
      setErrorMessage('Erro ao acessar por procuração: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="min-h-screen bg-slate-950 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 selection:bg-sky-500 selection:text-white relative overflow-hidden">
      {/* Luzes decorativas */}
      <div class="absolute -top-40 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div class="absolute -bottom-40 right-10 w-[500px] h-[300px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Modal Interativo de Termos de Serviço & LGPD */}
      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        onAccept={() => setAgreedLgpd(true)}
      />

      <div class="sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        {/* Cabeçalho */}
        <div class="flex flex-col items-center text-center mb-6">
          <div class="h-12 w-12 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-sky-500/25 ring-1 ring-white/20 mb-2.5">
            <ShieldCheck class="h-7 w-7 text-white" />
          </div>
          <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Eu<span class="text-sky-400">ditoria</span>
          </h1>
          <p class="text-xs text-sky-400/90 uppercase tracking-widest font-bold mt-0.5">
            Auditoria Prévia &amp; Governança eSocial
          </p>
        </div>

        {/* Indicador de Passos */}
        <div class="mb-5 flex items-center justify-center gap-3 text-xs font-semibold">
          <div class={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition ${
            step === 1 
              ? 'bg-sky-500/20 border-sky-500 text-sky-300 shadow-sm' 
              : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}>
            <span class="w-4 h-4 rounded-full bg-sky-500 text-slate-950 text-[10px] font-black flex items-center justify-center">1</span>
            <span>{authMode === 'register' ? 'Cadastro da Empresa' : 'Acesso da Empresa'}</span>
          </div>

          <span class="text-slate-600">&rarr;</span>

          <div class={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition ${
            step === 2 
              ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow-sm' 
              : 'bg-slate-900 border-slate-800 text-slate-500'
          }`}>
            <span class={`w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center ${
              step === 2 ? 'bg-indigo-400 text-slate-950' : 'bg-slate-800 text-slate-400'
            }`}>2</span>
            <span>Próprio Perfil ou Procuração</span>
          </div>
        </div>

        {/* Card Principal */}
        <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
          {/* Status do Supabase */}
          <div class="flex items-center justify-between bg-slate-950/70 border border-slate-800/80 px-3.5 py-1.5 rounded-xl text-xs">
            <div class="flex items-center gap-2">
              <Database class="w-3.5 h-3.5 text-sky-400" />
              <span class="text-slate-300 font-medium text-[11px]">Banco Supabase:</span>
            </div>
            {supabaseActive ? (
              <span class="text-emerald-400 font-bold font-mono text-[11px] flex items-center gap-1">
                <span class="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Conectado (application.env)
              </span>
            ) : (
              <span class="text-slate-400 font-mono text-[11px]">
                Modo Local Seguro (configure application.env)
              </span>
            )}
          </div>

          {/* ============================================================ */}
          {/* PASSO 1: ENTRAR OU CADASTRAR SUA EMPRESA                    */}
          {/* ============================================================ */}
          {step === 1 && (
            <div class="space-y-4">
              {/* Abas Alternadoras: Já tenho conta (Login) vs Criar Conta (Cadastro) */}
              <div class="flex border-b border-slate-800">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setErrorMessage(''); }}
                  class={`flex-1 pb-3 text-xs font-bold border-b-2 transition flex items-center justify-center gap-2 ${
                    authMode === 'login'
                      ? 'border-sky-500 text-sky-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Building2 class="w-4 h-4" />
                  Já Tenho Conta (Entrar)
                </button>

                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setErrorMessage(''); }}
                  class={`flex-1 pb-3 text-xs font-bold border-b-2 transition flex items-center justify-center gap-2 ${
                    authMode === 'register'
                      ? 'border-sky-500 text-sky-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <UserCheck class="w-4 h-4" />
                  Criar Nova Conta (Cadastro)
                </button>
              </div>

              <div>
                <h2 class="text-base font-bold text-white">
                  {authMode === 'register' ? 'Cadastro de Nova Empresa / Empregador' : 'Identificação da sua Empresa'}
                </h2>
                <p class="text-xs text-slate-400 mt-0.5">
                  {authMode === 'register'
                    ? 'Informe os dados da organização para abertura de conta em conformidade com as diretrizes da LGPD.'
                    : 'Insira os dados da sua empresa titular da conta para autenticar o acesso.'}
                </p>
              </div>

              <form onSubmit={handleStep1Submit} class="space-y-3.5 pt-1">
                {authMode === 'login' ? (
                  /* CAMPOS ESPECÍFICOS DE LOGIN (ENTRAR) */
                  <div class="space-y-3.5">
                    <div class="flex flex-col gap-1.5 w-full">
                      <label class="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                        <span>E-mail Corporativo ou Documento (CNPJ/CPF)</span>
                        <span class="text-rose-400 font-bold">*</span>
                      </label>
                      <div class="relative">
                        <Mail class="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          placeholder="compliance@empresa.com.br ou 00.000.000/0000-00"
                          class="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-800/90 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
                        />
                      </div>
                    </div>

                    <div class="flex flex-col gap-1.5 w-full">
                      <label class="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                        <span>Senha de Acesso</span>
                        <span class="text-rose-400 font-bold">*</span>
                      </label>
                      <div class="relative">
                        <Lock class="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          placeholder="••••••••"
                          class="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-800/90 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* CAMPOS ESPECÍFICOS DE CADASTRO DE NOVA EMPRESA */
                  <div class="space-y-3.5">
                    {/* Tipo de Pessoa (PJ ou PF) */}
                    <div class="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => { setUserType('PJ'); setDocumentNumber(''); }}
                        class={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition ${
                          userType === 'PJ'
                            ? 'bg-sky-500/15 border-sky-500 text-sky-300 ring-1 ring-sky-500/30'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <Building2 class="w-4 h-4" />
                        Pessoa Jurídica (CNPJ)
                      </button>

                      <button
                        type="button"
                        onClick={() => { setUserType('PF'); setDocumentNumber(''); }}
                        class={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition ${
                          userType === 'PF'
                            ? 'bg-sky-500/15 border-sky-500 text-sky-300 ring-1 ring-sky-500/30'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <User class="w-4 h-4" />
                        Pessoa Física (CPF)
                      </button>
                    </div>

                    {/* Documento & Razão Social */}
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <MaskedInput
                        label={userType === 'PJ' ? 'CNPJ da Empresa' : 'Seu CPF'}
                        mask={userType === 'PJ' ? 'cnpj' : 'cpf'}
                        value={documentNumber}
                        onChange={setDocumentNumber}
                        required
                        placeholder={userType === 'PJ' ? '00.000.000/0000-00' : '000.000.000-00'}
                      />

                      <div class="flex flex-col gap-1.5 w-full">
                        <label class="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                          <span>{userType === 'PJ' ? 'Razão Social da Empresa' : 'Nome Completo'}</span>
                          <span class="text-rose-400 font-bold">*</span>
                        </label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                          placeholder={userType === 'PJ' ? 'Ex: TechBrasil Soluções Ltda' : 'Ex: Carlos Eduardo Silva'}
                          class="px-3.5 py-2.5 rounded-lg bg-slate-800/90 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
                        />
                      </div>
                    </div>

                    {/* Responsável e Telefone */}
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div class="flex flex-col gap-1.5 w-full">
                        <label class="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                          <span>Responsável Técnico / Admin</span>
                          <span class="text-rose-400 font-bold">*</span>
                        </label>
                        <input
                          type="text"
                          value={responsavelNome}
                          onChange={(e) => setResponsavelNome(e.target.value)}
                          required
                          placeholder="Ex: Dra. Juliana Silveira"
                          class="px-3.5 py-2.5 rounded-lg bg-slate-800/90 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
                        />
                      </div>

                      <MaskedInput
                        label="Telefone / WhatsApp Corporativo"
                        mask="phone"
                        value={telefone}
                        onChange={setTelefone}
                        required
                        placeholder="(00) 0 0000-0000"
                      />
                    </div>

                    {/* E-mail e Senha */}
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div class="flex flex-col gap-1.5 w-full">
                        <label class="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                          <span>E-mail Corporativo</span>
                          <span class="text-rose-400 font-bold">*</span>
                        </label>
                        <div class="relative">
                          <Mail class="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="compliance@empresa.com.br"
                            class="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-800/90 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
                          />
                        </div>
                      </div>

                      <div class="flex flex-col gap-1.5 w-full">
                        <label class="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                          <span>Senha de Acesso</span>
                          <span class="text-rose-400 font-bold">*</span>
                        </label>
                        <div class="relative">
                          <Lock class="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            class="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-800/90 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Confirmação de Senha */}
                    <div class="flex flex-col gap-1.5 w-full">
                      <label class="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                        <span>Confirmar Senha</span>
                        <span class="text-rose-400 font-bold">*</span>
                      </label>
                      <div class="relative">
                        <Lock class="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          placeholder="••••••••"
                          class="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-800/90 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition font-mono"
                        />
                      </div>
                    </div>

                    {/* Checkbox LGPD */}
                    <div class="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                      <div class="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          id="lgpd-consent"
                          checked={agreedLgpd}
                          onChange={(e) => setAgreedLgpd(e.target.checked)}
                          class="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-500 cursor-pointer"
                        />
                        <label htmlFor="lgpd-consent" class="text-xs text-slate-300 leading-relaxed cursor-pointer select-none">
                          Declaro que li e concordo com os{' '}
                          <button
                            type="button"
                            onClick={() => setIsTermsModalOpen(true)}
                            class="text-sky-400 hover:text-sky-300 underline font-semibold inline-flex items-center gap-0.5"
                          >
                            Termos de Serviço e a Política de Privacidade (LGPD)
                            <ExternalLink class="w-3 h-3 ml-0.5" />
                          </button>
                          , ciente de que a Euditoria atua como Operadora e os dados tratados destinam-se exclusivamente à auditoria preventiva do eSocial nos termos dos Arts. 7º e 11 da Lei 13.709/2018.
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {errorMessage && (
                  <div class="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex flex-col gap-2">
                    <div class="flex items-center gap-2">
                      <AlertCircle class="w-4 h-4 text-rose-400 shrink-0" />
                      <span class="font-semibold">{errorMessage}</span>
                    </div>
                    {errorMessage.includes('não cadastrad') && (
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('register');
                          setErrorMessage('');
                        }}
                        class="self-start text-xs font-bold text-sky-400 hover:text-sky-300 underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Clique aqui para criar o cadastro da sua empresa agora &rarr;</span>
                      </button>
                    )}
                  </div>
                )}

                <div class="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    class="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-sky-500/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <span>Processando Acesso...</span>
                    ) : (
                      <>
                        <span>{authMode === 'register' ? 'Cadastrar Empresa & Continuar' : 'Acessar & Escolher Perfil'}</span>
                        <ArrowRight class="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ============================================================ */}
          {/* PASSO 2: SELECIONAR PRÓPRIO PERFIL OU PROCURAÇÃO             */}
          {/* ============================================================ */}
          {step === 2 && (
            <div class="space-y-5">
              {/* Confirmação da Empresa Autenticada */}
              <div class="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 class="w-4 h-4" />
                  </div>
                  <div>
                    <span class="text-[10px] text-slate-500 uppercase font-mono block">Empresa Autenticada</span>
                    <span class="text-xs font-bold text-white block">
                      {authenticatedCompany?.fullName || fullName}
                    </span>
                    <span class="text-[11px] text-sky-400 font-mono">
                      {authenticatedCompany?.documentNumber || documentNumber}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  class="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 font-semibold hover:underline"
                >
                  <ArrowLeft class="w-3 h-3" />
                  Trocar Empresa
                </button>
              </div>

              <div>
                <h2 class="text-base font-bold text-white">Como você deseja operar hoje?</h2>
                <p class="text-xs text-slate-400 mt-0.5">
                  Selecione se deseja acessar o ambiente da sua própria empresa ou representar um cliente com procuração eletrônica.
                </p>
              </div>

              {/* Seletor de Perfil: Meu Perfil vs Procuração */}
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Opção A: Meu Próprio Perfil (Titular) */}
                <div
                  onClick={() => setSelectedRole('TITULAR')}
                  class={`p-4 rounded-2xl border cursor-pointer transition relative flex flex-col justify-between ${
                    selectedRole === 'TITULAR'
                      ? 'bg-sky-500/10 border-sky-500 ring-2 ring-sky-500/20 shadow-lg'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div class="flex items-center justify-between">
                      <div class="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center mb-2">
                        <Briefcase class="w-4 h-4" />
                      </div>
                      {selectedRole === 'TITULAR' && (
                        <span class="h-2 w-2 rounded-full bg-sky-400" />
                      )}
                    </div>
                    <h3 class="text-sm font-bold text-white">Meu Próprio Perfil</h3>
                    <span class="text-[10px] text-sky-400 font-bold uppercase tracking-wider block mt-0.5">Titular Direto</span>
                    <p class="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Gerencie e audite os eventos do eSocial, folha e guias da própria organização.
                    </p>
                  </div>

                  <div class="pt-3">
                    <button
                      type="button"
                      onClick={handleProceedAsTitular}
                      disabled={loading}
                      class="w-full py-2 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs rounded-xl transition shadow-md shadow-sky-500/20 flex items-center justify-center gap-1.5"
                    >
                      <span>Entrar como Titular</span>
                      <ArrowRight class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Opção B: Por Procuração (Procurador) */}
                <div
                  onClick={() => setSelectedRole('PROCURADOR')}
                  class={`p-4 rounded-2xl border cursor-pointer transition relative flex flex-col justify-between ${
                    selectedRole === 'PROCURADOR'
                      ? 'bg-indigo-500/10 border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div class="flex items-center justify-between">
                      <div class="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-2">
                        <FileSignature class="w-4 h-4" />
                      </div>
                      {selectedRole === 'PROCURADOR' && (
                        <span class="h-2 w-2 rounded-full bg-indigo-400" />
                      )}
                    </div>
                    <h3 class="text-sm font-bold text-white">Acessar por Procuração</h3>
                    <span class="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block mt-0.5">Procurador / Outorga</span>
                    <p class="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Represente outra empresa ou pessoa física com outorga e-CAC / RFB.
                    </p>
                  </div>

                  <div class="pt-3">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('PROCURADOR')}
                      class={`w-full py-2 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 ${
                        selectedRole === 'PROCURADOR'
                          ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <span>Informar Outorga</span>
                      <ArrowRight class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* SEÇÃO EXPANDIDA SE FOR POR PROCURAÇÃO */}
              {selectedRole === 'PROCURADOR' && (
                <form onSubmit={handleProceedAsProcurador} class="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/40 space-y-4">
                  <div class="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
                    <FileSignature class="w-4 h-4 text-indigo-400" />
                    <span>Dados da Empresa ou Pessoa com Procuração</span>
                  </div>

                  {/* Seleção do Tipo do Outorgante */}
                  <div class="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => { setOutorganteType('PJ'); setOutorganteDocument(''); }}
                      class={`p-2 rounded-lg text-xs font-semibold border transition ${
                        outorganteType === 'PJ'
                          ? 'bg-indigo-500/20 border-indigo-400 text-indigo-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      Empresa Representada (CNPJ)
                    </button>

                    <button
                      type="button"
                      onClick={() => { setOutorganteType('PF'); setOutorganteDocument(''); }}
                      class={`p-2 rounded-lg text-xs font-semibold border transition ${
                        outorganteType === 'PF'
                          ? 'bg-indigo-500/20 border-indigo-400 text-indigo-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      Pessoa Representada (CPF)
                    </button>
                  </div>

                  {/* Campos do Representado */}
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <MaskedInput
                      label={outorganteType === 'PJ' ? 'CNPJ da Empresa com Procuração' : 'CPF do Outorgante'}
                      mask={outorganteType === 'PJ' ? 'cnpj' : 'cpf'}
                      value={outorganteDocument}
                      onChange={setOutorganteDocument}
                      required
                      placeholder={outorganteType === 'PJ' ? '00.000.000/0000-00' : '000.000.000-00'}
                    />

                    <div class="flex flex-col gap-1.5 w-full">
                      <label class="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                        <span>{outorganteType === 'PJ' ? 'Razão Social do Representado' : 'Nome do Representado'}</span>
                        <span class="text-rose-400 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        value={outorganteName}
                        onChange={(e) => setOutorganteName(e.target.value)}
                        required
                        placeholder={outorganteType === 'PJ' ? 'Ex: Metalúrgica Gaúcha S.A.' : 'Ex: Roberto Mendonça'}
                        class="px-3.5 py-2.5 rounded-lg bg-slate-800/90 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                      />
                    </div>
                  </div>

                  <div class="flex flex-col gap-1.5 w-full">
                    <label class="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                      <span>Número da Procuração Eletrônica RFB / e-CAC (Opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={procuracaoNumero}
                      onChange={(e) => setProcuracaoNumero(e.target.value)}
                      placeholder="Ex: PROC-RFB-2026-99014"
                      class="px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-600 text-xs font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {errorMessage && (
                    <div class="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle class="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div class="pt-1">
                    <button
                      type="submit"
                      disabled={loading}
                      class="w-full py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {loading ? (
                        <span>Validando Procuração...</span>
                      ) : (
                        <>
                          <span>Entrar no Ambiente com Procuração</span>
                          <ArrowRight class="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Botão de Cancelar caso esteja apenas trocando de perfil */}
              {onCancelSwitch && (
                <div class="text-center pt-2">
                  <button
                    type="button"
                    onClick={onCancelSwitch}
                    class="text-xs text-slate-400 hover:text-white underline font-semibold"
                  >
                    Cancelar e manter sessão atual
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rodapé com link para os Termos LGPD */}
        <div class="text-center mt-5 space-y-1">
          <p class="text-xs text-slate-500">
            Conexão protegida por criptografia TLS 1.3 e conformidade integral com a LGPD (Lei 13.709/2018).
          </p>
          <button
            type="button"
            onClick={() => setIsTermsModalOpen(true)}
            class="text-[11px] text-sky-400 hover:text-sky-300 underline font-medium inline-flex items-center gap-1"
          >
            <FileText class="w-3 h-3" />
            Consultar Termos de Serviço &amp; Política de Proteção de Dados
          </button>
        </div>
      </div>
    </div>
  );
}
