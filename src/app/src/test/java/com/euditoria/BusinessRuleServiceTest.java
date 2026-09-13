package com.euditoria;

import com.euditoria.service.BusinessRuleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class BusinessRuleServiceTest {

    private BusinessRuleService businessRuleService;

    @BeforeEach
    public void setup() {
        businessRuleService = new BusinessRuleService();
    }

    @Test
    @DisplayName("Deve validar CPF válido pelo Módulo 11")
    public void testValidCpf() {
        assertTrue(businessRuleService.isValidCpf("52998224725"));
        assertTrue(businessRuleService.isValidCpf("12345678909"));
    }

    @Test
    @DisplayName("Deve rejeitar CPF com dígitos verificadores inválidos ou repetidos")
    public void testInvalidCpf() {
        assertFalse(businessRuleService.isValidCpf("11122233344"));
        assertFalse(businessRuleService.isValidCpf("11111111111"));
        assertFalse(businessRuleService.isValidCpf("12345678900"));
    }

    @Test
    @DisplayName("Deve validar CNPJ de 14 dígitos pelo Módulo 11")
    public void testValidCnpj() {
        assertTrue(businessRuleService.isValidCnpj("12345678000195"));
    }
}
