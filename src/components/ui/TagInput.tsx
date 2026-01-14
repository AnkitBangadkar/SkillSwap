import { useState, useRef, type KeyboardEvent } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Badge } from './Badge';
import { SKILL_CATEGORIES, ALL_TAGS } from '../../lib/constants';

export interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  label?: string;
  error?: string;
  placeholder?: string;
  maxTags?: number;
  suggestions?: string[];
  allowCustom?: boolean;
}

export function TagInput({
  value,
  onChange,
  label,
  error,
  placeholder = 'Add tags...',
  maxTags = 5,
  suggestions = ALL_TAGS,
  allowCustom = true,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredSuggestions = suggestions.filter(
    (tag) =>
      tag.toLowerCase().includes(inputValue.toLowerCase()) &&
      !value.includes(tag)
  );

  const handleAddTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !value.includes(trimmed) && value.length < maxTags) {
      onChange([...value, trimmed]);
      setInputValue('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue && (allowCustom || filteredSuggestions.includes(inputValue))) {
        handleAddTag(inputValue);
      } else if (filteredSuggestions.length > 0) {
        handleAddTag(filteredSuggestions[0]);
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      handleRemoveTag(value[value.length - 1]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const canAddMore = value.length < maxTags;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5 ml-1">
          {label}
          <span className="text-[var(--text-tertiary)] font-normal ml-2">
            ({value.length}/{maxTags})
          </span>
        </label>
      )}

      <div
        className={cn(
          'relative rounded-xl border border-[var(--border-default)] bg-[var(--bg-app)] transition-all duration-200',
          'focus-within:ring-2 focus-within:ring-[var(--color-primary-500)] focus-within:border-transparent',
          error && 'border-[var(--color-error)] focus-within:ring-[var(--color-error)]'
        )}
      >
        {/* Selected Tags */}
        <div className="flex flex-wrap gap-2 p-2">
          {value.map((tag) => (
            <Badge key={tag} variant="primary" className="gap-1 pr-1">
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 hover:bg-[var(--color-primary-200)] dark:hover:bg-[var(--color-primary-800)] rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {canAddMore && (
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setIsOpen(true)}
              onBlur={() => setTimeout(() => setIsOpen(false), 200)}
              onKeyDown={handleKeyDown}
              placeholder={value.length === 0 ? placeholder : ''}
              className="flex-1 min-w-[120px] border-none outline-none text-sm py-1 px-1 bg-transparent text-[var(--text-primary)] placeholder-[var(--text-tertiary)]"
            />
          )}
        </div>

        {/* Toggle dropdown button */}
        {canAddMore && (
          <button
            type="button"
            onClick={() => {
              setIsOpen(!isOpen);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
          >
            <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
          </button>
        )}

        {/* Dropdown */}
        {isOpen && canAddMore && (
          <div className="absolute z-10 left-0 right-0 mt-1 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] shadow-xl max-h-64 overflow-hidden">
            <div className="flex">
              {/* Categories */}
              <div className="w-1/3 border-r border-[var(--border-default)] bg-[var(--bg-surface-highlight)] max-h-64 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => setActiveCategory(null)}
                  className={cn(
                    'w-full text-left px-3 py-2 text-sm hover:bg-[var(--border-default)] text-[var(--text-secondary)]',
                    activeCategory === null && 'bg-[var(--color-primary-100)] text-[var(--color-primary-700)] dark:bg-[var(--color-primary-900)] dark:text-[var(--color-primary-100)]'
                  )}
                >
                  All
                </button>
                {SKILL_CATEGORIES.map((cat) => (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setActiveCategory(cat.name)}
                    className={cn(
                      'w-full text-left px-3 py-2 text-sm hover:bg-[var(--border-default)] text-[var(--text-secondary)]',
                      activeCategory === cat.name && 'bg-[var(--color-primary-100)] text-[var(--color-primary-700)] dark:bg-[var(--color-primary-900)] dark:text-[var(--color-primary-100)]'
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Tags */}
              <div className="w-2/3 max-h-64 overflow-y-auto p-2 bg-[var(--bg-surface)]">
                <div className="flex flex-wrap gap-1.5">
                  {(activeCategory
                    ? SKILL_CATEGORIES.find((c) => c.name === activeCategory)?.tags || []
                    : filteredSuggestions
                  )
                    .filter((tag) => !value.includes(tag))
                    .slice(0, 30)
                    .map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleAddTag(tag)}
                        className="px-2 py-1 text-xs rounded-full bg-[var(--bg-surface-highlight)] text-[var(--text-secondary)] hover:bg-[var(--color-primary-100)] hover:text-[var(--color-primary-700)] dark:hover:bg-[var(--color-primary-900)] dark:hover:text-[var(--color-primary-100)] border border-[var(--border-default)]"
                      >
                        {tag}
                      </button>
                    ))}
                </div>
                {allowCustom && inputValue && !filteredSuggestions.includes(inputValue) && (
                  <button
                    type="button"
                    onClick={() => handleAddTag(inputValue)}
                    className="mt-2 w-full text-left px-2 py-1 text-sm text-[var(--color-primary-600)] hover:bg-[var(--color-primary-50)] dark:hover:bg-[var(--color-primary-900)] rounded"
                  >
                    Add "{inputValue}"
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {error && <p className="mt-1.5 text-sm text-[var(--color-error)] ml-1">{error}</p>}
    </div>
  );
}
