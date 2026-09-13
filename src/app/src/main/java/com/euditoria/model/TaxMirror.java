package com.euditoria.model;

import java.math.BigDecimal;

public class TaxMirror {
    // S-5001: INSS Segurados
    private BigDecimal baseCalculoInssSegurado = BigDecimal.ZERO;
    private BigDecimal inssSeguradoDeclarado = BigDecimal.ZERO;
    private BigDecimal inssSeguradoApurado = BigDecimal.ZERO;
    private BigDecimal divergenciaInssSegurado = BigDecimal.ZERO;

    // S-5002: IRRF
    private BigDecimal baseCalculoIrrf = BigDecimal.ZERO;
    private BigDecimal irrfDeclarado = BigDecimal.ZERO;
    private BigDecimal irrfApurado = BigDecimal.ZERO;
    private BigDecimal divergenciaIrrf = BigDecimal.ZERO;

    // S-5003: FGTS do Trabalhador
    private BigDecimal baseCalculoFgts = BigDecimal.ZERO;
    private BigDecimal fgtsDeclarado = BigDecimal.ZERO;
    private BigDecimal fgtsApurado = BigDecimal.ZERO;
    private BigDecimal divergenciaFgts = BigDecimal.ZERO;

    // S-5011: Contribuições Sociais Patronais, RAT e Terceiros
    private BigDecimal patronalPrevidenciariaApurada = BigDecimal.ZERO; // 20%
    private BigDecimal ratApurado = BigDecimal.ZERO; // RAT * FAP
    private BigDecimal outrasEntidadesTerceirosApurado = BigDecimal.ZERO; // 5.8%
    private BigDecimal totalPatronalApurado = BigDecimal.ZERO;

    // S-5013: FGTS Consolidado Empregador
    private BigDecimal totalFgtsConsolidadoApurado = BigDecimal.ZERO;

    private boolean possuiDivergencias = false;
    private String memoriaCalculoTexto;

    public TaxMirror() {}

    public BigDecimal getBaseCalculoInssSegurado() { return baseCalculoInssSegurado; }
    public void setBaseCalculoInssSegurado(BigDecimal baseCalculoInssSegurado) { this.baseCalculoInssSegurado = baseCalculoInssSegurado; }

    public BigDecimal getInssSeguradoDeclarado() { return inssSeguradoDeclarado; }
    public void setInssSeguradoDeclarado(BigDecimal inssSeguradoDeclarado) { this.inssSeguradoDeclarado = inssSeguradoDeclarado; }

    public BigDecimal getInssSeguradoApurado() { return inssSeguradoApurado; }
    public void setInssSeguradoApurado(BigDecimal inssSeguradoApurado) { this.inssSeguradoApurado = inssSeguradoApurado; }

    public BigDecimal getDivergenciaInssSegurado() { return divergenciaInssSegurado; }
    public void setDivergenciaInssSegurado(BigDecimal divergenciaInssSegurado) { this.divergenciaInssSegurado = divergenciaInssSegurado; }

    public BigDecimal getBaseCalculoIrrf() { return baseCalculoIrrf; }
    public void setBaseCalculoIrrf(BigDecimal baseCalculoIrrf) { this.baseCalculoIrrf = baseCalculoIrrf; }

    public BigDecimal getIrrfDeclarado() { return irrfDeclarado; }
    public void setIrrfDeclarado(BigDecimal irrfDeclarado) { this.irrfDeclarado = irrfDeclarado; }

    public BigDecimal getIrrfApurado() { return irrfApurado; }
    public void setIrrfApurado(BigDecimal irrfApurado) { this.irrfApurado = irrfApurado; }

    public BigDecimal getDivergenciaIrrf() { return divergenciaIrrf; }
    public void setDivergenciaIrrf(BigDecimal divergenciaIrrf) { this.divergenciaIrrf = divergenciaIrrf; }

    public BigDecimal getBaseCalculoFgts() { return baseCalculoFgts; }
    public void setBaseCalculoFgts(BigDecimal baseCalculoFgts) { this.baseCalculoFgts = baseCalculoFgts; }

    public BigDecimal getFgtsDeclarado() { return fgtsDeclarado; }
    public void setFgtsDeclarado(BigDecimal fgtsDeclarado) { this.fgtsDeclarado = fgtsDeclarado; }

    public BigDecimal getFgtsApurado() { return fgtsApurado; }
    public void setFgtsApurado(BigDecimal fgtsApurado) { this.fgtsApurado = fgtsApurado; }

    public BigDecimal getDivergenciaFgts() { return divergenciaFgts; }
    public void setDivergenciaFgts(BigDecimal divergenciaFgts) { this.divergenciaFgts = divergenciaFgts; }

    public BigDecimal getPatronalPrevidenciariaApurada() { return patronalPrevidenciariaApurada; }
    public void setPatronalPrevidenciariaApurada(BigDecimal patronalPrevidenciariaApurada) { this.patronalPrevidenciariaApurada = patronalPrevidenciariaApurada; }

    public BigDecimal getRatApurado() { return ratApurado; }
    public void setRatApurado(BigDecimal ratApurado) { this.ratApurado = ratApurado; }

    public BigDecimal getOutrasEntidadesTerceirosApurado() { return outrasEntidadesTerceirosApurado; }
    public void setOutrasEntidadesTerceirosApurado(BigDecimal outrasEntidadesTerceirosApurado) { this.outrasEntidadesTerceirosApurado = outrasEntidadesTerceirosApurado; }

    public BigDecimal getTotalPatronalApurado() { return totalPatronalApurado; }
    public void setTotalPatronalApurado(BigDecimal totalPatronalApurado) { this.totalPatronalApurado = totalPatronalApurado; }

    public BigDecimal getTotalFgtsConsolidadoApurado() { return totalFgtsConsolidadoApurado; }
    public void setTotalFgtsConsolidadoApurado(BigDecimal totalFgtsConsolidadoApurado) { this.totalFgtsConsolidadoApurado = totalFgtsConsolidadoApurado; }

    public boolean isPossuiDivergencias() { return possuiDivergencias; }
    public void setPossuiDivergencias(boolean possuiDivergencias) { this.possuiDivergencias = possuiDivergencias; }

    public String getMemoriaCalculoTexto() { return memoriaCalculoTexto; }
    public void setMemoriaCalculoTexto(String memoriaCalculoTexto) { this.memoriaCalculoTexto = memoriaCalculoTexto; }
}
