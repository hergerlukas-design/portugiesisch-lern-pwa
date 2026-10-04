import type { Card } from '../types';

export const DAILY_TASK_SIZE = 10;

const DAILY_TASK_KEY = 'dailyTask';

export interface DailyTask {
  date: string; // local date, YYYY-MM-DD
  wordIds: string[];
  completed: boolean;
}

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
    localStorage.setItem(DAILY_TASK_KEY, JSON.stringify(task));
  } catch {
    // Task just won't survive a reload
  }
}

/**
 * Today's task, created from the current cards if there is none for today yet
 */
export function getOrCreateDailyTask(cards: Card[]): DailyTask | null {
  const today = todayString();
  try {
    const stored = localStorage.getItem(DAILY_TASK_KEY);
    if (stored) {
      const task = JSON.parse(stored) as DailyTask;
      if (task.date === today && task.wordIds.length > 0) return task;
    }
  } catch {
    // Fall through and create a new task
  }

  const wordIds = pickWords(cards);
  if (wordIds.length === 0) return null;
  const task = { date: today, wordIds, completed: false };
  save(task);
  return task;
}

export function markDailyTaskCompleted(task: DailyTask): DailyTask {
  const completed = { ...task, completed: true };
  save(completed);
  return completed;
}
