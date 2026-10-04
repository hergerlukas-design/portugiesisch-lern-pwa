/**
 * SM-2 (SuperMemo-2) Spaced Repetition Algorithm
 * https://en.wikipedia.org/wiki/SuperMemo#Description_of_SM-2_algorithm
 */

export interface SM2State {
  interval: number; // days until next review
  easeFactor: number; // EF (1.3 - 2.5)
  repetitions: number; // n (number of successful repetitions)
}

const DEFAULT_EASE_FACTOR = 2.5;
const MIN_EASE_FACTOR = 1.3;

/**
 * Calculate next review interval and update SM-2 state based on user's quality rating
 * @param state Current SM-2 state
 * @param quality User's recall quality (0-5 scale)
 *                0 = complete blackout
 *                1 = incorrect response, but upon seeing answer realized it
 *                2 = incorrect response, but upon seeing answer it seemed easy to remember
 *                3 = correct response after some hesitation
 *                4 = correct response after brief hesitation
 *                5 = perfect response
 * @returns Updated SM-2 state
 */
export function calculateSM2(state: SM2State, quality: number): SM2State {
  // Ensure quality is in valid range
  const q = Math.max(0, Math.min(5, quality));

  let newState = { ...state };

  if (q < 3) {
    // Incorrect response - reset progress
    newState.repetitions = 0;
    newState.interval = 1;
  } else {
    // Correct response - progress learning
    if (newState.repetitions === 0) {
      newState.interval = 1;
    } else if (newState.repetitions === 1) {
      newState.interval = 3;
    } else {
      newState.interval = Math.round(newState.interval * newState.easeFactor);
    }
    newState.repetitions += 1;
  }

  // Update ease factor
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  newState.easeFactor = Math.max(
    MIN_EASE_FACTOR,
    newState.easeFactor + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)
  );

  return newState;
}

/**
 * Get cards that need review today
 * @param cards Array of cards
 * @param currentDate Current date for comparison
 * @returns Cards due for review
 */
export function getCardsForReview(
  cards: any[],
  currentDate: Date = new Date()
): any[] {
  return cards.filter((card) => {
    const nextReviewDate = new Date(card.nextReviewDate);
    return nextReviewDate <= currentDate;
  });
}

/**
 * Get review statistics for a date range
 * @param cards Array of cards
 * @param startDate Start of range
 * @param endDate End of range
 * @returns Count of cards due in range
 */
export function getReviewStats(
  cards: any[],
  startDate: Date,
  endDate: Date
): { today: number; week: number } {
  const today = cards.filter((card) => {
    const nextReviewDate = new Date(card.nextReviewDate);
    return (
      nextReviewDate >= startDate && nextReviewDate <= new Date(endDate)
    );
  }).length;

  const weekEnd = new Date(startDate);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const week = cards.filter((card) => {
    const nextReviewDate = new Date(card.nextReviewDate);
    return nextReviewDate >= startDate && nextReviewDate <= weekEnd;
  }).length;

  return { today, week };
}

/**
 * Initialize a new card (first time seeing a word)
 */
export function initializeCard(): SM2State {
  return {
    interval: 1,
    easeFactor: DEFAULT_EASE_FACTOR,
    repetitions: 0,
  };
}

/**
 * Determine card status based on SM-2 state
 */
export function getCardStatus(state: SM2State): 'new' | 'learning' | 'reviewing' | 'mastered' {
  if (state.repetitions === 0) {
    return 'new';
  } else if (state.repetitions < 3) {
    return 'learning';
  } else if (state.interval < 7) {
    return 'reviewing';
  } else {
    return 'mastered';
  }
}
