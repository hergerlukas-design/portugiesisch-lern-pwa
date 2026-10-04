import type { Card, Direction, Level } from '../types';

export const DAILY_TASK_SIZE = 10;

// DE → PT keeps the original key so existing tasks carry over
const taskKey = (direction: Direction) =>
  direction === 'de-pt' ? 'dailyTask' : `dailyTask:${direction}`;

export interface DailyTask {
  date: string; // local date, YYYY-MM-DD
  direction: Direction;
  wordIds: string[];
  // Each level can complete the same words once
  completedLevels: Level[];
}

const LEVEL_ORDER: Level[] = ['beginner', 'advanced'];

function todayString(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Pick today's words: due reviews first, then new words (in frequency order),
 * then whatever comes up next
 */
function pickWords(cards: Card[]): string[] {
  const now = new Date();
  const rank = (card: Card) => {
    const due = card.nextReviewDate <= now;
    if (due && card.status !== 'new') return 0;
    if (card.status === 'new') return 1;
    return 2;
  };
  return [...cards]
    .sort(
      (a, b) =>
        rank(a) - rank(b) || a.nextReviewDate.getTime() - b.nextReviewDate.getTime()
    )
    .slice(0, DAILY_TASK_SIZE)
    .map((card) => card.wordId);
}

function save(task: DailyTask) {
  try {
    localStorage.setItem(taskKey(task.direction), JSON.stringify(task));
  } catch {
    // Task just won't survive a reload
  }
}

/**
 * Today's task, created from the current cards if there is none for today yet
 */
export function getOrCreateDailyTask(cards: Card[], direction: Direction): DailyTask | null {
  const today = todayString();
  try {
    const stored = localStorage.getItem(taskKey(direction));
    if (stored) {
      const task = JSON.parse(stored) as DailyTask & { completed?: boolean };
      if (task.date === today && task.wordIds.length > 0) {
        // Older tasks stored a single flag; those were completed in beginner mode
        if (!Array.isArray(task.completedLevels)) {
          task.completedLevels = task.completed ? ['beginner'] : [];
        }
        return { date: task.date, direction, wordIds: task.wordIds, completedLevels: task.completedLevels };
      }
    }
  } catch {
    // Fall through and create a new task
  }

  const wordIds = pickWords(cards);
  if (wordIds.length === 0) return null;
  const task: DailyTask = { date: today, direction, wordIds, completedLevels: [] };
  save(task);
  return task;
}

export function markDailyTaskCompleted(task: DailyTask, level: Level): DailyTask {
  if (task.completedLevels.includes(level)) return task;
  const completed = { ...task, completedLevels: [...task.completedLevels, level] };
  save(completed);
  return completed;
}

/**
 * Level for the next daily run: the preferred one if still open, else the other open
 * one; once both are done, practice continues in the preferred level
 */
export function nextDailyLevel(task: DailyTask, preferred: Level): Level {
  if (!task.completedLevels.includes(preferred)) return preferred;
  return LEVEL_ORDER.find((l) => !task.completedLevels.includes(l)) ?? preferred;
}

export function isDailyTaskDone(task: DailyTask): boolean {
  return LEVEL_ORDER.every((l) => task.completedLevels.includes(l));
}
