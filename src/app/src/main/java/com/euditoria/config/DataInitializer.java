package com.euditoria.config;

import com.euditoria.model.Tenant;
import com.euditoria.model.TenantPlan;
import com.euditoria.model.TimelineEvent;
import com.euditoria.model.Worker;
import com.euditoria.repository.TenantRepository;
import com.euditoria.repository.TimelineEventRepository;
import com.euditoria.repository.WorkerRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

/**
 * Inicializador seguro de dados base para funcionamento 100% autônomo e sem falhas.
 * Garante a existência do Tenant padrão e dados de referência quando o banco relacional inicia.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private final TenantRepository tenantRepository;
    private final WorkerRepository workerRepository;
    private final TimelineEventRepository timelineEventRepository;

    public DataInitializer(TenantRepository tenantRepository,
                           WorkerRepository workerRepository,
                           TimelineEventRepository timelineEventRepository) {
        this.tenantRepository = tenantRepository;
        this.workerRepository = workerRepository;
        this.timelineEventRepository = timelineEventRepository;
    }

    @Override
    public void run(String... args) {
        // Inicializa o tenant padrão do sistema se não existir
        if (!tenantRepository.existsById("tenant-alpha")) {
            Tenant defaultTenant = new Tenant(
                    "tenant-alpha",
                    "TechBrasil Soluções Digitais Ltda",
                    "12.345.678/0001-95",
                    "contato@techbrasil.com.br",
                    TenantPlan.PROFESSIONAL,
                    0
            );
            tenantRepository.save(defaultTenant);
        }

        // Inicializa colaborador e linha do tempo de referência se a base de trabalhadores estiver vazia
        String demoCpf = "12345678909";
        if (!workerRepository.existsByCpf(demoCpf)) {
            Worker demoWorker = new Worker(demoCpf, "Carlos Eduardo Silveira", "MAT-08472", LocalDate.of(2023, 3, 1));
            demoWorker.getHistoricoEventos().addAll(List.of("S-2200", "S-2206", "S-1200"));
            workerRepository.save(demoWorker);

            TimelineEvent evt1 = new TimelineEvent(
                    "TL-EVT-001",
                    demoCpf,
                    demoWorker.getNome(),
                    "S-2200",
                    "Cadastramento Inicial e Admissão do Trabalhador",
                    LocalDate.of(2023, 3, 1),
                    "REC-2023-998811",
                    false,
                    null
            );

            TimelineEvent evt2 = new TimelineEvent(
                    "TL-EVT-002",
                    demoCpf,
                    demoWorker.getNome(),
                    "S-2206",
                    "Alteração de Contrato de Trabalho (Promoção para Especialista)",
                    LocalDate.of(2024, 7, 15),
                    "REC-2024-112233",
                    false,
                    null
            );

            TimelineEvent evt3 = new TimelineEvent(
                    "TL-EVT-003",
                    demoCpf,
                    demoWorker.getNome(),
                    "S-1200",
                    "Remuneração do Trabalhador Vinculado ao RGPS",
                    LocalDate.of(2026, 9, 1),
                    "REC-2026-445566",
                    false,
                    null
            );

            timelineEventRepository.saveAll(List.of(evt1, evt2, evt3));
        }
    }
}
