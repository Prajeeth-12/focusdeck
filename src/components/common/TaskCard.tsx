import React, { useState, useRef, useEffect } from 'react';
import type { Task, Status } from '../../types/task';
import { CategoryBadge, PriorityBadge } from './Badges';
import { formatDisplayDate, getTodayDateString } from '../../utils/dateUtils';
import { 
  Play, 
  CheckCircle2, 
  Circle, 
  RotateCcw, 
  MoreVertical, 
  Calendar, 
  Clock, 
  Repeat, 
  Pin, 
  Copy, 
  Trash2, 
  Edit3, 
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onStatusChange: (id: string, status: Status) => void;
  onToggleTodayFocus: (id: string) => void;
  onUpdatePlannedDate: (id: string, dateStr?: string) => void;
  onTagClick?: (tag: string) => void;
  isCompact?: boolean;
  showCategory?: boolean;
  onDragStart?: (e: React.DragEvent, task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onDuplicate,
  onStatusChange,
  onToggleTodayFocus,
  onTagClick,
  isCompact = false,
  showCategory = true,
  onDragStart,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const todayStr = getTodayDateString();
  const isPlannedToday = task.plannedDate === todayStr;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const triggerCompletionConfetti = (e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 30,
      spread: 50,
      origin: { x, y },
      colors: ['#10B981', '#38BDF8', '#818CF8', '#F59E0B'],
      disableForReducedMotion: true,
    });
  };

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerCompletionConfetti(e);
    onStatusChange(task.id, 'Completed');
  };

  const getCategoryBorder = () => {
    switch (task.category) {
      case 'Coding':
        return 'border-l-emerald-500';
      case 'Theory / Learning':
        return 'border-l-indigo-500';
      case 'Projects':
        return 'border-l-amber-500';
      default:
        return 'border-l-slate-400';
    }
  };

  if (isCompact) {
    return (
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', task.id);
          e.dataTransfer.setData('application/json', JSON.stringify(task));
          if (onDragStart) onDragStart(e, task);
        }}
        onClick={() => onEdit(task)}
        className={`group relative bg-white dark:bg-slate-900/95 hover:bg-slate-50 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800/90 rounded-lg p-2.5 border-l-[3.5px] ${getCategoryBorder()} shadow-2xs hover:shadow-sm transition-all cursor-grab active:cursor-grabbing select-none text-slate-900 dark:text-slate-100 ${
          task.status === 'Completed' ? 'opacity-60 bg-slate-50/70 dark:bg-slate-950/40' : ''
        }`}
      >
        {/* Compact Header: Priority & Pin / Action */}
        <div className="flex items-center justify-between gap-1.5 mb-1.5">
          <div className="flex items-center gap-1.5 shrink-0">
            <PriorityBadge priority={task.priority} size="sm" />
          </div>

          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              title={task.isTodayFocus ? "Remove from Today's Focus" : "Pin to Today's Focus"}
              onClick={() => onToggleTodayFocus(task.id)}
              className={`p-0.5 rounded transition-colors ${
                task.isTodayFocus
                  ? 'text-amber-500'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 opacity-0 group-hover:opacity-100'
              }`}
            >
              <Pin className={`w-3 h-3 ${task.isTodayFocus ? 'fill-amber-500' : ''}`} />
            </button>

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded transition-colors opacity-0 group-hover:opacity-100"
              >
                <MoreVertical className="w-3 h-3" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-1 z-50 text-xs text-slate-700 dark:text-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit(task);
                    }}
                    className="w-full px-2.5 py-1.5 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
                  >
                    <Edit3 className="w-3 h-3 text-slate-400" /> Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onDuplicate(task.id);
                    }}
                    className="w-full px-2.5 py-1.5 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
                  >
                    <Copy className="w-3 h-3 text-slate-400" /> Duplicate
                  </button>

                  <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(task.id);
                    }}
                    className="w-full px-2.5 py-1.5 flex items-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-left"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Compact Title */}
        <h4 className={`text-xs font-semibold leading-snug mb-1.5 text-slate-900 dark:text-slate-100 line-clamp-2 break-words ${task.status === 'Completed' ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
          {task.title}
        </h4>

        {/* Compact Tags (max 2) */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2" onClick={(e) => e.stopPropagation()}>
            {task.tags.slice(0, 2).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onTagClick && onTagClick(tag)}
                className="text-[10px] px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 transition-colors font-mono truncate max-w-[90px]"
              >
                #{tag}
              </button>
            ))}
            {task.tags.length > 2 && (
              <span className="text-[9px] text-slate-400 self-center">
                +{task.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Compact Footer Status Actions */}
        <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-slate-100 dark:border-slate-800/60 text-[10px]" onClick={(e) => e.stopPropagation()}>
          <span className="text-[10px] text-slate-400 font-medium truncate max-w-[60px]">
            {task.category === 'Theory / Learning' ? 'Theory' : task.category}
          </span>

          <div className="flex items-center gap-1 shrink-0">
            {task.status === 'To Do' && (
              <>
                <button
                  type="button"
                  onClick={() => onStatusChange(task.id, 'In Progress')}
                  className="px-1.5 py-0.5 text-[10px] font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-500/15 hover:bg-sky-100 dark:hover:bg-sky-500/25 border border-sky-200 dark:border-sky-500/30 rounded transition-colors"
                  title="Start task"
                >
                  Start
                </button>
                <button
                  type="button"
                  onClick={handleComplete}
                  className="p-0.5 text-slate-400 hover:text-emerald-500 rounded transition-colors"
                  title="Complete"
                >
                  <Circle className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            {task.status === 'In Progress' && (
              <>
                <button
                  type="button"
                  onClick={() => onStatusChange(task.id, 'To Do')}
                  className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
                  title="Pause"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={handleComplete}
                  className="px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/30 rounded border border-emerald-200 dark:border-emerald-500/40"
                  title="Complete"
                >
                  Done
                </button>
              </>
            )}

            {task.status === 'Completed' && (
              <button
                type="button"
                onClick={() => onStatusChange(task.id, 'To Do')}
                className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:text-amber-500 px-1 py-0.5 rounded transition-colors font-medium flex items-center gap-1"
                title="Reopen"
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>Done</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', task.id);
        e.dataTransfer.setData('application/json', JSON.stringify(task));
        if (onDragStart) onDragStart(e, task);
      }}
      onClick={() => onEdit(task)}
      className={`group relative bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 border-l-4 ${getCategoryBorder()} shadow-xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing select-none text-slate-900 dark:text-slate-100 ${
        task.status === 'Completed' ? 'opacity-65' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center flex-wrap gap-1.5">
          {showCategory && <CategoryBadge category={task.category} size="sm" />}
          <PriorityBadge priority={task.priority} size="sm" />
          
          {task.recurrence && task.recurrence.pattern !== 'none' && (
            <span
              title={`Recurring: ${task.recurrence.pattern}`}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/50 px-1.5 py-0.5 rounded"
            >
              <Repeat className="w-3 h-3" />
              <span className="capitalize">{task.recurrence.pattern}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            title={task.isTodayFocus ? "Remove from Today's Focus" : "Pin to Today's Focus"}
            onClick={() => onToggleTodayFocus(task.id)}
            className={`p-1 rounded transition-colors ${
              task.isTodayFocus
                ? 'text-amber-500 bg-amber-50 dark:bg-amber-500/15'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 opacity-0 group-hover:opacity-100'
            }`}
          >
            <Pin className={`w-3.5 h-3.5 ${task.isTodayFocus ? 'fill-amber-500' : ''}`} />
          </button>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded transition-colors"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-1 z-50 text-xs text-slate-700 dark:text-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(task);
                  }}
                  className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-400" /> Edit Task
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onDuplicate(task.id);
                  }}
                  className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-400" /> Duplicate
                </button>

                <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(task.id);
                  }}
                  className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-left"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Task
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <h3 className={`text-sm font-semibold leading-snug mb-1.5 text-slate-900 dark:text-slate-100 ${task.status === 'Completed' ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
        {task.title}
      </h3>

      {task.description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2.5 font-normal leading-relaxed">
          {task.description}
        </p>
      )}

      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2.5" onClick={(e) => e.stopPropagation()}>
          {task.tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onTagClick && onTagClick(tag)}
              className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors font-medium"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 text-[11px]">
          {task.plannedDate && (
            <span
              title={`Planned: ${task.plannedDate}`}
              className={`inline-flex items-center gap-1 ${
                isPlannedToday ? 'text-sky-600 dark:text-sky-400 font-semibold' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>{isPlannedToday ? 'Today' : formatDisplayDate(task.plannedDate)}</span>
            </span>
          )}

          {task.dueDate && (
            <span
              title={`Due: ${task.dueDate}`}
              className="inline-flex items-center gap-1 text-rose-500 dark:text-rose-400 font-medium"
            >
              <Clock className="w-3 h-3" />
              <span>Due {formatDisplayDate(task.dueDate)}</span>
            </span>
          )}

          {!task.plannedDate && !task.dueDate && (
            <span className="text-slate-400 dark:text-slate-600 italic">Unscheduled</span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {task.status === 'To Do' && (
            <>
              <button
                type="button"
                onClick={() => onStatusChange(task.id, 'In Progress')}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-500/15 hover:bg-sky-100 dark:hover:bg-sky-500/25 border border-sky-200 dark:border-sky-500/30 rounded transition-colors"
                title="Start working"
              >
                <Play className="w-2.5 h-2.5 fill-current" />
                <span>Start</span>
              </button>

              <button
                type="button"
                onClick={handleComplete}
                className="p-1 text-slate-400 hover:text-emerald-500 rounded transition-colors"
                title="Mark as Completed"
              >
                <Circle className="w-4 h-4" />
              </button>
            </>
          )}

          {task.status === 'In Progress' && (
            <>
              <button
                type="button"
                onClick={() => onStatusChange(task.id, 'To Do')}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded transition-colors"
                title="Pause"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleComplete}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/30 border border-emerald-200 dark:border-emerald-500/40 rounded transition-colors"
                title="Mark as Completed"
              >
                <Check className="w-3 h-3" />
                <span>Complete</span>
              </button>
            </>
          )}

          {task.status === 'Completed' && (
            <button
              type="button"
              onClick={() => onStatusChange(task.id, 'To Do')}
              className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 hover:text-amber-500 px-1.5 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"
              title="Click to reopen task"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Done</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
