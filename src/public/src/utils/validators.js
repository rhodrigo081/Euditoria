/**
 * Validações de integridade no frontend antes do envio (Prevenção de estado inconsistente).
 */
import { unmask } from './masks.js';

export function validateCpf(cpf) {
  const clean = unmask(cpf);
  if (clean.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(clean)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(clean.charAt(i), 10) * (10 - i);
  }
  let r1 = 11 - (soma % 11);
  let dig1 = r1 >= 10 ? 0 : r1;

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(clean.charAt(i), 10) * (11 - i);
  }
  let r2 = 11 - (soma % 11);
  let dig2 = r2 >= 10 ? 0 : r2;

  return parseInt(clean.charAt(9), 10) === dig1 && parseInt(clean.charAt(10), 10) === dig2;
}

export function validateEmail(email) {
  if (!email) return false;
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).toLowerCase());
}

export function validateRequired(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}