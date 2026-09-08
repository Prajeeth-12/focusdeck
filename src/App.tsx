import { useState, useEffect, useRef, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  db, 
  initializeDatabase, 
  createTask, 
  updateTask, 
  deleteTask, 
  duplicateTask, 
  updateTaskStatus, 
  toggleTodayFocus, 
  updateTaskPlannedDate 
} from './db/db';
import type { Task, ViewMode, Category, Priority, Status } from './types/task';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { TaskModal } from './components/modals/TaskModal';
import { TodayView } from './components/views/TodayView';
import { WeekView } from './components/views/WeekView';
import { TaskPoolView } from './components/views/TaskPoolView';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { getTodayDateString, getWeekDates } from './utils/dateUtils';

export function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('today');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [selectedPriority, setSelectedPriority] = useState<Priority | 'All'>('All');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
  });

  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [modalDefaults, setModalDefaults] = useState<{
    category?: Category;
    isTodayFocus?: boolean;
    plannedDate?: string;
    status?: Status;
  }>({});

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    initializeDatabase().catch(console.error);
  }, []);

  // Sync theme with document element and localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const allTasks = useLiveQuery(() => db.tasks.toArray(), []) || [];

  const filteredTasks = useMemo(() => {
    return allTasks.filter((task) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = task.title.toLowerCase().includes(query);
        const matchDesc = task.description?.toLowerCase().includes(query) || false;
        const matchCat = task.category.toLowerCase().includes(query);
        const matchTags = task.tags?.some((t) => t.toLowerCase().includes(query)) || false;
        if (!matchTitle && !matchDesc && !matchCat && !matchTags) return false;
      }

      if (selectedCategory !== 'All' && task.category !== selectedCategory) {
        return false;
      }

      if (selectedPriority !== 'All' && task.priority !== selectedPriority) {
        return false;
      }

      if (selectedTags.length > 0) {
        const hasAllTags = selectedTags.every((t) => task.tags?.includes(t));
        if (!hasAllTags) return false;
      }

      return true;
    });
  }, [allTasks, searchQuery, selectedCategory, selectedPriority, selectedTags]);

  const allTagsWithCounts = useMemo(() => {
    const tagCountMap = new Map<string, number>();
    allTasks.forEach((t) => {
      if (t.tags && Array.isArray(t.tags)) {
        t.tags.forEach((tag) => {
          const clean = tag.trim();
          if (clean) {
            tagCountMap.set(clean, (tagCountMap.get(clean) || 0) + 1);
          }
        });
      }
    });

    return Array.from(tagCountMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [allTasks]);

  const todayStr = getTodayDateString();
  const currentWeekDays = useMemo(() => getWeekDates(new Date()).map((d) => d.dateStr), []);

  const todayCount = useMemo(() => {
    return allTasks.filter(
      (t) => (t.isTodayFocus || t.plannedDate === todayStr) && t.status !== 'Completed'
    ).length;
  }, [allTasks, todayStr]);

  const weekCount = useMemo(() => {
    return allTasks.filter(
      (t) => t.plannedDate && currentWeekDays.includes(t.plannedDate) && t.status !== 'Completed'
    ).length;
  }, [allTasks, currentWeekDays]);

  const backlogTasks = useMemo(() => {
    return allTasks.filter(
      (t) => !t.plannedDate && !t.isTodayFocus && t.status !== 'Completed'
    );
  }, [allTasks]);

  const totalActiveCount = useMemo(() => {
    return allTasks.filter((t) => t.status !== 'Completed').length;
  }, [allTasks]);

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleClearAllFilters = () => {
    setSelectedCategory('All');
    setSelectedPriority('All');
    setSelectedTags([]);
    setSearchQuery('');
  };

  const handleOpenNewTaskModal = (defaults: {
    category?: Category;
    isTodayFocus?: boolean;
    plannedDate?: string;
    status?: Status;
  } = {}) => {
    setEditingTask(null);
    setModalDefaults(defaults);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'orderIndex'>) => {
    if (editingTask) {
      await updateTask(editingTask.id, taskData);
    } else {
      await createTask(taskData);
    }
    setIsTaskModalOpen(false);
  };

  const handleDeleteTask = async (id: string) => {
    if (window.confirm('Delete this task?')) {
      await deleteTask(id);
    }
  };

  const handleDuplicateTask = async (id: string) => {
    await duplicateTask(id);
  };

  const handleStatusChange = async (id: string, status: Status) => {
    await updateTaskStatus(id, status);
  };

  const handleToggleTodayFocus = async (id: string) => {
    await toggleTodayFocus(id);
  };

  const handleUpdatePlannedDate = async (id: string, dateStr?: string) => {
    await updateTaskPlannedDate(id, dateStr);
  };

  useKeyboardShortcuts({
    onOpenNewTask: () => handleOpenNewTaskModal(),
    onFocusSearch: () => searchInputRef.current?.focus(),
    onSetView: (v) => setCurrentView(v),
    onCloseModal: () => setIsTaskModalOpen(false),
    isModalOpen: isTaskModalOpen,
  });

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased font-sans transition-colors">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        selectedTags={selectedTags}
        onTagToggle={handleTagToggle}
        allTags={allTagsWithCounts}
        todayCount={todayCount}
        weekCount={weekCount}
        totalActiveCount={totalActiveCount}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedPriority={selectedPriority}
          onPriorityChange={setSelectedPriority}
          selectedTags={selectedTags}
          onRemoveTag={(tag) => setSelectedTags(selectedTags.filter((t) => t !== tag))}
          onClearAllFilters={handleClearAllFilters}
          onOpenNewTaskModal={() => handleOpenNewTaskModal()}
          theme={theme}
          onToggleTheme={toggleTheme}
          searchRef={searchInputRef}
        />

        <main className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-950/60">
          {currentView === 'today' && (
            <TodayView
              tasks={filteredTasks}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onDuplicateTask={handleDuplicateTask}
              onStatusChange={handleStatusChange}
              onToggleTodayFocus={handleToggleTodayFocus}
              onUpdatePlannedDate={handleUpdatePlannedDate}
              onOpenNewTaskModalWithDefaults={handleOpenNewTaskModal}
              onTagClick={handleTagToggle}
            />
          )}

          {currentView === 'week' && (
            <WeekView
              tasks={filteredTasks}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onDuplicateTask={handleDuplicateTask}
              onStatusChange={handleStatusChange}
              onToggleTodayFocus={handleToggleTodayFocus}
              onUpdatePlannedDate={handleUpdatePlannedDate}
              onOpenNewTaskModalWithDefaults={handleOpenNewTaskModal}
              onTagClick={handleTagToggle}
              backlogTasks={backlogTasks}
            />
          )}

          {currentView === 'pool' && (
            <TaskPoolView
              tasks={filteredTasks}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onDuplicateTask={handleDuplicateTask}
              onStatusChange={handleStatusChange}
              onToggleTodayFocus={handleToggleTodayFocus}
              onUpdatePlannedDate={handleUpdatePlannedDate}
              onTagClick={handleTagToggle}
            />
          )}
        </main>
      </div>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        initialTask={editingTask}
        defaultCategory={modalDefaults.category}
        defaultIsTodayFocus={modalDefaults.isTodayFocus}
        defaultPlannedDate={modalDefaults.plannedDate}
      />
    </div>
  );
}

export default App;
