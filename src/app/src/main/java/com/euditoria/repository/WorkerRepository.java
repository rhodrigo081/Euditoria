package com.euditoria.repository;

import com.euditoria.model.Worker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WorkerRepository extends JpaRepository<Worker, String> {

    Optional<Worker> findByCpf(String cpf);

    boolean existsByCpf(String cpf);
}
