import React from 'react';
import { PRONUNCIATION_RULES } from '../data/pronunciation';

// Cheat sheet: how Portuguese spelling is spoken, with one example per rule
export const Pronunciation: React.FC = () => (
  <div className="space-y-3.5">
    {PRONUNCIATION_RULES.map(({ title, intro, rules }) => (
      <section key={title} className="glass rounded-3xl p-[18px] space-y-3">
        <h2 className="m-0 text-[13px] font-bold tracking-[0.06em] uppercase text-muted dark:text-gray-300">{title}</h2>
        {intro && <p className="text-sm font-medium text-muted dark:text-gray-300">{intro}</p>}
        <ul className="flex flex-col divide-y divide-white/70 dark:divide-white/10">
          {rules.map(({ spelling, sound, example, exampleSound }) => (
            <li key={spelling} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-0.5 py-2.5 first:pt-0 last:pb-0">
              <span className="font-display font-bold text-[17px] text-ink dark:text-white">{spelling}</span>
              <span className="text-right text-[15px] font-semibold text-forest-700 dark:text-forest-300">{example}</span>
              <span className="text-[13px] font-medium text-muted dark:text-gray-300">{sound}</span>
              <span className="text-right text-[13px] font-semibold tracking-wide text-muted dark:text-gray-300">[{exampleSound}]</span>
            </li>
          ))}
        </ul>
      </section>
    ))}
  </div>
);

export default Pronunciation;
