import React, { useState, useRef, useEffect } from 'react';
import type { Direction, Word } from '../types';

interface FlashcardProps {
  word: Word;
  direction: Direction;
  // correct: typed answer matched, or (when nothing was typed) a passing self-rating
  onSubmit: (quality: number, userAnswer: string, correct: boolean) => void;
}

// SM-2 quality per rating; below 3 counts as a failed recall
const RATINGS = [
  { quality: 1, label: 'Nochmal', className: 'text-red-600 dark:text-red-400' },
  { quality: 3, label: 'Schwer', className: 'text-orange-600 dark:text-orange-400' },
  { quality: 4, label: 'Gut', className: 'text-blue-600 dark:text-blue-400' },
  { quality: 5, label: 'Leicht', className: 'text-green-600 dark:text-green-400' },
];

export const Flashcard: React.FC<FlashcardProps> = ({ word, direction, onSubmit }) => {
  const [flipped, setFlipped] = useState(false);
  // Once the answer has been seen, the card can be flipped back and forth freely
  const [revealed, setRevealed] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
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

  const typed = userAnswer.trim() !== '';
  const correct = userAnswer.toLowerCase().trim() === answer.toLowerCase().trim();

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
              {typed && (
                <p
                  className={`mt-6 text-sm font-medium ${
                    correct ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {correct ? '✓ Richtig' : `✗ Deine Antwort: ${userAnswer}`}
                </p>
              )}
            </div>
          </div>
        </div>
      </button>

      {!revealed ? (
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
            className="flex-1 min-w-0 px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
          >
            {typed ? 'Prüfen' : 'Zeigen'}
          </button>
        </form>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {RATINGS.map(({ quality, label, className }) => (
            <button
              key={quality}
              onClick={() => onSubmit(quality, userAnswer, typed ? correct : quality >= 3)}
              className={`py-3 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-sm font-medium transition-colors ${className}`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Flashcard;
