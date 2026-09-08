import React from 'react';
import type { ViewMode } from '../../types/task';
import { 
  Sun, 
  CalendarDays, 
  Layers, 
  Tag as TagIcon, 
  ChevronLeft, 
  ChevronRight,
  LayoutDashboard
} from 'lucide-react';

interface SidebarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  allTags: { name: string; count: number }[];
  todayCount: number;
  weekCount: number;
  totalActiveCount: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  selectedTags,
  onTagToggle,
  allTags,
  todayCount,
  weekCount,
  totalActiveCount,
  collapsed,
  onToggleCollapse,
}) => {
  const navItems: { id: ViewMode; label: string; icon: React.ReactNode; count?: number; badgeColor?: string; shortcut: string }[] = [
    {
      id: 'today',
      label: 'Today',
      icon: <Sun className="w-4 h-4 text-amber-500" />,
      count: todayCount,
      badgeColor: 'bg-amber-500/20 text-amber-500 dark:text-amber-300 font-semibold',
      shortcut: '1',
    },
    {
      id: 'week',
      label: 'Weekly Plan',
      icon: <CalendarDays className="w-4 h-4 text-sky-500" />,
      count: weekCount,
      badgeColor: 'bg-sky-500/20 text-sky-600 dark:text-sky-300 font-semibold',
      shortcut: '2',
    },
    {
      id: 'pool',
      label: 'Task Pool',
      icon: <Layers className="w-4 h-4 text-indigo-500" />,
      count: totalActiveCount,
      badgeColor: 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 font-semibold',
      shortcut: '3',
    },
  ];

  return (
    <aside
      className={`h-screen sticky top-0 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800/80 flex flex-col justify-between transition-all duration-200 select-none z-40 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      <div className="p-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center shadow-md">
              <LayoutDashboard className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-xs font-bold text-slate-900 dark:text-slate-100 tracking-wider uppercase leading-none">
                FocusDeck
              </h1>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Personal Workspace</span>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors mx-auto"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div className="space-y-1">
          {!collapsed && (
            <div className="px-2 pb-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Navigation
            </div>
          )}
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onViewChange(item.id)}
                title={collapsed ? `${item.label} (Key: ${item.shortcut})` : undefined}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-sky-300 font-semibold border border-sky-200 dark:border-sky-500/30 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {item.icon}
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!collapsed && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.count !== undefined && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${item.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                        {item.count}
                      </span>
                    )}
                    <kbd className="text-[9px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-900 px-1 rounded border border-slate-200 dark:border-slate-800">
                      {item.shortcut}
                    </kbd>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Tags Filter Cloud */}
        {!collapsed && allTags.length > 0 && (
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800/60">
            <div className="px-2 pb-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Tags Filter</span>
              <TagIcon className="w-3 h-3 text-slate-400" />
            </div>

            <div className="flex flex-wrap gap-1 px-1 max-h-48 overflow-y-auto">
              {allTags.map((tag) => {
                const isSelected = selectedTags.includes(tag.name);
                return (
                  <button
                    key={tag.name}
                    type="button"
                    onClick={() => onTagToggle(tag.name)}
                    className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-colors ${
                      isSelected
                        ? 'bg-sky-500 text-white font-semibold shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    #{tag.name} <span className="opacity-60 text-[9px]">({tag.count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/80 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            Local IndexedDB
          </span>
          <span className="text-[10px] font-mono">Offline Ready</span>
        </div>
      )}
    </aside>
  );
};
