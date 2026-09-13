package com.euditoria.service;

import com.euditoria.model.TaxMirror;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Motor de Apuração Fiscal do Euditoria.
 * Garante a INTEGRIDADE: nunca confia nos totais enviados pelo cliente ou no lote bruto.
 * Recalcula todas as bases, alíquotas e tributos estritamente no servidor.
 */
@Service
public class TaxCalculationService {

    private static final BigDecimal TETO_INSS_2026 = new BigDecimal("8157.41");
    private static final BigDecimal TETO_VALOR_INSS_2026 = new BigDecimal("951.63");

    /**
     * Calcula o INSS progressivo do trabalhador (S-5001).
     */
    public BigDecimal calculateInssProgressivo(BigDecimal salarioBruto) {
        if (salarioBruto == null || salarioBruto.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal base = salarioBruto.min(TETO_INSS_2026);
        BigDecimal inss;

        if (base.compareTo(new BigDecimal("1518.00")) <= 0) {
            inss = base.multiply(new BigDecimal("0.075"));
        } else if (base.compareTo(new BigDecimal("2793.88")) <= 0) {
            inss = base.multiply(new BigDecimal("0.09")).subtract(new BigDecimal("22.77"));
        } else if (base.compareTo(new BigDecimal("4190.83")) <= 0) {
            inss = base.multiply(new BigDecimal("0.12")).subtract(new BigDecimal("106.59"));
        } else {
            inss = base.multiply(new BigDecimal("0.14")).subtract(new BigDecimal("190.41"));
        }

        return inss.min(TETO_VALOR_INSS_2026).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Calcula o IRRF com dedução de INSS (S-5002).
     */
    public BigDecimal calculateIrrf(BigDecimal rendimentoBruto, BigDecimal inssDescontado, int dependentes) {
        if (rendimentoBruto == null || rendimentoBruto.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal deducaoDependentes = new BigDecimal("189.59").multiply(BigDecimal.valueOf(dependentes));
        BigDecimal baseCalculo = rendimentoBruto.subtract(inssDescontado).subtract(deducaoDependentes);

        if (baseCalculo.compareTo(new BigDecimal("2259.20")) <= 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal irrf;
        if (baseCalculo.compareTo(new BigDecimal("2826.65")) <= 0) {
            irrf = baseCalculo.multiply(new BigDecimal("0.075")).subtract(new BigDecimal("169.44"));
        } else if (baseCalculo.compareTo(new BigDecimal("3751.05")) <= 0) {
            irrf = baseCalculo.multiply(new BigDecimal("0.15")).subtract(new BigDecimal("381.44"));
        } else if (baseCalculo.compareTo(new BigDecimal("4664.68")) <= 0) {
            irrf = baseCalculo.multiply(new BigDecimal("0.225")).subtract(new BigDecimal("662.77"));
        } else {
            irrf = baseCalculo.multiply(new BigDecimal("0.275")).subtract(new BigDecimal("896.00"));
        }

        return irrf.max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Calcula o FGTS (S-5003).
     */
    public BigDecimal calculateFgts(BigDecimal remuneracaoTributavel, boolean isAprendiz) {
        if (remuneracaoTributavel == null || remuneracaoTributavel.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        BigDecimal taxa = isAprendiz ? new BigDecimal("0.02") : new BigDecimal("0.08");
        return remuneracaoTributavel.multiply(taxa).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Estrutura o espelho completo de conferência de totalizadores (RF03).
     */
    public TaxMirror generateTaxMirror(BigDecimal baseSalarial, BigDecimal inssDeclarado, BigDecimal irrfDeclarado, BigDecimal fgtsDeclarado) {
        TaxMirror mirror = new TaxMirror();

        BigDecimal base = (baseSalarial != null) ? baseSalarial : BigDecimal.ZERO;
        mirror.setBaseCalculoInssSegurado(base);
        mirror.setBaseCalculoIrrf(base);
        mirror.setBaseCalculoFgts(base);

        // Apuração Servidor
        BigDecimal inssApurado = calculateInssProgressivo(base);
        BigDecimal irrfApurado = calculateIrrf(base, inssApurado, 0);
        BigDecimal fgtsApurado = calculateFgts(base, false);

        // Patronal (S-5011)
        BigDecimal patronalBase = base.multiply(new BigDecimal("0.20")).setScale(2, RoundingMode.HALF_UP); // 20%
        BigDecimal rat = base.multiply(new BigDecimal("0.02")).setScale(2, RoundingMode.HALF_UP); // 2%
        BigDecimal terceiros = base.multiply(new BigDecimal("0.058")).setScale(2, RoundingMode.HALF_UP); // 5.8%
        BigDecimal totalPatronal = patronalBase.add(rat).add(terceiros);

        mirror.setInssSeguradoApurado(inssApurado);
        mirror.setInssSeguradoDeclarado(inssDeclarado != null ? inssDeclarado : BigDecimal.ZERO);
        mirror.setDivergenciaInssSegurado(mirror.getInssSeguradoDeclarado().subtract(inssApurado));

        mirror.setIrrfApurado(irrfApurado);
        mirror.setIrrfDeclarado(irrfDeclarado != null ? irrfDeclarado : BigDecimal.ZERO);
        mirror.setDivergenciaIrrf(mirror.getIrrfDeclarado().subtract(irrfApurado));

        mirror.setFgtsApurado(fgtsApurado);
        mirror.setFgtsDeclarado(fgtsDeclarado != null ? fgtsDeclarado : BigDecimal.ZERO);
        mirror.setDivergenciaFgts(mirror.getFgtsDeclarado().subtract(fgtsApurado));

        mirror.setPatronalPrevidenciariaApurada(patronalBase);
        mirror.setRatApurado(rat);
        mirror.setOutrasEntidadesTerceirosApurado(terceiros);
        mirror.setTotalPatronalApurado(totalPatronal);
        mirror.setTotalFgtsConsolidadoApurado(fgtsApurado);

        boolean divergente = mirror.getDivergenciaInssSegurado().abs().compareTo(new BigDecimal("0.02")) > 0 ||
                             mirror.getDivergenciaIrrf().abs().compareTo(new BigDecimal("0.02")) > 0 ||
                             mirror.getDivergenciaFgts().abs().compareTo(new BigDecimal("0.02")) > 0;

        mirror.setPossuiDivergencias(divergente);

        if (divergente) {
            mirror.setMemoriaCalculoTexto(String.format(
                    "ALERTA DE INTEGRIDADE: Divergência encontrada entre os valores declarados no lote e o cálculo oficial do servidor. " +
                    "Divergência INSS: R$ %s | Divergência IRRF: R$ %s | Divergência FGTS: R$ %s.",
                    mirror.getDivergenciaInssSegurado(), mirror.getDivergenciaIrrf(), mirror.getDivergenciaFgts()));
        } else {
            mirror.setMemoriaCalculoTexto("CONFORMIDADE FISCAL INTEGRAL: Valores declarados coincidem rigorosamente com a apuração progressiva oficial do Euditoria.");
        }

        return mirror;
    }
}
