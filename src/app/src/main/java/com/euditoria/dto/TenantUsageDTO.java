package com.euditoria.dto;

import com.euditoria.model.TenantPlan;

public class TenantUsageDTO {
    private String tenantId;
    private String tenantName;
    private String cnpj;
    private TenantPlan plan;
    private int monthlyEventsUsed;
    private int monthlyEventQuota;
    private double quotaUsagePercentage;
    private int requestsPerMinuteLimit;
    private int currentRequestsPerMinute;
    private int historyRetentionDays;

    public TenantUsageDTO() {}

    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }

    public String getTenantName() { return tenantName; }
    public void setTenantName(String tenantName) { this.tenantName = tenantName; }

    public String getCnpj() { return cnpj; }
    public void setCnpj(String cnpj) { this.cnpj = cnpj; }

    public TenantPlan getPlan() { return plan; }
    public void setPlan(TenantPlan plan) { this.plan = plan; }

    public int getMonthlyEventsUsed() { return monthlyEventsUsed; }
    public void setMonthlyEventsUsed(int monthlyEventsUsed) { this.monthlyEventsUsed = monthlyEventsUsed; }

    public int getMonthlyEventQuota() { return monthlyEventQuota; }
    public void setMonthlyEventQuota(int monthlyEventQuota) { this.monthlyEventQuota = monthlyEventQuota; }

    public double getQuotaUsagePercentage() { return quotaUsagePercentage; }
    public void setQuotaUsagePercentage(double quotaUsagePercentage) { this.quotaUsagePercentage = quotaUsagePercentage; }

    public int getRequestsPerMinuteLimit() { return requestsPerMinuteLimit; }
    public void setRequestsPerMinuteLimit(int requestsPerMinuteLimit) { this.requestsPerMinuteLimit = requestsPerMinuteLimit; }

    public int getCurrentRequestsPerMinute() { return currentRequestsPerMinute; }
    public void setCurrentRequestsPerMinute(int currentRequestsPerMinute) { this.currentRequestsPerMinute = currentRequestsPerMinute; }

    public int getHistoryRetentionDays() { return historyRetentionDays; }
    public void setHistoryRetentionDays(int historyRetentionDays) { this.historyRetentionDays = historyRetentionDays; }
}
