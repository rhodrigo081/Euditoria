package com.euditoria.repository;

import com.euditoria.model.Batch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BatchRepository extends JpaRepository<Batch, String> {

    List<Batch> findAllByOrderByUploadTimestampDesc();

    List<Batch> findByTenantIdOrderByUploadTimestampDesc(String tenantId);

    long countByTenantId(String tenantId);

    Optional<Batch> findByBatchId(String batchId);
}
