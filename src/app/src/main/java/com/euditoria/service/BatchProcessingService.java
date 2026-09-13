package com.euditoria.service;

import com.euditoria.dto.BatchUploadResponseDTO;
import com.euditoria.exception.ResourceNotFoundException;
import com.euditoria.mock.MockDataStore;
import com.euditoria.model.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class BatchProcessingService {

    private final MockDataStore mockDataStore;
    private final XsdValidationService xsdValidationService;
    private final BusinessRuleService businessRuleService;
    private final TaxCalculationService taxCalculationService;
    private final CertificateService certificateService;
    private final TenantQuotaService tenantQuotaService;

    public BatchProcessingService(MockDataStore mockDataStore,
                                  XsdValidationService xsdValidationService,
                                  BusinessRuleService businessRuleService,
                                  TaxCalculationService taxCalculationService,
                                  CertificateService certificateService,
                                  TenantQuotaService tenantQuotaService) {
        this.mockDataStore = mockDataStore;
        this.xsdValidationService = xsdValidationService;
        this.businessRuleService = businessRuleService;
        this.taxCalculationService = taxCalculationService;
        this.certificateService = certificateService;
        this.tenantQuotaService = tenantQuotaService;
    }

    public BatchUploadResponseDTO registerBatch(String fileName, String xmlContent, String tenantId) {
        String safeTenant = (tenantId == null || tenantId.isBlank()) ? "tenant-alpha" : tenantId;
        String batchId = "LOTE-" + LocalDateTime.now().getYear() + String.format("%02d", LocalDateTime.now().getMonthValue()) + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        int eventsCount = countEvents(xmlContent);
        tenantQuotaService.checkAndIncrementQuota(safeTenant, Math.max(1, eventsCount));

        Batch batch = new Batch(batchId, safeTenant, fileName, LocalDateTime.now(), xmlContent, BatchStatus.RECEIVED, Math.max(1, eventsCount));
        mockDataStore.getBatches().put(batchId, batch);

        // Processa as validações e auditoria
        processBatchAudit(batch);

        return new BatchUploadResponseDTO(
                batch.getBatchId(),
                batch.getStatus().name(),
                "Lote recepcionado com sucesso e encaminhado para o pipeline de auditoria prévia.",
                batch.getUploadTimestamp(),
                batch.getEventsCount()
        );
    }

    public Batch getBatch(String batchId) {
        Batch batch = mockDataStore.getBatches().get(batchId);
        if (batch == null) {
            throw new ResourceNotFoundException("Lote com identificador '" + batchId + "' não encontrado.");
        }
        return batch;
    }

    public List<Batch> listAllBatches() {
        return new ArrayList<>(mockDataStore.getBatches().values());
    }

    public Batch reprocessXml(String batchId, String updatedXml) {
        Batch batch = getBatch(batchId);
        batch.setXmlContent(updatedXml);
        batch.setUploadTimestamp(LocalDateTime.now());
        processBatchAudit(batch);
        return batch;
    }

    public void processBatchAudit(Batch batch) {
        batch.setStatus(BatchStatus.VALIDATING);
        List<AuditDiagnostic> diagnostics = new ArrayList<>();

        String xml = batch.getXmlContent();

        // 1. Validação Estrutural XSD
        diagnostics.addAll(xsdValidationService.validateXmlStructure(xml));

        // 2. Validação Semântica de CPF (Módulo 11)
        Pattern cpfPattern = Pattern.compile("<cpfTrab>(\\d{11})</cpfTrab>");
        Matcher cpfMatcher = cpfPattern.matcher(xml);
        String lastCpf = null;
        while (cpfMatcher.find()) {
            lastCpf = cpfMatcher.group(1);
            if (!businessRuleService.isValidCpf(lastCpf)) {
                diagnostics.add(new AuditDiagnostic(
                        UUID.randomUUID().toString(),
                        findLineNumber(xml, cpfMatcher.start()),
                        cpfMatcher.start(),
                        "cpfTrab",
                        "REGRA_VALIDA_CPF",
                        "Dígito verificador do CPF (" + lastCpf + ") inválido pelo algoritmo Módulo 11.",
                        "Corrija os dígitos finais do CPF do trabalhador no leiaute S-1200.",
                        DiagnosticSeverity.ERROR
                ));
            }
        }

        // 3. Validação Semântica de CNPJ
        Pattern cnpjPattern = Pattern.compile("<nrInsc>(\\d{14})</nrInsc>");
        Matcher cnpjMatcher = cnpjPattern.matcher(xml);
        while (cnpjMatcher.find()) {
            String cnpj = cnpjMatcher.group(1);
            if (!businessRuleService.isValidCnpj(cnpj)) {
                diagnostics.add(new AuditDiagnostic(
                        UUID.randomUUID().toString(),
                        findLineNumber(xml, cnpjMatcher.start()),
                        cnpjMatcher.start(),
                        "nrInsc",
                        "REGRA_VALIDA_CNPJ",
                        "CNPJ do Empregador (" + cnpj + ") inválido pelo Módulo 11.",
                        "Insira um CNPJ regular e ativo na Receita Federal.",
                        DiagnosticSeverity.ERROR
                ));
            }
        }

        // 4. Detecção de Quebra de Precedência (S-2299 sem S-2200)
        if (xml.contains("evtDeslig") && !xml.contains("evtAdmissao") && !xml.contains("S-2200")) {
            diagnostics.add(new AuditDiagnostic(
                    UUID.randomUUID().toString(),
                    findLineNumber(xml, xml.indexOf("evtDeslig")),
                    10,
                    "evtDeslig",
                    "REGRA_PRECEDENCIA_LEGAL",
                    "Quebra de precedência legal: Evento de Desligamento S-2299 transmitido sem histórico de admissão.",
                    "Transmita o evento S-2200 de Cadastramento Inicial/Admissão antes do desligamento.",
                    DiagnosticSeverity.CRITICAL
            ));
        }

        // 5. Motor de Apuração Fiscal (Integridade)
        BigDecimal baseSalarial = extractSalario(xml);
        TaxMirror taxMirror = taxCalculationService.generateTaxMirror(
                baseSalarial,
                extractValorDeclarado(xml, "9988"),
                BigDecimal.ZERO,
                BigDecimal.ZERO
        );
        batch.setTaxMirror(taxMirror);

        if (taxMirror.isPossuiDivergencias()) {
            diagnostics.add(new AuditDiagnostic(
                    UUID.randomUUID().toString(),
                    findLineNumber(xml, xml.indexOf("itensRemun")),
                    15,
                    "itensRemun",
                    "DIVERGENCIA_FISCAL_TOTALIZADOR",
                    taxMirror.getMemoriaCalculoTexto(),
                    "Ajuste os valores das rubricas de desconto para equivaler à tabela progressiva oficial 2026.",
                    DiagnosticSeverity.WARNING
            ));
        }

        batch.setDiagnostics(diagnostics);

        // Se não houver erros impeditivos (ERROR ou CRITICAL), emite certificado (RF04)
        boolean hasErrors = diagnostics.stream().anyMatch(d -> d.getSeverity() == DiagnosticSeverity.ERROR || d.getSeverity() == DiagnosticSeverity.CRITICAL);

        if (!hasErrors) {
            batch.setStatus(BatchStatus.COMPLIANT);
            Certificate cert = certificateService.generateCertificate(
                    batch.getBatchId(),
                    "12.345.678/0001-95",
                    "TechBrasil Soluções Digitais Ltda",
                    batch.getEventsCount(),
                    batch.getXmlContent()
            );
            batch.setCertificate(cert);
            mockDataStore.getCertificates().put(cert.getCertificateId(), cert);
        } else {
            batch.setStatus(BatchStatus.NON_COMPLIANT);
            batch.setCertificate(null);
        }
    }

    private int countEvents(String xml) {
        if (xml == null) return 1;
        int count = 0;
        Pattern p = Pattern.compile("<evento\\s");
        Matcher m = p.matcher(xml);
        while (m.find()) count++;
        return Math.max(1, count);
    }

    private int findLineNumber(String text, int charIndex) {
        if (text == null || charIndex < 0 || charIndex >= text.length()) return 1;
        int line = 1;
        for (int i = 0; i < charIndex; i++) {
            if (text.charAt(i) == '\n') line++;
        }
        return line;
    }

    private BigDecimal extractSalario(String xml) {
        try {
            Pattern p = Pattern.compile("<vrRubr>([0-9.]+)</vrRubr>");
            Matcher m = p.matcher(xml);
            if (m.find()) {
                return new BigDecimal(m.group(1));
            }
        } catch (Exception ignored) {}
        return new BigDecimal("4500.00");
    }

    private BigDecimal extractValorDeclarado(String xml, String codRubr) {
        try {
            if (xml.contains("<codRubr>" + codRubr + "</codRubr>")) {
                Pattern p = Pattern.compile("<vrRubr>([0-9.]+)</vrRubr>");
                Matcher m = p.matcher(xml);
                // Segundo vrRubr
                if (m.find() && m.find()) {
                    return new BigDecimal(m.group(1));
                }
            }
        } catch (Exception ignored) {}
        return null;
    }
}
