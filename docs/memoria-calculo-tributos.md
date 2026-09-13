# Memória de Cálculo Tributário e Previdenciário (eSocial)

## 1. Contribuição Previdenciária do Segurado (INSS - S-5001)
O cálculo é efetuado por faixas progressivas conforme tabela do RGPS (2026):

| Faixa Salarial (R$) | Alíquota | Parcela a Deduzir (R$) |
|---|---|---|
| Até 1.518,00 | 7,5% | - |
| De 1.518,01 até 2.793,88 | 9,0% | 22,77 |
| De 2.793,89 até 4.190,83 | 12,0% | 106,59 |
| De 4.190,84 até 8.157,41 | 14,0% | 190,41 |
| Acima do Teto (8.157,41) | Teto Máximo | R$ 951,63 fixo |

**Fórmula**: `INSS = Base * Alíquota - Parcela a Deduzir` (limitado ao teto).

## 2. Imposto de Renda Retido na Fonte (IRRF - S-5002)
- Base de Cálculo = `Rendimento Bruto Tributável - INSS Descontado - (Dependentes * 189,59) - Pensão Alimentícia`.
- Faixas Progressivas:
  - Até 2.259,20: Isento
  - De 2.259,21 a 2.826,65: 7,5% (dedução R$ 169,44)
  - De 2.826,66 a 3.751,05: 15,0% (dedução R$ 381,44)
  - De 3.751,06 a 4.664,68: 22,5% (dedução R$ 662,77)
  - Acima de 4.664,68: 27,5% (dedução R$ 896,00)

## 3. FGTS (S-5003 / S-5013)
- Alíquota padrão: 8,0% sobre o total da remuneração com incidência de FGTS.
- Jovem Aprendiz: 2,0%.

## 4. Encargos Patronais e Terceiros (S-5011)
- Patronal Previdenciária básica: 20,0% sobre a folha.
- RAT (Risco Ambiental do Trabalho) ajustado: Alíquota RAT (ex: 2%) x FAP.
- Outras Entidades (Terceiros): 5,8% (Salário Educação, INCRA, SENAI/SESI/SENAC/SESC, SEBRAE).
