package com.euditoria.model;

import java.time.LocalDateTime;

public class Certificate {
    private String certificateId;
    private String protocolNumber;
    private String batchId;
    private String cnpj;
    private String razaoSocial;
    private LocalDateTime issuedAt;
    private String sha256Hash;
    private int totalEventsValidated;
    private String status; // VALIDO, EXPIRADO, REVOGADO
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
