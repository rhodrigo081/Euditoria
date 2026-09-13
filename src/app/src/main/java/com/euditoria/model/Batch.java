package com.euditoria.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class Batch {
    private String batchId;
    private String tenantId;
    private String fileName;
    private LocalDateTime uploadTimestamp;
    private String xmlContent;
    private BatchStatus status;
    private int eventsCount;
    private List<AuditDiagnostic> diagnostics = new ArrayList<>();
    private TaxMirror taxMirror;
    private Certificate certificate;

    public Batch() {}

    public Batch(String batchId, String tenantId, String fileName, LocalDateTime uploadTimestamp, String xmlContent, BatchStatus status, int eventsCount) {
        this.batchId = batchId;
        this.tenantId = tenantId;
        this.fileName = fileName;
        this.uploadTimestamp = uploadTimestamp;
        this.xmlContent = xmlContent;
        this.status = status;
        this.eventsCount = eventsCount;
    }

    public String getBatchId() { return batchId; }
    public void setBatchId(String batchId) { this.batchId = batchId; }

    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public LocalDateTime getUploadTimestamp() { return uploadTimestamp; }
    public void setUploadTimestamp(LocalDateTime uploadTimestamp) { this.uploadTimestamp = uploadTimestamp; }

    public String getXmlContent() { return xmlContent; }
    public void setXmlContent(String xmlContent) { this.xmlContent = xmlContent; }

    public BatchStatus getStatus() { return status; }
    public void setStatus(BatchStatus status) { this.status = status; }

    public int getEventsCount() { return eventsCount; }
    public void setEventsCount(int eventsCount) { this.eventsCount = eventsCount; }

    public List<AuditDiagnostic> getDiagnostics() { return diagnostics; }
    public void setDiagnostics(List<AuditDiagnostic> diagnostics) { this.diagnostics = diagnostics; }

    public TaxMirror getTaxMirror() { return taxMirror; }
    public void setTaxMirror(TaxMirror taxMirror) { this.taxMirror = taxMirror; }

    public Certificate getCertificate() { return certificate; }
    public void setCertificate(Certificate certificate) { this.certificate = certificate; }
}
