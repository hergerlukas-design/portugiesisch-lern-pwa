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
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    total: 0,
  });

  if (cards.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto text-center py-12">
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
          Keine Karten zum Lernen verfügbar
        </p>
        <button
          onClick={onFinish}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
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
      <div className="w-full max-w-2xl mx-auto text-center py-12">
        <p className="text-xl text-red-600 dark:text-red-400">
          Wort nicht gefunden
        </p>
      </div>
    );
  }

  const handleCardComplete = (quality: number, userAnswer: string) => {
    const correct =
      userAnswer.toLowerCase().trim() ===
      word.portuguese.toLowerCase().trim();

    onCardComplete(currentCard.wordId, quality, userAnswer);

    setSessionStats({
      correct: sessionStats.correct + (correct ? 1 : 0),
      total: sessionStats.total + 1,
    });

    // Move to next card or finish
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Show finish screen
      setTimeout(() => {
        onFinish();
      }, 500);
    }
  };

  const accuracy =
    sessionStats.total > 0
      ? Math.round((sessionStats.correct / sessionStats.total) * 100)
      : 0;

  return (
    <div className="w-full space-y-8">
      {/* Progress bar */}
      <div className="max-w-2xl mx-auto w-full">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Fortschritt
          </p>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {currentIndex + 1} / {cards.length}
          </p>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / cards.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Session statistics */}
      {sessionStats.total > 0 && (
        <div className="max-w-2xl mx-auto w-full grid grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Richtig</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {sessionStats.correct}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Falsch</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {sessionStats.total - sessionStats.correct}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Genauigkeit</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {accuracy}%
            </p>
          </div>
        </div>
      )}

      {/* Flashcard */}
      <Flashcard
        word={word}
        card={currentCard}
        onSubmit={handleCardComplete}
      />

      {/* Navigation buttons */}
      <div className="max-w-2xl mx-auto w-full flex gap-4">
        <button
          onClick={() => {
            if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
          }}
          disabled={currentIndex === 0}
          className="flex-1 px-4 py-3 bg-gray-300 dark:bg-slate-700 hover:bg-gray-400 dark:hover:bg-slate-600 disabled:bg-gray-200 dark:disabled:bg-slate-800 text-gray-900 dark:text-white font-semibold rounded-lg transition-colors"
        >
          ← Zurück
        </button>
        <button
          onClick={onFinish}
          className="flex-1 px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
        >
          Beenden
        </button>
        <button
          disabled
          className="flex-1 px-4 py-3 bg-gray-300 dark:bg-slate-700 text-gray-900 dark:text-white font-semibold rounded-lg opacity-50 cursor-not-allowed"
        >
          Weiter →
        </button>
      </div>
    </div>
  );
};

export default StudyMode;
