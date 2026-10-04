import React, { useState } from 'react';
import type { Card } from '../types';
import { Flashcard } from './Flashcard';
import { getWordById } from '../data/words';

interface StudyModeProps {
  cards: Card[];
  onCardComplete: (wordId: string, quality: number, userAnswer: string) => void;
  onFinish: () => void;
}

export const StudyMode: React.FC<StudyModeProps> = ({
  cards,
  onCardComplete,
  onFinish,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

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

  const currentCard = cards[currentIndex];
  const word = getWordById(currentCard.wordId);

  if (!word) {
    return (
      <p className="text-center py-16 text-red-600 dark:text-red-400">Wort nicht gefunden</p>
    );
  }

  const handleCardComplete = (quality: number, userAnswer: string) => {
    onCardComplete(currentCard.wordId, quality, userAnswer);

    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
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
            style={{ width: `${(currentIndex / cards.length) * 100}%` }}
          />
        </div>
        <span className="text-sm tabular-nums text-gray-500 dark:text-gray-400">
          {currentIndex + 1}/{cards.length}
        </span>
      </div>

      <Flashcard key={currentCard.wordId} word={word} onSubmit={handleCardComplete} />
    </div>
  );
};

export default StudyMode;
