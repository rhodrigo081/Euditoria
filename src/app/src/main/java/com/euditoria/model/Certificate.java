package com.euditoria.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "certificates", indexes = {
        @Index(name = "idx_cert_protocol", columnList = "protocol_number"),
        @Index(name = "idx_cert_batch", columnList = "batch_id")
})
public class Certificate {

    @Id
    @Column(name = "certificate_id", length = 64)
    private String certificateId;

    @Column(name = "protocol_number", nullable = false, length = 64)
    private String protocolNumber;

    @Column(name = "batch_id", nullable = false, length = 64)
    private String batchId;

    @Column(name = "cnpj", nullable = false, length = 20)
    private String cnpj;

    @Column(name = "razao_social", nullable = false, length = 255)
    private String razaoSocial;

    @Column(name = "issued_at", nullable = false)
    private LocalDateTime issuedAt;

    @Column(name = "sha256_hash", nullable = false, length = 64)
    private String sha256Hash;

    @Column(name = "total_events_validated", nullable = false)
    private int totalEventsValidated;

    @Column(name = "status", nullable = false, length = 20)
    private String status; // VALIDO, EXPIRADO, REVOGADO

    @Column(name = "verification_url", length = 500)
    private String verificationUrl;

    public Certificate() {}

    public Certificate(String certificateId, String protocolNumber, String batchId, String cnpj, String razaoSocial, LocalDateTime issuedAt, String sha256Hash, int totalEventsValidated, String status, String verificationUrl) {
        this.certificateId = certificateId;
        this.protocolNumber = protocolNumber;
        this.batchId = batchId;
        this.cnpj = cnpj;
        this.razaoSocial = razaoSocial;
        this.issuedAt = issuedAt;
        this.sha256Hash = sha256Hash;
        this.totalEventsValidated = totalEventsValidated;
        this.status = status;
        this.verificationUrl = verificationUrl;
    }

    public String getCertificateId() { return certificateId; }
    public void setCertificateId(String certificateId) { this.certificateId = certificateId; }

    public String getProtocolNumber() { return protocolNumber; }
    public void setProtocolNumber(String protocolNumber) { this.protocolNumber = protocolNumber; }

    public String getBatchId() { return batchId; }
    public void setBatchId(String batchId) { this.batchId = batchId; }

    public String getCnpj() { return cnpj; }
    public void setCnpj(String cnpj) { this.cnpj = cnpj; }

    public String getRazaoSocial() { return razaoSocial; }
    public void setRazaoSocial(String razaoSocial) { this.razaoSocial = razaoSocial; }

    public LocalDateTime getIssuedAt() { return issuedAt; }
    public void setIssuedAt(LocalDateTime issuedAt) { this.issuedAt = issuedAt; }

    public String getSha256Hash() { return sha256Hash; }
    public void setSha256Hash(String sha256Hash) { this.sha256Hash = sha256Hash; }

    public int getTotalEventsValidated() { return totalEventsValidated; }
    public void setTotalEventsValidated(int totalEventsValidated) { this.totalEventsValidated = totalEventsValidated; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getVerificationUrl() { return verificationUrl; }
    public void setVerificationUrl(String verificationUrl) { this.verificationUrl = verificationUrl; }
}
