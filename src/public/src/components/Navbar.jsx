import React from 'react';
import { 
  ShieldCheck, 
  UploadCloud, 
  FileCode2, 
  Calculator, 
  Receipt, 
  Award, 
  Layers, 
  Activity,
  LogOut,
  User,
  Building2,
  FileSignature
} from 'lucide-react';
import { maskCpf, maskCnpj } from '../utils/masks';

export default function Navbar({ 
  currentTab, 
  setTab, 
  selectedTenant, 
  setTenant, 
  userSession, 
  onSwitchContext,
  onLogout 
}) {
  const tabs = [
    { id: 'dashboard', label: 'Visão Geral', icon: Activity },
    { id: 'folha', label: 'Folha de Pagamento', icon: Receipt },
    { id: 'ingestao', label: 'Ingestão de Lotes', icon: UploadCloud },
    { id: 'diagnostico', label: 'Editor & Diagnóstico', icon: FileCode2 },
    { id: 'apuracao', label: 'Espelho Fiscal', icon: Calculator },
    { id: 'certificados', label: 'Certificados', icon: Award },
    { id: 'cotas', label: 'Cotas & Planos', icon: Layers },
  ];

  const profile = userSession?.profile;
  const isProcurador = profile?.accessRole === 'PROCURADOR';

  return (
    <header class="bg-slate-950/80 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16 gap-3">
          {/* Logo & Marca */}
          <div class="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => setTab('dashboard')}>
            <div class="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 ring-1 ring-white/20">
              <ShieldCheck class="h-6 w-6 text-white" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-extrabold text-xl tracking-tight text-white">
                  Eu<span class="text-sky-400">ditoria</span>
                </span>
                <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  v2026.1
                </span>
              </div>
              <p class="text-[10px] text-slate-400 uppercase tracking-widest font-semibold hidden sm:block">
                Auditoria &amp; Governança eSocial
              </p>
            </div>
          </div>

          {/* Seção Central/Direita: Perfil Logado & Controles de Acesso */}
          <div class="flex items-center gap-3">
            {profile && (
              <div class="hidden md:flex items-center gap-2 bg-slate-900 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs">
                {isProcurador ? (
                  <FileSignature class="w-4 h-4 text-indigo-400 shrink-0" />
                ) : profile.userType === 'PF' ? (
                  <User class="w-4 h-4 text-sky-400 shrink-0" />
                ) : (
                  <Building2 class="w-4 h-4 text-emerald-400 shrink-0" />
                )}

                <div class="leading-tight">
                  <div class="flex items-center gap-1.5">
                    <span class="font-bold text-white max-w-[140px] truncate" title={profile.fullName}>
                      {profile.fullName}
                    </span>
                    <span class={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase ${
                      isProcurador 
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' 
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {profile.accessRole}
                    </span>
                  </div>

                  <div class="text-[10px] text-slate-400 font-mono">
                    {isProcurador ? (
                      <span class="text-indigo-300 font-semibold" title={`Procurador de: ${profile.outorganteName || profile.outorganteDocument}`}>
                        Rep: {profile.outorganteName ? profile.outorganteName.substring(0, 18) + '...' : profile.outorganteDocument}
                      </span>
                    ) : (
                      <span>{profile.userType === 'PF' ? maskCpf(profile.documentNumber) : maskCnpj(profile.documentNumber)}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Botão de Alternar Contexto (Titular <-> Procurador) */}
            {onSwitchContext && (
              <button
                onClick={onSwitchContext}
                class="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-sky-400 hover:text-sky-300 border border-slate-800 hover:border-sky-500/30 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                title="Alternar entre meu próprio perfil e procuração"
              >
                <FileSignature class="w-3.5 h-3.5" />
                <span class="hidden sm:inline">Trocar Perfil</span>
              </button>
            )}

            {/* Botão Sair */}
            {onLogout && (
              <button
                onClick={onLogout}
                class="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                title="Encerrar sessão"
              >
                <LogOut class="w-3.5 h-3.5" />
                <span class="hidden sm:inline">Sair</span>
              </button>
            )}
          </div>
        </div>

        {/* Barra de Abas de Navegação */}
        <nav class="flex space-x-1 sm:space-x-2 justify-center pb-2 pt-1 overflow-x-auto no-scrollbar border-t border-slate-900">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                class={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/50'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon class={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}