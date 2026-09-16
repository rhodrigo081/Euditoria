package com.euditoria.mock;
import com.euditoria.model.*;
import org.springframework.stereotype.Component;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
/**
 * Repositório em memória dinâmico para armazenamento limpo de lotes e certificados reais.
 * Sem dados mockados ou estáticos pré-carregados.
 */
@Component
public class MockDataStore {
    private final Map<String, Tenant> tenants = new ConcurrentHashMap<>();
    private final Map<String, Batch> batches = new ConcurrentHashMap<>();
    private final Map<String, Worker> workers = new ConcurrentHashMap<>();
    private final Map<String, List<TimelineEvent>> workerTimelines = new ConcurrentHashMap<>();
    private final Map<String, Certificate> certificates = new ConcurrentHashMap<>();
    public MockDataStore() {
        // Inicialização limpa: dados mockados removidos.
        // O armazenamento receberá apenas lotes e entidades criados dinamicamente pelos usuários.
    }
    public Map<String, Tenant> getTenants() { return tenants; }
    public Map<String, Batch> getBatches() { return batches; }
    public Map<String, Worker> getWorkers() { return workers; }
    public Map<String, List<TimelineEvent>> getWorkerTimelines() { return workerTimelines; }
    public Map<String, Certificate> getCertificates() { return certificates; }
}