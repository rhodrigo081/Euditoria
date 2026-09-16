package com.euditoria.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CompanyRegistrationDTO {
    
    private String userType = "PJ"; // 'PJ' ou 'PF'

    @NotBlank(message = "O documento da empresa (CNPJ ou CPF) é obrigatório.")
    private String documentNumber;

    @NotBlank(message = "A razão social ou nome da empresa é obrigatório.")
    private String companyName;

    @NotBlank(message = "O nome do responsável técnico/administrador é obrigatório.")
    private String responsavelNome;

    private String telefone;

    @NotBlank(message = "O e-mail corporativo é obrigatório.")
    @Email(message = "Formato de e-mail corporativo inválido.")
    private String email;

    @NotBlank(message = "A senha de acesso é obrigatória.")
    @Size(min = 6, message = "A senha deve ter pelo menos 6 caracteres.")
    private String password;

    private boolean agreedLgpd;

    public CompanyRegistrationDTO() {}

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

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public boolean isAgreedLgpd() { return agreedLgpd; }
    public void setAgreedLgpd(boolean agreedLgpd) { this.agreedLgpd = agreedLgpd; }
}
