package com.euditoria.model;

import jakarta.persistence.*;
import java.time.Instant;

/**
 * Entidade que representa uma empresa ou empregador cadastrado no sistema.
 * Garante persistência e rastreabilidade para auditoria e autenticação.
 */
@Entity
@Table(name = "registered_companies", indexes = {
        @Index(name = "idx_company_doc", columnList = "document_number"),
        @Index(name = "idx_company_email", columnList = "email")
})
public class RegisteredCompany {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "user_type", nullable = false, length = 10)
    private String userType; // 'PJ' ou 'PF'

    @Column(name = "document_number", nullable = false, unique = true, length = 20)
    private String documentNumber; // CNPJ ou CPF

    @Column(name = "company_name", nullable = false, length = 255)
    private String companyName; // Razão Social ou Nome Completo

    @Column(name = "responsavel_nome", nullable = false, length = 255)
    private String responsavelNome;

    @Column(name = "telefone", length = 30)
    private String telefone;

    @Column(name = "email", nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 128)
    private String passwordHash;

    @Column(name = "agreed_lgpd", nullable = false)
    private boolean agreedLgpd;

    @Column(name = "agreed_lgpd_at")
    private Instant agreedLgpdAt;

    @Column(name = "registered_at", nullable = false)
    private Instant registeredAt;

    @Column(name = "access_role", length = 30)
    private String accessRole; // Padrão: 'TITULAR'

    public RegisteredCompany() {
        this.registeredAt = Instant.now();
        this.accessRole = "TITULAR";
    }

    public RegisteredCompany(String id, String userType, String documentNumber, String companyName, 
                             String responsavelNome, String telefone, String email, String passwordHash, 
                             boolean agreedLgpd, Instant agreedLgpdAt) {
        this.id = id;
        this.userType = userType;
        this.documentNumber = documentNumber;
        this.companyName = companyName;
        this.responsavelNome = responsavelNome;
        this.telefone = telefone;
        this.email = email;
        this.passwordHash = passwordHash;
        this.agreedLgpd = agreedLgpd;
        this.agreedLgpdAt = agreedLgpdAt;
        this.registeredAt = Instant.now();
        this.accessRole = "TITULAR";
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserType() { return userType; }
    public void setUserType(String userType) { this.userType = userType; }

    public String getDocumentNumber() { return documentNumber; }
    public void setDocumentNumber(String documentNumber) { this.documentNumber = documentNumber; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getResponsavelNome() { return responsavelNome; }
    public void setResponsavelNome(String responsavelNome) { this.responsavelNome = responsavelNome; }

    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public boolean isAgreedLgpd() { return agreedLgpd; }
    public void setAgreedLgpd(boolean agreedLgpd) { this.agreedLgpd = agreedLgpd; }

    public Instant getAgreedLgpdAt() { return agreedLgpdAt; }
    public void setAgreedLgpdAt(Instant agreedLgpdAt) { this.agreedLgpdAt = agreedLgpdAt; }

    public Instant getRegisteredAt() { return registeredAt; }
    public void setRegisteredAt(Instant registeredAt) { this.registeredAt = registeredAt; }

    public String getAccessRole() { return accessRole; }
    public void setAccessRole(String accessRole) { this.accessRole = accessRole; }
}
