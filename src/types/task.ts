export type Category = 'Coding' | 'Theory / Learning' | 'Projects';
export type Priority = 'High' | 'Medium' | 'Low';
export type Status = 'To Do' | 'In Progress' | 'Completed';

export type RecurrencePattern = 'none' | 'daily' | 'weekly' | 'weekdays' | 'custom_days';

export interface RecurrenceConfig {
  pattern: RecurrencePattern;
  daysOfWeek?: number[]; // 0 = Sun, 1 = Mon, ..., 6 = Sat
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: Category;
  priority: Priority;
  status: Status;
  tags: string[];
  
  createdAt: string;       // ISO string e.g. "2026-09-08T18:00:00.000Z"
  plannedDate?: string;    // Date string "YYYY-MM-DD"
  dueDate?: string;        // Date string "YYYY-MM-DD"
  completedAt?: string;    // ISO string timestamp when completed
  
  isTodayFocus: boolean;   // Explicit focus toggle for today
  recurrence?: RecurrenceConfig;
  orderIndex: number;
}

export type ViewMode = 'today' | 'week' | 'pool';

export interface FilterOptions {
  searchQuery: string;
  category: Category | 'All';
  priority: Priority | 'All';
  status: Status | 'All';
  selectedTags: string[];
  dateFilter?: 'all' | 'today' | 'this_week' | 'unscheduled';
}
