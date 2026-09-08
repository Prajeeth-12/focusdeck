import React, { useState, useEffect } from 'react';
import type { Task, Category, Priority, Status, RecurrencePattern } from '../../types/task';
import { TagSelector } from '../common/TagSelector';
import { getTodayDateString } from '../../utils/dateUtils';
import { X, Calendar, Flame, Layers, Tag as TagIcon, Repeat, Sparkles, CheckSquare, Clock } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'createdAt' | 'orderIndex'>) => void;
  initialTask?: Task | null;
  defaultPlannedDate?: string;
  defaultCategory?: Category;
  defaultIsTodayFocus?: boolean;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTask,
  defaultPlannedDate,
  defaultCategory,
  defaultIsTodayFocus,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('Coding');
  const [priority, setPriority] = useState<Priority>('High');
  const [status, setStatus] = useState<Status>('To Do');
  const [tags, setTags] = useState<string[]>([]);
  const [plannedDate, setPlannedDate] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [isTodayFocus, setIsTodayFocus] = useState<boolean>(false);
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>('none');

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || '');
      setCategory(initialTask.category);
      setPriority(initialTask.priority);
      setStatus(initialTask.status);
      setTags(initialTask.tags || []);
      setPlannedDate(initialTask.plannedDate || '');
      setDueDate(initialTask.dueDate || '');
      setIsTodayFocus(initialTask.isTodayFocus || false);
      setRecurrencePattern(initialTask.recurrence?.pattern || 'none');
    } else {
      setTitle('');
      setDescription('');
      setCategory(defaultCategory || 'Coding');
      setPriority('High');
      setStatus('To Do');
      setTags([]);
      setPlannedDate(defaultPlannedDate || (defaultIsTodayFocus ? getTodayDateString() : ''));
      setDueDate('');
      setIsTodayFocus(defaultIsTodayFocus || (defaultPlannedDate === getTodayDateString()));
      setRecurrencePattern('none');
    }
  }, [initialTask, isOpen, defaultPlannedDate, defaultCategory, defaultIsTodayFocus]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      priority,
      status,
      tags,
      plannedDate: plannedDate || undefined,
      dueDate: dueDate || undefined,
      isTodayFocus,
      recurrence: recurrencePattern !== 'none' ? { pattern: recurrencePattern } : undefined,
    });
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const categories: { label: Category; color: string }[] = [
    { label: 'Coding', color: 'hover:border-emerald-500' },
    { label: 'Theory / Learning', color: 'hover:border-indigo-500' },
    { label: 'Projects', color: 'hover:border-amber-500' },
  ];

  const priorities: { label: Priority; color: string }[] = [
    { label: 'High', color: 'hover:border-rose-500' },
    { label: 'Medium', color: 'hover:border-amber-500' },
    { label: 'Low', color: 'hover:border-slate-500' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onKeyDown={handleKeyDown}
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-500" />
            {initialTask ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement Binary Search Tree deletion algorithm"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" /> Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((c) => {
                const isSelected = category === c.label;
                let activeStyle = '';
                if (c.label === 'Coding') {
                  activeStyle = isSelected 
                    ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-400 dark:border-emerald-500 font-semibold shadow-xs' 
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
                } else if (c.label === 'Theory / Learning') {
                  activeStyle = isSelected 
                    ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-400 dark:border-indigo-500 font-semibold shadow-xs' 
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
                } else {
                  activeStyle = isSelected 
                    ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-400 dark:border-amber-500 font-semibold shadow-xs' 
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
                }

                return (
                  <button
                    key={c.label}
                    type="button"
                    onClick={() => setCategory(c.label)}
                    className={`py-2 px-3 text-xs rounded-lg border text-center transition-all ${activeStyle} ${c.color}`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-rose-500" /> Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {priorities.map((p) => {
                const isSelected = priority === p.label;
                let activeStyle = '';
                if (p.label === 'High') {
                  activeStyle = isSelected 
                    ? 'bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-400 dark:border-rose-500 font-semibold shadow-xs' 
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
                } else if (p.label === 'Medium') {
                  activeStyle = isSelected 
                    ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-400 dark:border-amber-500 font-semibold shadow-xs' 
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
                } else {
                  activeStyle = isSelected 
                    ? 'bg-slate-100 dark:bg-slate-700/50 text-slate-800 dark:text-slate-200 border-slate-400 dark:border-slate-500 font-semibold shadow-xs' 
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
                }

                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setPriority(p.label)}
                    className={`py-2 px-3 text-xs rounded-lg border text-center transition-all ${activeStyle} ${p.color}`}
                  >
                    {p.label} Priority
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
              <TagIcon className="w-3.5 h-3.5 text-sky-500" /> Tags
            </label>
            <TagSelector selectedTags={tags} onChange={setTags} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" /> Planned Date
              </label>
              <input
                type="date"
                value={plannedDate}
                onChange={(e) => {
                  setPlannedDate(e.target.value);
                  if (e.target.value === getTodayDateString()) {
                    setIsTodayFocus(true);
                  }
                }}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" /> Due Date (Deadline)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                <CheckSquare className="w-3 h-3 text-slate-400" /> Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-200 dark:border-slate-800">
            <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={isTodayFocus}
                onChange={(e) => {
                  setIsTodayFocus(e.target.checked);
                  if (e.target.checked && !plannedDate) {
                    setPlannedDate(getTodayDateString());
                  }
                }}
                className="w-4 h-4 rounded text-sky-500 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:ring-sky-500"
              />
              <div>
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-200 block">Include in Today's Focus</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Pin to today's active priority list</span>
              </div>
            </label>

            <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Repeat className="w-3.5 h-3.5 text-sky-500" />
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-200">Recurrence Rule</span>
              </div>
              <select
                value={recurrencePattern}
                onChange={(e) => setRecurrencePattern(e.target.value as RecurrencePattern)}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="none">No Recurrence (One-off)</option>
                <option value="daily">Daily</option>
                <option value="weekdays">Every Weekday (Mon-Fri)</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Description & Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add key notes, reference links, solution insights, or requirements..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 text-xs font-mono leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel (Esc)
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              <span>{initialTask ? 'Save Changes' : 'Create Task'}</span>
              <kbd className="hidden sm:inline text-[10px] bg-sky-700 px-1.5 py-0.5 rounded text-sky-100">↵</kbd>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
