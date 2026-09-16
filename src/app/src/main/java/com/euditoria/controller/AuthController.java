package com.euditoria.controller;

import com.euditoria.dto.AuthResponseDTO;
import com.euditoria.dto.CompanyLoginDTO;
import com.euditoria.dto.CompanyRegistrationDTO;
import com.euditoria.model.RegisteredCompany;
import com.euditoria.service.CompanyAuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final CompanyAuthService companyAuthService;

    public AuthController(CompanyAuthService companyAuthService) {
        this.companyAuthService = companyAuthService;
    }

    /**
     * RF-AUTH-01: Cadastro oficial da empresa/empregador no banco de dados.
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody CompanyRegistrationDTO dto) {
        RegisteredCompany registered = companyAuthService.register(dto);
        AuthResponseDTO response = new AuthResponseDTO(
                "eud_tok_" + registered.getId(),
                "Empresa cadastrada com sucesso no banco de dados.",
                registered
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * RF-AUTH-02: Login estrito consultando o banco de dados.
     * Se o usuário não existir no banco, retorna HTTP 404.
     * Se a senha não conferir, retorna HTTP 422/401.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody CompanyLoginDTO dto) {
        AuthResponseDTO response = companyAuthService.login(dto);
        return ResponseEntity.ok(response);
    }

    /**
     * RF-AUTH-03: Lista todas as empresas cadastradas no sistema.
     */
    @GetMapping("/companies")
    public ResponseEntity<List<RegisteredCompany>> listCompanies() {
        return ResponseEntity.ok(companyAuthService.getAllCompanies());
    }

    /**
     * RF-AUTH-04: Verificação de existência prévia de CNPJ ou E-mail.
     */
    @GetMapping("/verify")
    public ResponseEntity<Map<String, Boolean>> verifyCompany(@RequestParam("identifier") String identifier) {
        RegisteredCompany company = companyAuthService.findByIdentifier(identifier);
        return ResponseEntity.ok(Map.of("exists", company != null));
    }
}
