package com.euditoria.service;

import com.euditoria.dto.WorkerTimelineDTO;
import com.euditoria.model.TimelineEvent;
import com.euditoria.model.Worker;
import com.euditoria.repository.TimelineEventRepository;
import com.euditoria.repository.WorkerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class TimelineAuditService {

    private final WorkerRepository workerRepository;
    private final TimelineEventRepository timelineEventRepository;

    public TimelineAuditService(WorkerRepository workerRepository, TimelineEventRepository timelineEventRepository) {
        this.workerRepository = workerRepository;
        this.timelineEventRepository = timelineEventRepository;
    }

    @Transactional
    public WorkerTimelineDTO getTimelineForWorker(String cpf) {
        String cleanCpf = (cpf != null) ? cpf.replaceAll("\\D", "") : "";
        Worker worker = workerRepository.findByCpf(cleanCpf).orElse(null);

        List<TimelineEvent> events = timelineEventRepository.findByCpfOrderByEventDateAsc(cleanCpf);

        if (worker == null && events.isEmpty()) {
            // Cria representação dinâmica e persiste no banco de dados caso o CPF seja novo
            worker = new Worker(cleanCpf, "Colaborador Auditado eSocial", "MAT-" + (cleanCpf.length() >= 4 ? cleanCpf.substring(cleanCpf.length() - 4) : "0001"), LocalDate.of(2023, 3, 1));
            workerRepository.save(worker);

            events = new ArrayList<>();
            events.add(new TimelineEvent("TL-" + cleanCpf + "-1", cleanCpf, worker.getNome(), "S-2200", "Cadastramento Inicial e Admissão do Trabalhador", LocalDate.of(2023, 3, 1), "REC-AUTO-100", false, null));
            events.add(new TimelineEvent("TL-" + cleanCpf + "-2", cleanCpf, worker.getNome(), "S-1200", "Remuneração Mensal do Período Vigente", LocalDate.of(2026, 9, 1), "REC-AUTO-200", false, null));
            timelineEventRepository.saveAll(events);
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
