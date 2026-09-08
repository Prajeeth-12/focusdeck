import React, { useState, useMemo } from 'react';
import type { Task, Category, Priority, Status } from '../../types/task';
import { TaskCard } from '../common/TaskCard';
import { getWeekDates, formatDisplayDate } from '../../utils/dateUtils';
import { 
  ChevronLeft, 
  ChevronRight, 
  CalendarDays, 
  Plus,
  Inbox,
  Search,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';

interface WeekViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onDuplicateTask: (id: string) => void;
  onStatusChange: (id: string, status: Status) => void;
  onToggleTodayFocus: (id: string) => void;
  onUpdatePlannedDate: (id: string, dateStr?: string) => void;
  onOpenNewTaskModalWithDefaults: (defaults: { category?: Category; plannedDate?: string; isTodayFocus?: boolean }) => void;
  onTagClick: (tag: string) => void;
  backlogTasks: Task[];
}

export const WeekView: React.FC<WeekViewProps> = ({
  tasks,
  onEditTask,
  onDeleteTask,
  onDuplicateTask,
  onStatusChange,
  onToggleTodayFocus,
  onUpdatePlannedDate,
  onOpenNewTaskModalWithDefaults,
  onTagClick,
  backlogTasks,
}) => {
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [dragOverDay, setDragOverDay] = useState<string | null>(null);
  const [isBacklogDockOpen, setIsBacklogDockOpen] = useState<boolean>(true);
  const [dragOverBacklog, setDragOverBacklog] = useState<boolean>(false);

  // Bottom dock filters
  const [backlogSearch, setBacklogSearch] = useState<string>('');
  const [backlogCategory, setBacklogCategory] = useState<Category | 'All'>('All');
  const [backlogPriority, setBacklogPriority] = useState<Priority | 'All'>('All');

  const today = new Date();
  const referenceDate = new Date(today);
  referenceDate.setDate(today.getDate() + weekOffset * 7);

  const weekDays = getWeekDates(referenceDate);
  const startDateStr = formatDisplayDate(weekDays[0].dateStr, false);
  const endDateStr = formatDisplayDate(weekDays[6].dateStr, false);

  // Calculate week stats
  const totalWeekTasks = tasks.filter((t) => t.plannedDate && weekDays.some((d) => d.dateStr === t.plannedDate)).length;
  const completedWeekTasks = tasks.filter((t) => t.plannedDate && weekDays.some((d) => d.dateStr === t.plannedDate) && t.status === 'Completed').length;
  const weekCompletionRate = totalWeekTasks > 0 ? Math.round((completedWeekTasks / totalWeekTasks) * 100) : 0;

  // Filtered backlog tasks for bottom dock
  const filteredBacklog = useMemo(() => {
    return backlogTasks.filter((task) => {
      if (backlogSearch.trim()) {
        const q = backlogSearch.toLowerCase().trim();
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchDesc = task.description?.toLowerCase().includes(q) || false;
        const matchTags = task.tags?.some((t) => t.toLowerCase().includes(q)) || false;
        if (!matchTitle && !matchDesc && !matchTags) return false;
      }

      if (backlogCategory !== 'All' && task.category !== backlogCategory) {
        return false;
      }

      if (backlogPriority !== 'All' && task.priority !== backlogPriority) {
        return false;
      }

      return true;
    });
  }, [backlogTasks, backlogSearch, backlogCategory, backlogPriority]);

  const handleDragOverDay = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverDay !== dateStr) {
      setDragOverDay(dateStr);
    }
  };

  const handleDragLeaveDay = () => {
    setDragOverDay(null);
  };

  const handleDropOnDay = (e: React.DragEvent, targetDateStr: string) => {
    e.preventDefault();
    setDragOverDay(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onUpdatePlannedDate(taskId, targetDateStr);
    }
  };

  const handleBacklogDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!dragOverBacklog) setDragOverBacklog(true);
  };

  const handleBacklogDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverBacklog(false);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onUpdatePlannedDate(taskId, undefined);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* 1. Week Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-3 shadow-xs transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Weekly Plan</span>
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400 font-mono">
                ({startDateStr} – {endDateStr})
              </span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Drag tasks between days or from the bottom Backlog Pool to plan your week
            </p>
          </div>
        </div>

        {/* Navigation Controls & Progress */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
            <span>{completedWeekTasks}/{totalWeekTasks} Done</span>
            <span className="text-emerald-500 font-bold">({weekCompletionRate}%)</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setWeekOffset(weekOffset - 1)}
              title="Previous Week"
              className="p-1.5 hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setWeekOffset(0)}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                weekOffset === 0
                  ? 'bg-white dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              This Week
            </button>

            <button
              type="button"
              onClick={() => setWeekOffset(weekOffset + 1)}
              title="Next Week"
              className="p-1.5 hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Full-Width 7-Day Grid */}
      <div className="overflow-x-auto pb-1">
        <div className="grid grid-cols-7 gap-2.5 min-w-[840px] w-full">
        {weekDays.map((day) => {
          const dayTasks = tasks.filter((t) => t.plannedDate === day.dateStr);
          const completedCount = dayTasks.filter((t) => t.status === 'Completed').length;
          const codingCount = dayTasks.filter((t) => t.category === 'Coding').length;
          const theoryCount = dayTasks.filter((t) => t.category === 'Theory / Learning').length;
          const projectCount = dayTasks.filter((t) => t.category === 'Projects').length;
          const isOver = dragOverDay === day.dateStr;

          return (
            <div
              key={day.dateStr}
              onDragOver={(e) => handleDragOverDay(e, day.dateStr)}
              onDragLeave={handleDragLeaveDay}
              onDrop={(e) => handleDropOnDay(e, day.dateStr)}
              className={`flex flex-col bg-white dark:bg-slate-950/70 border rounded-xl p-2.5 min-h-[340px] max-h-[460px] transition-all shadow-xs ${
                day.isToday
                  ? 'border-sky-400 dark:border-sky-500/50 bg-sky-50/30 dark:bg-sky-950/15 ring-1 ring-sky-300 dark:ring-sky-500/30'
                  : 'border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700/80'
              } ${isOver ? 'ring-2 ring-sky-400 bg-sky-50 dark:bg-sky-950/30 border-sky-400' : ''}`}
            >
              {/* Day Column Header */}
              <div className="pb-2 mb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs font-bold tracking-tight ${
                        day.isToday ? 'text-sky-700 dark:text-sky-300' : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {day.dayShort}
                    </span>
                    <span
                      className={`text-xs font-mono px-1.5 py-0.2 rounded-full font-bold ${
                        day.isToday
                          ? 'bg-sky-500 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {day.dayNumber}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 mt-1">
                    {codingCount > 0 && (
                      <span title={`${codingCount} Coding`} className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    )}
                    {theoryCount > 0 && (
                      <span title={`${theoryCount} Theory`} className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    )}
                    {projectCount > 0 && (
                      <span title={`${projectCount} Projects`} className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    )}
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-0.5 font-mono">
                      {completedCount}/{dayTasks.length}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onOpenNewTaskModalWithDefaults({
                      plannedDate: day.dateStr,
                    })
                  }
                  title={`Add task for ${day.dayName}`}
                  className="p-1 text-slate-400 hover:text-sky-600 dark:hover:text-sky-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Tasks List */}
              <div className="flex-1 space-y-2 overflow-y-auto pr-0.5">
                {dayTasks.length === 0 ? (
                  <div className="h-24 flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-800/60 rounded-lg text-slate-400 dark:text-slate-500 text-[11px] text-center p-2">
                    Drop here
                  </div>
                ) : (
                  dayTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={onEditTask}
                      onDelete={onDeleteTask}
                      onDuplicate={onDuplicateTask}
                      onStatusChange={onStatusChange}
                      onToggleTodayFocus={onToggleTodayFocus}
                      onUpdatePlannedDate={onUpdatePlannedDate}
                      onTagClick={onTagClick}
                      isCompact={true}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
        </div>
      </div>

      {/* 3. Bottom Full-Width Backlog & Pool Dock */}
      <div
        onDragOver={handleBacklogDragOver}
        onDragLeave={() => setDragOverBacklog(false)}
        onDrop={handleBacklogDrop}
        className={`bg-white dark:bg-slate-900 border rounded-xl p-4 transition-all shadow-xs ${
          dragOverBacklog
            ? 'border-sky-500 ring-2 ring-sky-400/40 bg-sky-50/20 dark:bg-slate-850'
            : 'border-slate-200 dark:border-slate-800'
        }`}
      >
        {/* Backlog Dock Header & Quick Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsBacklogDockOpen(!isBacklogDockOpen)}
              className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
              title={isBacklogDockOpen ? 'Collapse Backlog Pool' : 'Expand Backlog Pool'}
            >
              {isBacklogDockOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>

            <div className="flex items-center gap-2">
              <Inbox className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Unscheduled Backlog Pool
              </h3>
              <span className="text-xs font-mono font-bold bg-sky-50 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded-full border border-sky-200 dark:border-sky-500/30">
                {backlogTasks.length} {backlogTasks.length === 1 ? 'task' : 'tasks'}
              </span>
            </div>
          </div>

          {/* Filters & Action Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Quick Search */}
            <div className="relative w-44 sm:w-52">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={backlogSearch}
                onChange={(e) => setBacklogSearch(e.target.value)}
                placeholder="Filter backlog..."
                className="w-full pl-7 pr-6 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 transition-colors"
              />
              {backlogSearch && (
                <button
                  type="button"
                  onClick={() => setBacklogSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 text-xs">
              {(['All', 'Coding', 'Theory / Learning', 'Projects'] as const).map((cat) => {
                const isSelected = backlogCategory === cat;
                const label = cat === 'Theory / Learning' ? 'Theory' : cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setBacklogCategory(cat)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                      isSelected
                        ? 'bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-300 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Priority Filter */}
            <select
              value={backlogPriority}
              onChange={(e) => setBacklogPriority(e.target.value as Priority | 'All')}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] px-2 py-1 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-sky-500"
            >
              <option value="All">Priority: All</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Quick Add Button */}
            <button
              type="button"
              onClick={() =>
                onOpenNewTaskModalWithDefaults({
                  plannedDate: undefined,
                  isTodayFocus: false,
                })
              }
              title="Add task to backlog"
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 rounded-lg shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Backlog</span>
            </button>
          </div>
        </div>

        {/* Backlog Tasks Grid */}
        {isBacklogDockOpen && (
          <div className="mt-3">
            {filteredBacklog.length === 0 ? (
              <div className="py-8 flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-800/80 rounded-lg text-slate-400 dark:text-slate-500 text-xs text-center">
                <p>
                  {backlogTasks.length === 0
                    ? 'No unscheduled backlog tasks. All tasks are planned for the week!'
                    : 'No backlog tasks match the current filter.'}
                </p>
                <span className="text-[11px] text-slate-400 mt-1">
                  Drag tasks down here to un-schedule them back into the backlog.
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 max-h-60 overflow-y-auto pr-1">
                {filteredBacklog.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                    onDuplicate={onDuplicateTask}
                    onStatusChange={onStatusChange}
                    onToggleTodayFocus={onToggleTodayFocus}
                    onUpdatePlannedDate={onUpdatePlannedDate}
                    onTagClick={onTagClick}
                    isCompact={true}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
