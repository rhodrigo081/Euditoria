package com.euditoria.controller;

import com.euditoria.exception.ResourceNotFoundException;
import com.euditoria.model.Certificate;
import com.euditoria.repository.CertificateRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/certificates")
public class CertificateController {

    private final CertificateRepository certificateRepository;

    public CertificateController(CertificateRepository certificateRepository) {
        this.certificateRepository = certificateRepository;
    }

    @GetMapping("/{certificateId}")
    public ResponseEntity<Certificate> getCertificate(@PathVariable String certificateId) {
        Certificate cert = certificateRepository.findByCertificateId(certificateId)
                .or(() -> certificateRepository.findByProtocolNumber(certificateId))
                .orElseThrow(() -> new ResourceNotFoundException("Certificado de conformidade '" + certificateId + "' não encontrado."));
        return ResponseEntity.ok(cert);
    }
}
