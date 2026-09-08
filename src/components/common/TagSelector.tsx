import React, { useState, useRef, useEffect } from 'react';
import { Tag as TagIcon, X, Plus } from 'lucide-react';
import { getAllUniqueTags } from '../../db/db';

interface TagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  className?: string;
  placeholder?: string;
}

export const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTags,
  onChange,
  className = '',
  placeholder = 'Add or create tag...',
}) => {
  const [inputValue, setInputValue] = useState('');
  const [existingTags, setExistingTags] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadExistingTags();
  }, [selectedTags]);

  const loadExistingTags = async () => {
    const tags = await getAllUniqueTags();
    setExistingTags(tags);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddTag = (tagToAdd: string) => {
    const cleanTag = tagToAdd.trim().replace(/^#/, '');
    if (!cleanTag) return;
    if (!selectedTags.includes(cleanTag)) {
      onChange([...selectedTags, cleanTag]);
    }
    setInputValue('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(selectedTags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (inputValue.trim()) {
        handleAddTag(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      handleRemoveTag(selectedTags[selectedTags.length - 1]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const matchingExistingTags = existingTags.filter(
    (tag) =>
      !selectedTags.includes(tag) &&
      tag.toLowerCase().includes(inputValue.toLowerCase().trim())
  );

  const isNewTag =
    inputValue.trim() &&
    !existingTags.some((t) => t.toLowerCase() === inputValue.trim().toLowerCase()) &&
    !selectedTags.some((t) => t.toLowerCase() === inputValue.trim().toLowerCase());

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div
        onClick={() => inputRef.current?.focus()}
        className="flex flex-wrap items-center gap-1.5 min-h-[42px] px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500/30 transition-all cursor-text"
      >
        <TagIcon className="w-3.5 h-3.5 text-slate-400 mr-1 shrink-0" />
        
        {selectedTags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 bg-sky-50 dark:bg-slate-800 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-slate-700 text-xs px-2 py-0.5 rounded-md font-medium group"
          >
            <span>#{tag}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveTag(tag);
              }}
              className="text-slate-400 hover:text-rose-500 focus:outline-none"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selectedTags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 max-h-56 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl p-2.5 backdrop-blur-md">
          {isNewTag && (
            <button
              type="button"
              onClick={() => handleAddTag(inputValue)}
              className="w-full text-left flex items-center justify-between px-2.5 py-1.5 mb-1.5 text-xs font-medium text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-500/20 border border-sky-200 dark:border-sky-500/30 rounded-md transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Create new tag: <span className="font-semibold text-slate-900 dark:text-white">#{inputValue.trim()}</span>
              </span>
              <kbd className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">Enter</kbd>
            </button>
          )}

          {matchingExistingTags.length > 0 ? (
            <div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2 py-1 mb-1">
                Existing Tags
              </div>
              <div className="flex flex-wrap gap-1.5 px-1 py-1">
                {matchingExistingTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleAddTag(tag)}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    <Plus className="w-3 h-3 text-sky-500" />
                    <span>#{tag}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : !isNewTag && (
            <div className="text-xs text-slate-500 px-2 py-2 text-center">
              Type to create a new tag or press Enter
            </div>
          )}
        </div>
      )}
    </div>
  );
};
