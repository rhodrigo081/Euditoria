# Especificação de Requisitos Funcionais (RF01 a RF07)

### RF01 – Ingestão Automatizada de Lotes
- Endpoints REST para recepção de arquivos XML individuais ou em lotes compactados.
- Fila assíncrona com geração imediata de ticket de rastreamento (`batchId`).
- Acompanhamento de progresso com status `RECEIVED`, `VALIDATING`, `CALCULATING`, `COMPLIANT`, `NON_COMPLIANT`.

### RF02 – Validação Estrutural e Semântica de Leiautes
- Validação técnica da estrutura do XML contra esquemas oficiais.
- Validação semântica: algoritmo Módulo 11 para CPFs e CNPJs.
- Checagem de unicidade do atributo `Id` do evento e consistência do tipo de ambiente.

### RF03 – Motor de Apuração Fiscal de Totalizadores
- Reconstituição analítica de totalizadores:
  - **S-5001**: Contribuições sociais por trabalhador (INSS Segurado).
  - **S-5002**: IRRF por trabalhador.
  - **S-5003**: FGTS por trabalhador.
  - **S-5011**: Informações das contribuições sociais consolidadas por contribuinte (Patronal, RAT e Terceiros).
  - **S-5013**: FGTS consolidado do empregador.
- Confronto automático: Valor Declarado vs. Valor Apurado pelo Euditoria, gerando alertas de divergência.

### RF04 – Emissão de Certificados de Conformidade e Protocolos
- Para lotes 100% íntegros:
  - Emissão de Certificado Técnico com ID padrão (ex: `EUD-2026-CERT-XXXX`).
  - Hash criptográfico SHA-256 do lote auditado.
  - Protocolo oficial de conferência prévia para resguardo jurídico.

### RF05 – Rastreabilidade da Linha do Tempo Funcional
- Reconstrução da trajetória cronológica por CPF:
  - S-2200 (Admissão) -> S-2205 (Alteração Cadastral) -> S-2206 (Alteração Contratual) -> S-2230 (Afastamento) -> S-2299 (Desligamento).
- Detecção de inconsistências de precedência:
  - Desligamento sem admissão.
  - Afastamento sobreposto a outro período já ativo.
  - Pagamento posterior ao desligamento sem respaldo rescisório.

### RF06 – Central de Diagnóstico com Editor XML Integrado
- Editor web integrado com destaque para linhas com erros ou avisos.
- Descrição da irregularidade, tag XML causadora e sugestão de correção.
- Botão "Reprocessar Imediatamente" para validação em tempo de edição.

### RF07 – Gestão Multi-tenant e Controle de Cotas
- Gestão de múltiplos tenants (organizações):
  - **Starter**: 100 eventos/mês, 30 req/min, retenção de 30 dias.
  - **Professional**: 5.000 eventos/mês, 120 req/min, retenção de 1 ano.
  - **Enterprise**: Ilimitado, 600 req/min, retenção de 5 anos.
- Bloqueio ou alerta caso o limite de eventos ou a taxa de requisições por minuto seja ultrapassada.
