import React from 'react';
import { 
  ShieldCheck, 
  UploadCloud, 
  FileCode2, 
  Calculator, 
  GitBranch, 
  Award, 
  Layers, 
  Activity,
  CheckCircle2
} from 'lucide-react';

export default function Navbar({ currentTab, setTab, selectedTenant, setTenant }) {
  const tabs = [
    { id: 'dashboard', label: 'Visão Geral', icon: Activity },
    { id: 'ingestao', label: 'Ingestão de Lotes', icon: UploadCloud, badge: 'RF01' },
    { id: 'diagnostico', label: 'Editor & Diagnóstico', icon: FileCode2, badge: 'RF02/06' },
    { id: 'apuracao', label: 'Espelho Fiscal', icon: Calculator, badge: 'RF03' },
    { id: 'timeline', label: 'Linha do Tempo', icon: GitBranch, badge: 'RF05' },
    { id: 'certificados', label: 'Certificados', icon: Award, badge: 'RF04' },
    { id: 'cotas', label: 'Cotas & Planos', icon: Layers, badge: 'RF07' },
  ];

  const tenants = [
    { id: 'tenant-alpha', name: 'TechBrasil Soluções', plan: 'PRO' },
    { id: 'tenant-beta', name: 'Metalúrgica Gaúcha', plan: 'ENTERPRISE' },
    { id: 'tenant-gamma', name: 'Comércio Express', plan: 'STARTER' },
  ];

  return (
    <header class="bg-slate-950/80 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          {/* Logo & Marca */}
          <div class="flex items-center gap-3 cursor-pointer" onClick={() => setTab('dashboard')}>
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
              <p class="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                Auditoria & Governança eSocial
              </p>
            </div>
          </div>

          {/* Tenant Switcher & Security Status (RF07) */}
          <div class="flex items-center gap-3">
            <div class="hidden md:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-xs text-emerald-400">
              <span class="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span class="font-medium">CIA Security Ativa</span>
            </div>

            <div class="flex items-center gap-2 bg-slate-900 border border-slate-700 px-2 py-1 rounded-lg">
              <span class="text-xs text-slate-400 pl-1 font-medium">Organização:</span>
              <select
                value={selectedTenant}
                onChange={(e) => setTenant(e.target.value)}
                class="bg-transparent text-xs font-semibold text-sky-300 focus:outline-none cursor-pointer pr-2"
              >
                {tenants.map((t) => (
                  <option key={t.id} value={t.id} class="bg-slate-900 text-slate-200">
                    {t.name} ({t.plan})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <nav class="flex space-x-1 overflow-x-auto pb-2 pt-1 no-scrollbar border-t border-slate-900">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                class={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/50'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon class={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    class={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                      isActive ? 'bg-sky-700/60 text-sky-100' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}