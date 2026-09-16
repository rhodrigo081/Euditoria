import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import PayrollPage from './pages/PayrollPage';
import IngestionPage from './pages/IngestionPage';
import DiagnosticsPage from './pages/DiagnosticsPage';
import TaxMirrorPage from './pages/TaxMirrorPage';
import CertificatesPage from './pages/CertificatesPage';
import TenantsPage from './pages/TenantsPage';
import { authService } from './services/supabase';

export default function App() {
  const [userSession, setUserSession] = useState(null);
  const [sessionChecking, setSessionChecking] = useState(true);
  const [currentTab, setTab] = useState('dashboard');
  const [selectedTenant, setTenant] = useState('tenant-principal');
  const [selectedBatch, setSelectedBatch] = useState(null);

  const [isSwitchingProfile, setIsSwitchingProfile] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await authService.getCurrentSession();
        if (session) {
          setUserSession(session);
          if (session.profile?.documentNumber) {
            setTenant('tenant-' + session.profile.documentNumber.replace(/\D/g, '').substring(0, 8));
          }
        }
      } catch (err) {
        console.warn('[App] Erro ao carregar sessão:', err);
      } finally {
        setSessionChecking(false);
      }
    };

    checkSession();
  }, []);

  const handleLoginSuccess = (session) => {
    setUserSession(session);
    setIsSwitchingProfile(false);
    if (session.profile?.documentNumber) {
      setTenant('tenant-' + session.profile.documentNumber.replace(/\D/g, '').substring(0, 8));
    }
    setTab('dashboard');
  };

  const handleLogout = async () => {
    await authService.logout();
    setUserSession(null);
    setIsSwitchingProfile(false);
    setSelectedBatch(null);
  };

  const handleBatchSelected = (batch) => {
    setSelectedBatch(batch);
  };

  const handleBatchCreated = (batchResponse) => {
    setSelectedBatch({ batchId: batchResponse.batchId, status: batchResponse.status });
  };

  // Enquanto valida se há sessão salva
  if (sessionChecking) {
    return (
      <div class="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs font-mono">
        <div class="flex items-center gap-2">
          <span class="h-2 w-2 rounded-full bg-sky-400 animate-ping" />
          <span>Iniciando ambiente seguro Euditoria...</span>
        </div>
      </div>
    );
  }

  // Se não autenticado ou se o usuário solicitou alternar entre Titular e Procurador
  if (!userSession || isSwitchingProfile) {
    return (
      <OnboardingPage
        initialStep={isSwitchingProfile ? 2 : 1}
        currentSession={userSession}
        onLoginSuccess={handleLoginSuccess}
        onCancelSwitch={userSession ? () => setIsSwitchingProfile(false) : null}
      />
    );
  }

  return (
    <div class="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-sky-500 selection:text-white">
      <Navbar
        currentTab={currentTab}
        setTab={setTab}
        selectedTenant={selectedTenant}
        setTenant={setTenant}
        userSession={userSession}
        onSwitchContext={() => setIsSwitchingProfile(true)}
        onLogout={handleLogout}
      />

      <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'dashboard' && (
          <DashboardPage
            setTab={setTab}
            selectedTenant={selectedTenant}
            userSession={userSession}
            onSelectBatch={handleBatchSelected}
          />
        )}

        {currentTab === 'folha' && (
          <PayrollPage
            selectedTenant={selectedTenant}
            userSession={userSession}
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

        {currentTab === 'certificados' && (
          <CertificatesPage
            selectedBatch={selectedBatch}
            selectedTenant={selectedTenant}
            setTab={setTab}
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
            <span>Auditoria &amp; Governança eSocial</span>
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