# Çekirdek İskelet + Sayfalı Okuyucu — Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clean architecture çekirdeğini (hafif test altyapısı + kullanıcı-verisi DB tabloları) kurmak ve mevcut okuma içeriğini "gerçek kitap gibi" sayfalı, ilerleme kaydeden bir okuyucuda sunmak.

**Architecture:** Feature-first clean architecture, kademeli. Saf TS domain katmanı (sayfalama) birim testlerle; data katmanı gömülü içeriği (`INITIAL_READINGS`) okur ve ilerlemeyi SQLite'a yazar; presentation yalnızca hook üzerinden domain'e konuşur. İçerik SQLite'a KOPYALANMAZ.

**Tech Stack:** React Native 0.86 / Expo SDK 57, TypeScript, expo-sqlite (senkron API), jest + ts-jest (yalnızca saf-TS testleri için, devDependency).

**Spec:** `docs/superpowers/specs/2026-10-26-vocabmaster-improvements-design.md`

## Global Constraints

- Çevrimdışı-öncelikli: okuyucu ve sayfalama internet gerektirmez.
- İçerik SQLite'a kopyalanmaz; gömülü kaynaktan okunur. DB yalnızca kullanıcı verisi tutar.
- Her task sonunda `npx tsc --noEmit` temiz geçer.
- Yeni native paket eklenmez; yalnızca devDependency (jest, ts-jest, @types/jest).
- Mevcut çalışan ekranlar (Study, Vocabulary, SRS) bozulmaz.
- Aşırı soyutlamadan kaçın (YAGNI): katman yalnızca değer kattığında.
- Jest yalnızca saf-TS (`*.test.ts`) dosyalarını çalıştırır; RN/expo import eden modül test edilmez.

## Review Focus

- **Boş veya çok kısa içerik** → sayfalama en az 1 sayfa döndürür, asla 0 / çökme. (Task 2)
- **Paragraf ayracı olmayan tek uzun satır** → kelime ortasından bölmeden sayfalanır. (Task 2)
- **Hiç açılmamış içeriğin ilerlemesi** → `getProgress` makul varsayılan döndürür (sayfa 0, bitmedi), null değil. (Task 4)
- **`last_page > total_pages`** (içerik değişmiş/küçülmüş) → okuyucu son geçerli sayfaya sıkıştırır, çökmez. (Task 5)
- **Çok uzun içerik** → sayfalama tek seferde hesaplanır ve memoize edilir; her kaydırmada yeniden hesaplanmaz. (Task 5)

---

### Task 1: Test altyapısı + kullanıcı-verisi DB tabloları

