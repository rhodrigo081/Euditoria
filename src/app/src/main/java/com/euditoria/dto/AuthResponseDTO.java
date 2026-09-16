package com.euditoria.dto;

import com.euditoria.model.RegisteredCompany;

public class AuthResponseDTO {
    private String token;
    private String message;
    private UserInfo user;
    private CompanyInfo company;

    public AuthResponseDTO() {}

    public AuthResponseDTO(String token, String message, RegisteredCompany registered) {
        this.token = token;
        this.message = message;
        if (registered != null) {
            this.user = new UserInfo(registered.getId(), registered.getEmail(), registered.getResponsavelNome());
            this.company = new CompanyInfo(
                registered.getId(),
                registered.getUserType(),
                registered.getDocumentNumber(),
                registered.getCompanyName(),
                registered.getAccessRole()
            );
        }
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public UserInfo getUser() { return user; }
    public void setUser(UserInfo user) { this.user = user; }

    public CompanyInfo getCompany() { return company; }
    public void setCompany(CompanyInfo company) { this.company = company; }

    public static class UserInfo {
        private String id;
        private String email;
        private String name;

        public UserInfo(String id, String email, String name) {
            this.id = id;
            this.email = email;
            this.name = name;
        }

        public String getId() { return id; }
        public String getEmail() { return email; }
        public String getName() { return name; }
    }

    public static class CompanyInfo {
        private String id;
        private String userType;
        private String documentNumber;
        private String companyName;
        private String accessRole;

        public CompanyInfo(String id, String userType, String documentNumber, String companyName, String accessRole) {
            this.id = id;
            this.userType = userType;
            this.documentNumber = documentNumber;
            this.companyName = companyName;
            this.accessRole = accessRole;
        }

        public String getId() { return id; }
        public String getUserType() { return userType; }
        public String getDocumentNumber() { return documentNumber; }
        public String getCompanyName() { return companyName; }
        public String getAccessRole() { return accessRole; }
    }
}
