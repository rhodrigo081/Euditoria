# Termos de Serviço e Política de Privacidade e Proteção de Dados (LGPD)
**Plataforma Euditoria – Auditoria Preventiva & Governança eSocial**  
*Versão 2026.1 – Vigência a partir de 14 de setembro de 2026*  
*Em total conformidade com a Lei Federal nº 13.709/2018 (LGPD), Marco Civil da Internet (Lei nº 12.965/2014) e Normativas do Ambiente Nacional do eSocial.*

---

## 1. Objeto e Definições Gerais

### 1.1. Objeto
O presente instrumento regula as condições gerais de contratação, acesso e uso dos serviços providos pela **EUDITORIA GOVERNANÇA DIGITAL LTDA.** ("Euditoria" ou "Plataforma"), englobando:
- Ingestão, validação estrutural XSD e semântica de lotes de eventos do eSocial;
- Recálculo e conferência matemática de totalizadores tributários (S-5001, S-5002, S-5003, S-5011, S-5013);
- Gestão de folhas de pagamento e demonstrativos de remunerações por competência;
- Emissão de certificados e protocolos auditáveis com carimbo criptográfico SHA-256;
- Operação em nome próprio (Titular) ou mediante outorga de procuração eletrônica (Procurador).

### 1.2. Definições Relevantes (Art. 5º da LGPD)
- **Dado Pessoal**: Qualquer informação relacionada a pessoa natural identificada ou identificável (ex.: CPF, Nome, Matrícula, Salário, Cargo).
- **Dado Pessoal Sensível**: Dados que revelem origem racial, convicção religiosa, dados de saúde (ex.: laudos em eventos S-2220/S-2240 de SST) ou filiação a sindicato.
- **Titular**: A pessoa natural a quem se referem os dados pessoais que são objeto de tratamento (trabalhadores, colaboradores, estagiários, sócios ou procuradores).
- **Controlador**: A pessoa física ou jurídica que contrata a Euditoria e a quem competem as decisões referentes ao tratamento dos dados pessoais de seus funcionários e colaboradores (a "Empresa Usuária").
- **Operador**: A Euditoria, que realiza o tratamento de dados pessoais em nome e sob as instruções estritas do Controlador para fins exclusivos de auditoria fiscal e conformidade trabalhista.
- **Encarregado (DPO)**: Pessoa indicada pela Euditoria para atuar como canal de comunicação entre o Controlador, os titulares dos dados e a Autoridade Nacional de Proteção de Dados (ANPD).

---

## 2. Divisão de Papéis e Responsabilidades (Art. 39 a 44 da LGPD)

### 2.1. Da Empresa Usuária (Controladora)
A Empresa Usuária declara e garante que:
1. Possui base legal válida perante a LGPD para a coleta e o compartilhamento dos dados dos seus empregados e prestadores de serviço com a Euditoria, em especial:
   - **Cumprimento de obrigação legal ou regulatória** pelo controlador (Art. 7º, II e Art. 11, II, "a" da LGPD) decorrente das obrigações do eSocial, Consolidação das Leis do Trabalho (CLT), Lei nº 8.212/1991 e Instruções Normativas da Receita Federal do Brasil;
   - **Execução regular de contrato de trabalho** (Art. 7º, V da LGPD);
   - **Legítimo interesse do controlador** para salvaguarda patrimonial e prevenção a fraudes fiscais (Art. 7º, IX da LGPD).
2. Na hipótese de acesso na qualidade de **Procurador**, possui procuração eletrônica válida e eficaz outorgada pelo titular dos dados fiscais no e-CAC/RFB, respondendo civil e penalmente por qualquer excesso ou falsidade de mandato.

### 2.2. Da Euditoria (Operadora)
A Euditoria compromete-se a:
1. Tratar os dados estritamente para o cumprimento das finalidades pactuadas, vedado o uso para finalidades comerciais próprias, publicidade, comercialização ou cessão a terceiros;
2. Manter registro das operações de tratamento de dados que realizar (Art. 37 da LGPD);
3. Garantir a confidencialidade e o sigilo absoluto de todos os dados trafegados e processados;
4. Adotar medidas de segurança técnicas e administrativas aptas a proteger os dados de acessos não autorizados e de situações acidentais ou ilícitas.

