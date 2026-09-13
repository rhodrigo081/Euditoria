import React from 'react';

/**
 * Componente com Limite Rigoroso de Caracteres para Prevenção de Buffer Overflow e Spam (Frontend Security).
 */
export default function CharacterCountInput({
  label,
  value = '',
  onChange,
  maxLength = 100,
  required = false,
  type = 'text',
  placeholder = '',
  isTextarea = false,
  rows = 4,
  error = '',
  helperText = '',
  id,
  name,
}) {
  const inputId = id || name || 'char-input';
  const currentLength = (value || '').length;
  const remaining = maxLength - currentLength;
  const isNearLimit = remaining <= maxLength * 0.15;

  const handleChange = (e) => {
    const val = e.target.value;
    if (val.length <= maxLength) {
      if (onChange) onChange(val);
    }
  };

  return (
    <div class="flex flex-col gap-1.5 w-full">
      <div class="flex items-center justify-between">
        {label && (
          <label htmlFor={inputId} class="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1">
            <span>{label}</span>
            {required && <span class="text-rose-400 font-bold">*</span>}
          </label>
        )}
        <span
          class={`text-[11px] font-mono px-2 py-0.5 rounded ${
            isNearLimit ? 'bg-amber-950 text-amber-300 font-bold border border-amber-800' : 'text-slate-400 bg-slate-800'
          }`}
        >
          {currentLength} / {maxLength}
        </span>
      </div>

      {isTextarea ? (
        <textarea
          id={inputId}
          name={name}
          rows={rows}
          value={value}
          onChange={handleChange}
          required={required}
          maxLength={maxLength}
          placeholder={placeholder}
          class={`px-3.5 py-2.5 rounded-lg bg-slate-800/90 border font-mono text-xs ${
            error ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-700 focus:border-sky-500 focus:ring-sky-500'
          } text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 transition-all resize-none`}
        />
      ) : (
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={handleChange}
          required={required}
          maxLength={maxLength}
          placeholder={placeholder}
          class={`px-3.5 py-2.5 rounded-lg bg-slate-800/90 border ${
            error ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-700 focus:border-sky-500 focus:ring-sky-500'
          } text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-1 transition-all`}
        />
      )}

      <div class="flex items-center justify-between min-h-[16px]">
        {error ? (
          <span class="text-xs text-rose-400 font-medium">{error}</span>
        ) : helperText ? (
          <span class="text-xs text-slate-400">{helperText}</span>
        ) : <span />}
      </div>
    </div>
  );
}