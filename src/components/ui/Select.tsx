import { cn } from '../../lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function Select({
  options,
  value,
  onChange,
  label,
  error,
  placeholder = 'Select an option',
  disabled = false,
  className,
}: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5 ml-1">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          'input-base block w-full rounded-xl px-4 py-2.5 transition-all duration-200 appearance-none',
          'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent',
          'disabled:bg-[var(--bg-surface-highlight)] disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-[var(--color-error)] focus:ring-[var(--color-error)]',
          className
        )}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1.5 text-sm text-[var(--color-error)] ml-1">{error}</p>}
    </div>
  );
}
