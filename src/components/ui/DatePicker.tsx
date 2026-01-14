import { useState, useRef, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

interface DatePickerProps {
  label?: string;
  value?: string; // ISO date string YYYY-MM-DD
  onChange: (date: string) => void;
  min?: string;
  max?: string;
  error?: string;
}

export function DatePicker({ label, value, onChange, min, max, error }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedDate = value ? new Date(value) : null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const handleDayClick = (day: Date) => {
    // Format as YYYY-MM-DD manually to avoid timezone issues
    const year = day.getFullYear();
    const month = String(day.getMonth() + 1).padStart(2, '0');
    const d = String(day.getDate()).padStart(2, '0');
    onChange(`${year}-${month}-${d}`);
    setIsOpen(false);
  };

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth)),
  });

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className="w-full relative" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5 ml-1 uppercase tracking-wide font-bold text-xs">
          {label}
        </label>
      )}
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "input-base flex items-center justify-between w-full rounded-xl px-4 py-3 cursor-pointer transition-all duration-200",
          isOpen && "ring-2 ring-[var(--color-primary-500)] border-[var(--color-primary-500)]",
          error && "border-[var(--color-error)]"
        )}
      >
        <span className={cn(!selectedDate && "text-[var(--text-tertiary)]")}>
          {selectedDate ? format(selectedDate, 'PPP') : 'Select date'}
        </span>
        <CalendarIcon className="h-4 w-4 text-[var(--text-tertiary)]" />
      </div>

      {error && <p className="mt-1.5 text-sm text-[var(--color-error)] ml-1">{error}</p>}

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full min-w-[280px] bg-[var(--bg-surface)] border-2 border-[var(--border-default)] shadow-[4px_4px_0px_0px_var(--border-default)] rounded-xl p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={handlePrevMonth}
              className="p-1 hover:bg-[var(--bg-surface-highlight)] rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="font-display font-bold text-lg">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button 
              onClick={handleNextMonth}
              className="p-1 hover:bg-[var(--bg-surface-highlight)] rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-xs font-bold text-[var(--text-tertiary)] py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, idx) => {
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isTodayDate = isToday(day);
              
              // Simple disabled check (not accounting for specific min/max times logic yet, just dates)
              const isDisabled = (min && day < new Date(min)) || (max && day > new Date(max));

              return (
                <button
                  key={idx}
                  onClick={() => !isDisabled && handleDayClick(day)}
                  disabled={!!isDisabled}
                  className={cn(
                    "h-9 w-9 rounded-lg flex items-center justify-center text-sm transition-all duration-200 font-medium",
                    !isCurrentMonth && "text-[var(--text-tertiary)] opacity-50",
                    isSelected 
                      ? "bg-[var(--color-primary-500)] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_white] translate-x-[-1px] translate-y-[-1px] border border-black dark:border-white" 
                      : "hover:bg-[var(--bg-surface-highlight)]",
                    isTodayDate && !isSelected && "text-[var(--color-primary-600)] font-bold bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/30",
                    isDisabled && "opacity-25 cursor-not-allowed hover:bg-transparent"
                  )}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
