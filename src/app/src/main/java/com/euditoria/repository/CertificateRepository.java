package com.euditoria.repository;

import com.euditoria.model.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, String> {

    Optional<Certificate> findByCertificateId(String certificateId);

    Optional<Certificate> findByProtocolNumber(String protocolNumber);

    Optional<Certificate> findByBatchId(String batchId);

    List<Certificate> findByCnpjOrderByIssuedAtDesc(String cnpj);
}
