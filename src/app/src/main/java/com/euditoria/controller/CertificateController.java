package com.euditoria.controller;

import com.euditoria.exception.ResourceNotFoundException;
import com.euditoria.mock.MockDataStore;
import com.euditoria.model.Certificate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/certificates")
public class CertificateController {

    private final MockDataStore mockDataStore;

    public CertificateController(MockDataStore mockDataStore) {
        this.mockDataStore = mockDataStore;
    }

    @GetMapping("/{certificateId}")
    public ResponseEntity<Certificate> getCertificate(@PathVariable String certificateId) {
        Certificate cert = mockDataStore.getCertificates().get(certificateId);
        if (cert == null) {
            throw new ResourceNotFoundException("Certificado de conformidade '" + certificateId + "' não encontrado.");
        }
        return ResponseEntity.ok(cert);
    }
}
