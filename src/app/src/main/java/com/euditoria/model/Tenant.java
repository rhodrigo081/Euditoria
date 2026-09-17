package com.euditoria.model;

import jakarta.persistence.*;

@Entity
@Table(name = "tenants", indexes = {
        @Index(name = "idx_tenant_cnpj", columnList = "cnpj")
})
public class Tenant {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "cnpj", nullable = false)
    private String cnpj;

    @Column(name = "email", nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(name = "plan", nullable = false)
    private TenantPlan plan;

    @Column(name = "monthly_events_used", nullable = false)
    private int monthlyEventsUsed;

    @Column(name = "active_batches_count", nullable = false)
    private int activeBatchesCount;

    public Tenant() {}

    public Tenant(String id, String name, String cnpj, String email, TenantPlan plan, int monthlyEventsUsed) {
        this.id = id;
        this.name = name;
        this.cnpj = cnpj;
        this.email = email;
        this.plan = plan;
        this.monthlyEventsUsed = monthlyEventsUsed;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCnpj() { return cnpj; }
    public void setCnpj(String cnpj) { this.cnpj = cnpj; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public TenantPlan getPlan() { return plan; }
    public void setPlan(TenantPlan plan) { this.plan = plan; }

    public int getMonthlyEventsUsed() { return monthlyEventsUsed; }
    public void setMonthlyEventsUsed(int monthlyEventsUsed) { this.monthlyEventsUsed = monthlyEventsUsed; }

    public int getActiveBatchesCount() { return activeBatchesCount; }
    public void setActiveBatchesCount(int activeBatchesCount) { this.activeBatchesCount = activeBatchesCount; }
}
