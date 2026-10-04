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
      <div className="text-center py-16">
        <p className="text-gray-500 dark:text-gray-400 mb-6">Keine Karten zum Lernen verfügbar</p>
        <button
          onClick={onFinish}
          className="px-5 py-2.5 rounded-lg bg-gray-100 dark:bg-slate-800 font-medium"
        >
          Zurück
        </button>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="text-center py-16 space-y-8">
        <div>
          <p className="text-5xl">🎉</p>
          <p className="mt-4 text-xl font-semibold">Alle {cards.length} richtig!</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setQueue(cards);
              setDoneCount(0);
              setAttempt((a) => a + 1);
              setFinished(false);
            }}
            className="flex-1 py-3 rounded-lg border border-gray-200 dark:border-slate-700 font-medium hover:bg-gray-50 dark:hover:bg-slate-800"
          >
            Nochmal
          </button>
          <button
            onClick={onFinish}
            className="flex-1 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
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
      <p className="text-center py-16 text-red-600 dark:text-red-400">Wort nicht gefunden</p>
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
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <button
          onClick={onFinish}
          aria-label="Beenden"
          className="w-8 h-8 -ml-1 flex items-center justify-center rounded-md text-xl text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          ×
        </button>
        <div className="flex-1 h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${(doneCount / cards.length) * 100}%` }}
          />
        </div>
        <span className="text-sm tabular-nums text-gray-500 dark:text-gray-400">
          {doneCount}/{cards.length}
        </span>
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
