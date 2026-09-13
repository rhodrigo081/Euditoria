import React from 'react';
import { maskCpf, maskCnpj, maskPhone } from '../utils/masks';

/**
 * Componente de Input com Máscara e Proteção de Tipagem (Frontend Security).
 * Impede inserção de caracteres não-numéricos onde não deveriam existir.
 */
export default function MaskedInput({
  label,
  mask = 'cpf',
  value = '',
  onChange,
  required = false,
  placeholder = '',
  disabled = false,
  error = '',
  id,
  name,
}) {
  const inputId = id || name || `masked-${mask}`;

  const handleChange = (e) => {
    let raw = e.target.value;
    let formatted = raw;

    if (mask === 'cpf') formatted = maskCpf(raw);
    else if (mask === 'cnpj') formatted = maskCnpj(raw);
    else if (mask === 'phone') formatted = maskPhone(raw);

    if (onChange) {
      onChange(formatted);
    }
  };

  const getMaxLen = () => {
    if (mask === 'cpf') return 14; // 000.000.000-00
    if (mask === 'cnpj') return 18; // 00.000.000/0000-00
    if (mask === 'phone') return 16; // (00) 0 0000-0000
    return 30;
  };

  return (
    <div class="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} class="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center justify-between">
          <span>{label}</span>
          {required && <span class="text-rose-400 font-bold text-sm">*</span>}
        </label>
      )}
      <input
        id={inputId}
        name={name}
        type="text"
        inputMode="numeric"
        value={value}
        onChange={handleChange}
        required={required}
        placeholder={placeholder || (mask === 'cpf' ? '000.000.000-00' : mask === 'cnpj' ? '00.000.000/0000-00' : '(00) 0 0000-0000')}
        maxLength={getMaxLen()}
        disabled={disabled}
        class={`px-3.5 py-2.5 rounded-lg bg-slate-800/90 border ${
          error ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-700 focus:border-sky-500 focus:ring-sky-500'
        } text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-1 transition-all disabled:opacity-50`}
      />
      {error && <span class="text-xs text-rose-400 font-medium">{error}</span>}
    </div>
  );
}