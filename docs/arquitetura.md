# Arquitetura e Governança do Euditoria

## 1. Visão Geral
O **Euditoria** é uma solução de auditoria prévia de arquivos e lotes eSocial projetada sob os pilares da Tríade CIA (Confidencialidade, Integridade e Disponibilidade) e alinhada ao manual de orientação do eSocial (MOS).

```
+-------------------------------------------------------------+
|                      Frontend (React)                       |
|  - Inputs Tipados (email, tel, text)                        |
|  - Máscaras Estritas (CPF, CNPJ, Telefone)                  |
|  - Limite de Caracteres & Validação de Estado               |
|  - Editor XML com Diagnóstico Visual e Linha do Tempo       |
+------------------------------+------------------------------+
                               | HTTPS / JSON / XML
                               v
+-------------------------------------------------------------+
|               Backend (Java / Spring Boot)                  |
|                                                             |
| [Segurança & Disponibilidade]                                |
|  - RateLimitingFilter (Proteção contra sobrecarga/DoS)      |
|  - ThreadPoolTaskExecutor (Processamento Assíncrono Seguro) |
|  - GlobalExceptionHandler (RFC 7807 - Sem vazamento de chaves)|
|                                                             |
| [Pipeline de Validação & Integridade]                       |
|  - Validador Estrutural & Semântico XSD (RF02)              |
|  - Validador Módulo 11 (CPF/CNPJ)                           |
|  - Motor de Apuração Fiscal de Rubricas (RF03)              |
|  - Rastreador de Linha do Tempo e Precedência Legal (RF05)  |
|  - Emissor de Certificados SHA-256 e Protocolos (RF04)      |
|  - Gestor Multi-Tenant e Cotas por Tier (RF07)              |
+-------------------------------------------------------------+
```

## 2. Pilares de Segurança

### 2.1 Confidencialidade
- O backend intercepta todas as falhas por meio do `GlobalExceptionHandler`.
- Respostas de erro nunca expõem stack traces, credenciais de banco, nomes de pacotes internos ou chaves de API.
- Respostas de erro seguem o padrão Problem Details com códigos amigáveis.

### 2.2 Integridade
- Princípio da **Não-Confiança no Cliente**: valores de bases de cálculo, alíquotas e totalizadores calculados no cliente são solenemente ignorados pelo servidor.
- O backend recalcula cada tributo individualmente baseado nas rubricas declaradas e tabelas vigentes. Qualquer divergência entre o valor declarado e o apurado é apontada no espelho de conferência.

### 2.3 Disponibilidade
- **Rate Limiting**: Controle de requisições por minuto implementado via filtro de requisições, rejeitando chamadas excessivas com HTTP 429.
- **Processamento Assíncrono com Fila Delimitada**: Ingestão de lotes despachada para threads controladas, evitando travamentos do servidor.
