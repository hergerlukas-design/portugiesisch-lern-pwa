import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Card, Direction, Progress, Stats } from '../types';
import { initializeCard, calculateSM2, getCardStatus } from './sm2';

const CARDS_KEY = 'portugiesisch_cards';
const PROGRESS_KEY = 'portugiesisch_progress';

/**
 * Custom hook for managing card progress with LocalStorage persistence.
 * Cards and stats are scoped to one study direction; each direction keeps its own schedule.
 */
export function useProgress(direction: Direction) {
  // Cards of both directions, as stored
  const [allCards, setAllCards] = useState<Card[]>([]);
  const cards = useMemo(
    () => allCards.filter((card) => card.direction === direction),
    [allCards, direction]
  );
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cards from localStorage on mount
  useEffect(() => {
    const savedCards = localStorage.getItem(CARDS_KEY);
    if (savedCards) {
      try {
        const parsed = JSON.parse(savedCards);
        // Convert date strings back to Date objects
        const restored = parsed.map((card: any) => ({
          ...card,
          // Cards from before directions were tracked belong to DE → PT
          direction: card.direction ?? 'de-pt',
          nextReviewDate: new Date(card.nextReviewDate),
          lastReviewDate: card.lastReviewDate ? new Date(card.lastReviewDate) : undefined,
        }));
        setAllCards(restored);
      } catch (error) {
        console.error('Failed to load cards:', error);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save cards to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(CARDS_KEY, JSON.stringify(allCards));
    }
  }, [allCards, isLoaded]);

  /**
   * Initialize cards for a set of words in the current direction
   */
  const initializeCards = useCallback((wordIds: string[]) => {
    const now = new Date();
    const newCards: Card[] = wordIds.map((wordId) => {
      const sm2State = initializeCard();
      return {
        wordId,
        direction,
        interval: sm2State.interval,
        easeFactor: sm2State.easeFactor,
        repetitions: sm2State.repetitions,
        nextReviewDate: now,
        status: 'new',
      };
    });
    setAllCards((prev) => [...prev.filter((card) => card.direction !== direction), ...newCards]);
  }, [direction]);

  /**
   * Record a study attempt and update SM-2 metrics
   */
  const recordProgress = useCallback(
    (wordId: string, quality: number, userAnswer: string, correct: boolean) => {
      setAllCards((prevCards) => {
        const cardIndex = prevCards.findIndex(
          (c) => c.wordId === wordId && c.direction === direction
        );
        if (cardIndex === -1) return prevCards;

        const card = prevCards[cardIndex];
        const sm2State = {
          interval: card.interval,
          easeFactor: card.easeFactor,
          repetitions: card.repetitions,
        };

        const updated = calculateSM2(sm2State, quality);
        const now = new Date();
        const nextReviewDate = new Date(now);
        nextReviewDate.setDate(nextReviewDate.getDate() + updated.interval);

        const newCard: Card = {
          ...card,
          interval: updated.interval,
          easeFactor: updated.easeFactor,
          repetitions: updated.repetitions,
          lastReviewDate: now,
          nextReviewDate,
          status: getCardStatus(updated),
        };

        const newCards = [...prevCards];
        newCards[cardIndex] = newCard;
        return newCards;
      });

      // Also save progress history for analytics
      const progress: Progress = {
        cardId: wordId,
        wordId,
        quality,
        timestamp: new Date(),
        userAnswer,
        correct,
        direction,
      };
      saveProgressEntry(progress);
    },
    [direction]
  );

  /**
   * Get cards due for review today
   */
  const getCardsForReview = useCallback((category?: string): Card[] => {
    const now = new Date();
    return cards.filter((card) => {
      const isDue = card.nextReviewDate <= now;
      if (category === 'all') return isDue;
      return isDue && card.status !== 'mastered';
    });
  }, [cards]);

  /**
   * Calculate current statistics
   */
  const getStats = useCallback((): Stats => {
    const totalCards = cards.length;
    const newCards = cards.filter((c) => c.status === 'new').length;
    const learningCards = cards.filter((c) => c.status === 'learning').length;
    const reviewingCards = cards.filter((c) => c.status === 'reviewing').length;
    const masteredCards = cards.filter((c) => c.status === 'mastered').length;

    const progressEntries = getProgressHistory().filter(
      (p) => (p.direction ?? 'de-pt') === direction
    );
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayReviews = progressEntries.filter(
      (p) => new Date(p.timestamp) >= today
    ).length;

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    const weekReviews = progressEntries.filter(
      (p) => new Date(p.timestamp) >= weekAgo
    ).length;

    const correctAnswers = progressEntries.filter((p) => p.correct).length;
    const totalAnswers = progressEntries.length;
    const accuracy = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;

    // Calculate streak
    let streak = 0;
    for (let i = progressEntries.length - 1; i >= 0; i--) {
      if (progressEntries[i].correct) {
        streak++;
      } else {
        break;
      }
    }

    return {
      totalCards,
      newCards,
      learningCards,
      reviewingCards,
      masteredCards,
      todayReviews,
      weekReviews,
      correctAnswers,
      totalAnswers,
      accuracy: Math.round(accuracy),
      streak,
    };
  }, [cards, direction]);

  /**
   * Reset all progress (for testing or restart)
   */
  const resetAllProgress = useCallback(() => {
    setAllCards([]);
    localStorage.removeItem(CARDS_KEY);
    localStorage.removeItem(PROGRESS_KEY);
  }, []);

  return {
    cards,
    isLoaded,
    initializeCards,
    recordProgress,
    getCardsForReview,
    getStats,
    resetAllProgress,
  };
}

/**
 * Helper function to save progress entries
 */
function saveProgressEntry(progress: Progress) {
  const entries = getProgressHistory();
  entries.push(progress);
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(entries));
}

/**
 * Helper function to retrieve progress history
 */
export function getProgressHistory(): Progress[] {
  const saved = localStorage.getItem(PROGRESS_KEY);
  if (!saved) return [];
  try {
    return JSON.parse(saved).map((p: any) => ({
      ...p,
      timestamp: new Date(p.timestamp),
    }));
  } catch {
    return [];
  }
}

/**
 * Clear all stored data (for testing)
 */
export function clearAllData() {
  localStorage.removeItem(CARDS_KEY);
  localStorage.removeItem(PROGRESS_KEY);
}
