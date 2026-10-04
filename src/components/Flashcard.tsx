import React, { useState, useRef, useEffect } from 'react';
import type { Direction, Level, Outcome, Word } from '../types';
import { buildChoices } from '../lib/choices';

interface FlashcardProps {
  word: Word;
  direction: Direction;
  // beginner: pick from 4 options; advanced: type the answer
  level: Level;
  // again: the user asked to see this card again later in the session
  onSubmit: (outcome: Outcome, again: boolean, userAnswer: string) => void;
}

export const Flashcard: React.FC<FlashcardProps> = ({ word, direction, level, onSubmit }) => {
  const [flipped, setFlipped] = useState(false);
  // Once the answer has been seen, the card can be flipped back and forth freely
  const [revealed, setRevealed] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [chosen, setChosen] = useState<string | null>(null);
  const [choices] = useState(() => (level === 'beginner' ? buildChoices(word, direction) : []));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Skip on touch devices so the keyboard doesn't cover the card for people who just flip
    if (window.matchMedia('(pointer: fine)').matches) inputRef.current?.focus();
  }, []);

  const ptFirst = direction === 'pt-de';
  const prompt = ptFirst ? word.portuguese : word.german;
  const answer = ptFirst ? word.german : word.portuguese;
  const promptExample = word.exampleSentence?.[ptFirst ? 'portuguese' : 'german'];
  const answerExample = word.exampleSentence?.[ptFirst ? 'german' : 'portuguese'];

  // The user's own answer: the picked option (beginner) or the typed text (advanced)
  const given = level === 'beginner' ? (chosen ?? '') : userAnswer;
  const answered = given.trim() !== '';
  const correct = given.toLowerCase().trim() === answer.toLowerCase().trim();
  // Only an actual answer counts; just flipping the card is neutral
  const outcome: Outcome = !answered ? 'skipped' : correct ? 'correct' : 'wrong';

  const choose = (option: string) => {
    setChosen(option);
    setFlipped(true);
    setRevealed(true);
  };

  const choiceClass = (option: string) => {
    if (!revealed) {
      return 'border-gray-200 dark:border-slate-700 hover:border-forest-300 hover:bg-forest-50 dark:hover:bg-forest-950/40';
    }
    if (option === answer) {
      return 'border-forest-500 bg-forest-50 dark:bg-forest-950/40 text-forest-700 dark:text-forest-300';
    }
    if (option === chosen) {
      return 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300';
    }
    return 'border-gray-200 dark:border-slate-700 opacity-40';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFlipped(true);
    setRevealed(true);
  };

  const toggleFlip = () => {
    setFlipped((f) => !f);
    setRevealed(true);
  };

  const flipHint = (
    <span aria-hidden className="absolute top-3 right-4 text-lg text-gray-300 dark:text-slate-600">
      ↻
    </span>
  );

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={toggleFlip}
        aria-label={`Karte umdrehen: ${flipped !== ptFirst ? 'Deutsch' : 'Portugiesisch'} zeigen`}
        className="flashcard-3d block w-full cursor-pointer"
      >
        <div className={`flashcard-inner ${flipped ? 'flipped' : ''}`}>
          {/* Front - prompt side */}
          <div className="flashcard-front">
            {flipHint}
            <div className="text-center px-6">
              <p className="text-3xl font-semibold text-gray-900 dark:text-white">{prompt}</p>
              {promptExample && (
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 italic">{promptExample}</p>
              )}
            </div>
          </div>

          {/* Back - answer side */}
          <div className="flashcard-back">
            {flipHint}
            <div className="text-center px-6">
              <p className="text-3xl font-semibold text-gray-900 dark:text-white">{answer}</p>
              {answerExample && (
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 italic">{answerExample}</p>
              )}
              {answered && (
                <p
                  className={`mt-6 text-sm font-medium ${
                    correct ? 'text-forest-600 dark:text-forest-400' : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {correct ? '✓ Richtig' : `✗ Deine Antwort: ${given}`}
                </p>
              )}
            </div>
          </div>
        </div>
      </button>

      {level === 'beginner' && (
        <div className="grid grid-cols-2 gap-2">
          {choices.map((option) => (
            <button
              key={option}
              onClick={() => choose(option)}
              disabled={revealed}
              className={`py-3 px-2 rounded-xl border font-medium transition-colors ${choiceClass(option)}`}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {!revealed ? (
        level === 'advanced' && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder={ptFirst ? 'Auf Deutsch…' : 'Auf Portugiesisch…'}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className="flex-1 min-w-0 px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:border-forest-500 focus:ring-4 focus:ring-forest-100 dark:focus:ring-forest-950 transition"
          />
          <button
            type="submit"
            className="px-5 py-3 rounded-xl bg-forest-600 hover:bg-forest-700 active:scale-[0.98] text-white font-medium shadow-lg shadow-forest-600/25 transition"
          >
            {answered ? 'Prüfen' : 'Zeigen'}
          </button>
        </form>
        )
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onSubmit(outcome, true, given)}
            className="py-3 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-red-600 dark:text-red-400 font-medium transition-colors"
          >
            Nochmal
          </button>
          <button
            onClick={() => onSubmit(outcome, false, given)}
            className="py-3 rounded-xl bg-forest-600 hover:bg-forest-700 active:scale-[0.98] text-white font-medium shadow-lg shadow-forest-600/25 transition"
          >
            Weiter
          </button>
        </div>
      )}
    </div>
  );
};

export default Flashcard;
