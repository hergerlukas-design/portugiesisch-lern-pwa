import React, { useState, useRef, useEffect } from 'react';
import type { Word, Card } from '../types';

interface FlashcardProps {
  word: Word;
  card: Card;
  onSubmit: (quality: number, userAnswer: string) => void;
  isFlipped?: boolean;
}

export const Flashcard: React.FC<FlashcardProps> = ({
  word,
  card,
  onSubmit,
  isFlipped = false,
}) => {
  const [flipped, setFlipped] = useState(isFlipped);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!flipped && inputRef.current) {
      inputRef.current.focus();
    }
  }, [flipped]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if answer is correct (case-insensitive, trim whitespace)
    const correct =
      userAnswer.toLowerCase().trim() ===
      word.portuguese.toLowerCase().trim();

    setFeedback(correct ? 'correct' : 'incorrect');

    // After showing feedback, flip to show the answer
    setTimeout(() => {
      setFlipped(true);
    }, 500);
  };

  const handleQuality = (quality: number) => {
    onSubmit(quality, userAnswer);

    // Reset for next card
    setUserAnswer('');
    setFlipped(false);
    setFeedback(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Flashcard 3D */}
      <div className="flashcard-3d mb-8">
        <div className={`flashcard-inner ${flipped ? 'flipped' : ''}`}>
          {/* Front - German side */}
          <div className="flashcard-front">
            <div className="text-center p-8">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Übersetze ins Portugiesische
              </p>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">
                {word.german}
              </p>
              {word.exampleSentence && (
                <div className="mt-6 pt-6 border-t border-blue-200 dark:border-slate-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Beispiel
                  </p>
                  <p className="text-sm italic text-gray-700 dark:text-gray-300">
                    {word.exampleSentence.german}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Back - Portuguese side */}
          <div className="flashcard-back">
            <div className="text-center p-8">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Antwort
              </p>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">
                {word.portuguese}
              </p>
              {word.exampleSentence && (
                <div className="mt-6 pt-6 border-t border-green-200 dark:border-slate-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Beispiel
                  </p>
                  <p className="text-sm italic text-gray-700 dark:text-gray-300">
                    {word.exampleSentence.portuguese}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Input and feedback */}
      {!flipped && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Deine Antwort
            </label>
            <input
              ref={inputRef}
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Portugiesisch eingeben..."
              className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                feedback === 'correct'
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : feedback === 'incorrect'
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-blue-200 dark:border-slate-600 bg-white dark:bg-slate-800'
              } text-gray-900 dark:text-white`}
            />
          </div>

          {feedback && (
            <div
              className={`p-4 rounded-lg ${
                feedback === 'correct'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
              }`}
            >
              {feedback === 'correct' ? (
                <p className="font-semibold">✓ Richtig!</p>
              ) : (
                <div>
                  <p className="font-semibold">✗ Falsch</p>
                  <p className="text-sm mt-1">Korrekte Antwort: {word.portuguese}</p>
                </div>
              )}
            </div>
          )}

          {!feedback ? (
            <button
              type="submit"
              disabled={!userAnswer.trim()}
              className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
            >
              Antwort überprüfen
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setFlipped(true)}
              className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
            >
              Karte umdrehen
            </button>
          )}
        </form>
      )}

      {/* Quality rating buttons (shown after flip) */}
      {flipped && (
        <div className="space-y-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Wie schwer war diese Frage?
          </p>
          <div className="grid grid-cols-5 gap-2">
            <button
              onClick={() => handleQuality(0)}
              className="px-3 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition-colors"
              title="Komplett falsch"
            >
              0
            </button>
            <button
              onClick={() => handleQuality(1)}
              className="px-3 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold transition-colors"
              title="Schwer"
            >
              1
            </button>
            <button
              onClick={() => handleQuality(2)}
              className="px-3 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-semibold transition-colors"
              title="OK"
            >
              2
            </button>
            <button
              onClick={() => handleQuality(3)}
              className="px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold transition-colors"
              title="Gut"
            >
              3
            </button>
            <button
              onClick={() => handleQuality(4)}
              className="px-3 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-semibold transition-colors"
              title="Sehr gut"
            >
              4
            </button>
          </div>
          <button
            onClick={() => handleQuality(5)}
            className="w-full px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors"
            title="Perfekt"
          >
            5 - Perfekt
          </button>
        </div>
      )}

      {/* Card statistics */}
      <div className="mt-8 pt-8 border-t border-gray-200 dark:border-slate-700">
        <div className="grid grid-cols-4 gap-4 text-center text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Wiederholungen</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {card.repetitions}
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Intervall</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {card.interval}d
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Ease Factor</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {card.easeFactor.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Status</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
              {card.status}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
