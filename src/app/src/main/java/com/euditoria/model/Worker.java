package com.euditoria.model;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class Worker {
    private String cpf;
    private String nome;
    private String matricula;
    private LocalDate dataAdmissao;
    private LocalDate dataDesligamento;
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
