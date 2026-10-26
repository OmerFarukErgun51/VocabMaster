# İçerik Bitiş Testi — Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bir içerik (kitap) bitince, o içeriğin hedef kelimeleri ve cümlelerinden üretilen bir pekiştirme testi sunmak ve sonucu kaydetmek.

**Architecture:** Saf test-üretim mantığı domain katmanında birim testlerle; DB destekli kelime/distractor toplama ve sonuç kaydı data katmanında; test ekranı presentation katmanında, `PagedReaderScreen` son sayfaya ulaşınca açılır.

**Tech Stack:** React Native 0.86 / Expo SDK 57, TypeScript, expo-sqlite (senkron), jest + ts-jest.

**Spec:** `docs/superpowers/specs/2026-10-26-vocabmaster-improvements-design.md` (§8 Bitiş Testleri)

## Global Constraints

- İçerik SQLite'a kopyalanmaz; kelime/distractor verisi mevcut `words` tablosundan okunur, sonuç `test_results`'a yazılır.
- Her task sonunda `npx tsc --noEmit` temiz geçer, `npm test` yeşil.
- Saf domain mantığı RN/expo import etmez (jest ile test edilir).
- Mevcut ekranlar bozulmaz; test yalnızca okuyucu son sayfada açılır.

## Review Focus

- **Hiç kelime ve cümle yok** → test boş dizi döner; UI "test oluşturulamadı" gösterir, çökmez. (Task 1 + Task 3)
- **4'ten az distractor** → şıklar mevcut olanla üretilir (cevap + eldekiler), en az 1 şık; cevap her zaman şıklar içinde. (Task 1)
- **Hedef kelime hiçbir cümlede geçmiyor** → o kelime için yalnızca anlam sorusu, cloze yok. (Task 1)
- **max sınırı** → üretilen soru sayısı max'ı aşmaz. (Task 1)
- **Aynı içeriğin testi tekrar çözülür** → yeni sonuç eklenir, en iyi skor okunabilir. (Task 2, manuel)

---

### Task 1: Test üretim domain mantığı (saf, TDD)

**Files:**
- Create: `src/features/reader/domain/testTypes.ts`
- Create: `src/features/reader/domain/testGenerator.ts`
- Test: `src/features/reader/domain/testGenerator.test.ts`

**Interfaces:**
- Produces:
  - `MeaningQuestion = { kind: 'meaning'; word: string; prompt: string; options: string[]; answer: string }`
  - `ClozeQuestion = { kind: 'cloze'; word: string; sentence: string; options: string[]; answer: string }`
  - `TestQuestion = MeaningQuestion | ClozeQuestion`
  - `WordPair = { english: string; turkish: string }`
  - `generateEndOfContentTest(params: { words: WordPair[]; sentences: {en:string;tr:string}[]; distractorMeanings: string[]; distractorWords: string[]; max?: number }): TestQuestion[]`
    - Her kelime için bir anlam sorusu (prompt = english, answer = turkish, options = answer + en fazla 3 farklı distractorMeaning, karışık).
    - Kelimeyi (tam sözcük, büyük/küçük harf duyarsız) içeren ilk cümle için bir cloze sorusu (sentence = cümlede kelime `_____` ile değiştirilmiş, answer = english, options = answer + en fazla 3 distractorWord).
    - Toplam `max` (varsayılan 8) ile sınırlanır.

- [ ] **Step 1: Başarısız testleri yaz** (`testGenerator.test.ts`)

```ts
import { generateEndOfContentTest } from './testGenerator';

const words = [{ english: 'forest', turkish: 'orman' }, { english: 'bowl', turkish: 'kase' }];
const sentences = [{ en: 'The forest was green.', tr: 'Orman yeşildi.' }];

test('boş girdi boş test döner', () => {
  expect(generateEndOfContentTest({ words: [], sentences: [], distractorMeanings: [], distractorWords: [] })).toEqual([]);
});
test('her kelime için anlam sorusu üretir ve cevap şıklarda olur', () => {
  const qs = generateEndOfContentTest({ words, sentences: [], distractorMeanings: ['elma','kitap','su','masa'], distractorWords: [] });
  const meanings = qs.filter(q => q.kind === 'meaning');
  expect(meanings).toHaveLength(2);
  meanings.forEach(q => expect(q.options).toContain(q.answer));
  expect(meanings[0].options.length).toBeLessThanOrEqual(4);
});
test('az distractor ile cevap yine şıklarda ve şık sayısı taşmaz', () => {
  const qs = generateEndOfContentTest({ words: [words[0]], sentences: [], distractorMeanings: ['elma'], distractorWords: [] });
  const q = qs[0];
  expect(q.options).toContain(q.answer);
  expect(q.options.length).toBe(2);
});
test('kelimeyi içeren cümleden cloze üretir (boşluk içerir, cevabı içermez)', () => {
  const qs = generateEndOfContentTest({ words: [words[0]], sentences, distractorMeanings: ['x','y','z'], distractorWords: ['bowl','river','tree'] });
  const cloze = qs.find(q => q.kind === 'cloze');
  expect(cloze).toBeDefined();
  expect(cloze!.sentence).toContain('_____');
  expect(cloze!.sentence.toLowerCase()).not.toContain('forest');
  expect(cloze!.options).toContain('forest');
});
test('max soru sayısını sınırlar', () => {
  const many = Array.from({ length: 10 }, (_, i) => ({ english: `w${i}`, turkish: `t${i}` }));
  const qs = generateEndOfContentTest({ words: many, sentences: [], distractorMeanings: ['a','b','c','d'], distractorWords: [], max: 4 });
  expect(qs.length).toBe(4);
});
```

