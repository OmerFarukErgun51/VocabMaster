# 📱 VocabMaster — Personal English Learning & Interactive Reading App

VocabMaster is an offline-first, personal language-learning ecosystem built with **React Native (Expo)**. It combines a **Spaced Repetition (SRS)** engine, an **interactive text/PDF reader (LingQ-style)**, **multiple exercise modes**, and a **Google Gemini-powered AI coach**.

---

## 🚀 Quick Start

1. **Requirement:** Install **Expo Go** on your phone from Google Play / App Store.
2. **Run the project:**
   ```bash
   cd VocabMaster
   npm install
   npx expo start
   ```
3. **Connect:** Scan the QR code shown in the terminal with Expo Go (make sure the phone and computer are on the same Wi-Fi). Changes hot-reload instantly.

---

## ✨ Core Features

### 🧠 Smart Spaced Repetition (SRS)
- Leitner-style boxes (1 → 5): review intervals grow as you answer correctly (1, 3, 7, 16, 35 days).
- Mastered words (box 5) are archived so they don't waste time in daily reviews.
- CEFR filtering: A1, A2, B1, B2, C1, C2.

### 🎮 Four Exercise Modes
- **Flashcards** — two-sided cards, pronunciation, example sentences, collocations.
- **Multiple choice** — both TR → EN and EN → TR.
- **Matching pairs** — quickly match English and Turkish words.
- **Writing / dictation** — type the English from pronunciation and meaning.

### 📖 Reading Library & Tap-to-Learn
- Movie dialogues, classic literature, tech/science articles, and children's stories.
- Import your own PDF or text files.
- **Tap-to-Learn:** tap any word in a text to see its meaning, pronunciation, and an "Add to my words" button.
- **Paginated reader** (in progress): read like a real book with page numbers and resume support.

### 🤖 Gemini AI Coach
- Analyzes your weak words and generates practice stories.
- Scores sentences you write and suggests more natural alternatives.
- Simplifies difficult texts to your level.

---

## 🛠️ Tech Stack
- **Framework:** React Native (Expo SDK 57, TypeScript)
- **Database:** `expo-sqlite` (fully offline, local SQLite — stores user data only)
- **Speech:** `expo-speech` (US & UK accents)
- **AI:** Google Gemini API
- **Files:** `expo-document-picker`, `expo-file-system`
- **Tests:** Jest + ts-jest (pure TypeScript domain logic)

---

## 🧱 Architecture

The project is gradually moving to a feature-first clean architecture:

```
src/
  core/        # shared kernel (db, theme, types)
  content/     # static, read-only content (not copied into the DB)
  features/    # feature modules (reader, movies, study, coach)
    <feature>/
      domain/        # pure business logic (no RN/SQLite imports) — unit tested
      data/          # repositories: read content + persist user progress
      presentation/  # screens, components, hooks
  shared/      # shared UI components and utils
```

**Storage principle:** content is read from bundled static files and is **never duplicated into SQLite**. The database holds only user data (saved words, SRS state, reading progress, test results), keeping storage light.

See `docs/superpowers/specs/` for the design and `docs/superpowers/plans/` for implementation plans.

---

## 🧪 Development

```bash
npx tsc --noEmit   # type-check
npm test           # run unit tests (pure TS domain logic)
npx expo start     # run the app
```

---

## 📄 License
See [LICENSE](LICENSE).
