package com.euditoria.controller;

import com.euditoria.model.Batch;
import com.euditoria.model.TaxMirror;
import com.euditoria.service.BatchProcessingService;
import com.euditoria.service.TaxCalculationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/tax-mirrors")
public class TaxMirrorController {

    private final BatchProcessingService batchProcessingService;
    private final TaxCalculationService taxCalculationService;

    public TaxMirrorController(BatchProcessingService batchProcessingService, TaxCalculationService taxCalculationService) {
        this.batchProcessingService = batchProcessingService;
        this.taxCalculationService = taxCalculationService;
    }

    @GetMapping("/{batchId}")
    public ResponseEntity<TaxMirror> getTaxMirror(@PathVariable String batchId) {
        Batch batch = batchProcessingService.getBatch(batchId);
        return ResponseEntity.ok(batch.getTaxMirror());
    }

    @PostMapping("/calculate-preview")
    public ResponseEntity<TaxMirror> calculatePreview(@RequestBody Map<String, Object> body) {
        BigDecimal base = new BigDecimal(body.getOrDefault("baseSalarial", "0.00").toString());
        BigDecimal inss = new BigDecimal(body.getOrDefault("inssDeclarado", "0.00").toString());
        BigDecimal irrf = new BigDecimal(body.getOrDefault("irrfDeclarado", "0.00").toString());
        BigDecimal fgts = new BigDecimal(body.getOrDefault("fgtsDeclarado", "0.00").toString());

        TaxMirror mirror = taxCalculationService.generateTaxMirror(base, inss, irrf, fgts);
        return ResponseEntity.ok(mirror);
    }
}
