package com.euditoria.dto;

import jakarta.validation.constraints.NotBlank;

public class CompanyLoginDTO {

    @NotBlank(message = "Informe o e-mail ou documento cadastrado.")
    private String email;

    @NotBlank(message = "Informe a senha de acesso.")
    private String password;

    public CompanyLoginDTO() {}

    public CompanyLoginDTO(String email, String password) {
        this.email = email;
        this.password = password;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
