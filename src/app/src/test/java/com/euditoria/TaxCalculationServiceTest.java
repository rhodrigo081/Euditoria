package com.euditoria;

import com.euditoria.model.TaxMirror;
import com.euditoria.service.TaxCalculationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

public class TaxCalculationServiceTest {

    private TaxCalculationService taxCalculationService;

    @BeforeEach
    public void setup() {
        taxCalculationService = new TaxCalculationService();
    }

    @Test
    @DisplayName("Deve calcular o INSS progressivo na 1a faixa (7,5%)")
    public void testInssFaixa1() {
        BigDecimal salario = new BigDecimal("1500.00");
        BigDecimal inss = taxCalculationService.calculateInssProgressivo(salario);
        // 1500 * 0.075 = 112.50
        assertEquals(new BigDecimal("112.50"), inss);
    }

    @Test
    @DisplayName("Deve limitar o INSS ao teto máximo da previdência (R$ 951,63)")
    public void testInssTeto() {
        BigDecimal salarioAlto = new BigDecimal("15000.00");
        BigDecimal inss = taxCalculationService.calculateInssProgressivo(salarioAlto);
        assertEquals(new BigDecimal("951.63"), inss);
    }

    @Test
    @DisplayName("Deve calcular o FGTS padrão de 8%")
    public void testFgtsGeral() {
        BigDecimal salario = new BigDecimal("5000.00");
        BigDecimal fgts = taxCalculationService.calculateFgts(salario, false);
        assertEquals(new BigDecimal("400.00"), fgts);
    }

    @Test
    @DisplayName("Deve acusar divergência quando valor declarado diferir da apuração oficial do servidor")
    public void testIntegridadeDivergencia() {
        BigDecimal salario = new BigDecimal("5000.00");
        BigDecimal inssSubfaturado = new BigDecimal("200.00"); // Deveria ser muito maior

        TaxMirror mirror = taxCalculationService.generateTaxMirror(salario, inssSubfaturado, BigDecimal.ZERO, new BigDecimal("400.00"));
        assertTrue(mirror.isPossuiDivergencias(), "O servidor deve detectar a tentativa de subfaturamento do INSS.");
        assertTrue(mirror.getDivergenciaInssSegurado().compareTo(BigDecimal.ZERO) < 0);
    }
}
