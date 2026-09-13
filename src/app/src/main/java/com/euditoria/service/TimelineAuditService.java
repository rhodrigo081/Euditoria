package com.euditoria.service;

import com.euditoria.dto.WorkerTimelineDTO;
import com.euditoria.mock.MockDataStore;
import com.euditoria.model.TimelineEvent;
import com.euditoria.model.Worker;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class TimelineAuditService {

    private final MockDataStore mockDataStore;

    public TimelineAuditService(MockDataStore mockDataStore) {
        this.mockDataStore = mockDataStore;
    }

    public WorkerTimelineDTO getTimelineForWorker(String cpf) {
        String cleanCpf = (cpf != null) ? cpf.replaceAll("\\D", "") : "";
        Worker worker = mockDataStore.getWorkers().get(cleanCpf);

        List<TimelineEvent> events = mockDataStore.getWorkerTimelines().getOrDefault(cleanCpf, new ArrayList<>());

        if (worker == null && events.isEmpty()) {
            // Cria representação dinâmica mockada caso o CPF seja novo
            worker = new Worker(cleanCpf, "Colaborador Auditado eSocial", "MAT-" + cleanCpf.substring(Math.max(0, cleanCpf.length() - 4)), LocalDate.of(2023, 3, 1));
            events = new ArrayList<>();
            events.add(new TimelineEvent("TL-NEW-1", cleanCpf, worker.getNome(), "S-2200", "Cadastramento Inicial e Admissão do Trabalhador", LocalDate.of(2023, 3, 1), "REC-AUTO-100", false, null));
            events.add(new TimelineEvent("TL-NEW-2", cleanCpf, worker.getNome(), "S-1200", "Remuneração Mensal do Período Vigente", LocalDate.of(2026, 9, 1), "REC-AUTO-200", false, null));
        }

        boolean hasViolations = events.stream().anyMatch(TimelineEvent::isPrecedenceViolation);
        return new WorkerTimelineDTO(
                cleanCpf,
                worker != null ? worker.getNome() : "Trabalhador Desconhecido",
                worker != null ? worker.getMatricula() : "N/D",
                hasViolations,
                events
        );
    }
}
