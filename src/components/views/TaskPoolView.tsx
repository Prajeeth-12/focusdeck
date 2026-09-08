import React, { useState } from 'react';
import type { Task, Priority, Status } from '../../types/task';
import { TaskCard } from '../common/TaskCard';
import { CategoryBadge, PriorityBadge } from '../common/Badges';
import { formatDisplayDate } from '../../utils/dateUtils';
import { 
  Layers, 
  LayoutGrid, 
  Table as TableIcon, 
  Kanban as KanbanIcon,
  ArrowUpDown, 
  Edit3, 
  Copy, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  CircleDot, 
  Inbox, 
  Archive, 
  ListTodo
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TaskPoolViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onDuplicateTask: (id: string) => void;
  onStatusChange: (id: string, status: Status) => void;
  onToggleTodayFocus: (id: string) => void;
  onUpdatePlannedDate: (id: string, dateStr?: string) => void;
  onTagClick: (tag: string) => void;
}

type PoolSegment = 'backlog' | 'active' | 'completed';
type LayoutMode = 'table' | 'grid' | 'kanban';
type SortField = 'createdAt' | 'plannedDate' | 'priority' | 'title' | 'category';
type SortOrder = 'asc' | 'desc';

export const TaskPoolView: React.FC<TaskPoolViewProps> = ({
  tasks,
  onEditTask,
  onDeleteTask,
  onDuplicateTask,
  onStatusChange,
  onToggleTodayFocus,
  onUpdatePlannedDate,
  onTagClick,
}) => {
  const [segment, setSegment] = useState<PoolSegment>('active');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('table');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [dragOverColumn, setDragOverColumn] = useState<Status | null>(null);

  // Segment filtering
  const segmentTasks = tasks.filter((t) => {
    if (segment === 'backlog') {
      return !t.plannedDate && !t.isTodayFocus && t.status !== 'Completed';
    }
    if (segment === 'completed') {
      return t.status === 'Completed';
    }
    // active
    return t.status !== 'Completed';
  });

  // Sorting
  const sortedTasks = [...segmentTasks].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'title') {
      comparison = a.title.localeCompare(b.title);
    } else if (sortField === 'category') {
      comparison = a.category.localeCompare(b.category);
    } else if (sortField === 'priority') {
      const pWeight: Record<Priority, number> = { High: 3, Medium: 2, Low: 1 };
      comparison = pWeight[a.priority] - pWeight[b.priority];
    } else if (sortField === 'plannedDate') {
      comparison = (a.plannedDate || '').localeCompare(b.plannedDate || '');
    } else {
      comparison = (a.createdAt || '').localeCompare(b.createdAt || '');
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const backlogCount = tasks.filter((t) => !t.plannedDate && !t.isTodayFocus && t.status !== 'Completed').length;
  const activeCount = tasks.filter((t) => t.status !== 'Completed').length;
  const completedCount = tasks.filter((t) => t.status === 'Completed').length;

  const handleKanbanDrop = (e: React.DragEvent, targetStatus: Status) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      if (targetStatus === 'Completed') {
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        confetti({
          particleCount: 30,
          spread: 60,
          origin: { x: (rect.left + rect.width / 2) / window.innerWidth, y: (rect.top + rect.height / 2) / window.innerHeight },
          colors: ['#10B981', '#38BDF8', '#818CF8'],
          disableForReducedMotion: true,
        });
      }
      onStatusChange(taskId, targetStatus);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Segment Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-3.5 shadow-xs transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Task Pool & Registry</span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Central repository for backlog storage, all active tasks, and finished archive
            </p>
          </div>
        </div>

        {/* Segments: Backlog | All Active | Completed Archive & Layout Mode Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setSegment('backlog')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
                segment === 'backlog'
                  ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>Backlog</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-200 dark:bg-slate-900 rounded-full text-slate-700 dark:text-slate-300">
                {backlogCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSegment('active')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
                segment === 'active'
                  ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <ListTodo className="w-3.5 h-3.5" />
              <span>All Active</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-200 dark:bg-slate-900 rounded-full text-slate-700 dark:text-slate-300">
                {activeCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSegment('completed')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
                segment === 'completed'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Completed Archive</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-200 dark:bg-slate-900 rounded-full text-slate-700 dark:text-slate-300">
                {completedCount}
              </span>
            </button>
          </div>

          <div className="flex items-center bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setLayoutMode('table')}
              title="Table View"
              className={`p-1.5 rounded-md transition-colors ${
                layoutMode === 'table' ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <TableIcon className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setLayoutMode('grid')}
              title="Card Grid View"
              className={`p-1.5 rounded-md transition-colors ${
                layoutMode === 'grid' ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setLayoutMode('kanban')}
              title="Kanban Board View"
              className={`p-1.5 rounded-md transition-colors ${
                layoutMode === 'kanban' ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <KanbanIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Layout Rendering */}
      {layoutMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['To Do', 'In Progress', 'Completed'] as const).map((st) => {
            const colTasks = sortedTasks.filter((t) => t.status === st);
            const isOver = dragOverColumn === st;

            return (
              <div
                key={st}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (dragOverColumn !== st) setDragOverColumn(st);
                }}
                onDragLeave={() => setDragOverColumn(null)}
                onDrop={(e) => handleKanbanDrop(e, st)}
                className={`flex flex-col bg-slate-50 dark:bg-slate-950/70 border rounded-xl p-4 min-h-[520px] transition-all ${
                  isOver ? 'ring-2 ring-sky-400 bg-slate-100 dark:bg-slate-900 border-sky-500' : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    {st === 'To Do' && <CircleDot className="w-4 h-4 text-slate-400" />}
                    {st === 'In Progress' && <Clock className="w-4 h-4 text-sky-500 animate-pulse" />}
                    {st === 'Completed' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">{st}</h3>
                    <span className="text-xs font-mono font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full">
                      {colTasks.length}
                    </span>
                  </div>
                </div>

                <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
                  {colTasks.length === 0 ? (
                    <div className="h-32 flex items-center justify-center border border-dashed border-slate-300 dark:border-slate-800/80 rounded-lg text-slate-400 text-xs text-center p-3">
                      Drop tasks here
                    </div>
                  ) : (
                    colTasks.map((task) => (
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
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : layoutMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedTasks.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              No tasks found in this section.
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
              />
            ))
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">Status</th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200"
                    onClick={() => toggleSort('title')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Task Title</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200"
                    onClick={() => toggleSort('category')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Category</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200"
                    onClick={() => toggleSort('priority')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Priority</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Tags</th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200"
                    onClick={() => toggleSort('plannedDate')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Planned Date</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {sortedTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No tasks found in this view.
                    </td>
                  </tr>
                ) : (
                  sortedTasks.map((task) => (
                    <tr
                      key={task.id}
                      onClick={() => onEditTask(task)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    >
                      <td className="py-2.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() =>
                            onStatusChange(
                              task.id,
                              task.status === 'Completed' ? 'To Do' : 'Completed'
                            )
                          }
                          title={task.status === 'Completed' ? 'Reopen' : 'Mark complete'}
                        >
                          {task.status === 'Completed' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : task.status === 'In Progress' ? (
                            <Clock className="w-4 h-4 text-sky-500 animate-pulse" />
                          ) : (
                            <CircleDot className="w-4 h-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                          )}
                        </button>
                      </td>

                      <td className="py-2.5 px-4 font-medium text-slate-900 dark:text-slate-100 max-w-xs sm:max-w-sm truncate">
                        <span className={task.status === 'Completed' ? 'line-through text-slate-400 dark:text-slate-500' : ''}>
                          {task.title}
                        </span>
                      </td>

                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <CategoryBadge category={task.category} size="sm" />
                      </td>

                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <PriorityBadge priority={task.priority} size="sm" />
                      </td>

                      <td className="py-2.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {task.tags?.map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => onTagClick(t)}
                              className="text-[10px] px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700 font-mono"
                            >
                              #{t}
                            </button>
                          ))}
                        </div>
                      </td>

                      <td className="py-2.5 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        {task.plannedDate ? formatDisplayDate(task.plannedDate) : '—'}
                      </td>

                      <td className="py-2.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => onEditTask(task)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDuplicateTask(task.id)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
                            title="Duplicate"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteTask(task.id)}
                            className="p-1 hover:bg-rose-50 dark:hover:bg-rose-500/20 text-slate-400 hover:text-rose-500 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
