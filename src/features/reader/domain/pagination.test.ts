import { paginate, computeCharsPerPage } from './pagination';

test('kısa metin tek sayfa döner', () => {
  expect(paginate('Hello world', 100)).toEqual(['Hello world']);
});

test('boş metin en az bir sayfa döner', () => {
  expect(paginate('', 100)).toHaveLength(1);
});

test('kelime ortasından bölmez ve tüm kelimeleri korur', () => {
  const pages = paginate('aaaa bbbb cccc dddd', 10);
  // Hiçbir kelime bölünmemeli: sayfaları birleştirince orijinal kelime dizisi çıkar.
  expect(pages.join(' ').replace(/\s+/g, ' ').trim()).toBe('aaaa bbbb cccc dddd');
  expect(pages.length).toBeGreaterThan(1);
});

test('paragraf sınırını tercih eder', () => {
  const pages = paginate('para1 text.\n\npara2 text.', 14);
  expect(pages[0]).toContain('para1');
  expect(pages[0]).not.toContain('para2');
});

test('computeCharsPerPage pozitif tam sayı döner', () => {
  const n = computeCharsPerPage({ width: 360, height: 640, fontSize: 18, lineHeight: 28 });
  expect(Number.isInteger(n)).toBe(true);
  expect(n).toBeGreaterThan(0);
});
