package com.euditoria.repository;

import com.euditoria.model.AuditDiagnostic;
import com.euditoria.model.DiagnosticSeverity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditDiagnosticRepository extends JpaRepository<AuditDiagnostic, String> {

    List<AuditDiagnostic> findBySeverity(DiagnosticSeverity severity);

    List<AuditDiagnostic> findByErrorCode(String errorCode);
}
