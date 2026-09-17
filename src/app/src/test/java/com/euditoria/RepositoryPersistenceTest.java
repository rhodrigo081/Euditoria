package com.euditoria;

import com.euditoria.dto.CompanyLoginDTO;
import com.euditoria.dto.CompanyRegistrationDTO;
import com.euditoria.exception.BusinessException;
import com.euditoria.model.*;
import com.euditoria.repository.*;
import com.euditoria.service.CompanyAuthService;
import com.euditoria.service.TenantQuotaService;
import com.euditoria.service.TimelineAuditService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class RepositoryPersistenceTest {

    @Autowired
    private RegisteredCompanyRepository companyRepository;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private BatchRepository batchRepository;

    @Autowired
    private CertificateRepository certificateRepository;

    @Autowired
    private WorkerRepository workerRepository;

    @Autowired
    private TimelineEventRepository timelineEventRepository;

    @Autowired
    private AuditDiagnosticRepository auditDiagnosticRepository;

    @Autowired
    private CompanyAuthService companyAuthService;

    @Autowired
    private TenantQuotaService tenantQuotaService;

    @Autowired
    private TimelineAuditService timelineAuditService;

    @Test
    @DisplayName("Deve persistir e consultar RegisteredCompany via repositório com busca case-insensitive e por documento")
    void testRegisteredCompanyRepositoryPersistence() {
        String testEmail = "financeiro@empresa-teste-" + UUID.randomUUID() + ".com.br";
        String testDoc = "12345678000199";

        RegisteredCompany company = new RegisteredCompany(
                "comp_test_123",
                "PJ",
                testDoc,
                "Empresa Teste Persistência Ltda",
                "Maria Responsável",
                "(11) 98765-4321",
                testEmail,
                "hash_seguro_sha256",
                true,
                Instant.now()
        );

        companyRepository.save(company);

        // Busca por e-mail em maiúsculas
        Optional<RegisteredCompany> foundByEmail = companyRepository.findByEmailIgnoreCase(testEmail.toUpperCase());
        assertTrue(foundByEmail.isPresent());
        assertEquals(testDoc, foundByEmail.get().getDocumentNumber());

        // Busca por documento
        Optional<RegisteredCompany> foundByDoc = companyRepository.findByDocumentNumber(testDoc);
        assertTrue(foundByDoc.isPresent());
        assertEquals("Empresa Teste Persistência Ltda", foundByDoc.get().getCompanyName());

        // Checagem de existência
        assertTrue(companyRepository.existsByEmailIgnoreCase(testEmail));
        assertTrue(companyRepository.existsByDocumentNumber(testDoc));
        assertFalse(companyRepository.existsByDocumentNumber("00000000000000"));
    }

    @Test
    @DisplayName("Deve persistir Batch com diagnósticos em cascata e TaxMirror embutido")
    void testBatchRepositoryCascadeAndEmbedded() {
        String batchId = "LOTE-TEST-" + UUID.randomUUID().toString().substring(0, 8);
        Batch batch = new Batch(
                batchId,
                "tenant-alpha",
                "folha_mensal_s1200.xml",
                LocalDateTime.now(),
                "<eSocial><evtRemun /></eSocial>",
                BatchStatus.NON_COMPLIANT,
                5
        );

        AuditDiagnostic diag = new AuditDiagnostic(
                UUID.randomUUID().toString(),
                12,
                4,
                "cpfTrab",
                "REGRA_VALIDA_CPF",
                "Dígito verificador inválido",
                "Corrigir CPF",
                DiagnosticSeverity.ERROR
        );
        batch.getDiagnostics().add(diag);

        TaxMirror taxMirror = new TaxMirror();
        taxMirror.setBaseCalculoInssSegurado(new BigDecimal("5000.00"));
        taxMirror.setInssSeguradoDeclarado(new BigDecimal("500.00"));
        taxMirror.setInssSeguradoApurado(new BigDecimal("518.14"));
        taxMirror.setDivergenciaInssSegurado(new BigDecimal("18.14"));
        taxMirror.setPossuiDivergencias(true);
        taxMirror.setMemoriaCalculoTexto("Divergência de apuração progressiva 2026.");
        batch.setTaxMirror(taxMirror);

        batchRepository.save(batch);

        Optional<Batch> loaded = batchRepository.findById(batchId);
        assertTrue(loaded.isPresent());
        assertEquals(5, loaded.get().getEventsCount());
        assertNotNull(loaded.get().getTaxMirror());
        assertEquals(new BigDecimal("5000.00"), loaded.get().getTaxMirror().getBaseCalculoInssSegurado());
        assertEquals(1, loaded.get().getDiagnostics().size());
        assertEquals("REGRA_VALIDA_CPF", loaded.get().getDiagnostics().get(0).getErrorCode());
    }

    @Test
    @DisplayName("Deve emitir e consultar Certificate via CertificateRepository")
    void testCertificateRepository() {
        String certId = "EUD-2026-CERT-" + UUID.randomUUID().toString().substring(0, 8);
        String protocol = "PROT-2026-" + UUID.randomUUID().toString().substring(0, 8);
        Certificate cert = new Certificate(
                certId,
                protocol,
                "LOTE-2026-001",
                "12.345.678/0001-95",
                "TechBrasil Soluções Digitais Ltda",
                LocalDateTime.now(),
                "a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0",
                10,
                "VALIDO",
                "http://localhost:8080/api/v1/certificates/" + certId
        );

        certificateRepository.save(cert);

        Optional<Certificate> byId = certificateRepository.findByCertificateId(certId);
        assertTrue(byId.isPresent());
        assertEquals(protocol, byId.get().getProtocolNumber());

        Optional<Certificate> byProtocol = certificateRepository.findByProtocolNumber(protocol);
        assertTrue(byProtocol.isPresent());
        assertEquals("TechBrasil Soluções Digitais Ltda", byProtocol.get().getRazaoSocial());
    }

    @Test
    @DisplayName("Deve persistir Worker e consultar linha do tempo ordenada cronologicamente")
    void testWorkerAndTimelineEventRepository() {
        String cpf = "99887766554";
        Worker worker = new Worker(cpf, "Auditor eSocial Silva", "MAT-9901", LocalDate.of(2022, 1, 15));
        workerRepository.save(worker);

        TimelineEvent e1 = new TimelineEvent("EVT-1", cpf, worker.getNome(), "S-2200", "Admissão", LocalDate.of(2022, 1, 15), "REC-01", false, null);
        TimelineEvent e2 = new TimelineEvent("EVT-2", cpf, worker.getNome(), "S-2206", "Alteração Contratual", LocalDate.of(2023, 6, 1), "REC-02", false, null);
        TimelineEvent e3 = new TimelineEvent("EVT-3", cpf, worker.getNome(), "S-1200", "Remuneração", LocalDate.of(2026, 9, 1), "REC-03", false, null);

        timelineEventRepository.saveAll(List.of(e3, e1, e2)); // Salva fora de ordem

        List<TimelineEvent> orderedEvents = timelineEventRepository.findByCpfOrderByEventDateAsc(cpf);
        assertEquals(3, orderedEvents.size());
        assertEquals("S-2200", orderedEvents.get(0).getEventType());
        assertEquals("S-2206", orderedEvents.get(1).getEventType());
        assertEquals("S-1200", orderedEvents.get(2).getEventType());
    }

    @Test
    @DisplayName("Deve registrar empresa e efetuar login transacional seguro via CompanyAuthService")
    void testCompanyAuthServiceWithRepositories() {
        String email = "governance-" + UUID.randomUUID() + "@compliance.com.br";
        String doc = "88999777000122";

        CompanyRegistrationDTO regDto = new CompanyRegistrationDTO();
        regDto.setUserType("PJ");
        regDto.setDocumentNumber(doc);
        regDto.setCompanyName("Compliance Corp");
        regDto.setResponsavelNome("Diretor Roberto");
        regDto.setTelefone("(11) 99999-8888");
        regDto.setEmail(email);
        regDto.setPassword("SenhaForte@2026");
        regDto.setAgreedLgpd(true);

        RegisteredCompany registered = companyAuthService.register(regDto);
        assertNotNull(registered);
        assertEquals(doc, registered.getDocumentNumber());

        // Valida que o tenant correspondente foi persistido automaticamente
        assertTrue(tenantRepository.existsById(registered.getId()));

        // Valida tentativa de duplicidade de e-mail
        assertThrows(BusinessException.class, () -> companyAuthService.register(regDto));

        // Valida login com sucesso
        CompanyLoginDTO loginDto = new CompanyLoginDTO();
        loginDto.setEmail(email);
        loginDto.setPassword("SenhaForte@2026");
        var authResponse = companyAuthService.login(loginDto);
        assertNotNull(authResponse.getToken());
        assertEquals(registered.getId(), authResponse.getCompany().getId());

        // Valida falha por senha incorreta
        loginDto.setPassword("SenhaIncorreta");
        assertThrows(BusinessException.class, () -> companyAuthService.login(loginDto));
    }

    @Test
    @DisplayName("Deve controlar e persistir incremento de cota do tenant")
    void testTenantQuotaPersistence() {
        Tenant tenant = tenantQuotaService.getTenant("tenant-alpha");
        assertNotNull(tenant);
        int initialUsed = tenant.getMonthlyEventsUsed();

        tenantQuotaService.checkAndIncrementQuota("tenant-alpha", 15);

        Tenant updated = tenantQuotaService.getTenant("tenant-alpha");
        assertEquals(initialUsed + 15, updated.getMonthlyEventsUsed());
    }
}
