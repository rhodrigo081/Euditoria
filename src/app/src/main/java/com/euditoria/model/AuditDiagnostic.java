package com.euditoria.model;

public class AuditDiagnostic {
    private String id;
    private int lineNumber;
    private int columnNumber;
    private String nodeName;
    private String errorCode;
    private String message;
    private String suggestedFix;
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
