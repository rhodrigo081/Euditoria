package com.euditoria.dto;

import com.euditoria.model.TimelineEvent;
import java.util.List;

public class WorkerTimelineDTO {
    private String cpf;
    private String workerName;
    private String matricula;
    private boolean hasPrecedenceViolations;
    private List<TimelineEvent> events;

    public WorkerTimelineDTO() {}

    public WorkerTimelineDTO(String cpf, String workerName, String matricula, boolean hasPrecedenceViolations, List<TimelineEvent> events) {
        this.cpf = cpf;
        this.workerName = workerName;
        this.matricula = matricula;
        this.hasPrecedenceViolations = hasPrecedenceViolations;
        this.events = events;
    }

    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }

    public String getWorkerName() { return workerName; }
    public void setWorkerName(String workerName) { this.workerName = workerName; }

    public String getMatricula() { return matricula; }
    public void setMatricula(String matricula) { this.matricula = matricula; }

    public boolean isHasPrecedenceViolations() { return hasPrecedenceViolations; }
    public void setHasPrecedenceViolations(boolean hasPrecedenceViolations) { this.hasPrecedenceViolations = hasPrecedenceViolations; }

    public List<TimelineEvent> getEvents() { return events; }
    public void setEvents(List<TimelineEvent> events) { this.events = events; }
}
