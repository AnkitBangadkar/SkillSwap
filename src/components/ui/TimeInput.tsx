import { useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TimeInputProps {
  label?: string;
  value?: string; // HH:mm format
  onChange: (time: string) => void;
  error?: string;
}

export function TimeInput({ label, value = '', onChange, error }: TimeInputProps) {
  const [hours, minutes] = value.split(':');
  const hourRef = useRef<HTMLInputElement>(null);
  const minuteRef = useRef<HTMLInputElement>(null);

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    
    // Allow numeric only
    val = val.replace(/\D/g, '');
    
    // Max 2 chars
    if (val.length > 2) val = val.slice(0, 2);
    
    // Auto-focus minutes if 2 chars entered
    if (val.length === 2) {
      // Validate hours (00-23)
      if (parseInt(val) > 23) val = '23';
      minuteRef.current?.focus();
    }

    updateTime(val, minutes || '00');
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    
    // Allow numeric only
    val = val.replace(/\D/g, '');
    
    // Max 2 chars
    if (val.length > 2) val = val.slice(0, 2);

    // Validate minutes (00-59)
    if (parseInt(val) > 59) val = '59';

    updateTime(hours || '00', val);
  };

  const updateTime = (h: string, m: string) => {
    onChange(`${h}:${m}`);
  };

  const handleBlur = () => {
    // Pad with zeros on blur
    const h = (hours || '00').padStart(2, '0');
    const m = (minutes || '00').padStart(2, '0');
    updateTime(h, m);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5 ml-1 uppercase tracking-wide font-bold text-xs">
          {label}
        </label>
      )}
      
      <div 
        className={cn(
          "input-base flex items-center w-full rounded-xl px-4 py-3 transition-all duration-200 group focus-within:ring-2 focus-within:ring-[var(--color-primary-500)] focus-within:border-[var(--color-primary-500)]",
          error && "border-[var(--color-error)]"
        )}
      >
        <div className="flex-1 flex items-center justify-center gap-1">
          <input
            ref={hourRef}
            type="text"
            value={hours || ''}
            onChange={handleHourChange}
            onBlur={handleBlur}
            placeholder="HH"
            className="w-8 text-center bg-transparent focus:outline-none placeholder-[var(--text-tertiary)] font-mono text-lg font-bold"
            maxLength={2}
          />
          <span className="text-[var(--text-tertiary)] font-bold">:</span>
          <input
            ref={minuteRef}
            type="text"
            value={minutes || ''}
            onChange={handleMinuteChange}
            onBlur={handleBlur}
            placeholder="MM"
            className="w-8 text-center bg-transparent focus:outline-none placeholder-[var(--text-tertiary)] font-mono text-lg font-bold"
            maxLength={2}
          />
        </div>
        <Clock className="h-4 w-4 text-[var(--text-tertiary)] ml-2" />
      </div>

      {error && <p className="mt-1.5 text-sm text-[var(--color-error)] ml-1">{error}</p>}
    </div>
  );
}
