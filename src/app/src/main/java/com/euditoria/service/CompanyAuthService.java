package com.euditoria.service;

import com.euditoria.dto.AuthResponseDTO;
import com.euditoria.dto.CompanyLoginDTO;
import com.euditoria.dto.CompanyRegistrationDTO;
import com.euditoria.exception.BusinessException;
import com.euditoria.exception.ResourceNotFoundException;
import com.euditoria.model.RegisteredCompany;
import com.euditoria.model.Tenant;
import com.euditoria.model.TenantPlan;
import com.euditoria.repository.RegisteredCompanyRepository;
import com.euditoria.repository.TenantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.*;

@Service
public class CompanyAuthService {

    private final RegisteredCompanyRepository companyRepository;
    private final TenantRepository tenantRepository;

    public CompanyAuthService(RegisteredCompanyRepository companyRepository, TenantRepository tenantRepository) {
        this.companyRepository = companyRepository;
        this.tenantRepository = tenantRepository;
    }

    /**
     * Registra uma nova empresa ou empregador no banco de dados do sistema com atomicidade transacional.
     */
    @Transactional
    public RegisteredCompany register(CompanyRegistrationDTO dto) {
        if (!dto.isAgreedLgpd()) {
            throw new BusinessException("LGPD_NOT_ACCEPTED", 
                "É obrigatório concordar com os Termos de Serviço e a Política de Privacidade (LGPD) para cadastrar sua empresa.");
        }

        String normalizedEmail = dto.getEmail().trim().toLowerCase();
        String normalizedDoc = sanitizeDocument(dto.getDocumentNumber());

        // Assegura remoção de qualquer caractere não numérico
        String cleanPhone = sanitizeDocument(dto.getTelefone());

        if (companyRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new BusinessException("EMAIL_ALREADY_REGISTERED", 
                "O e-mail informado já está cadastrado no sistema. Utilize a aba de login para acessar sua conta.");
        }

        if (companyRepository.existsByDocumentNumber(normalizedDoc)) {
            throw new BusinessException("DOCUMENT_ALREADY_REGISTERED", 
                "O documento informado (CNPJ/CPF) já possui cadastro ativo no sistema.");
        }

        String companyId = "comp_" + UUID.randomUUID().toString().substring(0, 8);
        String passwordHash = hashPassword(dto.getPassword());

        RegisteredCompany company = new RegisteredCompany(
                companyId,
                dto.getUserType() != null ? dto.getUserType() : "PJ",
                normalizedDoc,
                dto.getCompanyName().trim(),
                dto.getResponsavelNome().trim(),
                cleanPhone, // <-- Salva apenas os números no banco
                normalizedEmail,
                passwordHash,
                true,
                Instant.now()
        );

        RegisteredCompany savedCompany = companyRepository.save(company);

        Tenant tenant = new Tenant(
                companyId,
                company.getCompanyName(),
                company.getDocumentNumber(),
                company.getEmail(),
                TenantPlan.PROFESSIONAL,
                0
        );
        tenantRepository.save(tenant);

        return savedCompany;
    }

    /**
     * Autentica a empresa baseando-se estritamente nos dados cadastrados no banco relacional.
     * Rejeita prontamente tentativas com e-mails/documentos não cadastrados ou senhas incorretas.
     */
    @Transactional(readOnly = true)
    public AuthResponseDTO login(CompanyLoginDTO dto) {
        String identifier = dto.getEmail().trim();
        RegisteredCompany company = findByIdentifier(identifier);

        if (company == null) {
            throw new ResourceNotFoundException(
                "Empresa ou usuário não cadastrado no sistema. Por favor, crie sua conta na aba 'Criar Nova Conta' antes de efetuar o login."
            );
        }

        String inputPasswordHash = hashPassword(dto.getPassword());
        if (!company.getPasswordHash().equals(inputPasswordHash)) {
            throw new BusinessException("INVALID_CREDENTIALS", 
                "Senha incorreta. Verifique suas credenciais de acesso.");
        }

        String token = "eud_auth_" + UUID.randomUUID().toString().replace("-", "");
        return new AuthResponseDTO(token, "Autenticação realizada com sucesso no banco de dados.", company);
    }

    /**
     * Consulta empresa por e-mail ou documento sanitizado consultando o repositório JPA.
     */
    @Transactional(readOnly = true)
    public RegisteredCompany findByIdentifier(String identifier) {
        if (identifier == null || identifier.isBlank()) return null;
        
        String cleanEmail = identifier.trim().toLowerCase();
        Optional<RegisteredCompany> byEmail = companyRepository.findByEmailIgnoreCase(cleanEmail);
        if (byEmail.isPresent()) return byEmail.get();

        String cleanDoc = sanitizeDocument(identifier);
        return companyRepository.findByDocumentNumber(cleanDoc).orElse(null);
    }

    /**
     * Retorna todas as empresas cadastradas (sanitizadas para segurança).
     */
    @Transactional(readOnly = true)
    public List<RegisteredCompany> getAllCompanies() {
        List<RegisteredCompany> list = new ArrayList<>();
        for (RegisteredCompany original : companyRepository.findAll()) {
            RegisteredCompany sanitized = new RegisteredCompany(
                    original.getId(),
                    original.getUserType(),
                    original.getDocumentNumber(),
                    original.getCompanyName(),
                    original.getResponsavelNome(),
                    sanitizeDocument(original.getTelefone()),
                    original.getEmail(),
                    null, // Remove hash de senha para segurança
                    original.isAgreedLgpd(),
                    original.getAgreedLgpdAt()
            );
            sanitized.setRegisteredAt(original.getRegisteredAt());
            sanitized.setAccessRole(original.getAccessRole());
            list.add(sanitized);
        }
        return list;
    }

    private String sanitizeDocument(String doc) {
        if (doc == null) return "";
        return doc.replaceAll("[^0-9]", "");
    }

    private String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(password.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Falha ao gerar hash de segurança da senha.", e);
        }
    }
}
