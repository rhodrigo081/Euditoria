import React, { useState } from 'react';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import IngestionPage from './pages/IngestionPage';
import DiagnosticsPage from './pages/DiagnosticsPage';
import TaxMirrorPage from './pages/TaxMirrorPage';
import TimelinePage from './pages/TimelinePage';
import CertificatesPage from './pages/CertificatesPage';
import TenantsPage from './pages/TenantsPage';

export default function App() {
  const [currentTab, setTab] = useState('dashboard');
  const [selectedTenant, setTenant] = useState('tenant-alpha');
  const [selectedBatch, setSelectedBatch] = useState(null);

  const handleBatchSelected = (batch) => {
    setSelectedBatch(batch);
  };

  const handleBatchCreated = (batchResponse) => {
    // Ao criar um novo lote, podemos selecionar e ir para o diagnóstico
    setSelectedBatch({ batchId: batchResponse.batchId, status: batchResponse.status });
  };

  return (
    <div class="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-sky-500 selection:text-white">
      <Navbar
        currentTab={currentTab}
        setTab={setTab}
        selectedTenant={selectedTenant}
        setTenant={setTenant}
      />

      <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'dashboard' && (
          <DashboardPage
            setTab={setTab}
            selectedTenant={selectedTenant}
            onSelectBatch={handleBatchSelected}
          />
        )}

        {currentTab === 'ingestao' && (
          <IngestionPage
            setTab={setTab}
            selectedTenant={selectedTenant}
            onBatchCreated={handleBatchCreated}
          />
        )}

        {currentTab === 'diagnostico' && (
          <DiagnosticsPage
            selectedBatch={selectedBatch}
            selectedTenant={selectedTenant}
            onBatchUpdated={handleBatchSelected}
          />
        )}

        {currentTab === 'apuracao' && (
          <TaxMirrorPage
            selectedBatch={selectedBatch}
            selectedTenant={selectedTenant}
          />
        )}

        {currentTab === 'timeline' && (
          <TimelinePage
            selectedTenant={selectedTenant}
          />
        )}

        {currentTab === 'certificados' && (
          <CertificatesPage
            selectedBatch={selectedBatch}
            selectedTenant={selectedTenant}
          />
        )}

        {currentTab === 'cotas' && (
          <TenantsPage
            selectedTenant={selectedTenant}
            setTenant={setTenant}
          />
        )}
      </main>

      {/* Footer de Governança e Segurança */}
      <footer class="bg-slate-950 border-t border-slate-900 py-6 text-xs text-slate-500 text-center no-print">
        <div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <span class="font-bold text-slate-400">Euditoria Platform</span>
            <span>•</span>
            <span>Auditoria & Governança eSocial</span>
          </div>
          <div class="flex items-center gap-4 text-[11px]">
            <span>Confidencialidade: Blindagem RFC 7807</span>
            <span>•</span>
            <span>Integridade: Recálculo de Rubricas</span>
            <span>•</span>
            <span>Disponibilidade: Rate-Limiting Ativo</span>
          </div>
        </div>
      </footer>
    </div>
  );
}