---

## 3. Segurança da Informação, Criptografia e Blindagem Técnica

Em cumprimento ao Art. 46 da LGPD, a Euditoria implementa salvaguardas técnicas de ponta:

1. **Criptografia em Trânsito e em Repouso**:
   - Todo tráfego de rede é protegido por TLS 1.3 com suites criptográficas modernas;
   - As credenciais e dados em repouso no Supabase/PostgreSQL são criptografados com algoritmo AES-256;
2. **Carimbo Criptográfico de Integridade (SHA-256)**:
   - Cada lote XML auditado recebe uma assinatura hash SHA-256 única e irreversível, assegurando a rastreabilidade e imutabilidade dos resultados perante órgãos fiscalizadores;
3. **Isolamento Lógico Multi-Tenant**:
   - Cada organização possui isolamento estrito de dados (Row Level Security - RLS) ativado no banco de dados, impedindo que dados de uma empresa sejam acessados por outra;
4. **Blindagem de Erros e Logs (RFC 7807)**:
   - Respostas de erro são padronizadas e higienizadas para não expor stacktraces, estruturas internas de tabelas ou fragmentos de dados privados;
5. **Rate-Limiting Ativo (Prevenção de DoS)**:
   - Limitação preventiva de requisições por minuto (RPM) por tenant, garantindo alta disponibilidade contínua dos serviços.

---

## 4. Direitos dos Titulares e Atendimento a Solicitações (Art. 18 da LGPD)

Os titulares dos dados têm direito de solicitar:
- Confirmação da existência de tratamento;
- Acesso aos dados;
- Correção de dados incompletos, inexatos ou desatualizados;
- Anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos;
- Portabilidade dos dados;
- Informação das entidades públicas e privadas com as quais o controlador realizou uso compartilhado de dados.

### 4.1. Canal do Encarregado de Proteção de Dados (DPO)
Para exercer seus direitos ou esclarecer dúvidas sobre o tratamento de dados pessoais, o titular ou o Controlador poderá entrar em contato direto com o nosso Encarregado de Proteção de Dados:
- **Encarregado (DPO)**: Departamento de Segurança da Informação e Conformidade LGPD
- **E-mail Oficial**: `dpo@euditoria.com.br`
- **Prazo de Resposta**: Até 15 (quinze) dias úteis, conforme estipulado pelo Art. 19, II da LGPD.

---

## 5. Ciclo de Vida, Retenção e Descarte de Dados

1. **Prazo de Retenção Legal**:
   - Os dados e históricos de lotes auditados são mantidos pelo período mínimo necessário ao cumprimento das obrigações fiscais e trabalhistas ou conforme o plano contratado (de 30 dias até 5 anos, prazo prescricional para auditorias fiscais conforme Art. 174 do Código Tributário Nacional).
2. **Descarte Seguro**:
   - Encerrado o período de retenção ou rescindido o contrato entre as partes, os dados serão eliminados ou anonimizados irreversivelmente dos servidores, ressalvadas as hipóteses de guarda obrigatória por dever legal ou regulatório.

---

## 6. Alterações destes Termos

A Euditoria reserva-se o direito de atualizar este instrumento periodicamente para refletir evoluções tecnológicas, atualizações nos esquemas do eSocial ou alterações legislativas na LGPD. Modificações substantivas serão notificadas aos usuários cadastrados via e-mail e mediante aviso na plataforma antes de sua entrada em vigor.

---

## 7. Foro de Eleição

Para dirimir eventuais controvérsias oriundas deste Termo, as partes elegem o Foro da Comarca da sede da Euditoria, com expressa renúncia a qualquer outro, por mais privilegiado que seja, ressalvada a competência regulatória da Autoridade Nacional de Proteção de Dados (ANPD).
