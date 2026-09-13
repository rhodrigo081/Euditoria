package com.euditoria.model;

import java.time.LocalDate;

public class TimelineEvent {
    private String id;
    private String cpf;
    private String workerName;
    private String eventType; // S-2200, S-2205, S-2206, S-2230, S-1200, S-2299
    private String description;
    private LocalDate eventDate;
    private String receiptNumber;
    private boolean precedenceViolation;
    private String violationDetails;

    public TimelineEvent() {}

    public TimelineEvent(String id, String cpf, String workerName, String eventType, String description, LocalDate eventDate, String receiptNumber, boolean precedenceViolation, String violationDetails) {
        this.id = id;
        this.cpf = cpf;
        this.workerName = workerName;
        this.eventType = eventType;
        this.description = description;
        this.eventDate = eventDate;
        this.receiptNumber = receiptNumber;
        this.precedenceViolation = precedenceViolation;
        this.violationDetails = violationDetails;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }

    public String getWorkerName() { return workerName; }
    public void setWorkerName(String workerName) { this.workerName = workerName; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDate getEventDate() { return eventDate; }
    public void setEventDate(LocalDate eventDate) { this.eventDate = eventDate; }

    public String getReceiptNumber() { return receiptNumber; }
    public void setReceiptNumber(String receiptNumber) { this.receiptNumber = receiptNumber; }

    public boolean isPrecedenceViolation() { return precedenceViolation; }
    public void setPrecedenceViolation(boolean precedenceViolation) { this.precedenceViolation = precedenceViolation; }

    public String getViolationDetails() { return violationDetails; }
    public void setViolationDetails(String violationDetails) { this.violationDetails = violationDetails; }
}
