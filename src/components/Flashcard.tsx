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
      return 'glass text-ink dark:text-white hover:border-forest-400!';
    }
    if (option === answer) {
      return 'glass-active border-2 border-forest-600! text-forest-800 dark:text-forest-200';
    }
    if (option === chosen) {
      return 'glass-active border-2 border-red-600! text-red-800 dark:text-red-300';
    }
    return 'glass text-ink dark:text-white opacity-45';
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
    <svg viewBox="0 0 24 24" className="absolute top-5 right-5 w-5 h-5 text-muted/60 dark:text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
      <path d="M21 3v5h-5" />
    </svg>
  );

  const sideLabel = (portuguese: boolean) => (
    <span className="absolute top-6 left-6 text-xs font-bold tracking-[0.08em] uppercase text-muted dark:text-gray-300">
      {portuguese ? 'Português' : 'Deutsch'}
    </span>
  );

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={toggleFlip}
        aria-label={`Karte umdrehen: ${flipped !== ptFirst ? 'Deutsch' : 'Portugiesisch'} zeigen`}
        className="flashcard-3d block w-full cursor-pointer"
      >
        <div className={`flashcard-inner ${flipped ? 'flipped' : ''}`}>
          {/* Front - prompt side */}
          <div className="flashcard-front">
            {sideLabel(ptFirst)}
            {flipHint}
            <div className="text-center px-6">
              <p className="font-display font-extrabold text-[44px] leading-none tracking-tight text-ink dark:text-white">{prompt}</p>
              {promptExample && (
                <p className="mt-5 text-sm font-medium text-muted dark:text-gray-300">{promptExample}</p>
              )}
            </div>
          </div>

          {/* Back - answer side */}
          <div className="flashcard-back">
            {sideLabel(!ptFirst)}
            {flipHint}
            <div className="text-center px-6">
              <p className="font-display font-bold text-[40px] leading-none tracking-tight text-forest-600 dark:text-forest-300">{answer}</p>
              {answerExample && (
                <p className="mt-5 text-sm font-medium text-muted dark:text-gray-300">{answerExample}</p>
              )}
              {answered && (
                <p
                  className={`inline-block mt-5 px-3 py-1.5 rounded-full text-[13px] font-bold ${
                    correct
                      ? 'bg-forest-50/90 text-forest-800 dark:bg-forest-900/60 dark:text-forest-200'
                      : 'bg-red-50/90 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                  }`}
                >
                  {correct ? 'Richtig!' : `Deine Antwort: ${given}`}
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
              className={`min-h-14 py-3 px-2 rounded-2xl font-semibold text-[15px] transition ${choiceClass(option)}`}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {!revealed ? (
        level === 'advanced' && (
        <form onSubmit={handleSubmit} className="flex gap-2.5">
          <input
            ref={inputRef}
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder={ptFirst ? 'Auf Deutsch…' : 'Auf Portugiesisch…'}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label={ptFirst ? 'Antwort auf Deutsch' : 'Antwort auf Portugiesisch'}
            className="glass flex-1 min-w-0 h-14 px-4 rounded-2xl text-lg font-semibold text-ink dark:text-white placeholder:text-muted/70 dark:placeholder:text-gray-400 focus:outline-none focus:border-forest-600! focus:border-2 transition"
          />
          <button
            type="submit"
            className="h-14 px-[22px] rounded-2xl bg-ink dark:bg-white text-white dark:text-ink font-bold text-base active:scale-[0.98] transition"
          >
            {answered ? 'Prüfen' : 'Zeigen'}
          </button>
        </form>
        )
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => onSubmit(outcome, true, given)}
            className="glass min-h-14 rounded-2xl text-red-800 dark:text-red-300 font-bold transition active:scale-[0.98]"
          >
            Nochmal
          </button>
          <button
            onClick={() => onSubmit(outcome, false, given)}
            className="min-h-14 rounded-2xl bg-forest-600 text-white font-bold shadow-[0_10px_24px_-12px_rgb(20_72_47/0.7),inset_0_1.5px_0_rgb(255_255_255/0.35)] active:scale-[0.98] transition"
          >
            Weiter
          </button>
        </div>
      )}
    </div>
  );
};

export default Flashcard;
