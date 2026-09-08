import Dexie, { type Table } from 'dexie';
import type { Task, Status } from '../types/task';
import { getTodayDateString, calculateNextRecurrenceDate } from '../utils/dateUtils';

export class ProductivityDatabase extends Dexie {
  tasks!: Table<Task, string>;

  constructor() {
    super('ProductivityCommandCenterDB');
    this.version(1).stores({
      tasks: 'id, category, priority, status, plannedDate, dueDate, isTodayFocus, createdAt, completedAt, orderIndex, *tags',
    });
  }
}

export const db = new ProductivityDatabase();

// Initial sample data if DB is empty
export const SAMPLE_TASKS: Omit<Task, 'id' | 'createdAt'>[] = [
  {
    title: 'Solve LeetCode #236: Lowest Common Ancestor',
    description: 'Practice recursive subtree traversal and handle edge cases for BST vs generic binary trees.',
    category: 'Coding',
    priority: 'High',
    status: 'In Progress',
    tags: ['DSA', 'Trees', 'Recursion', 'Interview'],
    plannedDate: getTodayDateString(),
    isTodayFocus: true,
    orderIndex: 0,
    recurrence: { pattern: 'none' },
  },
  {
    title: 'Complete 3 Dynamic Programming problems (Knapsack variations)',
    description: '0/1 Knapsack, Subset Sum, and Target Sum patterns with space optimization.',
    category: 'Coding',
    priority: 'Medium',
    status: 'To Do',
    tags: ['DSA', 'Dynamic Programming', 'Patterns'],
    plannedDate: getTodayDateString(),
    isTodayFocus: true,
    orderIndex: 1,
  },
  {
    title: 'Daily DSA Practice - 1 Medium Problem',
    description: 'Keep streak active on Arrays / Sliding Window.',
    category: 'Coding',
    priority: 'High',
    status: 'To Do',
    tags: ['DSA', 'Daily Routine'],
    plannedDate: getTodayDateString(),
    isTodayFocus: true,
    orderIndex: 2,
    recurrence: { pattern: 'daily' },
  },
  {
    title: 'Study Operating Systems: Virtual Memory & Page Replacement',
    description: 'Review LRU, Clock algorithm, TLB misses, and page table hierarchies.',
    category: 'Theory / Learning',
    priority: 'High',
    status: 'In Progress',
    tags: ['OS', 'University', 'Systems', 'Memory'],
    plannedDate: getTodayDateString(),
    isTodayFocus: true,
    orderIndex: 3,
  },
  {
    title: 'Read Computer Networks: TCP Congestion Control & Fast Recovery',
    description: 'AIMD, Slow Start, Reno vs CUBIC algorithms.',
    category: 'Theory / Learning',
    priority: 'Medium',
    status: 'To Do',
    tags: ['Networks', 'Protocols', 'TCP/IP'],
    plannedDate: getTodayDateString(),
    isTodayFocus: true,
    orderIndex: 4,
  },
  {
    title: 'Implement JWT Auth & Refresh Token rotation in Express API',
    description: 'Set up httpOnly cookie storage, expiry middleware, and Redis blacklist for logout.',
    category: 'Projects',
    priority: 'High',
    status: 'In Progress',
    tags: ['Backend', 'Security', 'Auth', 'Node.js'],
    plannedDate: getTodayDateString(),
    isTodayFocus: true,
    orderIndex: 5,
  },
  {
    title: 'Design Database Schema for Notifications Service',
    description: 'Support multi-channel dispatch (email, webhook, in-app) with read receipts.',
    category: 'Projects',
    priority: 'Medium',
    status: 'To Do',
    tags: ['System Design', 'PostgreSQL', 'Architecture'],
    plannedDate: getTodayDateString(),
    isTodayFocus: true,
    orderIndex: 6,
  },
  {
    title: 'Read System Design Primer: Distributed Caching with Redis',
    description: 'Cache-aside, write-through, write-behind, and cache stampede prevention.',
    category: 'Theory / Learning',
    priority: 'Low',
    status: 'To Do',
    tags: ['System Design', 'Redis', 'Architecture'],
    plannedDate: '',
    isTodayFocus: false,
    orderIndex: 7,
  },
  {
    title: 'Build CLI tool for local markdown note sync',
    description: 'Simple Go script to watch folder and format frontmatter.',
    category: 'Projects',
    priority: 'Low',
    status: 'To Do',
    tags: ['Go', 'Tools', 'CLI'],
    plannedDate: '',
    isTodayFocus: false,
    orderIndex: 8,
  }
];

