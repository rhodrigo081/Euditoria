package com.euditoria.dto;

import com.euditoria.model.BatchStatus;
import java.time.LocalDateTime;

public class BatchUploadResponseDTO {
    private String batchId;
    private String status;
    private String message;
    private LocalDateTime receivedAt;
    private int estimatedEvents;

    public BatchUploadResponseDTO() {}

    public BatchUploadResponseDTO(String batchId, String status, String message, LocalDateTime receivedAt, int estimatedEvents) {
        this.batchId = batchId;
        this.status = status;
        this.message = message;
        this.receivedAt = receivedAt;
        this.estimatedEvents = estimatedEvents;
    }

    public String getBatchId() { return batchId; }
    public void setBatchId(String batchId) { this.batchId = batchId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDateTime getReceivedAt() { return receivedAt; }
    public void setReceivedAt(LocalDateTime receivedAt) { this.receivedAt = receivedAt; }

    public int getEstimatedEvents() { return estimatedEvents; }
    public void setEstimatedEvents(int estimatedEvents) { this.estimatedEvents = estimatedEvents; }
}
