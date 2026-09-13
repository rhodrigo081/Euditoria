package com.euditoria.model;

public class Tenant {
    private String id;
    private String name;
    private String cnpj;
    private String email;
    private TenantPlan plan;
    private int monthlyEventsUsed;
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
