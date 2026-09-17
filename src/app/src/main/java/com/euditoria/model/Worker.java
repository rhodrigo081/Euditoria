package com.euditoria.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "workers")
public class Worker {

    @Id
    @Column(name = "cpf", length = 14)
    private String cpf;

    @Column(name = "nome", nullable = false, length = 255)
    private String nome;

    @Column(name = "matricula", nullable = false, length = 50)
    private String matricula;

    @Column(name = "data_admissao")
    private LocalDate dataAdmissao;

    @Column(name = "data_desligamento")
    private LocalDate dataDesligamento;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "worker_event_history", joinColumns = @JoinColumn(name = "worker_cpf"))
    @Column(name = "event_name")
    private List<String> historicoEventos = new ArrayList<>();

    public Worker() {}

    public Worker(String cpf, String nome, String matricula, LocalDate dataAdmissao) {
        this.cpf = cpf;
        this.nome = nome;
        this.matricula = matricula;
        this.dataAdmissao = dataAdmissao;
    }

    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getMatricula() { return matricula; }
    public void setMatricula(String matricula) { this.matricula = matricula; }

    public LocalDate getDataAdmissao() { return dataAdmissao; }
    public void setDataAdmissao(LocalDate dataAdmissao) { this.dataAdmissao = dataAdmissao; }

    public LocalDate getDataDesligamento() { return dataDesligamento; }
    public void setDataDesligamento(LocalDate dataDesligamento) { this.dataDesligamento = dataDesligamento; }

    public List<String> getHistoricoEventos() { return historicoEventos; }
    public void setHistoricoEventos(List<String> historicoEventos) { this.historicoEventos = historicoEventos; }
}