export async function initializeDatabase() {
  const count = await db.tasks.count();
  if (count === 0) {
    const now = new Date().toISOString();
    const tasksToInsert: Task[] = SAMPLE_TASKS.map((t, idx) => ({
      ...t,
      id: `task-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: now,
    }));
    await db.tasks.bulkAdd(tasksToInsert);
  }
}

/**
 * Task CRUD Operations
 */
export async function createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'orderIndex'>): Promise<Task> {
  const allTasks = await db.tasks.toArray();
  const maxOrder = allTasks.reduce((max, t) => Math.max(max, t.orderIndex || 0), 0);

  const newTask: Task = {
    ...taskData,
    id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    orderIndex: maxOrder + 1,
    tags: taskData.tags || [],
  };

  await db.tasks.add(newTask);
  return newTask;
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<void> {
  await db.tasks.update(id, updates);
}

export async function deleteTask(id: string): Promise<void> {
  await db.tasks.delete(id);
}

export async function duplicateTask(id: string): Promise<Task | null> {
  const task = await db.tasks.get(id);
  if (!task) return null;

  const newTask: Task = {
    ...task,
    id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: `${task.title} (Copy)`,
    createdAt: new Date().toISOString(),
    status: 'To Do',
    completedAt: undefined,
    orderIndex: task.orderIndex + 1,
  };

  await db.tasks.add(newTask);
  return newTask;
}

/**
 * Update task status with manual user workflow and recurrence resolution
 */
export async function updateTaskStatus(id: string, newStatus: Status): Promise<void> {
  const task = await db.tasks.get(id);
  if (!task) return;

  const updates: Partial<Task> = {
    status: newStatus,
  };

  if (newStatus === 'Completed') {
    updates.completedAt = new Date().toISOString();
    
    // Check if recurrence is configured
    if (task.recurrence && task.recurrence.pattern !== 'none') {
      const nextPlannedDate = calculateNextRecurrenceDate(task.plannedDate, task.recurrence);
      
      const nextOccurrence: Task = {
        ...task,
        id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        status: 'To Do',
        createdAt: new Date().toISOString(),
        completedAt: undefined,
        plannedDate: nextPlannedDate,
        isTodayFocus: nextPlannedDate === getTodayDateString(),
        orderIndex: task.orderIndex + 1,
      };

      await db.tasks.add(nextOccurrence);
    }
  } else {
    updates.completedAt = undefined;
  }

  await db.tasks.update(id, updates);
}

export async function toggleTodayFocus(id: string): Promise<boolean> {
  const task = await db.tasks.get(id);
  if (!task) return false;

  const nextVal = !task.isTodayFocus;
  await db.tasks.update(id, {
    isTodayFocus: nextVal,
    plannedDate: nextVal && !task.plannedDate ? getTodayDateString() : task.plannedDate,
  });
  return nextVal;
}

export async function updateTaskPlannedDate(id: string, plannedDate: string | undefined): Promise<void> {
  const isToday = plannedDate === getTodayDateString();
  await db.tasks.update(id, {
    plannedDate: plannedDate || '',
    isTodayFocus: isToday ? true : false,
  });
}

/**
 * Get unique list of all tags present in the database (for auto-suggest)
 */
export async function getAllUniqueTags(): Promise<string[]> {
  const tasks = await db.tasks.toArray();
  const tagSet = new Set<string>();
  tasks.forEach((t) => {
    if (t.tags && Array.isArray(t.tags)) {
      t.tags.forEach((tag) => {
        const trimmed = tag.trim();
        if (trimmed) tagSet.add(trimmed);
      });
    }
  });
  return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
}

/**
 * Export and Import Helpers for Local Backup
 */
export async function exportDatabaseToJson(): Promise<string> {
  const tasks = await db.tasks.toArray();
  return JSON.stringify({
    version: 1,
    exportedAt: new Date().toISOString(),
    tasks,
  }, null, 2);
}

export async function importDatabaseFromJson(jsonString: string): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const data = JSON.parse(jsonString);
    if (!data.tasks || !Array.isArray(data.tasks)) {
      return { success: false, count: 0, error: 'Invalid file format: missing tasks array' };
    }

    const validTasks: Task[] = data.tasks.filter((t: any) => t.id && t.title && t.category);
    await db.tasks.clear();
    await db.tasks.bulkAdd(validTasks);

    return { success: true, count: validTasks.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err?.message || 'Failed to parse JSON' };
  }
}

export async function resetDatabaseToSamples(): Promise<void> {
  await db.tasks.clear();
  const now = new Date().toISOString();
  const tasksToInsert: Task[] = SAMPLE_TASKS.map((t, idx) => ({
    ...t,
    id: `task-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: now,
  }));
  await db.tasks.bulkAdd(tasksToInsert);
}
