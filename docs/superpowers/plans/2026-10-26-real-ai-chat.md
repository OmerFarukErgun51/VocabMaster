# Gerçek AI Sohbeti (Nova) — Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** AICoachModal'daki sahte (sabit butonlu) sohbeti, kullanıcının yazdığı mesajlara Gemini ile gerçekten yanıt veren, hataları nazikçe düzelten bir sohbete çevirmek.

**Architecture:** Saf prompt kurma + yanıt ayrıştırma `features/coach/domain`'de (birim test); Gemini çağrısı `features/coach/data`'da (callGemini'yi sarar, fallback'li); UI AICoachModal'da metin girişi + gönder.

**Spec:** `docs/superpowers/specs/2026-10-26-...-design.md` (§1 AI, gerçek sohbet)

## Global Constraints
- API anahtarı yoksa/hatada çökme yok; nazik bir fallback mesajı döner.
- `features/coach/domain` RN/expo import etmez (jest ile test edilir).
- Her task sonunda `npx tsc --noEmit` temiz, `npm test` yeşil.

## Review Focus
- **Geçmiş çok uzun** → prompt'a yalnızca son N mesaj konur (token şişmesi yok). (Task 1)
- **Gemini JSON yerine düz metin/fenced döndürür** → parse düz metni `reply` olarak kabul eder, çökmez. (Task 1)
- **API anahtarı yok / ağ hatası** → `chatWithNova` fallback mesajı döner. (Task 2, manuel)

---

### Task 1: Sohbet prompt + yanıt ayrıştırma (saf, TDD)

**Files:**
- Create: `src/features/coach/domain/chatPrompt.ts`
- Test: `src/features/coach/domain/chatPrompt.test.ts`

**Interfaces:**
- Produces:
  - `ChatTurn = { role: 'user' | 'nova'; text: string }`
  - `NovaReply = { reply: string; replyTr: string; correction?: string }`
  - `buildNovaChatPrompt(history: ChatTurn[], userMessage: string, maxHistory?: number): string` — Nova kişiliğini tanıtır, son `maxHistory` (varsayılan 8) mesajı ve yeni mesajı ekler, `{reply, replyTr, correction}` JSON ister.
  - `parseNovaReply(raw: string): NovaReply` — ```json çitlerini temizler; geçerli JSON ise alanları döndürür; JSON değilse ham metni `reply` yapar, `replyTr: ''`.

- [ ] **Step 1: Başarısız testleri yaz**

```ts
import { buildNovaChatPrompt, parseNovaReply } from './chatPrompt';

test('prompt yeni mesajı ve JSON talimatını içerir', () => {
  const p = buildNovaChatPrompt([], 'Hello Nova');
  expect(p).toContain('Hello Nova');
  expect(p.toLowerCase()).toContain('json');
});
test('prompt yalnızca son N mesajı içerir', () => {
  const hist = Array.from({ length: 20 }, (_, i) => ({ role: 'user' as const, text: `m${i}` }));
  const p = buildNovaChatPrompt(hist, 'new', 8);
  expect(p).toContain('m19');
  expect(p).not.toContain('m0\n');
});
test('geçerli JSON yanıtı ayrıştırır', () => {
  const r = parseNovaReply('```json\n{"reply":"Hi!","replyTr":"Merhaba!","correction":"x"}\n```');
  expect(r).toEqual({ reply: 'Hi!', replyTr: 'Merhaba!', correction: 'x' });
});
test('JSON olmayan yanıtı düz metin reply olarak alır', () => {
  const r = parseNovaReply('Just text');
  expect(r.reply).toBe('Just text');
  expect(r.replyTr).toBe('');
});
```

- [ ] **Step 2: RED** — `npx jest chatPrompt`
- [ ] **Step 3: Uygula** `chatPrompt.ts`.
- [ ] **Step 4: GREEN** — `npx jest chatPrompt`
- [ ] **Step 5: Commit** — `git commit -m "Add Nova chat prompt builder and reply parser"`

---

### Task 2: Nova sohbet servisi (Gemini sarmalayıcı)

**Files:**
- Create: `src/features/coach/data/novaChat.ts`

**Interfaces:**
- Consumes: `callGemini` (`src/services/gemini.ts`); `buildNovaChatPrompt`, `parseNovaReply`, `ChatTurn`, `NovaReply` (Task 1).
- Produces: `chatWithNova(history: ChatTurn[], userMessage: string): Promise<NovaReply>` — prompt kurar, `callGemini(prompt, true)` çağırır, `parseNovaReply` ile döner; hata/anahtar yoksa nazik fallback `NovaReply` döner.

- [ ] **Step 1: Uygula.** DB/RN'e dokunmaz ama callGemini (RN) import eder → birim test yok; Task 3 manuel doğrular.
- [ ] **Step 2: Typecheck** — `npx tsc --noEmit`.
- [ ] **Step 3: Commit** — `git commit -m "Add Nova chat service wrapping Gemini"`

---

### Task 3: AICoachModal gerçek sohbet UI

**Files:**
- Modify: `src/components/AICoachModal.tsx`

**Interfaces:**
- Consumes: `chatWithNova`, `ChatTurn` (Task 2/1).
- Değişiklik: chat modundaki sabit chip'ler kaldırılır; yerine `TextInput` + gönder butonu. Gönderince: kullanıcı mesajı chatLog'a eklenir, `chatWithNova` çağrılır (yükleniyor göstergesi), dönen `reply`(+`replyTr`, varsa `correction`) Nova balonu olarak eklenir. Seslendirme korunur.

- [ ] **Step 1: Uygula** (chatLog tipini ChatTurn'e uyarla; `handleChatUserChoice` yerine `handleSendMessage`).
- [ ] **Step 2: Tüm testler + typecheck** — `npm test`, `npx tsc --noEmit`.
- [ ] **Step 3: Manuel doğrulama (kullanıcı):** AI Koç → Sohbet → bir şey yaz → Nova gerçekten yanıtlıyor mu, hata düzeltmesi geliyor mu, anahtar yoksa nazik mesaj mı.
- [ ] **Step 4: Commit** — `git commit -m "Replace fake chat with real Gemini conversation in AI coach"`
