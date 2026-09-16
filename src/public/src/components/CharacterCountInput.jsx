import React from 'react';


export default function CharacterCountInput({
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

  const handleChange = (e) => {
    const val = e.target.value;
    if (val.length <= maxLength) {
      if (onChange) onChange(val);
    }
  };

  return (
    <div class="flex flex-col gap-1.5 w-full">
      {isTextarea ? (
        <textarea
          id={inputId}
          name={name}
          rows={rows}
          value={value}
          onChange={handleChange}
          required={required}
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