- [ ] **Step 2: Çalıştır, RED gör** — Run: `npx jest testGenerator` — Expected: FAIL (modül yok).
- [ ] **Step 3: `testTypes.ts` ve `testGenerator.ts`'i uygula.**
- [ ] **Step 4: Çalıştır, GREEN gör** — Run: `npx jest testGenerator` — Expected: PASS.
- [ ] **Step 5: Commit** — `git add src/features/reader/domain/testTypes.ts src/features/reader/domain/testGenerator.ts src/features/reader/domain/testGenerator.test.ts && git commit -m "Add end-of-content test generator"`

---

### Task 2: Test deposu + içerik için test kurucu (SQLite)

**Files:**
- Create: `src/features/reader/data/testRepository.ts`

**Interfaces:**
- Consumes: `getAllWords`, `findWordByEnglish` (`src/services/database.ts`); `getAllContent`/`ReaderContent`; `generateEndOfContentTest` (Task 1); `test_results` tablosu.
- Produces:
  - `saveTestResult(contentId: string, score: number, total: number): void` — `test_results`'a satır ekler.
  - `getBestResult(contentId: string): { score: number; total: number } | null`.
  - `buildTestForContent(content: ReaderContent): TestQuestion[]` — highlights + varsa cümlelerden kelimeleri çözer (findWordByEnglish ile turkish bulur; bulunamayanı atlar), distractor havuzlarını `getAllWords`'ten toplar, `generateEndOfContentTest`'i çağırır.

- [ ] **Step 1: Uygula** — mevcut `database.ts` senkron desenini izle. DB'ye dokunduğu için birim test yok; Task 3 manuel doğrulamasıyla kanıtlanır.
- [ ] **Step 2: Typecheck** — Run: `npx tsc --noEmit` — Expected: hata yok.
- [ ] **Step 3: Commit** — `git add src/features/reader/data/testRepository.ts && git commit -m "Add end-of-content test repository and builder"`

---

### Task 3: Bitiş testi ekranı + okuyucuya entegrasyon

**Files:**
- Create: `src/features/reader/presentation/EndOfContentTest.tsx`
- Modify: `src/features/reader/presentation/PagedReaderScreen.tsx`

**Interfaces:**
- Consumes: `buildTestForContent`, `saveTestResult` (Task 2); `TestQuestion` (Task 1); `useTheme`.
- Produces: `EndOfContentTest({ content, onClose })` — soruları tek tek gösterir (şık seçimi, doğru/yanlış geri bildirimi), bitişte skoru gösterir ve `saveTestResult` çağırır. Test boşsa "Bu içerik için test oluşturulamadı" gösterir.
- `PagedReaderScreen`: son sayfadayken (`page === total - 1` ve `total > 0`) alt barda "Bitiş Testi" butonu; basınca `EndOfContentTest` modalini açar.

- [ ] **Step 1: `EndOfContentTest.tsx`'i uygula.**
- [ ] **Step 2: `PagedReaderScreen`'e buton + modal durumu ekle.**
- [ ] **Step 3: Tüm testler + typecheck** — Run: `npm test` ve `npx tsc --noEmit` — Expected: tüm testler PASS, tsc temiz.
- [ ] **Step 4: Manuel doğrulama (kullanıcı):** kitabı sonuna kadar oku → "Bitiş Testi" çıkıyor mu, sorular geliyor mu, skor kaydediliyor mu.
- [ ] **Step 5: Commit** — `git add src/features/reader/presentation/EndOfContentTest.tsx src/features/reader/presentation/PagedReaderScreen.tsx && git commit -m "Add end-of-content test screen and reader integration"`
