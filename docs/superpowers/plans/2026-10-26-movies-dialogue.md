# Filmler / Diyalog Görünümü — Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Film ve günlük diyalog içeriklerini parça parça (satır satır) İngilizce replikler + senkron Türkçe çeviri + dokun-öğren ile sunmak; sonunda bitiş testi.

**Architecture:** Saf `toDialogueLines` dönüşümü domain'de (birim test); diyalog ekranı presentation'da; App içerik kategorisine göre yönlendirir ('movies'/'daily_dialogues' → diyalog, diğerleri → sayfalı okuyucu).

**Spec:** `docs/superpowers/specs/2026-10-26-...-design.md` (§6-7, Filmler)

## Global Constraints
- Mevcut gömülü içerik (readings `sentences`) kullanılır; yeni telifli veri eklenmez; DB'ye içerik kopyalanmaz.
- Her task sonunda `npx tsc --noEmit` temiz, `npm test` yeşil.
- Mevcut sayfalı okuyucu ve diğer ekranlar bozulmaz.

## Review Focus
- **Cümlesi olmayan içerik** → `content` metninden cümlelere bölünür; boş metin → boş dizi. (Task 1)
- **TR çevirisi olmayan satır** → EN gösterilir, TR boş/placeholder; çökme yok. (Task 1 + Task 2)
- **Kategori yönlendirmesi** → yalnızca 'movies'/'daily_dialogues' diyaloga gider; kitap/hikaye sayfalı okuyucuda kalır. (Task 2)

---

### Task 1: `toDialogueLines` domain (saf, TDD)

**Files:**
- Create: `src/features/reader/domain/dialogue.ts`
- Test: `src/features/reader/domain/dialogue.test.ts`

**Interfaces:**
- Produces: `DialogueLine = { en: string; tr: string }`; `toDialogueLines(input: { sentences?: { en: string; tr: string }[]; content: string }): DialogueLine[]`
  - `sentences` doluysa onları döndürür; değilse `content`'i cümlelere böler (`tr: ''`); boş içerik → `[]`.

- [ ] **Step 1: Başarısız testleri yaz**

```ts
import { toDialogueLines } from './dialogue';
test('sentences varsa onları kullanır', () => {
  const s = [{ en: 'Hello.', tr: 'Merhaba.' }];
  expect(toDialogueLines({ sentences: s, content: 'x' })).toEqual(s);
});
test('sentences yoksa content cümlelere bölünür, tr boş', () => {
  const lines = toDialogueLines({ content: 'Hi there. How are you?' });
  expect(lines.length).toBe(2);
  expect(lines[0].en).toContain('Hi there');
  expect(lines[0].tr).toBe('');
});
test('boş içerik boş dizi döner', () => {
  expect(toDialogueLines({ content: '' })).toEqual([]);
});
```

- [ ] **Step 2: RED** — `npx jest dialogue`
- [ ] **Step 3: Uygula** `dialogue.ts` (cümle bölme: `/(?<=[.?!])\s+/`, trim, boşları ele).
- [ ] **Step 4: GREEN** — `npx jest dialogue`
- [ ] **Step 5: Commit** — `git commit -m "Add dialogue line builder for movie content"`

---

### Task 2: Diyalog ekranı + App yönlendirmesi

**Files:**
- Create: `src/features/reader/presentation/MovieDialogueScreen.tsx`
- Modify: `App.tsx`

**Interfaces:**
- Consumes: `toDialogueLines` (Task 1), `InteractiveText`, `EndOfContentTest`, `speakWord`, `useTheme`, `ReaderContent`.
- Produces: `MovieDialogueScreen({ reading, onBack })` — satırları diyalog kartları olarak dikey listeler; her kartta EN (InteractiveText ile dokunulabilir), "Çeviriyi göster" toggle (TR varsa), seslendir butonu; altta "Bitiş Testi" → `EndOfContentTest` modal.
- `App.tsx`: `activeReading` kategorisi 'movies' veya 'daily_dialogues' ise `MovieDialogueScreen`, değilse `PagedReaderScreen`.

- [ ] **Step 1: `MovieDialogueScreen.tsx`'i uygula** (ReaderContent'i reading'den kur; `toDialogueLines` ile satırları üret).
- [ ] **Step 2: `App.tsx` yönlendirmesini ekle.**
- [ ] **Step 3: Tüm testler + typecheck** — `npm test`, `npx tsc --noEmit`.
- [ ] **Step 4: Manuel doğrulama (kullanıcı):** bir film/diyalog aç → satırlar geliyor mu, çeviri açılıyor mu, seslendirme ve dokun-öğren çalışıyor mu, bitiş testi geliyor mu.
- [ ] **Step 5: Commit** — `git commit -m "Add movie dialogue screen and category-based routing"`
