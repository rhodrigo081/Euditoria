# Euditoria — Plataforma Integrada de Governança e Auditoria Prévia eSocial

O **Euditoria** é uma plataforma corporativa para governança, validação e auditoria prévia de obrigações trabalhistas, fiscais e previdenciárias vinculadas ao **eSocial**. O sistema automatiza a recepção de lotes XML, a validação de conformidade estrita contra esquemas XSD vigentes, o cruzamento da linha do tempo funcional dos colaboradores e a apuração da memória de cálculo de tributos (INSS, FGTS e IRRF) com reconstituição dos totalizadores oficiais (**S-5001**, **S-5002**, **S-5003**, **S-5011** e **S-5013**).

---

## 📁 Estrutura do Projeto

O projeto segue rigorosamente o template padronizado de governança:

```text
Euditoria/
├── src/
│   ├── app/                      # BACKEND (Java 21+ / Spring Boot 3.3)
│   │   ├── src/main/java/com/euditoria/
│   │   │   ├── config/           # Confidencialidade, Rate Limiting & ThreadPool Assíncrono
│   │   │   ├── controller/       # Endpoints REST (RF01 a RF07)
│   │   │   ├── service/          # Motor Fiscal, Validador XSD, Precedência & Auditoria
│   │   │   ├── model/            # Entidades e Modelos de Domínio
│   │   │   ├── dto/              # DTOs de Entrada, Saída e Respostas ProblemDetail
│   │   │   ├── exception/        # GlobalExceptionHandler blindado (Sem vazamento de segredos)
│   │   │   └── mock/             # Repositório de dados em memória (100% Mockado)
│   │   ├── src/main/resources/   # application.yml e schemas XSD
│   │   └── pom.xml               # Configuração do Maven
│   │
│   └── public/                   # FRONTEND (React 18 / Vite + Tailwind CSS + Lucide)
│       ├── src/
│       │   ├── components/       # MaskedInput, CharacterCountInput, Navbar, etc.
│       │   ├── pages/            # Dashboard, Ingestão, Editor XML, Espelho Fiscal, Linha do Tempo, Cotas
│       │   ├── services/         # Cliente HTTP REST com fallback inteligente
│       │   ├── utils/            # Máscaras (CPF/CNPJ/Fone), sanitizadores e validadores Módulo 11
│       │   ├── App.jsx & main.jsx
│       ├── package.json
│       ├── vite.config.js
│       └── index.html
│
├── tests/                        # Testes Automatizados
│   ├── backend/                  # Testes JUnit (Apuração fiscal, integridade e Módulo 11)
│   └── frontend/                 # Testes de máscaras, limites de caracteres e validações
│
├── docs/                         # Documentação Técnica e Normativa
│   ├── arquitetura.md            # Arquitetura e Tríade de Segurança (CIA)
│   ├── requisitos-rf01-rf07.md   # Especificação dos Requisitos Funcionais
│   └── memoria-calculo-tributos.md # Regras das tabelas progressivas RGPS 2026
│
├── assets/                       # Identidade visual e logotipo SVG do Euditoria
│   └── logo.svg
│
├── config/                       # Variáveis de ambiente e perfis
│   └── application.env
│
├── data/                         # Dados mockados e tabelas de alíquotas
│   ├── tax-tables/               # Faixas de INSS, deduções de IRRF e FGTS
│   └── xml-samples/              # Exemplos de XMLs válidos e com divergências
│
├── .gitignore                    # Regras de exclusão de artefatos
└── README.md                     # Guia oficial da plataforma
```

---

## 🔒 Diretrizes de Segurança Aplicadas

### Frontend (React)
1. **Limite de Caracteres (`maxLength`)**: Prevenção de ataques de buffer overflow e payloads desnecessariamente volumosos, com contador visual em tempo real nos inputs e textareas (`CharacterCountInput`).
2. **Campos Obrigatórios (`required`)**: Bloqueio de submissão no formulário enquanto o estado da aplicação não estiver 100% consistente.
3. **Máscaras de Entrada Estritas**:
   - CPF: `###.###.###-##` (higienização contra injeção de caracteres especiais e letras).
   - Telefone: `(##) # ####-####` ou `(##) ####-####`.
   - CNPJ: `##.###.###/####-##`.
4. **Tipagem Semântica**: Emprego sistemático de `<input type="email">`, `<input type="date">`, `<input type="file" accept=".xml">` para acionar a validação nativa do navegador antes do envio.

### Backend (Java / Spring Boot)
1. **Confidencialidade**:
   - Tratamento centralizado de falhas via `GlobalExceptionHandler`.
   - Nenhuma chave de API, segredo, caminho interno do servidor ou stack trace é exposto nas respostas de erro do cliente (em conformidade com a RFC 7807).
2. **Integridade**:
   - O servidor **não confia** em valores ou totais enviados pelo cliente.
   - O `TaxCalculationService` recalcula centavo a centavo o INSS (tabela progressiva 2026 com teto), IRRF, FGTS e encargos patronais (20%, RAT e 5,8% de Terceiros). Divergências entre o valor declarado no XML e o calculado são apontadas nos espelhos fiscais.
