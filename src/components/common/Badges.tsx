import React from 'react';
import type { Category, Priority, Status } from '../../types/task';
import { Code2, BookOpen, FolderGit2, ArrowUp, ArrowRight, ArrowDown, CheckCircle2, Clock, CircleDot } from 'lucide-react';

interface CategoryBadgeProps {
  category: Category;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  size = 'md',
  showIcon = true,
}) => {
  const getStyles = () => {
    switch (category) {
      case 'Coding':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/25',
          icon: <Code2 className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
        };
      case 'Theory / Learning':
        return {
          bg: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/25',
          icon: <BookOpen className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
        };
      case 'Projects':
        return {
          bg: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/25',
          icon: <FolderGit2 className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
        };
      default:
        return {
          bg: 'bg-slate-100 dark:bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-500/25',
          icon: null,
        };
    }
  };

  const style = getStyles();
  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5 gap-1' : 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border ${style.bg} ${sizeClasses} transition-colors tracking-tight`}
    >
      {showIcon && style.icon}
      <span>{category}</span>
    </span>
  );
};

interface PriorityBadgeProps {
  priority: Priority;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'sm' }) => {
  const getStyles = () => {
    switch (priority) {
      case 'High':
        return {
          bg: 'bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30 font-semibold',
          icon: <ArrowUp className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
        };
      case 'Medium':
        return {
          bg: 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30 font-medium',
          icon: <ArrowRight className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
        };
      case 'Low':
        return {
          bg: 'bg-slate-100 dark:bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-500/30 font-medium',
          icon: <ArrowDown className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
        };
    }
  };

  const style = getStyles();
  const sizeClasses = size === 'sm' ? 'text-[11px] px-1.5 py-0.5 gap-1' : 'text-xs px-2 py-0.5 gap-1';

  return (
    <span className={`inline-flex items-center font-medium rounded border ${style.bg} ${sizeClasses}`}>
      {style.icon}
      <span>{priority}</span>
    </span>
  );
};

interface StatusBadgeProps {
  status: Status;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const getStyles = () => {
    switch (status) {
      case 'To Do':
        return {
          bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
          icon: <CircleDot className="w-3 h-3 text-slate-400" />,
        };
      case 'In Progress':
        return {
          bg: 'bg-sky-50 dark:bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-500/30',
          icon: <Clock className="w-3 h-3 text-sky-500 animate-pulse" />,
        };
      case 'Completed':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30',
          icon: <CheckCircle2 className="w-3 h-3 text-emerald-500" />,
        };
    }
  };

  const style = getStyles();
  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5 gap-1.5' : 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span className={`inline-flex items-center font-medium rounded-md border ${style.bg} ${sizeClasses}`}>
      {style.icon}
      <span>{status}</span>
    </span>
  );
};
