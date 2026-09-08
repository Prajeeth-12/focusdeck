import React from 'react';
import type { Task, Category, Priority, Status } from '../../types/task';
import { TaskCard } from '../common/TaskCard';
import { formatFullBannerDate, getTodayDateString } from '../../utils/dateUtils';
import { 
  Code2, 
  BookOpen, 
  FolderGit2, 
  Plus
} from 'lucide-react';

interface TodayViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onDuplicateTask: (id: string) => void;
  onStatusChange: (id: string, status: Status) => void;
  onToggleTodayFocus: (id: string) => void;
  onUpdatePlannedDate: (id: string, dateStr?: string) => void;
  onOpenNewTaskModalWithDefaults: (defaults: { category: Category; isTodayFocus: boolean; plannedDate: string }) => void;
  onTagClick: (tag: string) => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  tasks,
  onEditTask,
  onDeleteTask,
  onDuplicateTask,
  onStatusChange,
  onToggleTodayFocus,
  onUpdatePlannedDate,
  onOpenNewTaskModalWithDefaults,
  onTagClick,
}) => {
  const todayStr = getTodayDateString();

  const todayTasks = tasks.filter((t) => t.isTodayFocus || t.plannedDate === todayStr);

  const codingTasks = todayTasks.filter((t) => t.category === 'Coding');
  const theoryTasks = todayTasks.filter((t) => t.category === 'Theory / Learning');
  const projectTasks = todayTasks.filter((t) => t.category === 'Projects');

  const totalToday = todayTasks.length;
  const completedToday = todayTasks.filter((t) => t.status === 'Completed').length;
  const inProgressToday = todayTasks.filter((t) => t.status === 'In Progress').length;
  const completionPercentage = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  const renderCategoryColumn = (
    category: Category,
    categoryTasks: Task[],
    icon: React.ReactNode,
    borderColor: string,
    accentBg: string,
    textColor: string
  ) => {
    const sortedTasks = [...categoryTasks].sort((a, b) => {
      if (a.status === 'Completed' && b.status !== 'Completed') return 1;
      if (b.status === 'Completed' && a.status !== 'Completed') return -1;
      if (a.status === 'In Progress' && b.status !== 'In Progress') return -1;
      if (b.status === 'In Progress' && a.status !== 'In Progress') return 1;
      
      const priorityWeight: Record<Priority, number> = { High: 3, Medium: 2, Low: 1 };
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    });

    return (
      <div className={`flex flex-col bg-white dark:bg-slate-950/60 border ${borderColor} rounded-xl p-4 min-h-[460px] shadow-xs`}>
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${accentBg} ${textColor}`}>
              {icon}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{category}</h3>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {categoryTasks.filter((t) => t.status === 'Completed').length} of {categoryTasks.length} done
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              onOpenNewTaskModalWithDefaults({
                category,
                isTodayFocus: true,
                plannedDate: todayStr,
              })
            }
            title={`Add new ${category} task for today`}
            className="p-1.5 text-slate-400 hover:text-sky-500 dark:hover:text-sky-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[calc(100vh-320px)] pr-1">
          {sortedTasks.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 dark:border-slate-800/80 rounded-lg text-slate-400 dark:text-slate-500">
              <p className="text-xs font-medium mb-2">No {category} tasks for today</p>
              <button
                type="button"
                onClick={() =>
                  onOpenNewTaskModalWithDefaults({
                    category,
                    isTodayFocus: true,
                    plannedDate: todayStr,
                  })
                }
                className="text-xs text-sky-600 dark:text-sky-400 hover:underline font-semibold inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add focus item
              </button>
            </div>
          ) : (
            sortedTasks.map((task) => (
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
                showCategory={false}
              />
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Date Header & Progress Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 px-2 py-0.5 rounded">
                Daily Focus
              </span>
              {inProgressToday > 0 && (
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                  {inProgressToday} In Progress
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {formatFullBannerDate()}
            </h2>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-lg shrink-0">
            <div className="text-right">
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">
                {completedToday} / {totalToday} <span className="text-slate-500 dark:text-slate-400 font-sans font-normal text-xs">Completed</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {totalToday - completedToday} remaining today
              </div>
            </div>

            <div className="w-12 h-12 relative flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-200 dark:text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-500 dark:text-emerald-400 transition-all duration-500"
                  strokeDasharray={`${completionPercentage}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[11px] font-bold text-slate-900 dark:text-slate-100 font-mono">
                {completionPercentage}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Three Category Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {renderCategoryColumn(
          'Coding',
          codingTasks,
          <Code2 className="w-4 h-4" />,
          'border-emerald-200 dark:border-emerald-500/25',
          'bg-emerald-50 dark:bg-emerald-500/10',
          'text-emerald-600 dark:text-emerald-400'
        )}

        {renderCategoryColumn(
          'Theory / Learning',
          theoryTasks,
          <BookOpen className="w-4 h-4" />,
          'border-indigo-200 dark:border-indigo-500/25',
          'bg-indigo-50 dark:bg-indigo-500/10',
          'text-indigo-600 dark:text-indigo-400'
        )}

        {renderCategoryColumn(
          'Projects',
          projectTasks,
          <FolderGit2 className="w-4 h-4" />,
          'border-amber-200 dark:border-amber-500/25',
          'bg-amber-50 dark:bg-amber-500/10',
          'text-amber-600 dark:text-amber-400'
        )}
      </div>
    </div>
  );
};
