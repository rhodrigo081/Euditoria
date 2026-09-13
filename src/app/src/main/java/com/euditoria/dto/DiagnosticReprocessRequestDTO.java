package com.euditoria.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class DiagnosticReprocessRequestDTO {
    @NotBlank(message = "O ID do lote é obrigatório.")
    private String batchId;

    @NotBlank(message = "O conteúdo XML não pode estar vazio.")
    @Size(max = 20000000, message = "O XML excede o limite suportado para reprocessamento.")
    private String xmlContent;

    public DiagnosticReprocessRequestDTO() {}

    public DiagnosticReprocessRequestDTO(String batchId, String xmlContent) {
        this.batchId = batchId;
        this.xmlContent = xmlContent;
    }

    public String getBatchId() { return batchId; }
    public void setBatchId(String batchId) { this.batchId = batchId; }

    public String getXmlContent() { return xmlContent; }
    public void setXmlContent(String xmlContent) { this.xmlContent = xmlContent; }
}
