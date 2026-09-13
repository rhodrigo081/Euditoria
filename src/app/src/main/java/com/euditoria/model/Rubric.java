package com.euditoria.model;

import java.math.BigDecimal;

public class Rubric {
    private String codRubr;
    private String ideTabRubr;
    private String dscRubr;
    private BigDecimal vrRubr;
    private int tpRubr; // 1 = Vencimento/Provento, 2 = Desconto, 3 = Informativa
    private String codIncCP; // Previdência Social
    private String codIncIRRF; // IRRF
    private String codIncFGTS; // FGTS

    public Rubric() {}

    public Rubric(String codRubr, String ideTabRubr, String dscRubr, BigDecimal vrRubr, int tpRubr, String codIncCP, String codIncIRRF, String codIncFGTS) {
        this.codRubr = codRubr;
        this.ideTabRubr = ideTabRubr;
        this.dscRubr = dscRubr;
        this.vrRubr = vrRubr;
        this.tpRubr = tpRubr;
        this.codIncCP = codIncCP;
        this.codIncIRRF = codIncIRRF;
        this.codIncFGTS = codIncFGTS;
    }

    public String getCodRubr() { return codRubr; }
    public void setCodRubr(String codRubr) { this.codRubr = codRubr; }

    public String getIdeTabRubr() { return ideTabRubr; }
    public void setIdeTabRubr(String ideTabRubr) { this.ideTabRubr = ideTabRubr; }

    public String getDscRubr() { return dscRubr; }
    public void setDscRubr(String dscRubr) { this.dscRubr = dscRubr; }

    public BigDecimal getVrRubr() { return vrRubr; }
    public void setVrRubr(BigDecimal vrRubr) { this.vrRubr = vrRubr; }

    public int getTpRubr() { return tpRubr; }
    public void setTpRubr(int tpRubr) { this.tpRubr = tpRubr; }

    public String getCodIncCP() { return codIncCP; }
    public void setCodIncCP(String codIncCP) { this.codIncCP = codIncCP; }

    public String getCodIncIRRF() { return codIncIRRF; }
    public void setCodIncIRRF(String codIncIRRF) { this.codIncIRRF = codIncIRRF; }

    public String getCodIncFGTS() { return codIncFGTS; }
    public void setCodIncFGTS(String codIncFGTS) { this.codIncFGTS = codIncFGTS; }
}
