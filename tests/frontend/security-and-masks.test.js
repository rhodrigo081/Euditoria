// Teste automatizado de validações e máscaras do frontend
import assert from 'node:assert';
import { maskCpf, maskCnpj, maskPhone, unmask } from '../../src/public/src/utils/masks.js';
import { validateCpf, validateEmail, validateRequired } from '../../src/public/src/utils/validators.js';

console.log('--- Iniciando Testes Automatizados de Segurança & Máscaras (Frontend) ---');

// 1. Testes de Higienização e Máscaras
assert.strictEqual(unmask('123.456.789-01'), '12345678901', 'unmask deve extrair apenas dígitos');
assert.strictEqual(maskCpf('52998224725'), '529.982.247-25', 'Máscara de CPF deve formatar ###.###.###-##');
assert.strictEqual(maskPhone('11987654321'), '(11) 9 8765-4321', 'Máscara de telefone deve formatar (##) # ####-####');
assert.strictEqual(maskCnpj('12345678000195'), '12.345.678/0001-95', 'Máscara de CNPJ deve formatar ##.###.###/####-##');

// Prevenção de caracteres não-numéricos (Security)
assert.strictEqual(maskCpf('529abc982def247!@#25'), '529.982.247-25', 'Máscara deve eliminar caracteres especiais e letras inseridas maliciosamente');

// 2. Validação Módulo 11
assert.strictEqual(validateCpf('529.982.247-25'), true, 'CPF válido deve passar');
assert.strictEqual(validateCpf('111.222.333-44'), false, 'CPF com dígito verificador inválido deve falhar');
assert.strictEqual(validateCpf('111.111.111-11'), false, 'CPF com dígitos repetidos deve falhar');

// 3. Tipagem e Validação de E-mail
assert.strictEqual(validateEmail('auditor@empresa.com.br'), true, 'Email válido');
assert.strictEqual(validateEmail('invalido@com'), false, 'Email sem TLD válido deve falhar');

// 4. Campos Obrigatórios
assert.strictEqual(validateRequired(''), false, 'String vazia deve falhar em required');
assert.strictEqual(validateRequired('   '), false, 'Apenas espaços deve falhar em required');
assert.strictEqual(validateRequired('Carlos Silva'), true, 'Texto preenchido deve passar');

console.log('✔ Todos os 9 testes de Frontend (Máscaras, Validações e Limites) passaram com 100% de sucesso!');