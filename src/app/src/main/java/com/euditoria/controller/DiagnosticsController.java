package com.euditoria.controller;

import com.euditoria.dto.DiagnosticReprocessRequestDTO;
import com.euditoria.model.Batch;
import com.euditoria.service.BatchProcessingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/diagnostics")
public class DiagnosticsController {

    private final BatchProcessingService batchProcessingService;

    public DiagnosticsController(BatchProcessingService batchProcessingService) {
        this.batchProcessingService = batchProcessingService;
    }

    @PostMapping("/reprocess")
    public ResponseEntity<Batch> reprocessXml(@Valid @RequestBody DiagnosticReprocessRequestDTO request) {
        Batch updatedBatch = batchProcessingService.reprocessXml(request.getBatchId(), request.getXmlContent());
        return ResponseEntity.ok(updatedBatch);
    }
}
