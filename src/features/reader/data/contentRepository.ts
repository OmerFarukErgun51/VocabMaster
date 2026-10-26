import { INITIAL_READINGS } from '../../../data/seedReadings';
import { ReaderContent } from '../domain/types';

/**
 * Gömülü okuma içeriğini ReaderContent'e dönüştürür. SQLite'a DOKUNMAZ —
 * içerik salt-okunur kaynaktan okunur, yalnızca kullanıcı ilerlemesi DB'de tutulur.
 * Her okumaya index tabanlı kararlı bir id atanır (reading-<index>).
 */
export const getAllContent = (): ReaderContent[] =>
  INITIAL_READINGS.map((r, i) => ({
    id: `reading-${i}`,
    title: r.title,
    source: r.source,
    category: r.category,
    level: r.level,
    content: r.content,
    sentences: r.sentences,
    highlights: r.vocabulary_highlights ?? [],
  }));

export const getContentById = (id: string): ReaderContent | undefined =>
  getAllContent().find(c => c.id === id);
