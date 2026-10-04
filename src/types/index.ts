/**
 * Word entry with German-Portuguese translation
 */
export interface Word {
  id: string;
  german: string;
  portuguese: string;
  category: 'top100' | 'top500' | 'top1000';
  exampleSentence?: {
    german: string;
    portuguese: string;
  };
}

/**
 * Flashcard with spaced repetition metrics
 */
export interface Card {
  wordId: string;
  interval: number; // days until next review
  easeFactor: number; // SM-2 ease factor (1.3 - 2.5)
  repetitions: number; // number of successful repetitions
  lastReviewDate?: Date;
  nextReviewDate: Date;
  status: 'new' | 'learning' | 'reviewing' | 'mastered';
}

/**
 * User progress for a card during a study session
 */
export interface Progress {
  cardId: string;
  wordId: string;
  quality: number; // 0-5 rating of user's recall
  timestamp: Date;
  userAnswer: string;
  correct: boolean;
}

/**
 * Statistics and performance metrics
 */
export interface Stats {
  totalCards: number;
  newCards: number;
  learningCards: number;
  reviewingCards: number;
  masteredCards: number;
  todayReviews: number;
  weekReviews: number;
  correctAnswers: number;
  totalAnswers: number;
  accuracy: number; // percentage 0-100
  streak: number; // consecutive correct answers
}

/**
 * Quiz mode data
 */
export interface QuizCard {
  wordId: string;
  german: string;
  portuguese: string;
  options: string[]; // 4 Portuguese translation options
  correctIndex: number; // index of correct answer in options
}

/**
 * App state for study mode
 */
export interface StudySession {
  mode: 'study' | 'quiz' | 'stats';
  category: 'all' | 'top100' | 'top500' | 'top1000';
  currentCardIndex: number;
  cards: Card[];
  sessionProgress: Progress[];
  sessionStats: {
    reviewed: number;
    correct: number;
    startTime: Date;
  };
}

/**
 * Study direction: which language is shown on the front of the card
 */
export type Direction = 'de-pt' | 'pt-de';

/**
 * Result of answering a card: typed answers are correct or wrong; a card that was
 * only flipped (nothing typed) is skipped and doesn't count either way
 */
export type Outcome = 'correct' | 'wrong' | 'skipped';

/**
 * Answer mode: beginners pick from 4 options, advanced learners type the answer
 */
export type Level = 'beginner' | 'advanced';

/**
 * Color scheme: follow the device, or force light/dark
 */
export type Theme = 'system' | 'light' | 'dark';
