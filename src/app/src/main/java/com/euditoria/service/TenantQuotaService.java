package com.euditoria.service;

import com.euditoria.dto.TenantUsageDTO;
import com.euditoria.exception.QuotaExceededException;
import com.euditoria.model.Tenant;
import com.euditoria.model.TenantPlan;
import com.euditoria.repository.TenantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TenantQuotaService {

    private final TenantRepository tenantRepository;

    public TenantQuotaService(TenantRepository tenantRepository) {
        this.tenantRepository = tenantRepository;
    }

    @Transactional
    public Tenant getTenant(String tenantId) {
        String key = (tenantId == null || tenantId.isBlank()) ? "tenant-alpha" : tenantId;
        return tenantRepository.findById(key)
                .or(() -> tenantRepository.findById("tenant-alpha"))
                .orElseGet(() -> {
                    Tenant fallback = new Tenant(
                            "tenant-alpha",
                            "TechBrasil Soluções Digitais Ltda",
                            "12.345.678/0001-95",
                            "contato@techbrasil.com.br",
                            TenantPlan.PROFESSIONAL,
                            0
                    );
                    return tenantRepository.save(fallback);
                });
    }

    @Transactional
    public void checkAndIncrementQuota(String tenantId, int eventsCount) {
        Tenant tenant = getTenant(tenantId);
        int limit = tenant.getPlan().getMonthlyEventQuota();
        if (tenant.getMonthlyEventsUsed() + eventsCount > limit) {
            throw new QuotaExceededException(String.format(
                    "Cota mensal de eventos excedida para a organização '%s'. Consumo atual: %d / Limite do Plano %s: %d.",
                    tenant.getName(), tenant.getMonthlyEventsUsed(), tenant.getPlan().name(), limit));
        }
        tenant.setMonthlyEventsUsed(tenant.getMonthlyEventsUsed() + eventsCount);
        tenantRepository.save(tenant);
    }

    @Transactional(readOnly = true)

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
