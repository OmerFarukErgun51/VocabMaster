export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type Category = 
  | 'daily' 
  | 'business' 
  | 'travel' 
  | 'technology' 
  | 'idioms' 
  | 'academic'
  | 'movies'
  | 'literature';

export interface Word {
  id: number;
  english: string;
  turkish: string;
  level: CEFRLevel;
  category: Category;
  part_of_speech?: string; // noun, verb, adjective, phrasal verb, etc.
  pronunciation?: string;  // IPA e.g. /əˈkɒmplɪʃ/
  example_en: string;
  example_tr: string;
  collocations?: string;   // e.g. "make a decision, key decision"
  frequency_rank?: number; // e.g. Top 1000, 3000
  image_url?: string;      // Curated image representation for visual memory
  // SRS properties
  box_level: number;       // 1 to 5 (5 = Mastered)
  interval_days: number;
  repetition_count: number;
  ease_factor: number;
  next_review_date: string; // ISO date string (YYYY-MM-DD)
  is_mastered: boolean;
}

export type ReadingCategory = 'stories' | 'literature' | 'daily_dialogues' | 'movies' | 'tech_scifi' | 'books' | 'custom_pdf';

export interface ReadingMaterial {
  id: number;
  title: string;
  category: ReadingCategory;
  level: CEFRLevel;
  source: string; // e.g. "Inception (2010)", "Sherlock Holmes", "Tech Daily"
  content: string; // full text with paragraphs
  vocabulary_highlights?: string[]; // key target words in this text
  image_url?: string; // Poster or book cover art
  sentences?: { en: string; tr: string }[]; // Sentence-by-sentence parallel translations
  created_at?: string;
}

export interface StudyLog {
  id?: number;
  word_id: number;
  exercise_type: 'flashcard' | 'quiz' | 'matching' | 'writing' | 'cloze';
  is_correct: boolean;
  timestamp: string;
}

export interface UserStats {
  streak_days: number;
  last_study_date: string;
  total_words_reviewed: number;
  mastered_words_count: number;
  learning_words_count: number;
  accuracy_rate: number;
}
