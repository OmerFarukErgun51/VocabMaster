import { CEFRLevel, ReadingCategory } from '../../../types';

/** Okuyucunun gösterdiği içerik birimi. Gömülü kaynaktan türetilir; DB'ye yazılmaz. */
export interface ReaderContent {
  id: string;
  title: string;
  source: string;
  category: ReadingCategory;
  level: CEFRLevel;
  content: string;
  sentences?: { en: string; tr: string }[];
  highlights: string[];
}
