package com.euditoria.repository;

import com.euditoria.model.RegisteredCompany;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RegisteredCompanyRepository extends JpaRepository<RegisteredCompany, String> {

    Optional<RegisteredCompany> findByEmailIgnoreCase(String email);

    Optional<RegisteredCompany> findByDocumentNumber(String documentNumber);

    Optional<RegisteredCompany> findByEmailIgnoreCaseOrDocumentNumber(String email, String documentNumber);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByDocumentNumber(String documentNumber);
}
