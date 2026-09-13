package com.euditoria.controller;

import com.euditoria.dto.BatchUploadResponseDTO;
import com.euditoria.model.Batch;
import com.euditoria.service.BatchProcessingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/batches")
public class BatchController {

    private final BatchProcessingService batchProcessingService;

    public BatchController(BatchProcessingService batchProcessingService) {
        this.batchProcessingService = batchProcessingService;
    }

    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public ResponseEntity<BatchUploadResponseDTO> uploadBatch(
            @RequestParam("file") MultipartFile file,
            @RequestHeader(value = "X-Tenant-ID", required = false) String tenantId) throws IOException {

        String xmlContent = new String(file.getBytes(), StandardCharsets.UTF_8);
        BatchUploadResponseDTO response = batchProcessingService.registerBatch(file.getOriginalFilename(), xmlContent, tenantId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/raw")
    public ResponseEntity<BatchUploadResponseDTO> uploadRawXml(
            @RequestBody Map<String, String> payload,
            @RequestHeader(value = "X-Tenant-ID", required = false) String tenantId) {

        String xmlContent = payload.getOrDefault("xmlContent", "");
        String fileName = payload.getOrDefault("fileName", "lote_declarado.xml");
        BatchUploadResponseDTO response = batchProcessingService.registerBatch(fileName, xmlContent, tenantId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<Batch>> listBatches() {
        return ResponseEntity.ok(batchProcessingService.listAllBatches());
    }

    @GetMapping("/{batchId}")
    public ResponseEntity<Batch> getBatchDetails(@PathVariable String batchId) {
        return ResponseEntity.ok(batchProcessingService.getBatch(batchId));
    }
}
