package com.euditoria.model;

import jakarta.persistence.*;

@Entity
@Table(name = "audit_diagnostics")
public class AuditDiagnostic {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "line_number")
    private int lineNumber;

    @Column(name = "column_number")
    private int columnNumber;

    @Column(name = "node_name", length = 100)
    private String nodeName;

    @Column(name = "error_code", length = 100)
    private String errorCode;

    @Lob
    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    @Lob
    @Column(name = "suggested_fix", columnDefinition = "TEXT")
    private String suggestedFix;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false, length = 20)
    private DiagnosticSeverity severity;

    public AuditDiagnostic() {}

    public AuditDiagnostic(String id, int lineNumber, int columnNumber, String nodeName, String errorCode, String message, String suggestedFix, DiagnosticSeverity severity) {
        this.id = id;
        this.lineNumber = lineNumber;
        this.columnNumber = columnNumber;
        this.nodeName = nodeName;
        this.errorCode = errorCode;
        this.message = message;
        this.suggestedFix = suggestedFix;
        this.severity = severity;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public int getLineNumber() { return lineNumber; }
    public void setLineNumber(int lineNumber) { this.lineNumber = lineNumber; }

    public int getColumnNumber() { return columnNumber; }
    public void setColumnNumber(int columnNumber) { this.columnNumber = columnNumber; }

    public String getNodeName() { return nodeName; }
    public void setNodeName(String nodeName) { this.nodeName = nodeName; }

    public String getErrorCode() { return errorCode; }
    public void setErrorCode(String errorCode) { this.errorCode = errorCode; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getSuggestedFix() { return suggestedFix; }
    public void setSuggestedFix(String suggestedFix) { this.suggestedFix = suggestedFix; }

    public DiagnosticSeverity getSeverity() { return severity; }
    public void setSeverity(DiagnosticSeverity severity) { this.severity = severity; }
}
