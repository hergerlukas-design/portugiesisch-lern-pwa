import React, { useState, useRef, useEffect } from 'react';
import type { Word } from '../types';

interface FlashcardProps {
  word: Word;
  onSubmit: (quality: number, userAnswer: string) => void;
}

// SM-2 quality per rating; below 3 counts as a failed recall
const RATINGS = [
  { quality: 1, label: 'Nochmal', className: 'text-red-600 dark:text-red-400' },
  { quality: 3, label: 'Schwer', className: 'text-orange-600 dark:text-orange-400' },
  { quality: 4, label: 'Gut', className: 'text-blue-600 dark:text-blue-400' },
  { quality: 5, label: 'Leicht', className: 'text-green-600 dark:text-green-400' },
];

export const Flashcard: React.FC<FlashcardProps> = ({ word, onSubmit }) => {
  const [flipped, setFlipped] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const correct = userAnswer.toLowerCase().trim() === word.portuguese.toLowerCase().trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFlipped(true);
  };

  return (
    <div className="space-y-6">
      <div className="flashcard-3d">
        <div className={`flashcard-inner ${flipped ? 'flipped' : ''}`}>
          {/* Front - German side */}
          <div className="flashcard-front">
            <div className="text-center px-6">
              <p className="text-3xl font-semibold text-gray-900 dark:text-white">{word.german}</p>
              {word.exampleSentence && (
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 italic">
                  {word.exampleSentence.german}
                </p>
              )}
            </div>
          </div>

          {/* Back - Portuguese side */}
          <div className="flashcard-back">
            <div className="text-center px-6">
              <p className="text-3xl font-semibold text-gray-900 dark:text-white">{word.portuguese}</p>
              {word.exampleSentence && (
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 italic">
                  {word.exampleSentence.portuguese}
                </p>
              )}
              {userAnswer.trim() && (
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
      </div>

      {!flipped ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Auf Portugiesisch…"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className="flex-1 min-w-0 px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
          >
            {userAnswer.trim() ? 'Prüfen' : 'Zeigen'}
          </button>
        </form>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {RATINGS.map(({ quality, label, className }) => (
            <button
              key={quality}
              onClick={() => onSubmit(quality, userAnswer)}
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
