import { getDB, getAllWords, findWordByEnglish } from '../../../services/database';
import { ReaderContent } from '../domain/types';
import { TestQuestion, WordPair } from '../domain/testTypes';
import { generateEndOfContentTest } from '../domain/testGenerator';

export const saveTestResult = (contentId: string, score: number, total: number): void => {
  getDB().runSync(
    'INSERT INTO test_results (content_id, score, total) VALUES (?, ?, ?)',
    [contentId, score, total]
  );
};

export const getBestResult = (contentId: string): { score: number; total: number } | null => {
  const row = getDB().getFirstSync<{ score: number; total: number }>(
    'SELECT score, total FROM test_results WHERE content_id = ? ORDER BY score DESC LIMIT 1',
    [contentId]
  );
  return row ?? null;
};

/**
 * İçeriğin hedef kelimelerini (highlights) sözlükte çözer, çeldirici havuzlarını
 * mevcut kelime tablosundan toplar ve saf üreticiyi çağırır. İçerik DB'ye yazılmaz.
 */
export const buildTestForContent = (content: ReaderContent): TestQuestion[] => {
  const words: WordPair[] = [];
  for (const hl of content.highlights) {
    const found = findWordByEnglish(hl);
    if (found) {
      words.push({ english: found.english, turkish: found.turkish });
    }
  }

  // Çeldirici havuzu: tablodan rastgele bir alt küme (performans için sınırlı).
  const pool = getAllWords(true).sort(() => 0.5 - Math.random()).slice(0, 40);
  const distractorMeanings = pool.map(w => w.turkish);
  const distractorWords = pool.map(w => w.english);

  return generateEndOfContentTest({
    words,
    sentences: content.sentences ?? [],
    distractorMeanings,
    distractorWords,
  });
};
