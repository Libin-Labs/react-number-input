'use client';
import { useEffect, useId, useMemo, useState } from 'react';
export function roundNumber(value: number, precision: number) {
  if (!Number.isFinite(value) || !Number.isInteger(precision) || precision < 0 || precision > 12)
    throw new RangeError('Finite value and precision0..12 required.');
  const factor = 10 ** precision;
  if (Math.abs(value) * factor > Number.MAX_SAFE_INTEGER)
    throw new RangeError('Value exceeds safe decimal precision.');
  const rounded =
    (Math.sign(value) * Math.round((Math.abs(value) + Number.EPSILON) * factor)) / factor;
  return Object.is(rounded, -0) ? 0 : rounded;
}
export function parseLocaleNumber(text: string, locale: string): number | null {
  if (text.length > 128) throw new RangeError('Numeric text too long.');
  if (!text.trim()) return null;
  const format = new Intl.NumberFormat(locale);
  const parts = format.formatToParts(-12345.6);
  const group = parts.find((part) => part.type === 'group')?.value;
  const decimal = parts.find((part) => part.type === 'decimal')?.value ?? '.';
  const minus = parts.find((part) => part.type === 'minusSign')?.value ?? '-';
  let normalized = text.trim().replaceAll(minus, '-');
  for (let digit = 0; digit < 10; digit += 1)
    normalized = normalized.replaceAll(
      new Intl.NumberFormat(locale, { useGrouping: false }).format(digit),
      String(digit),
    );
  if (group) normalized = normalized.replaceAll(group, '');
  normalized = normalized.replaceAll(decimal, '.').replace(/[\u200e\u200f\u061c]/g, '');
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized))
    throw new TypeError('Invalid locale number.');
  const value = Number(normalized);
  if (!Number.isFinite(value)) throw new RangeError('Number is not finite.');
  return value;
}
export interface NumberInputProps {
  value?: number | null;
  defaultValue?: number | null;
  onChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  locale?: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  className?: string;
  onInvalid?: (message: string) => void;
}
export function NumberInput({
  value: controlled,
  defaultValue = null,
  onChange,
  min = -1000000000,
  max = 1000000000,
  step = 1,
  precision = 2,
  locale = 'en-US',
  label = 'Number',
  disabled = false,
  required = false,
  name,
  className,
  onInvalid,
}: NumberInputProps) {
  if (![min, max, step].every(Number.isFinite) || min > max || step <= 0)
    throw new RangeError('Invalid numeric bounds/step.');
  roundNumber(min, precision);
  roundNumber(max, precision);
  const formatter = useMemo(
    () => new Intl.NumberFormat(locale, { maximumFractionDigits: precision }),
    [locale, precision],
  );
  const [internal, setInternal] = useState(defaultValue);
  const value = controlled === undefined ? internal : controlled;
  if (value !== null && (!Number.isFinite(value) || value < min || value > max))
    throw new RangeError('Controlled value outside bounds.');
  const [text, setText] = useState(value === null ? '' : formatter.format(value));
  const [error, setError] = useState<string | null>(null);
  const id = useId();
  useEffect(() => setText(value === null ? '' : formatter.format(value)), [value, formatter]);
  const commit = (next: number | null) => {
    if (next === null && required) {
      setError('A number is required.');
      onInvalid?.('A number is required.');
      return false;
    }
    const normalized =
      next === null ? null : roundNumber(Math.min(max, Math.max(min, next)), precision);
    if (controlled === undefined) setInternal(normalized);
    onChange?.(normalized);
    setText(normalized === null ? '' : formatter.format(normalized));
    setError(null);
    return true;
  };
  const parse = () => {
    try {
      const next = parseLocaleNumber(text, locale);
      if (next !== null && (next < min || next > max))
        throw new RangeError(`Use a value between ${min} and ${max}.`);
      commit(next);
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : String(reason);
      setError(message);
      onInvalid?.(message);
    }
  };
  const advance = (direction: number) =>
    commit((value ?? Math.min(max, Math.max(min, 0))) + direction * step);
  return (
    <div className={className}>
      <label htmlFor={id}>{label}</label>
      <div style={{ display: 'flex', gap: 4 }}>
        <button
          type="button"
          disabled={disabled || (value !== null && value <= min)}
          aria-label={`Decrease ${label}`}
          onClick={() => advance(-1)}
        >
          -
        </button>
        <input
          id={id}
          role="spinbutton"
          inputMode="decimal"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value ?? undefined}
          aria-valuetext={text}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          value={text}
          disabled={disabled}
          required={required}
          maxLength={128}
          onChange={(event) => setText(event.currentTarget.value)}
          onBlur={parse}
          onKeyDown={(event) => {
            if (event.nativeEvent.isComposing) return;
            if (event.key === 'Enter') {
              event.preventDefault();
              parse();
            }
            if (event.key === 'Escape') {
              setText(value === null ? '' : formatter.format(value));
              setError(null);
            }
            if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
              event.preventDefault();
              advance(event.key === 'ArrowUp' ? 1 : -1);
            }
            if (event.key === 'Home') {
              event.preventDefault();
              commit(min);
            }
            if (event.key === 'End') {
              event.preventDefault();
              commit(max);
            }
          }}
        />
        <button
          type="button"
          disabled={disabled || (value !== null && value >= max)}
          aria-label={`Increase ${label}`}
          onClick={() => advance(1)}
        >
          +
        </button>
      </div>
      {name && <input type="hidden" name={name} value={value ?? ''} />}{' '}
      {error && (
        <p id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
export default NumberInput;
