import { WORDS } from '../data/words';
import type { Direction, Word } from '../types';

const norm = (s: string) => s.toLowerCase().trim();

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * The correct answer plus `count - 1` wrong ones, shuffled. Wrong options never share
 * the prompt (e.g. "em" is in/auf/an, so none of those may be a wrong option for "em")
 * or the answer text, so exactly one option is right.
 */
export function buildChoices(word: Word, direction: Direction, count = 4): string[] {
  const ptFirst = direction === 'pt-de';
  const promptOf = (w: Word) => norm(ptFirst ? w.portuguese : w.german);
  const answerOf = (w: Word) => (ptFirst ? w.german : w.portuguese);

  const prompt = promptOf(word);
  const answer = answerOf(word);
  const used = new Set([norm(answer)]);
  const wrong: string[] = [];

  for (const candidate of shuffle(WORDS)) {
    if (wrong.length >= count - 1) break;
    const text = answerOf(candidate);
    if (promptOf(candidate) === prompt || used.has(norm(text))) continue;
    used.add(norm(text));
    wrong.push(text);
  }

  return shuffle([answer, ...wrong]);
}
