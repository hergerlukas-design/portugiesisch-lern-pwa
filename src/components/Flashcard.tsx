import React, { useState, useRef, useEffect } from 'react';
import type { Direction, Outcome, Word } from '../types';

interface FlashcardProps {
  word: Word;
  direction: Direction;
  // again: the user asked to see this card again later in the session
  onSubmit: (outcome: Outcome, again: boolean, userAnswer: string) => void;
}

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
  // Only a typed answer counts; just flipping the card is neutral
  const outcome: Outcome = !typed ? 'skipped' : correct ? 'correct' : 'wrong';

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
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onSubmit(outcome, true, userAnswer)}
            className="py-3 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-red-600 dark:text-red-400 font-medium transition-colors"
          >
            Nochmal
          </button>
          <button
            onClick={() => onSubmit(outcome, false, userAnswer)}
            className="py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
          >
            Weiter
          </button>
        </div>
      )}
    </div>
  );
};

export default Flashcard;
