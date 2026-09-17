package com.euditoria.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "batches", indexes = {
        @Index(name = "idx_batch_tenant", columnList = "tenant_id"),
        @Index(name = "idx_batch_upload", columnList = "upload_timestamp")
})
public class Batch {

    @Id
    @Column(name = "batch_id", length = 64)
    private String batchId;

    @Column(name = "tenant_id", nullable = false, length = 64)
    private String tenantId;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "upload_timestamp", nullable = false)
    private LocalDateTime uploadTimestamp;

    @Lob
    @Column(name = "xml_content", columnDefinition = "TEXT")
    private String xmlContent;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private BatchStatus status;

    @Column(name = "events_count", nullable = false)
    private int eventsCount;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "batch_id")
    private List<AuditDiagnostic> diagnostics = new ArrayList<>();

    @Embedded
    private TaxMirror taxMirror;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JoinColumn(name = "certificate_id")
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
