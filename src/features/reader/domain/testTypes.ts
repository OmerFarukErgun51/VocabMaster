export interface WordPair {
  english: string;
  turkish: string;
}

/** İngilizce kelimeyi görüp Türkçe anlamını seçme sorusu. */
export interface MeaningQuestion {
  kind: 'meaning';
  word: string;
  prompt: string;
  options: string[];
  answer: string;
}

/** Cümledeki boşluğa doğru İngilizce kelimeyi seçme sorusu. */
export interface ClozeQuestion {
  kind: 'cloze';
  word: string;
  sentence: string;
  options: string[];
  answer: string;
}

export type TestQuestion = MeaningQuestion | ClozeQuestion;
