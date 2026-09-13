package com.euditoria.service;

import com.euditoria.model.Certificate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
public class CertificateService {

    public String computeSha256(String content) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedhash = digest.digest(content.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder(2 * encodedhash.length);
            for (byte b : encodedhash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            return "UNKNOWN_HASH";
        }
    }

    public Certificate generateCertificate(String batchId, String cnpj, String razaoSocial, int eventsCount, String xmlContent) {
        String token = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String certId = "EUD-2026-CERT-" + token;
        String protoNum = "PROT-AUD-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy.MM.dd")) + "-" + token;
        String sha256 = computeSha256(xmlContent != null ? xmlContent : "EUDITORIA_EMPTY");
        String verificationUrl = "https://euditoria.gov.br/verificar/" + certId;

        return new Certificate(
                certId,
                protoNum,
                batchId,
                cnpj != null ? cnpj : "12.345.678/0001-95",
                razaoSocial != null ? razaoSocial : "Organização Auditada",
                LocalDateTime.now(),
                sha256,
                eventsCount,
                "VALIDO",
                verificationUrl
        );
    }
}
