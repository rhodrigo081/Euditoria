package com.euditoria.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Lob;
import java.math.BigDecimal;

@Embeddable
public class TaxMirror {
    // S-5001: INSS Segurados
    @Column(name = "tax_base_inss", precision = 15, scale = 2)
    private BigDecimal baseCalculoInssSegurado = BigDecimal.ZERO;

    @Column(name = "tax_inss_declarado", precision = 15, scale = 2)
    private BigDecimal inssSeguradoDeclarado = BigDecimal.ZERO;

    @Column(name = "tax_inss_apurado", precision = 15, scale = 2)
    private BigDecimal inssSeguradoApurado = BigDecimal.ZERO;

    @Column(name = "tax_inss_divergencia", precision = 15, scale = 2)
    private BigDecimal divergenciaInssSegurado = BigDecimal.ZERO;

    // S-5002: IRRF
    @Column(name = "tax_base_irrf", precision = 15, scale = 2)
    private BigDecimal baseCalculoIrrf = BigDecimal.ZERO;

    @Column(name = "tax_irrf_declarado", precision = 15, scale = 2)
    private BigDecimal irrfDeclarado = BigDecimal.ZERO;

    @Column(name = "tax_irrf_apurado", precision = 15, scale = 2)
    private BigDecimal irrfApurado = BigDecimal.ZERO;

    @Column(name = "tax_irrf_divergencia", precision = 15, scale = 2)
    private BigDecimal divergenciaIrrf = BigDecimal.ZERO;

    // S-5003: FGTS do Trabalhador
    @Column(name = "tax_base_fgts", precision = 15, scale = 2)
    private BigDecimal baseCalculoFgts = BigDecimal.ZERO;

    @Column(name = "tax_fgts_declarado", precision = 15, scale = 2)
    private BigDecimal fgtsDeclarado = BigDecimal.ZERO;

    @Column(name = "tax_fgts_apurado", precision = 15, scale = 2)
    private BigDecimal fgtsApurado = BigDecimal.ZERO;

    @Column(name = "tax_fgts_divergencia", precision = 15, scale = 2)
    private BigDecimal divergenciaFgts = BigDecimal.ZERO;

    // S-5011: Contribuições Sociais Patronais, RAT e Terceiros
    @Column(name = "tax_patronal_apurada", precision = 15, scale = 2)
    private BigDecimal patronalPrevidenciariaApurada = BigDecimal.ZERO; // 20%

    @Column(name = "tax_rat_apurado", precision = 15, scale = 2)
    private BigDecimal ratApurado = BigDecimal.ZERO; // RAT * FAP

    @Column(name = "tax_terceiros_apurado", precision = 15, scale = 2)
    private BigDecimal outrasEntidadesTerceirosApurado = BigDecimal.ZERO; // 5.8%

    @Column(name = "tax_total_patronal_apurado", precision = 15, scale = 2)
    private BigDecimal totalPatronalApurado = BigDecimal.ZERO;

    // S-5013: FGTS Consolidado Empregador
    @Column(name = "tax_total_fgts_consolidado", precision = 15, scale = 2)
    private BigDecimal totalFgtsConsolidadoApurado = BigDecimal.ZERO;

    @Column(name = "tax_possui_divergencias")
    private boolean possuiDivergencias = false;

    @Lob
    @Column(name = "tax_memoria_calculo", columnDefinition = "TEXT")
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
