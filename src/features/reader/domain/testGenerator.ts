import { TestQuestion, WordPair } from './testTypes';

interface GenerateParams {
  words: WordPair[];
  sentences: { en: string; tr: string }[];
  distractorMeanings: string[];
  distractorWords: string[];
  max?: number;
}

const escapeRegExp = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const shuffle = <T>(arr: T[]): T[] =>
  arr
    .map(v => [Math.random(), v] as [number, T])
    .sort((a, b) => a[0] - b[0])
    .map(x => x[1]);

/** Cevabı + havuzdan en fazla `count` farklı çeldiriciyi karıştırarak şık listesi üretir. */
const buildOptions = (answer: string, pool: string[], count = 3): string[] => {
  const distractors = shuffle(pool.filter(d => d !== answer)).slice(0, count);
  return shuffle([answer, ...distractors]);
};

export const generateEndOfContentTest = ({
  words,
  sentences,
  distractorMeanings,
  distractorWords,
  max = 8,
}: GenerateParams): TestQuestion[] => {
  const questions: TestQuestion[] = [];

  for (const w of words) {
    // 1) Anlam sorusu
    questions.push({
      kind: 'meaning',
      word: w.english,
      prompt: w.english,
      options: buildOptions(w.turkish, distractorMeanings),
      answer: w.turkish,
    });

    // 2) Kelimeyi içeren bir cümle varsa cloze sorusu
    const wordRe = new RegExp(`\\b${escapeRegExp(w.english)}\\b`, 'i');
    const match = sentences.find(s => wordRe.test(s.en));
    if (match) {
      const blanked = match.en.replace(new RegExp(`\\b${escapeRegExp(w.english)}\\b`, 'gi'), '_____');
      questions.push({
        kind: 'cloze',
        word: w.english,
        sentence: blanked,
        options: buildOptions(w.english, distractorWords),
        answer: w.english,
      });
    }
  }

  return questions.slice(0, max);
};
