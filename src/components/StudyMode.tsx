import React, { useState } from 'react';
import type { Card, Direction, Level, Outcome } from '../types';
import { Flashcard } from './Flashcard';
import { getWordById } from '../data/words';

interface StudyModeProps {
  cards: Card[];
  direction: Direction;
  level: Level;
  // Cards not answered correctly go back to the end of the queue until every card was
  repeatUntilCorrect?: boolean;
  onCardComplete: (wordId: string, outcome: Outcome, userAnswer: string) => void;
  // All cards done (for repeatUntilCorrect: all correct)
  onComplete?: () => void;
  onFinish: () => void;
}

export const StudyMode: React.FC<StudyModeProps> = ({
  cards,
  direction,
  level,
  repeatUntilCorrect = false,
  onCardComplete,
  onComplete,
  onFinish,
}) => {
  const [queue, setQueue] = useState<Card[]>(cards);
  const [doneCount, setDoneCount] = useState(0);
  // Counts every card shown, so a card that comes straight back still gets a fresh Flashcard
  const [attempt, setAttempt] = useState(0);
  const [finished, setFinished] = useState(false);

  if (cards.length === 0) {
    return (
      <div className="glass rounded-[28px] text-center px-6 py-12 mt-10">
        <p className="text-muted dark:text-gray-300 font-semibold mb-6">Keine Karten zum Lernen verfügbar</p>
        <button
          onClick={onFinish}
          className="glass-active h-12 px-6 rounded-2xl font-bold"
        >
          Zurück
        </button>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="glass rounded-[32px] text-center px-6 py-10 mt-10 space-y-8">
        <div className="flex flex-col items-center">
          <span className="glass-hero w-20 h-20 rounded-full flex items-center justify-center text-white">
            <svg viewBox="0 0 24 24" className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <p className="mt-5 font-display font-bold text-2xl">Alle {cards.length} richtig!</p>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={() => {
              setQueue(cards);
              setDoneCount(0);
              setAttempt((a) => a + 1);
              setFinished(false);
            }}
            className="glass-active flex-1 h-14 rounded-2xl font-bold"
          >
            Nochmal
          </button>
          <button
            onClick={onFinish}
            className="flex-1 h-14 rounded-2xl bg-forest-600 text-white font-bold shadow-[0_10px_24px_-12px_rgb(20_72_47/0.7),inset_0_1.5px_0_rgb(255_255_255/0.35)] active:scale-[0.98] transition"
          >
            Fertig
          </button>
        </div>
      </div>
    );
  }

  const [currentCard, ...rest] = queue;
  const word = getWordById(currentCard.wordId);

  if (!word) {
    return (
      <p className="text-center py-16 font-semibold text-red-700 dark:text-red-400">Wort nicht gefunden</p>
    );
  }

  const handleCardComplete = (outcome: Outcome, again: boolean, userAnswer: string) => {
    onCardComplete(currentCard.wordId, outcome, userAnswer);

    const retry = again || (repeatUntilCorrect && outcome !== 'correct');
    const nextQueue = retry ? [...rest, currentCard] : rest;
    setAttempt((a) => a + 1);

    if (nextQueue.length > 0) {
      setQueue(nextQueue);
      if (!retry) setDoneCount((n) => n + 1);
      return;
    }

    onComplete?.();
    if (repeatUntilCorrect) {
      setDoneCount(cards.length);
      setFinished(true);
    } else {
      onFinish();
    }
  };

  return (
    <div className="space-y-6 pt-6">
      {/* Progress */}
      <div className="flex items-center gap-3.5">
        <button
          onClick={onFinish}
          aria-label="Beenden"
          className="glass w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-ink dark:text-white"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="flex justify-between text-[13px] font-bold">
            <span>{direction === 'de-pt' ? 'DE → PT' : 'PT → DE'}</span>
            <span className="tabular-nums text-muted dark:text-gray-300">
              {doneCount} / {cards.length}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-white/60 dark:bg-white/15 overflow-hidden">
            <div
              className="h-full bg-forest-600 dark:bg-forest-400 rounded-full transition-all duration-300"
              style={{ width: `${(doneCount / cards.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <Flashcard
        key={attempt}
        word={word}
        direction={direction}
        level={level}
        onSubmit={handleCardComplete}
      />
    </div>
  );
};

export default StudyMode;
