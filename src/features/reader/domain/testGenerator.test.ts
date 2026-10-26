import { generateEndOfContentTest } from './testGenerator';

const words = [
  { english: 'forest', turkish: 'orman' },
  { english: 'bowl', turkish: 'kase' },
];
const sentences = [{ en: 'The forest was green.', tr: 'Orman yeşildi.' }];

test('boş girdi boş test döner', () => {
  expect(
    generateEndOfContentTest({ words: [], sentences: [], distractorMeanings: [], distractorWords: [] })
  ).toEqual([]);
});

test('her kelime için anlam sorusu üretir ve cevap şıklarda olur', () => {
  const qs = generateEndOfContentTest({
    words,
    sentences: [],
    distractorMeanings: ['elma', 'kitap', 'su', 'masa'],
    distractorWords: [],
  });
  const meanings = qs.filter(q => q.kind === 'meaning');
  expect(meanings).toHaveLength(2);
  meanings.forEach(q => expect(q.options).toContain(q.answer));
  expect(meanings[0].options.length).toBeLessThanOrEqual(4);
});

test('az distractor ile cevap yine şıklarda ve şık sayısı taşmaz', () => {
  const qs = generateEndOfContentTest({
    words: [words[0]],
    sentences: [],
    distractorMeanings: ['elma'],
    distractorWords: [],
  });
  const q = qs[0];
  expect(q.options).toContain(q.answer);
  expect(q.options.length).toBe(2);
});

test('kelimeyi içeren cümleden cloze üretir (boşluk içerir, cevabı içermez)', () => {
  const qs = generateEndOfContentTest({
    words: [words[0]],
    sentences,
    distractorMeanings: ['x', 'y', 'z'],
    distractorWords: ['bowl', 'river', 'tree'],
  });
  const cloze = qs.find(q => q.kind === 'cloze');
  expect(cloze).toBeDefined();
  expect(cloze!.sentence).toContain('_____');
  expect(cloze!.sentence.toLowerCase()).not.toContain('forest');
  expect(cloze!.options).toContain('forest');
});

test('max soru sayısını sınırlar', () => {
  const many = Array.from({ length: 10 }, (_, i) => ({ english: `w${i}`, turkish: `t${i}` }));
  const qs = generateEndOfContentTest({
    words: many,
    sentences: [],
    distractorMeanings: ['a', 'b', 'c', 'd'],
    distractorWords: [],
    max: 4,
  });
  expect(qs.length).toBe(4);
});
