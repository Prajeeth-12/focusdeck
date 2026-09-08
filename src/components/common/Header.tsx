import React, { useState, useRef, useEffect } from 'react';
import type { Category, Priority } from '../../types/task';
import { 
  Search, 
  Plus, 
  Download, 
  Upload, 
  RotateCcw, 
  Settings, 
  SlidersHorizontal,
  X,
  Sun,
  Moon
} from 'lucide-react';
import { exportDatabaseToJson, importDatabaseFromJson, resetDatabaseToSamples } from '../../db/db';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: Category | 'All';
  onCategoryChange: (cat: Category | 'All') => void;
  selectedPriority: Priority | 'All';
  onPriorityChange: (p: Priority | 'All') => void;
  selectedTags: string[];
  onRemoveTag: (t: string) => void;
  onClearAllFilters: () => void;
  onOpenNewTaskModal: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  searchRef?: React.RefObject<HTMLInputElement | null>;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedPriority,
  onPriorityChange,
  selectedTags,
  onRemoveTag,
  onClearAllFilters,
  onOpenNewTaskModal,
  theme,
  onToggleTheme,
  searchRef,
}) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async () => {
    const jsonStr = await exportDatabaseToJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `productivity-tasks-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatusMessage('Backup exported successfully!');
    setTimeout(() => setStatusMessage(null), 3000);
    setSettingsOpen(false);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const content = evt.target?.result as string;
      const res = await importDatabaseFromJson(content);
      if (res.success) {
        setStatusMessage(`Successfully imported ${res.count} tasks!`);
      } else {
        alert(`Import failed: ${res.error}`);
      }
      setTimeout(() => setStatusMessage(null), 3000);
      setSettingsOpen(false);
    };
    reader.readAsText(file);
  };

  const handleReset = async () => {
    if (window.confirm('Reset all tasks back to default sample starter tasks? Current data will be replaced.')) {
      await resetDatabaseToSamples();
      setStatusMessage('Restored default starter tasks.');
      setTimeout(() => setStatusMessage(null), 3000);
      setSettingsOpen(false);
    }
  };

  const hasActiveFilters =
    selectedCategory !== 'All' ||
    selectedPriority !== 'All' ||
    selectedTags.length > 0 ||
    searchQuery.trim().length > 0;

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md px-6 py-3 transition-colors">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {(['All', 'Coding', 'Theory / Learning', 'Projects'] as const).map((cat) => {
            const isSelected = selectedCategory === cat;
            let activeColor = '';
            if (cat === 'All') {
              activeColor = isSelected 
                ? 'bg-sky-50 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-500/50 shadow-xs' 
                : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200';
            } else if (cat === 'Coding') {
              activeColor = isSelected 
                ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/50 shadow-xs' 
                : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200';
            } else if (cat === 'Theory / Learning') {
              activeColor = isSelected 
                ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-500/50 shadow-xs' 
                : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200';
            } else if (cat === 'Projects') {
              activeColor = isSelected 
                ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500/50 shadow-xs' 
                : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200';
            }

            return (
              <button
                key={cat}
                type="button"
                onClick={() => onCategoryChange(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all shrink-0 ${activeColor}`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search, Theme Toggle, New Task, Settings */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Search Box */}
          <div className="relative flex-1 md:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchRef as any}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search tasks, tags..."
              className="w-full pl-8 pr-8 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 transition-all"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded border border-slate-200 dark:border-slate-700 font-mono">
                /
              </kbd>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg transition-colors shrink-0"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>

          {/* New Task Button */}
          <button
            type="button"
            onClick={onOpenNewTaskModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 rounded-lg shadow-sm transition-all shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
            <kbd className="hidden sm:inline-block text-[10px] bg-sky-700 px-1 rounded text-sky-100 font-mono">
              N
            </kbd>
          </button>

          {/* Backup / Export Settings */}
          <div className="relative" ref={settingsRef}>
            <button
              type="button"
              onClick={() => setSettingsOpen(!settingsOpen)}
              title="Data, Backup & Settings"
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>

            {settingsOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-2 z-50 text-xs text-slate-800 dark:text-slate-200 backdrop-blur-md">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  Local Storage Backup
                </div>

                <button
                  type="button"
                  onClick={handleExport}
                  className="w-full px-3 py-2 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
                >
                  <Download className="w-3.5 h-3.5 text-sky-500" /> Export JSON Backup
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-3 py-2 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-500" /> Import JSON Backup
                </button>

                <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full px-3 py-2 flex items-center gap-2 hover:bg-amber-50 dark:hover:bg-amber-500/15 text-amber-600 dark:text-amber-400 text-left"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Restore Sample Tasks
                </button>
              </div>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>

      {/* Active Filter Indicator Bar */}
      {hasActiveFilters && (
        <div className="flex items-center flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800/60 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" /> Filters:
          </span>

          {selectedCategory !== 'All' && (
            <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 px-2 py-0.5 rounded text-[11px]">
              Category: <span className="font-semibold">{selectedCategory}</span>
              <button onClick={() => onCategoryChange('All')} className="hover:text-rose-500">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedPriority !== 'All' && (
            <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 px-2 py-0.5 rounded text-[11px]">
              Priority: <span className="font-semibold">{selectedPriority}</span>
              <button onClick={() => onPriorityChange('All')} className="hover:text-rose-500">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60 px-2 py-0.5 rounded text-[11px]"
            >
              #{tag}
              <button onClick={() => onRemoveTag(tag)} className="hover:text-rose-500">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {searchQuery && (
            <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 px-2 py-0.5 rounded text-[11px]">
              Search: "{searchQuery}"
              <button onClick={() => onSearchChange('')} className="hover:text-rose-500">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={onClearAllFilters}
            className="text-[11px] text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 ml-1 underline transition-colors"
          >
            Clear filters
          </button>
        </div>
      )}

      {statusMessage && (
        <div className="absolute top-16 right-6 z-50 bg-emerald-50 dark:bg-emerald-950/90 border border-emerald-300 dark:border-emerald-500/50 text-emerald-800 dark:text-emerald-200 text-xs px-3.5 py-2 rounded-lg shadow-lg">
          {statusMessage}
        </div>
      )}
    </header>
  );
};