**Files:**
- Modify: `package.json` (devDeps + `test` script)
- Create: `jest.config.js`
- Create: `src/core/db/migrations.ts`
- Modify: `src/services/database.ts` (initDatabase içinde yeni migration'ı çağır)
- Test: `src/core/db/migrations.test.ts` (saf: SQL metni üretimini test eder)

**Interfaces:**
- Produces:
  - `READING_PROGRESS_DDL: string`, `TEST_RESULTS_DDL: string` — tablo oluşturma SQL metinleri (saf sabitler, test edilebilir).
  - `initUserDataTables(db: SQLiteDatabase): void` — iki tabloyu `CREATE TABLE IF NOT EXISTS` ile kurar.
  - `reading_progress(content_id TEXT, type TEXT, last_page INTEGER, total_pages INTEGER, finished INTEGER, updated_at TEXT)`, PK `content_id`.
  - `test_results(id INTEGER PK AUTOINCREMENT, content_id TEXT, score INTEGER, total INTEGER, taken_at TEXT)`.

- [ ] **Step 1: jest + ts-jest + @types/jest ekle ve `test` script'i ekle**

Run: `npm install -D jest ts-jest @types/jest`
`package.json` scripts'e ekle: `"test": "jest"`

- [ ] **Step 2: `jest.config.js` yaz**

ts-jest preset, `testEnvironment: 'node'`, `testMatch: ['**/*.test.ts']` (yalnızca `.ts`, `.tsx` hariç), `roots: ['<rootDir>/src']`.

- [ ] **Step 3: Başarısız testi yaz** (`src/core/db/migrations.test.ts`)

```ts
import { READING_PROGRESS_DDL, TEST_RESULTS_DDL } from './migrations';

test('reading_progress DDL IF NOT EXISTS ve content_id PK içerir', () => {
  expect(READING_PROGRESS_DDL).toMatch(/CREATE TABLE IF NOT EXISTS reading_progress/);
  expect(READING_PROGRESS_DDL).toMatch(/content_id TEXT PRIMARY KEY/);
});
test('test_results DDL IF NOT EXISTS içerir', () => {
  expect(TEST_RESULTS_DDL).toMatch(/CREATE TABLE IF NOT EXISTS test_results/);
});
```

- [ ] **Step 4: Testi çalıştır, başarısız olduğunu gör**

Run: `npm test -- migrations`
Expected: FAIL ("Cannot find module './migrations'").

- [ ] **Step 5: `migrations.ts`'i uygula**

`READING_PROGRESS_DDL`, `TEST_RESULTS_DDL` sabitlerini ve `initUserDataTables(db)` fonksiyonunu yaz (mevcut `database.ts` `execSync` desenini izle).

- [ ] **Step 6: Testi çalıştır, geçtiğini gör**

Run: `npm test -- migrations`
Expected: PASS.

- [ ] **Step 7: `initDatabase` içinden çağır**

`src/services/database.ts` içinde tablolar oluşturulduktan sonra `initUserDataTables(db)` çağrısını ekle (import dahil).

- [ ] **Step 8: Typecheck**

Run: `npx tsc --noEmit`
Expected: hata yok.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json jest.config.js src/core/db/migrations.ts src/core/db/migrations.test.ts src/services/database.ts
git commit -m "çekirdek: test altyapısı ve kullanıcı-verisi tabloları"
```

---

### Task 2: Sayfalama domain mantığı (saf, TDD)

**Files:**
- Create: `src/features/reader/domain/pagination.ts`
- Test: `src/features/reader/domain/pagination.test.ts`

**Interfaces:**
- Produces:
  - `computeCharsPerPage(opts: { width: number; height: number; fontSize: number; lineHeight: number }): number` — ekran boyutundan sayfa başına tahmini karakter sayısı (saf).
  - `paginate(text: string, charsPerPage: number): string[]` — metni sayfalara böler; kelime ortasından bölmez, mümkünse paragraf (`\n\n`) sınırında keser; her zaman ≥1 sayfa döndürür (boş metin → `['']`).

- [ ] **Step 1: Başarısız testleri yaz** (`pagination.test.ts`)

```ts
import { paginate, computeCharsPerPage } from './pagination';

test('kısa metin tek sayfa döner', () => {
  expect(paginate('Hello world', 100)).toEqual(['Hello world']);
});
test('boş metin en az bir sayfa döner', () => {
  expect(paginate('', 100)).toHaveLength(1);
});
test('kelime ortasından bölmez', () => {
  const pages = paginate('aaaa bbbb cccc dddd', 10);
  pages.forEach(p => expect(p).not.toMatch(/\w$/)); // sayfa kelime ortasında bitmez
  expect(pages.join(' ').replace(/\s+/g, ' ').trim()).toBe('aaaa bbbb cccc dddd');
});
test('paragraf sınırını tercih eder', () => {
  const pages = paginate('para1 text.\n\npara2 text.', 14);
  expect(pages[0]).toContain('para1');
});
test('computeCharsPerPage pozitif tam sayı döner', () => {
  const n = computeCharsPerPage({ width: 360, height: 640, fontSize: 18, lineHeight: 28 });
  expect(Number.isInteger(n)).toBe(true);
  expect(n).toBeGreaterThan(0);
});
```

- [ ] **Step 2: Testleri çalıştır, başarısız gör**

Run: `npm test -- pagination`
Expected: FAIL.

- [ ] **Step 3: `pagination.ts`'i uygula**

`paginate`: paragraflara böl, paragrafları sayfaya sığdıkça biriktir; sığmayan paragrafı kelime kelime böl (kelime bütünlüğü korunur). `computeCharsPerPage`: `(genişlik/ort.karakter_genişliği) * (yükseklik/satır_yüksekliği)` yaklaşık formülü; ort. karakter genişliği ≈ `fontSize * 0.5`.

- [ ] **Step 4: Testleri çalıştır, geçtiğini gör**

Run: `npm test -- pagination`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/reader/domain/pagination.ts src/features/reader/domain/pagination.test.ts
git commit -m "okuyucu: saf sayfalama domain mantığı"
```

---

### Task 3: İçerik deposu (gömülü okumaları sarmalar, DB'siz)

**Files:**
- Create: `src/features/reader/domain/types.ts`
- Create: `src/features/reader/data/contentRepository.ts`
- Test: `src/features/reader/data/contentRepository.test.ts`

**Interfaces:**
- Consumes: `INITIAL_READINGS` (`src/data/seedReadings.ts`, `Omit<ReadingMaterial,'id'>[]`).
- Produces:
  - `ReaderContent = { id: string; title: string; source: string; category: ReadingCategory; level: CEFRLevel; content: string; sentences?: {en:string;tr:string}[]; highlights: string[] }`.
  - `getAllContent(): ReaderContent[]` — her okumaya kararlı bir `id` (`reading-<index>`) atar; SQLite'a DOKUNMAZ.
  - `getContentById(id: string): ReaderContent | undefined`.

- [ ] **Step 1: Başarısız testleri yaz** (`contentRepository.test.ts`)

```ts
import { getAllContent, getContentById } from './contentRepository';

test('gömülü okumaları id ile döndürür', () => {
  const all = getAllContent();
  expect(all.length).toBeGreaterThan(0);
  expect(all[0].id).toMatch(/^reading-\d+$/);
  expect(typeof all[0].content).toBe('string');
});
test('getContentById doğru içeriği döndürür', () => {
  const first = getAllContent()[0];
  expect(getContentById(first.id)?.title).toBe(first.title);
  expect(getContentById('yok-boyle-id')).toBeUndefined();
});
```

- [ ] **Step 2: Testleri çalıştır, başarısız gör**

Run: `npm test -- contentRepository`
Expected: FAIL.

- [ ] **Step 3: `types.ts` ve `contentRepository.ts`'i uygula**

`INITIAL_READINGS.map((r, i) => ...)` ile `ReaderContent` üret; `highlights` yoksa `[]`. Yalnızca saf veri dönüşümü — RN/expo import etme (test edilebilir kalsın).

- [ ] **Step 4: Testleri çalıştır, geçtiğini gör**

Run: `npm test -- contentRepository`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/reader/domain/types.ts src/features/reader/data/contentRepository.ts src/features/reader/data/contentRepository.test.ts
git commit -m "okuyucu: gömülü içerik deposu"
```

---

### Task 4: İlerleme deposu (SQLite kullanıcı verisi)

**Files:**
- Create: `src/features/reader/data/progressRepository.ts`

**Interfaces:**
- Consumes: `getDB` (`src/services/database.ts`), `reading_progress` tablosu (Task 1).
- Produces:
  - `ReadingProgress = { contentId: string; lastPage: number; totalPages: number; finished: boolean }`.
  - `getProgress(contentId: string): ReadingProgress` — satır yoksa `{ contentId, lastPage: 0, totalPages: 0, finished: false }` döndürür (asla null).
  - `saveProgress(p: ReadingProgress): void` — `INSERT OR REPLACE`, `updated_at = now`.

- [ ] **Step 1: Uygula**

Mevcut `database.ts` senkron desenini (`db.getFirstSync`, `db.runSync`) izle. `finished` 0/1 ↔ boolean dönüşümü. Bu dosya expo-sqlite'a dokunduğu için birim testi yok; doğruluğu Task 5'in manuel testinde + tsc ile doğrulanır.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: hata yok.

- [ ] **Step 3: Commit**

```bash
git add src/features/reader/data/progressRepository.ts
git commit -m "okuyucu: ilerleme deposu (sqlite)"
```

---

### Task 5: Sayfalı okuyucu ekranı + hook + bağlama

**Files:**
- Create: `src/features/reader/presentation/usePagedReader.ts`
- Create: `src/features/reader/presentation/PagedReaderScreen.tsx`
- Modify: `App.tsx` (okuyucuyu `PagedReaderScreen` ile aç)
- Modify: `src/screens/LibraryScreen.tsx` (seçimde `ReaderContent.id` gönder)

**Interfaces:**
- Consumes: `paginate`, `computeCharsPerPage` (Task 2); `getContentById` (Task 3); `getProgress`, `saveProgress` (Task 4); mevcut `InteractiveText` (dokun-öğren) ve `useTheme`.
- Produces:
  - Hook `usePagedReader(contentId, screen): { pages: string[]; page: number; total: number; goTo(n): void; finished: boolean; content: ReaderContent }` — sayfaları `useMemo` ile tek sefer hesaplar; başlangıç sayfası `getProgress` → `clamp(lastPage, 0, total-1)`; `goTo` çağrısında `saveProgress`.
  - `PagedReaderScreen({ contentId, onBack })`.

- [ ] **Step 1: Hook'u uygula** (`usePagedReader.ts`)

`charsPerPage = computeCharsPerPage(...)`, `pages = useMemo(() => paginate(content.content, charsPerPage), [...])`. `lastPage > total-1` ise `total-1`'e sıkıştır (Review Focus). Son sayfaya ulaşınca `finished=true` kaydet.

- [ ] **Step 2: Ekranı uygula** (`PagedReaderScreen.tsx`)

Yatay `FlatList` + `pagingEnabled` (yatay sayfa çevirme); her sayfa `InteractiveText` ile (dokun-öğren korunur); altta "Sayfa {page+1} / {total}" + ince ilerleme çubuğu; geri butonu. Boş/tek sayfa durumunda da sorunsuz.

- [ ] **Step 3: Bağla** — `App.tsx` ve `LibraryScreen.tsx`

`activeReading` yerine `activeReadingId: string | null` kullan; `LibraryScreen` içerik seçince id gönderir; `PagedReaderScreen` açılır.

- [ ] **Step 4: Tüm testler + typecheck**

Run: `npm test` ve `npx tsc --noEmit`
Expected: tüm testler PASS, tsc hata yok.

- [ ] **Step 5: Manuel doğrulama (kullanıcı ile)**

`npx expo start` → bir kitap aç: sayfalar çevriliyor mu, "Sayfa X / Y" doğru mu, kapatıp açınca kaldığı sayfadan devam ediyor mu, kelimeye dokununca anlam geliyor mu.

- [ ] **Step 6: Commit**

```bash
git add src/features/reader/presentation/ App.tsx src/screens/LibraryScreen.tsx
git commit -m "okuyucu: sayfalı okuma ekranı ve ilerleme"
```