3. **Disponibilidade**:
   - `RateLimitingFilter`: Limitação de requisições por minuto por organização (IP/Tenant) com resposta HTTP 429 para conter sobrecargas ou abusos.
   - `AsyncConfiguration`: Processamento assíncrono com pool de threads delimitado (`ThreadPoolTaskExecutor`), evitando que o processamento pesado de arquivos derrube o servidor.
4. **Dados 100% Mockados**:
   - Não requer instalação de bancos de dados externos; todo o estado é gerenciado pelo `MockDataStore` em memória com dados ricos e realistas de trabalhadores, lotes e certificados.

---

## 🚀 Requisitos Funcionais Implementados

- **RF01 – Ingestão Automatizada de Lotes**:
  - Upload via Web com arrastar-e-soltar (.xml) e opção de inserção direta de texto.
  - Endpoints REST `POST /api/v1/batches/upload` e `POST /api/v1/batches/raw`.
  - Processamento assíncrono com acompanhamento de tickets (`batchId`).

- **RF02 – Validação Estrutural e Semântica de Leiautes**:
  - Validação técnica de integridade XML com proteção contra ataques XXE.
  - Validação de regras semânticas: dígitos verificadores de CPF e CNPJ via Módulo 11.
  - Checagem de unicidade de identificadores e encadeamento de eventos.

- **RF03 – Motor de Apuração Fiscal de Totalizadores**:
  - Reconstituição matemática dos totalizadores **S-5001** (INSS Segurado), **S-5002** (IRRF), **S-5003** (FGTS Trabalhador), **S-5011** (Patronal, RAT e Terceiros) e **S-5013** (FGTS Consolidado).
  - Espelho de conferência comparando o "Valor Declarado no Lote" vs. "Valor Apurado pelo Servidor", sinalizando divergências em centavos.
  - Simulador fiscal interativo integrado.

- **RF04 – Emissão de Certificados de Conformidade e Protocolos**:
  - Identificador padronizado (Ex: `EUD-2026-CERT-B94A7C1E`).
  - Carimbo criptográfico SHA-256 do lote original.
  - Tela oficial de protocolo e certificado com suporte a impressão e exportação.

- **RF05 – Rastreabilidade da Linha do Tempo Funcional**:
  - Reconstrução cronológica dos eventos de cada trabalhador: Admissão (S-2200) $\rightarrow$ Alterações (S-2206) $\rightarrow$ Afastamentos (S-2230) $\rightarrow$ Desligamento (S-2299).
  - Identificação de quebras de precedência legal (ex: Desligamento sem Admissão prévia, ou pagamentos pós-rescisão).

- **RF06 – Central de Diagnóstico com Editor XML Integrado**:
  - Editor web de código com numeração de linhas e destaque visual dos nós com pendências.
  - Painel lateral detalhando severidade, código do erro e sugestão de correção.
  - Botão **"Reprocessar Imediatamente"** (`POST /api/v1/diagnostics/reprocess`) e atalho de auto-correção sugerida.

- **RF07 – Gestão Multi-tenant e Controle de Cotas (SaaS Multi-tier)**:
  - Planos: *Starter* (100 ev/mês, 30 req/min), *Professional* (5.000 ev/mês, 120 req/min) e *Enterprise* (Ilimitado, 600 req/min).
  - Medidor visual de consumo da cota mensal e taxa de requisições de API em tempo real.

---

## 🛠️ Como Executar

### 1. Executar o Backend (Spring Boot)
No diretório `src/app`:
```powershell
$env:JAVA_HOME = "C:\Users\rhodr\.jdks\openjdk-24.0.1"
& "C:\Program Files\JetBrains\IntelliJ IDEA 2026.1\plugins\maven\lib\maven3\bin\mvn.cmd" spring-boot:run
```
O backend iniciará na porta **8080** (`http://localhost:8080`).

### 2. Executar o Frontend (React / Vite)
No diretório `src/public`:
```powershell
npm run dev
```
O frontend iniciará na porta **3000** (`http://localhost:3000`).

### 3. Executar os Testes Automatizados
- **Testes do Backend (JUnit)**:
  ```powershell
  $env:JAVA_HOME = "C:\Users\rhodr\.jdks\openjdk-24.0.1"
  & "C:\Program Files\JetBrains\IntelliJ IDEA 2026.1\plugins\maven\lib\maven3\bin\mvn.cmd" test -f src/app/pom.xml
  ```
- **Testes do Frontend (Node Test Suite)**:
  ```powershell
  node tests/frontend/security-and-masks.test.js
  ```
---

## 🐳 Execução Simplificada com Docker e Docker Compose

Com o Docker instalado, você pode subir o ecossistema completo (Backend Spring Boot + Frontend React via Nginx) com um único comando:

```bash
docker compose up --build -d
```

### Serviços Inicializados:
| Serviço | Contêiner | Porta Mapeada | Descrição |
|---|---|---|---|
| **Frontend** | `euditoria-frontend` | `http://localhost:3000` | Interface Web servida por Nginx com proxy reverso e cabeçalhos de segurança. |
| **Backend** | `euditoria-backend` | `http://localhost:8080` | API REST Spring Boot (Java 21) com healthcheck ativo e dados mockados. |

### Parar os serviços:
```bash
docker compose down
```