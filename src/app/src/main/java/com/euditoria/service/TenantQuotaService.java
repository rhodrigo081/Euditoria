package com.euditoria.service;

import com.euditoria.dto.TenantUsageDTO;
import com.euditoria.exception.QuotaExceededException;
import com.euditoria.mock.MockDataStore;
import com.euditoria.model.Tenant;
import org.springframework.stereotype.Service;

@Service
public class TenantQuotaService {

    private final MockDataStore mockDataStore;

    public TenantQuotaService(MockDataStore mockDataStore) {
        this.mockDataStore = mockDataStore;
    }

    public Tenant getTenant(String tenantId) {
        String key = (tenantId == null || tenantId.isBlank()) ? "tenant-alpha" : tenantId;
        return mockDataStore.getTenants().getOrDefault(key, mockDataStore.getTenants().get("tenant-alpha"));
    }

    public void checkAndIncrementQuota(String tenantId, int eventsCount) {
        Tenant tenant = getTenant(tenantId);
        int limit = tenant.getPlan().getMonthlyEventQuota();
        if (tenant.getMonthlyEventsUsed() + eventsCount > limit) {
            throw new QuotaExceededException(String.format(
                    "Cota mensal de eventos excedida para a organização '%s'. Consumo atual: %d / Limite do Plano %s: %d.",
                    tenant.getName(), tenant.getMonthlyEventsUsed(), tenant.getPlan().name(), limit));
        }
        tenant.setMonthlyEventsUsed(tenant.getMonthlyEventsUsed() + eventsCount);
    }

    public TenantUsageDTO getTenantUsage(String tenantId) {
        Tenant tenant = getTenant(tenantId);
        TenantUsageDTO dto = new TenantUsageDTO();
        dto.setTenantId(tenant.getId());
        dto.setTenantName(tenant.getName());
        dto.setCnpj(tenant.getCnpj());
        dto.setPlan(tenant.getPlan());
        dto.setMonthlyEventsUsed(tenant.getMonthlyEventsUsed());
        dto.setMonthlyEventQuota(tenant.getPlan().getMonthlyEventQuota());
        dto.setQuotaUsagePercentage(
                tenant.getPlan().getMonthlyEventQuota() > 0
                        ? (double) tenant.getMonthlyEventsUsed() / tenant.getPlan().getMonthlyEventQuota() * 100.0
                        : 0.0
        );
        dto.setRequestsPerMinuteLimit(tenant.getPlan().getRequestsPerMinuteLimit());
        dto.setCurrentRequestsPerMinute(18); // Amostra de uso ativo
        dto.setHistoryRetentionDays(tenant.getPlan().getHistoryRetentionDays());
        return dto;
    }
}
