package com.euditoria.service;

import org.springframework.stereotype.Service;

@Service
public class BusinessRuleService {

    /**
     * Validação rigorosa de CPF via algoritmo oficial do Módulo 11.
     */
    public boolean isValidCpf(String cpf) {
        if (cpf == null) return false;
        String clean = cpf.replaceAll("\\D", "");
        if (clean.length() != 11) return false;

        // Rejeita sequências repetidas como 11111111111, 00000000000, etc.
        if (clean.matches("(\\d)\\1{10}")) return false;

        try {
            int soma = 0;
            for (int i = 0; i < 9; i++) {
                soma += (clean.charAt(i) - '0') * (10 - i);
            }
            int r1 = 11 - (soma % 11);
            int dig1 = (r1 >= 10) ? 0 : r1;

            soma = 0;
            for (int i = 0; i < 10; i++) {
                soma += (clean.charAt(i) - '0') * (11 - i);
            }
            int r2 = 11 - (soma % 11);
            int dig2 = (r2 >= 10) ? 0 : r2;

            return (clean.charAt(9) - '0' == dig1) && (clean.charAt(10) - '0' == dig2);
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Validação rigorosa de CNPJ via algoritmo oficial do Módulo 11.
     */
    public boolean isValidCnpj(String cnpj) {
        if (cnpj == null) return false;
        String clean = cnpj.replaceAll("\\D", "");
        if (clean.length() != 14) return false;

        if (clean.matches("(\\d)\\1{13}")) return false;

        try {
            int[] pesos1 = {5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
            int soma = 0;
            for (int i = 0; i < 12; i++) {
                soma += (clean.charAt(i) - '0') * pesos1[i];
            }
            int r1 = soma % 11;
            int dig1 = (r1 < 2) ? 0 : (11 - r1);

            int[] pesos2 = {6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
            soma = 0;
            for (int i = 0; i < 13; i++) {
                soma += (clean.charAt(i) - '0') * pesos2[i];
            }
            int r2 = soma % 11;
            int dig2 = (r2 < 2) ? 0 : (11 - r2);

            return (clean.charAt(12) - '0' == dig1) && (clean.charAt(13) - '0' == dig2);
        } catch (Exception e) {
            return false;
        }
    }
}
