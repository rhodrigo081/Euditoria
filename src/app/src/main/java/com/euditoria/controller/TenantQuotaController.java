package com.euditoria.controller;

import com.euditoria.dto.TenantUsageDTO;
import com.euditoria.service.TenantQuotaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/tenants")
public class TenantQuotaController {

    private final TenantQuotaService tenantQuotaService;

    public TenantQuotaController(TenantQuotaService tenantQuotaService) {
        this.tenantQuotaService = tenantQuotaService;
    }

    @GetMapping("/current")
    public ResponseEntity<TenantUsageDTO> getCurrentTenantUsage(
            @RequestHeader(value = "X-Tenant-ID", required = false, defaultValue = "tenant-alpha") String tenantId) {
        return ResponseEntity.ok(tenantQuotaService.getTenantUsage(tenantId));
    }

    @GetMapping("/{tenantId}/usage")
    public ResponseEntity<TenantUsageDTO> getTenantUsage(@PathVariable String tenantId) {
        return ResponseEntity.ok(tenantQuotaService.getTenantUsage(tenantId));
    }
}
