/**
 * Cliente HTTP REST para a plataforma Euditoria.
 * Comunica com o backend Java/Spring Boot e garante isolamento e tratamento de erros.
 */

const BASE_URL = '/api/v1';

export async function fetchWithTenant(endpoint, options = {}, tenantId = 'tenant-alpha') {
  const headers = {
    'X-Tenant-ID': tenantId,
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (res.status === 429) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Limite de requisições excedido. A plataforma Euditoria protege sua disponibilidade.');
    }

    if (res.status === 402) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Cota mensal de eventos do plano contratado foi atingida.');
    }

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Erro na requisição (HTTP ${res.status})`);
    }

    return await res.json();
  } catch (err) {
    console.warn(`[Euditoria API] Erro ao comunicar com backend em ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  // RF01: Ingestão de Lotes
  async uploadBatch(file, tenantId) {
    const formData = new FormData();
    formData.append('file', file);
    return fetchWithTenant('/batches/upload', {
      method: 'POST',
      body: formData,
    }, tenantId);
  },

  async uploadRawXml(fileName, xmlContent, tenantId) {
    return fetchWithTenant('/batches/raw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName, xmlContent }),
    }, tenantId);
  },

  async getBatches(tenantId) {
    return fetchWithTenant('/batches', {}, tenantId);
  },

  async getBatchDetails(batchId, tenantId) {
    return fetchWithTenant(`/batches/${batchId}`, {}, tenantId);
  },

  // RF06 & RF02: Diagnóstico e Reprocessamento Imediato no Editor
  async reprocessXml(batchId, xmlContent, tenantId) {
    return fetchWithTenant('/diagnostics/reprocess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batchId, xmlContent }),
    }, tenantId);
  },

  // RF03: Espelhos Fiscais e Totalizadores
  async getTaxMirror(batchId, tenantId) {
    return fetchWithTenant(`/tax-mirrors/${batchId}`, {}, tenantId);
  },

  async calculateTaxPreview(baseSalarial, inssDeclarado, irrfDeclarado, fgtsDeclarado) {
    return fetchWithTenant('/tax-mirrors/calculate-preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baseSalarial, inssDeclarado, irrfDeclarado, fgtsDeclarado }),
    });
  },

  // RF04: Certificados e Protocolos
  async getCertificate(certificateId, tenantId) {
    return fetchWithTenant(`/certificates/${certificateId}`, {}, tenantId);
  },

  // RF05: Linha do Tempo Funcional do Trabalhador
  async getWorkerTimeline(cpf, tenantId) {
    return fetchWithTenant(`/workers/${cpf}/timeline`, {}, tenantId);
  },

  // RF07: Gestão de Cotas e Tenants
  async getTenantUsage(tenantId) {
    return fetchWithTenant(`/tenants/${tenantId}/usage`, {}, tenantId);
  },

  async checkHealth() {
    return fetchWithTenant('/health');
  },
};