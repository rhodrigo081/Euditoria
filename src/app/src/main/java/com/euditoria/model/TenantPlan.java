package com.euditoria.model;

public enum TenantPlan {
    STARTER(100, 30, 30),
    PROFESSIONAL(5000, 120, 365),
    ENTERPRISE(1000000, 600, 1825);

    private final int monthlyEventQuota;
    private final int requestsPerMinuteLimit;
    private final int historyRetentionDays;

    TenantPlan(int monthlyEventQuota, int requestsPerMinuteLimit, int historyRetentionDays) {
        this.monthlyEventQuota = monthlyEventQuota;
        this.requestsPerMinuteLimit = requestsPerMinuteLimit;
        this.historyRetentionDays = historyRetentionDays;
    }

    public int getMonthlyEventQuota() { return monthlyEventQuota; }
    public int getRequestsPerMinuteLimit() { return requestsPerMinuteLimit; }
    public int getHistoryRetentionDays() { return historyRetentionDays; }
}
