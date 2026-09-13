package com.euditoria.mock;

import com.euditoria.model.*;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class MockDataStore {

    private final Map<String, Tenant> tenants = new ConcurrentHashMap<>();
    private final Map<String, Batch> batches = new ConcurrentHashMap<>();
    private final Map<String, Worker> workers = new ConcurrentHashMap<>();
    private final Map<String, List<TimelineEvent>> workerTimelines = new ConcurrentHashMap<>();
    private final Map<String, Certificate> certificates = new ConcurrentHashMap<>();

    public MockDataStore() {
        initMockData();
    }

    private void initMockData() {
        // Tenants
        Tenant t1 = new Tenant("tenant-alpha", "TechBrasil Soluções Digitais Ltda", "12.345.678/0001-95", "compliance@techbrasil.com.br", TenantPlan.PROFESSIONAL, 1420);
        Tenant t2 = new Tenant("tenant-beta", "Indústria Metalúrgica Gaúcha S.A.", "98.765.432/0001-10", "esocial@metalurgicagaucha.ind.br", TenantPlan.ENTERPRISE, 89400);
        Tenant t3 = new Tenant("tenant-gamma", "Comércio e Logística Rápida", "45.123.890/0001-33", "fiscal@logisticarapida.com.br", TenantPlan.STARTER, 82);

        tenants.put(t1.getId(), t1);
        tenants.put(t2.getId(), t2);
        tenants.put(t3.getId(), t3);

        // Workers & Timelines
        Worker w1 = new Worker("52998224725", "Carlos Eduardo da Silva", "MAT-9821", LocalDate.of(2022, 1, 10));
        Worker w2 = new Worker("11122233344", "Mariana Oliveira Santos", "MAT-7712", null); // Sem admissão
        Worker w3 = new Worker("12345678909", "Roberto Mendonça de Souza", "MAT-3341", LocalDate.of(2020, 5, 15));

        workers.put(w1.getCpf(), w1);
        workers.put(w2.getCpf(), w2);
        workers.put(w3.getCpf(), w3);

        // Timeline w1 (Valida)
        List<TimelineEvent> tEvents1 = new ArrayList<>();
        tEvents1.add(new TimelineEvent("TL-01", w1.getCpf(), w1.getNome(), "S-2200", "Cadastramento Inicial e Admissão do Trabalhador", LocalDate.of(2022, 1, 10), "REC-2022-00129", false, null));
        tEvents1.add(new TimelineEvent("TL-02", w1.getCpf(), w1.getNome(), "S-2206", "Alteração Contratual de Cargo e Salário (+15%)", LocalDate.of(2023, 6, 1), "REC-2023-04910", false, null));
        tEvents1.add(new TimelineEvent("TL-03", w1.getCpf(), w1.getNome(), "S-2230", "Afastamento Temporário - Férias Regulamentares (30 dias)", LocalDate.of(2024, 7, 1), "REC-2024-08122", false, null));
        tEvents1.add(new TimelineEvent("TL-04", w1.getCpf(), w1.getNome(), "S-1200", "Remuneração Mensal de Trabalhador Vinculado ao RGPS", LocalDate.of(2026, 9, 1), "REC-2026-11894", false, null));
        workerTimelines.put(w1.getCpf(), tEvents1);

        // Timeline w2 (Com quebra de precedência - Desligamento sem admissão)
        List<TimelineEvent> tEvents2 = new ArrayList<>();
        tEvents2.add(new TimelineEvent("TL-10", w2.getCpf(), w2.getNome(), "S-2299", "Desligamento / Rescisão Contratual", LocalDate.of(2026, 9, 1), "REC-2026-99001", true, "VIOLAÇÃO DE PRECEDÊNCIA: Evento S-2299 transmitido sem evento prévio de Admissão (S-2200 ou S-2190)."));
        tEvents2.add(new TimelineEvent("TL-11", w2.getCpf(), w2.getNome(), "S-1200", "Tentativa de Envio de Remuneração após Desligamento", LocalDate.of(2026, 9, 5), "REC-PENDENTE", true, "VIOLAÇÃO DE PRECEDÊNCIA: Folha de pagamento declarada posterior à rescisão sem rubricas rescisórias."));
        workerTimelines.put(w2.getCpf(), tEvents2);

        // Batches
        // Batch 1: Compliant
        Batch b1 = new Batch("LOTE-202609-001", "tenant-alpha", "folha_setembro_2026_unidade_matriz.xml", LocalDateTime.now().minusHours(3), "<eSocial>...</eSocial>", BatchStatus.COMPLIANT, 18);
        TaxMirror tm1 = new TaxMirror();
        tm1.setBaseCalculoInssSegurado(new BigDecimal("98450.00"));
        tm1.setInssSeguradoDeclarado(new BigDecimal("10829.50"));
        tm1.setInssSeguradoApurado(new BigDecimal("10829.50"));
        tm1.setDivergenciaInssSegurado(BigDecimal.ZERO);
        tm1.setBaseCalculoIrrf(new BigDecimal("87620.50"));
        tm1.setIrrfDeclarado(new BigDecimal("6450.20"));
        tm1.setIrrfApurado(new BigDecimal("6450.20"));
        tm1.setDivergenciaIrrf(BigDecimal.ZERO);
        tm1.setBaseCalculoFgts(new BigDecimal("98450.00"));
        tm1.setFgtsDeclarado(new BigDecimal("7876.00"));
        tm1.setFgtsApurado(new BigDecimal("7876.00"));
        tm1.setDivergenciaFgts(BigDecimal.ZERO);
        tm1.setPatronalPrevidenciariaApurada(new BigDecimal("19690.00")); // 20%
        tm1.setRatApurado(new BigDecimal("1969.00")); // 2%
        tm1.setOutrasEntidadesTerceirosApurado(new BigDecimal("5710.10")); // 5.8%
        tm1.setTotalPatronalApurado(new BigDecimal("27369.10"));
        tm1.setTotalFgtsConsolidadoApurado(new BigDecimal("7876.00"));
        tm1.setPossuiDivergencias(false);
        tm1.setMemoriaCalculoTexto("Totalizadores S-5001, S-5002, S-5003, S-5011 e S-5013 apurados com 100% de conformidade matemática com a folha.");
        b1.setTaxMirror(tm1);

        Certificate c1 = new Certificate(
                "EUD-2026-CERT-B94A7C1E",
                "PROT-AUD-2026.09.13-000841",
                b1.getBatchId(),
                "12.345.678/0001-95",
                "TechBrasil Soluções Digitais Ltda",
                LocalDateTime.now().minusHours(3),
                "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                18,
                "VALIDO",
                "https://euditoria.gov.br/verificar/EUD-2026-CERT-B94A7C1E"
        );
        b1.setCertificate(c1);
        certificates.put(c1.getCertificateId(), c1);
        batches.put(b1.getBatchId(), b1);

        // Batch 2: Non compliant (Para testes no editor XML e diagnósticos)
        Batch b2 = new Batch("LOTE-202609-002", "tenant-alpha", "lote_inconsistente_auditoria.xml", LocalDateTime.now().minusMinutes(45),
                """
                <?xml version="1.0" encoding="UTF-8"?>
                <eSocial xmlns="http://www.esocial.gov.br/schema/lote/eventos/envio/v1_1_1">
                  <envioLoteEventos grupo="1">
                    <ideEmpregador>
                      <tpInsc>1</tpInsc>
                      <nrInsc>12345678000195</nrInsc>
                    </ideEmpregador>
                    <eventos>
                      <evento Id="ID1123456780001952026091300000099">
                        <eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtRemun/v_S_01_02_00">
                          <evtRemun Id="ID1123456780001952026091300000099">
                            <ideTrabalhador>
                              <cpfTrab>11122233344</cpfTrab>
                              <infoComplem>
                                <nmTrab>Mariana Oliveira Santos</nmTrab>
                              </infoComplem>
                            </ideTrabalhador>
                            <dmDev>
                              <ideDmDev>DEMO_DIVERGENTE</ideDmDev>
                              <infoPerApur>
                                <ideEstabLot>
                                  <remunPerApur>
                                    <itensRemun>
                                      <codRubr>1000</codRubr>
                                      <vrRubr>6800.00</vrRubr>
                                    </itensRemun>
                                  </remunPerApur>
                                </ideEstabLot>
                              </infoPerApur>
                            </dmDev>
                          </evtRemun>
                        </eSocial>
                      </evento>
                    </eventos>
                  </envioLoteEventos>
                </eSocial>
                """, BatchStatus.NON_COMPLIANT, 2);

        b2.getDiagnostics().add(new AuditDiagnostic("DIAG-001", 13, 16, "cpfTrab", "REGRA_VALIDA_CPF", "Dígito verificador do CPF inválido (Módulo 11 reprovado).", "Corrija o CPF do trabalhador para um número válido antes da transmissão.", DiagnosticSeverity.ERROR));
        b2.getDiagnostics().add(new AuditDiagnostic("DIAG-002", 11, 25, "evtRemun", "REGRA_PRECEDENCIA_ADMISSAO", "Trabalhador CPF 111.222.333-44 não possui evento S-2200 ativo no empregador.", "Transmita previamente o evento S-2200 de Admissão antes de apurar folha.", DiagnosticSeverity.CRITICAL));
        b2.getDiagnostics().add(new AuditDiagnostic("DIAG-003", 22, 18, "vrRubr", "REGRA_APURACAO_INSS", "Valor de desconto de INSS difere da apuração oficial pelo teto da tabela.", "Recalcule o desconto de INSS pela tabela progressiva oficial 2026.", DiagnosticSeverity.WARNING));

        TaxMirror tm2 = new TaxMirror();
        tm2.setBaseCalculoInssSegurado(new BigDecimal("6800.00"));
        tm2.setInssSeguradoDeclarado(new BigDecimal("150.00"));
        tm2.setInssSeguradoApurado(new BigDecimal("761.59"));
        tm2.setDivergenciaInssSegurado(new BigDecimal("-611.59"));
        tm2.setPossuiDivergencias(true);
        tm2.setMemoriaCalculoTexto("Divergência detectada de R$ 611,59 no INSS do trabalhador CPF 11122233344. O valor declarado foi subfaturado.");
        b2.setTaxMirror(tm2);

        batches.put(b2.getBatchId(), b2);
    }

    public Map<String, Tenant> getTenants() { return tenants; }
    public Map<String, Batch> getBatches() { return batches; }
    public Map<String, Worker> getWorkers() { return workers; }
    public Map<String, List<TimelineEvent>> getWorkerTimelines() { return workerTimelines; }
    public Map<String, Certificate> getCertificates() { return certificates; }
}
