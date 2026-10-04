import React from 'react';
import type { Direction, Stats } from '../types';
import { getProgressHistory } from '../lib/useProgress';
import { DAILY_TASK_SIZE } from '../lib/dailyTask';

interface StatsProps {
  stats: Stats;
  direction: Direction;
}

const WEEKDAYS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const CHART_HEIGHT = 100;

// Answers per day for the last 7 days, oldest first
function lastWeek(direction: Direction) {
  const entries = getProgressHistory().filter((p) => (p.direction ?? 'de-pt') === direction);
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - (6 - i));
    const next = new Date(day);
    next.setDate(next.getDate() + 1);
    const count = entries.filter((p) => p.timestamp >= day && p.timestamp < next).length;
    return { label: WEEKDAYS[day.getDay()], count, today: i === 6 };
  });
}

export const StatsComponent: React.FC<StatsProps> = ({ stats, direction }) => {
  const total = Math.max(stats.totalCards, 1);
  const week = lastWeek(direction);
  // Goal line sits at CHART_HEIGHT; busier days grow past it up to the box
  const scale = Math.max(DAILY_TASK_SIZE, ...week.map((d) => d.count)) / DAILY_TASK_SIZE;

  const metrics = [
    { label: 'Heute', value: stats.todayReviews, unit: 'Karten' },
    { label: 'Diese Woche', value: stats.weekReviews, unit: 'Karten' },
    { label: 'Genauigkeit', value: `${stats.accuracy}%`, unit: 'insgesamt' },
    { label: 'Beste Serie', value: stats.streak, unit: 'richtig in Folge' },
  ];

  const statuses = [
    { label: 'Gemeistert', value: stats.masteredCards, color: 'bg-forest-800 dark:bg-forest-300' },
    { label: 'Wiederholen', value: stats.reviewingCards, color: 'bg-forest-400' },
    { label: 'Lernend', value: stats.learningCards, color: 'bg-forest-200 dark:bg-forest-700' },
    { label: 'Neu', value: stats.newCards, color: 'bg-white/90 ring-1 ring-inset ring-ink/20 dark:bg-white/20 dark:ring-white/20' },
  ];

  return (
    <div className="space-y-3.5">
      <div className="grid grid-cols-2 gap-2.5">
        {metrics.map(({ label, value, unit }) => (
          <div key={label} className="glass rounded-[20px] px-4 py-3.5 flex flex-col gap-0.5">
            <span className="text-xs font-bold text-muted dark:text-gray-300">{label}</span>
            <span className="font-display font-bold text-[28px] tabular-nums">{value}</span>
            <span className="text-xs text-muted dark:text-gray-300">{unit}</span>
          </div>
        ))}
      </div>

      <section className="glass rounded-3xl p-[18px] flex flex-col gap-3.5">
        <div className="flex justify-between items-baseline">
          <h2 className="m-0 text-[15px] font-bold">Karten pro Tag</h2>
          <span className="text-xs font-semibold text-muted dark:text-gray-300">Ziel {DAILY_TASK_SIZE}</span>
        </div>
        <div
          role="img"
          aria-label={`Karten pro Tag, letzte 7 Tage: ${week.map((d) => `${d.label} ${d.count}`).join(', ')}`}
          className="relative grid grid-cols-7 gap-2.5 items-end"
          style={{ height: CHART_HEIGHT * 1.28 }}
        >
          <div
            className="absolute inset-x-0 border-t border-dashed border-ink/25 dark:border-white/25"
            style={{ bottom: CHART_HEIGHT / scale + 24 }}
          />
          {week.map(({ label, count, today }) => (
            <div key={label} className="flex flex-col items-center gap-1.5">
              <div
                className={`w-full rounded-lg ${
                  today
                    ? 'bg-forest-600 dark:bg-forest-400'
                    : count >= DAILY_TASK_SIZE
                      ? 'bg-forest-800 dark:bg-forest-300'
                      : 'bg-white/80 dark:bg-white/20'
                }`}
                style={{ height: Math.max(4, Math.round((count / DAILY_TASK_SIZE / scale) * CHART_HEIGHT)) }}
              />
              <span className={`text-xs ${today ? 'font-extrabold' : 'font-semibold text-muted dark:text-gray-300'}`}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="glass rounded-3xl p-[18px] flex flex-col gap-3.5">
        <div className="flex justify-between items-baseline">
          <h2 className="m-0 text-[15px] font-bold">Wortschatz</h2>
          <span className="text-xs font-semibold text-muted dark:text-gray-300">{stats.totalCards} Wörter</span>
        </div>
        <div className="flex h-3.5 rounded-[7px] overflow-hidden gap-[3px]">
          {statuses.map(({ label, value, color }) =>
            value > 0 ? <div key={label} className={color} style={{ width: `${(value / total) * 100}%` }} /> : null
          )}
        </div>
        <ul className="grid grid-cols-2 gap-x-3 gap-y-2 text-[13px]">
          {statuses.map(({ label, value, color }) => (
            <li key={label} className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-[3px] ${color}`} />
              {label}
              <span className="ml-auto font-bold tabular-nums">{value}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default StatsComponent;
