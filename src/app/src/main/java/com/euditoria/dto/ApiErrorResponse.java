package com.euditoria.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ApiErrorResponse {
    private String status;
    private int statusCode;
    private String errorCode;
    private String message;
    private LocalDateTime timestamp;
    private List<String> details;

    public ApiErrorResponse() {}

    public ApiErrorResponse(String status, int statusCode, String errorCode, String message, LocalDateTime timestamp, List<String> details) {
        this.status = status;
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.message = message;
        this.timestamp = timestamp;
        this.details = details;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getStatusCode() { return statusCode; }
    public void setStatusCode(int statusCode) { this.statusCode = statusCode; }

    public String getErrorCode() { return errorCode; }
    public void setErrorCode(String errorCode) { this.errorCode = errorCode; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public List<String> getDetails() { return details; }
    public void setDetails(List<String> details) { this.details = details; }
}
