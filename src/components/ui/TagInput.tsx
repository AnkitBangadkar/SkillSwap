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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          <span className="text-gray-400 font-normal ml-2">
            ({value.length}/{maxTags})
          </span>
        </label>
      )}

      <div
        className={cn(
          'relative rounded-lg border border-gray-300 bg-white',
          'focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent',
          error && 'border-red-500 focus-within:ring-red-500'
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
                className="ml-1 hover:bg-indigo-200 rounded-full p-0.5"
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
              className="flex-1 min-w-[120px] border-none outline-none text-sm py-1 px-1"
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
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
          </button>
        )}

        {/* Dropdown */}
        {isOpen && canAddMore && (
          <div className="absolute z-10 left-0 right-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg max-h-64 overflow-hidden">
            <div className="flex">
              {/* Categories */}
              <div className="w-1/3 border-r border-gray-200 bg-gray-50 max-h-64 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => setActiveCategory(null)}
                  className={cn(
                    'w-full text-left px-3 py-2 text-sm hover:bg-gray-100',
                    activeCategory === null && 'bg-indigo-50 text-indigo-700'
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
                      'w-full text-left px-3 py-2 text-sm hover:bg-gray-100',
                      activeCategory === cat.name && 'bg-indigo-50 text-indigo-700'
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Tags */}
              <div className="w-2/3 max-h-64 overflow-y-auto p-2">
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
                        className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 hover:bg-indigo-100 hover:text-indigo-700"
                      >
                        {tag}
                      </button>
                    ))}
                </div>
                {allowCustom && inputValue && !filteredSuggestions.includes(inputValue) && (
                  <button
                    type="button"
                    onClick={() => handleAddTag(inputValue)}
                    className="mt-2 w-full text-left px-2 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded"
                  >
                    Add "{inputValue}"
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
