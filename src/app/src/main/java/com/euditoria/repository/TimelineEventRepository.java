package com.euditoria.repository;

import com.euditoria.model.TimelineEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TimelineEventRepository extends JpaRepository<TimelineEvent, String> {

    List<TimelineEvent> findByCpfOrderByEventDateAsc(String cpf);

    List<TimelineEvent> findByCpfOrderByEventDateDesc(String cpf);

    void deleteByCpf(String cpf);
}
