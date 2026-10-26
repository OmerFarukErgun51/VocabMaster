import * as SQLite from 'expo-sqlite';
import { Word, ReadingMaterial, StudyLog, CEFRLevel, ReadingCategory } from '../types';
import { INITIAL_WORDS } from '../data/seedWords';
import { INITIAL_READINGS } from '../data/seedReadings';
import massiveWords from '../data/massiveWords.json';
import { ESSENTIAL_PHRASES } from '../data/phrasesData';
import { initUserDataTables } from '../core/db/migrations';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export const getDB = (): SQLite.SQLiteDatabase => {
  if (!dbInstance) {
    dbInstance = SQLite.openDatabaseSync('vocabmaster.db');
  }
  return dbInstance;
};

export const initDatabase = async (): Promise<void> => {
  const db = getDB();

  // Create tables
  db.execSync(`
    CREATE TABLE IF NOT EXISTS words (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      english TEXT NOT NULL UNIQUE,
      turkish TEXT NOT NULL,
      level TEXT NOT NULL,
      category TEXT NOT NULL,
      part_of_speech TEXT,
      pronunciation TEXT,
      example_en TEXT NOT NULL,
      example_tr TEXT NOT NULL,
      collocations TEXT,
      frequency_rank INTEGER,
      image_url TEXT,
      box_level INTEGER DEFAULT 1,
      interval_days INTEGER DEFAULT 1,
      repetition_count INTEGER DEFAULT 0,
      ease_factor REAL DEFAULT 2.5,
      next_review_date TEXT NOT NULL,
      is_mastered INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      level TEXT NOT NULL,
      source TEXT NOT NULL,
      content TEXT NOT NULL,
      vocabulary_highlights TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS study_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word_id INTEGER,
      exercise_type TEXT,
      is_correct INTEGER,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  // Kullanıcı-verisi tabloları (okuma ilerlemesi + test sonuçları)
  initUserDataTables(db);

  // Migration for existing tables: add image_url if missing
  try {
    db.execSync('ALTER TABLE words ADD COLUMN image_url TEXT;');
  } catch {
    // Column already exists
  }

  try {
    db.execSync('ALTER TABLE readings ADD COLUMN image_url TEXT;');
  } catch {}

  try {
    db.execSync('ALTER TABLE readings ADD COLUMN sentences TEXT;');
  } catch {}

  try {
    db.execSync('ALTER TABLE readings ADD COLUMN is_deleted INTEGER DEFAULT 0;');
  } catch {}

  // Populate/Sync initial words (insert if not exists)
  const today = new Date().toISOString().split('T')[0];
  const insertWord = db.prepareSync(`
    INSERT OR IGNORE INTO words (
      english, turkish, level, category, part_of_speech, pronunciation,
      example_en, example_tr, collocations, frequency_rank, image_url,
      box_level, interval_days, repetition_count, ease_factor, next_review_date, is_mastered
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 0, 2.5, ?, 0)
  `);

  for (const w of INITIAL_WORDS) {
    const cleanEn = w.english.toLowerCase().trim();
    insertWord.executeSync([
      cleanEn,
      w.turkish,
      w.level,
      w.category,
      w.part_of_speech,
      w.pronunciation || '',
      w.example_en,
      w.example_tr,
      w.collocations || '',
      w.frequency_rank || 1000,
      w.image_url || '',
      today
    ]);

    // Also update image_url for existing entries
    if (w.image_url) {
      db.runSync('UPDATE words SET image_url = ? WHERE english = ? AND (image_url IS NULL OR image_url = "")', [w.image_url, cleanEn]);
    }
  }

  // Populate massive dataset if not yet loaded
  const countRow = db.getFirstSync<{ c: number }>('SELECT COUNT(*) as c FROM words');
  if (!countRow || countRow.c < 500) {
    db.withTransactionSync(() => {
      for (const item of massiveWords as any[]) {
        insertWord.executeSync([
          item.english.toLowerCase().trim(),
          item.turkish,
          item.level,
          item.category,
          'word',
          '',
          item.example_en || `Example for "${item.english}".`,
          item.example_tr || `"${item.turkish}" için örnek cümle.`,
          '',
          1000,
          '',
          today
        ]);
      }
    });
  }

  // Migrate generic placeholder sentences in existing database
  try {
    const genericCheck = db.getFirstSync<{ c: number }>(
      "SELECT COUNT(*) as c FROM words WHERE example_en LIKE 'Example sentence for%' OR example_en LIKE 'Example for%'"
    );
    if (genericCheck && genericCheck.c > 0) {
      const updateStmt = db.prepareSync('UPDATE words SET example_en = ?, example_tr = ? WHERE english = ?');
      db.withTransactionSync(() => {
        for (const item of massiveWords as any[]) {
          updateStmt.executeSync([
            item.example_en,
            item.example_tr,
            item.english.toLowerCase().trim()
          ]);
        }
      });
    }
  } catch (e) {
    console.log('Sentence sync note:', e);
  }

  // Migrate high-accuracy Turkish translations and delete errant entries
  try {
    const trMigrationCheck = db.getFirstSync<{ value: string }>(
      "SELECT value FROM user_settings WHERE key = 'turkish_translations_v2'"
    );
    if (!trMigrationCheck || trMigrationCheck.value !== 'done') {
      db.runSync("DELETE FROM words WHERE english IN ('yanliş', 'doğru')");
      const updateTrStmt = db.prepareSync('UPDATE words SET turkish = ? WHERE english = ?');
      db.withTransactionSync(() => {
        for (const item of massiveWords as any[]) {
          updateTrStmt.executeSync([
            item.turkish,
            item.english.toLowerCase().trim()
          ]);
        }
      });
      db.runSync(
        "INSERT OR REPLACE INTO user_settings (key, value) VALUES ('turkish_translations_v2', 'done')"
      );
      console.log('High-accuracy Turkish translations migrated successfully.');
    }
  } catch (e) {
    console.log('Translation sync note:', e);
  }

  // Populate/Sync initial readings
  for (const r of INITIAL_READINGS) {
    const wasDeleted = db.getFirstSync<any>(
      'SELECT 1 FROM user_settings WHERE key = ?',
      [`deleted_reading_${r.title}`]
    );
    if (wasDeleted) {
      continue;
    }

    const existing = db.getFirstSync<any>('SELECT id, is_deleted FROM readings WHERE title = ?', [r.title]);
    const vocabJson = JSON.stringify(r.vocabulary_highlights || []);
    const sentencesJson = JSON.stringify(r.sentences || []);

    if (!existing) {
      db.runSync(
        `INSERT INTO readings (title, category, level, source, content, vocabulary_highlights, image_url, sentences)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [r.title, r.category, r.level, r.source, r.content, vocabJson, r.image_url || '', sentencesJson]
      );
    } else if (!existing.is_deleted) {
      db.runSync(
        `UPDATE readings SET category = ?, level = ?, content = ?, image_url = ?, sentences = ?, vocabulary_highlights = ? WHERE title = ?`,
        [r.category, r.level, r.content, r.image_url || '', sentencesJson, vocabJson, r.title]
      );
    }
  }

  // Populate/Sync essential phrases and question patterns
  try {
    const phraseMigrationCheck = db.getFirstSync<{ value: string }>(
      "SELECT value FROM user_settings WHERE key = 'phrases_seeded_v1'"
    );
    if (!phraseMigrationCheck || phraseMigrationCheck.value !== 'done') {
      const insertPhraseStmt = db.prepareSync(`
        INSERT OR IGNORE INTO words (
          english, turkish, level, category, part_of_speech, pronunciation,
          example_en, example_tr, collocations, frequency_rank, image_url,
          box_level, interval_days, repetition_count, ease_factor, next_review_date, is_mastered
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 0, 2.5, ?, 0)
      `);

      db.withTransactionSync(() => {
        for (const p of ESSENTIAL_PHRASES) {
          insertPhraseStmt.executeSync([
            p.english.trim(),
            p.turkish,
            p.level,
            p.category,
            p.part_of_speech,
            '',
            p.example_en,
            p.example_tr,
            p.collocations || '',
            500,
            '',
            today
          ]);
        }
      });
      db.runSync(
        "INSERT OR REPLACE INTO user_settings (key, value) VALUES ('phrases_seeded_v1', 'done')"
      );
      console.log('Essential phrases and question patterns seeded successfully.');
    }
  } catch (e) {
    console.log('Phrase seeding note:', e);
  }
};

// --- Word Queries ---

export const queryFilteredWords = (
  level: CEFRLevel | 'all' = 'all',
  isMastered: boolean = false,
  searchTerm: string = '',
  limit: number = 40,
  offset: number = 0,
  typeFilter: 'all' | 'words' | 'phrases' = 'all'
): { words: Word[]; totalCount: number } => {
  const db = getDB();
  const conditions: string[] = [];
  const params: any[] = [];

  // Mastered filter
  conditions.push('is_mastered = ?');
  params.push(isMastered ? 1 : 0);

  // Type filter (all vs words vs phrases/questions)
  if (typeFilter === 'phrases') {
    conditions.push("(part_of_speech = 'phrase' OR part_of_speech = 'question')");
  } else if (typeFilter === 'words') {
    conditions.push("(part_of_speech IS NULL OR (part_of_speech != 'phrase' AND part_of_speech != 'question'))");
  }

  // Level filter
  if (level !== 'all') {
    conditions.push('level = ?');
    params.push(level);
  }

  // Search filter
  if (searchTerm.trim()) {
    conditions.push('(english LIKE ? OR turkish LIKE ?)');
    const term = `%${searchTerm.trim().toLowerCase()}%`;
    params.push(term, term);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count matching this filter
  const countRow = db.getFirstSync<{ c: number }>(
    `SELECT COUNT(*) as c FROM words ${whereClause}`,
    params
  );
  const totalCount = countRow?.c || 0;

  // Get paginated items
  const queryParams = [...params, limit, offset];
  const rows = db.getAllSync<any>(
    `SELECT * FROM words ${whereClause} ORDER BY english ASC LIMIT ? OFFSET ?`,
    queryParams
  );

  const words = rows.map(r => ({
    ...r,
    is_mastered: Boolean(r.is_mastered)
  }));

  return { words, totalCount };
};

export const getCountsByLevel = (
  isMastered?: boolean,
  typeFilter: 'all' | 'words' | 'phrases' = 'all'
): Record<string, number> => {
  const db = getDB();
  const conditions: string[] = [];
  const params: any[] = [];

  if (isMastered !== undefined) {
    conditions.push('is_mastered = ?');
    params.push(isMastered ? 1 : 0);
  }

  if (typeFilter === 'phrases') {
    conditions.push("(part_of_speech = 'phrase' OR part_of_speech = 'question')");
  } else if (typeFilter === 'words') {
    conditions.push("(part_of_speech IS NULL OR (part_of_speech != 'phrase' AND part_of_speech != 'question'))");
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const query = `SELECT level, COUNT(*) as c FROM words ${whereClause} GROUP BY level`;
  const rows = db.getAllSync<{ level: string; c: number }>(query, params);
  const counts: Record<string, number> = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
  for (const r of rows) {
    counts[r.level] = r.c;
  }
  return counts;
};

export const getAllWords = (includeMastered = true): Word[] => {
  const db = getDB();
  const query = includeMastered 
    ? 'SELECT * FROM words ORDER BY level, english'
    : 'SELECT * FROM words WHERE is_mastered = 0 ORDER BY level, english';
  const rows = db.getAllSync<any>(query);
  return rows.map(r => ({
    ...r,
    is_mastered: Boolean(r.is_mastered)
  }));
};

export const getLevelCountsByStatus = (isMastered: boolean): Record<string, number> => {
  const db = getDB();
  const rows = db.getAllSync<{ level: string; c: number }>(
    'SELECT level, COUNT(*) as c FROM words WHERE is_mastered = ? GROUP BY level',
    [isMastered ? 1 : 0]
  );
  const map: Record<string, number> = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
  for (const r of rows) map[r.level] = r.c;
  return map;
};

export const getWordsByLevel = (level: CEFRLevel): Word[] => {
  const db = getDB();
  const today = new Date().toISOString().split('T')[0];
  // Prioritize words that have not been studied today yet, then random
  const rows = db.getAllSync<any>(
    `SELECT * FROM words 
     WHERE level = ? AND is_mastered = 0 
     ORDER BY CASE WHEN id IN (SELECT DISTINCT word_id FROM study_logs WHERE timestamp >= ?) THEN 1 ELSE 0 END ASC,
              RANDOM()`,
    [level, today]
  );
  return rows.map(r => ({
    ...r,
    is_mastered: Boolean(r.is_mastered)
  }));
};

export const getPhrasesAndQuestions = (
  category?: string,
  level?: CEFRLevel | 'all',
  limit?: number
): Word[] => {
  const db = getDB();
  const conditions: string[] = ["(part_of_speech = 'phrase' OR part_of_speech = 'question')"];
  const params: any[] = [];

  if (category && category !== 'all') {
    if (category === 'question') {
      conditions.push("part_of_speech = 'question'");
    } else if (category === 'phrase') {
      conditions.push("part_of_speech = 'phrase'");
    } else {
      conditions.push("category = ?");
      params.push(category);
    }
  }

  if (level && level !== 'all') {
    conditions.push('level = ?');
    params.push(level);
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;
  const limitClause = limit && limit > 0 ? `LIMIT ${limit}` : '';
  const rows = db.getAllSync<any>(
    `SELECT * FROM words ${whereClause} ORDER BY level ASC, id ASC ${limitClause}`,
    params
  );
  return rows.map(r => ({
    ...r,
    is_mastered: Boolean(r.is_mastered)
  }));
};

export const getDueReviewWords = (limit = 50): Word[] => {
  const db = getDB();
  const today = new Date().toISOString().split('T')[0];
  // Only words that were previously studied at least once (repetition_count > 0 or in study_logs)
  const rows = db.getAllSync<any>(
    `SELECT * FROM words 
     WHERE (repetition_count > 0 OR id IN (SELECT DISTINCT word_id FROM study_logs))
       AND is_mastered = 0 
       AND next_review_date <= ? 
     ORDER BY next_review_date ASC, box_level ASC 
     LIMIT ?`,
    [today, limit]
  );
  return rows.map(r => ({
    ...r,
    is_mastered: Boolean(r.is_mastered)
  }));
};

export const getPreviouslyStudiedWords = (limit = 50): Word[] => {
  const db = getDB();
  // All non-mastered words that the user has studied before
  const rows = db.getAllSync<any>(
    `SELECT * FROM words 
     WHERE (repetition_count > 0 OR id IN (SELECT DISTINCT word_id FROM study_logs))
       AND is_mastered = 0
     ORDER BY next_review_date ASC, box_level ASC
     LIMIT ?`,
    [limit]
  );
  return rows.map(r => ({
    ...r,
    is_mastered: Boolean(r.is_mastered)
  }));
};

export const getWeakWords = (limit = 10): Word[] => {
  const db = getDB();
  const rows = db.getAllSync<any>(`
    SELECT w.*, COUNT(sl.id) as fail_count
    FROM words w
    LEFT JOIN study_logs sl ON w.id = sl.word_id AND sl.is_correct = 0
    WHERE w.is_mastered = 0
    GROUP BY w.id
    ORDER BY fail_count DESC, w.box_level ASC
    LIMIT ?
  `, [limit]);

  return rows.map(r => ({
    ...r,
    is_mastered: Boolean(r.is_mastered)
  }));
};

// Common irregular verbs, nouns and forms mapping to root lemma
const IRREGULAR_LEMMAS: Record<string, string> = {
  went: 'go', gone: 'go', going: 'go', goes: 'go',
  was: 'be', were: 'be', been: 'be', being: 'be', am: 'be', is: 'be', are: 'be',
  had: 'have', has: 'have', having: 'have',
  did: 'do', done: 'do', doing: 'do', does: 'do',
  said: 'say', saying: 'say', says: 'say',
  made: 'make', making: 'make', makes: 'make',
  took: 'take', taken: 'take', taking: 'take', takes: 'take',
  saw: 'see', seen: 'see', seeing: 'see', sees: 'see',
  came: 'come', coming: 'come', comes: 'come',
  thought: 'think', thinking: 'think', thinks: 'think',
  knew: 'know', known: 'know', knowing: 'know', knows: 'know',
  got: 'get', gotten: 'get', getting: 'get', gets: 'get',
  gave: 'give', given: 'give', giving: 'give', gives: 'give',
  found: 'find', finding: 'find', finds: 'find',
  told: 'tell', telling: 'tell', tells: 'tell',
  became: 'become', becoming: 'become', becomes: 'become',
  felt: 'feel', feeling: 'feel', feels: 'feel',
  brought: 'bring', bringing: 'bring', brings: 'bring',
  began: 'begin', begun: 'begin', beginning: 'begin', begins: 'begin',
  kept: 'keep', keeping: 'keep', keeps: 'keep',
  held: 'hold', holding: 'hold', holds: 'hold',
  wrote: 'write', written: 'write', writing: 'write', writes: 'write',
  stood: 'stand', standing: 'stand', stands: 'stand',
  heard: 'hear', hearing: 'hear', hears: 'hear',
  ran: 'run', running: 'run', runs: 'run',
  spoke: 'speak', spoken: 'speak', speaking: 'speak', speaks: 'speak',
  fell: 'fall', fallen: 'fall', falling: 'fall', falls: 'fall',
  sent: 'send', sending: 'send', sends: 'send',
  built: 'build', building: 'build', builds: 'build',
  understood: 'understand', understanding: 'understand',
  drew: 'draw', drawn: 'draw', drawing: 'draw', draws: 'draw',
  broke: 'break', broken: 'break', breaking: 'break', breaks: 'break',
  spent: 'spend', spending: 'spend', spends: 'spend',
  rose: 'rise', risen: 'rise', rising: 'rise', rises: 'rise',
  drove: 'drive', driven: 'drive', driving: 'drive', drives: 'drive',
  bought: 'buy', buying: 'buy', buys: 'buy',
  wore: 'wear', worn: 'wear', wearing: 'wear', wears: 'wear',
  chose: 'choose', chosen: 'choose', choosing: 'choose', chooses: 'choose',
  better: 'good', best: 'good',
  worse: 'bad', worst: 'bad',
  children: 'child', men: 'man', women: 'woman', people: 'person', feet: 'foot', teeth: 'tooth'
};

export const findWordByEnglish = (english: string): Word | null => {
  const db = getDB();
  const raw = english.trim().toLowerCase().replace(/^[^\w]+|[^\w]+$/g, '');
  if (!raw) return null;

  // 1. Direct exact lookup
  let row = db.getFirstSync<any>('SELECT * FROM words WHERE LOWER(english) = ?', [raw]);
  if (row) {
    return { ...row, is_mastered: Boolean(row.is_mastered) };
  }

  // 2. Check irregular lemma table
  if (IRREGULAR_LEMMAS[raw]) {
    const lemma = IRREGULAR_LEMMAS[raw];
    row = db.getFirstSync<any>('SELECT * FROM words WHERE LOWER(english) = ?', [lemma]);
    if (row) {
      return { ...row, is_mastered: Boolean(row.is_mastered) };
    }
  }

  // 3. Generate candidate stems for regular inflections (plurals, tenses, adverbs)
  const candidates: string[] = [];

  // Remove possessive: 's, s'
  if (raw.endsWith("'s") || raw.endsWith("’s")) {
    candidates.push(raw.slice(0, -2));
  }

  // Plurals and 3rd person -s, -es, -ies
  if (raw.endsWith('ies') && raw.length > 4) {
    candidates.push(raw.slice(0, -3) + 'y');
  } else if (raw.endsWith('es') && raw.length > 3) {
    candidates.push(raw.slice(0, -2));
    candidates.push(raw.slice(0, -1)); // e.g. closes -> close
  } else if (raw.endsWith('s') && !raw.endsWith('ss') && raw.length > 2) {
    candidates.push(raw.slice(0, -1));
  }

  // Past tense -ed, -ied
  if (raw.endsWith('ied') && raw.length > 4) {
    candidates.push(raw.slice(0, -3) + 'y');
  } else if (raw.endsWith('ed') && raw.length > 3) {
    candidates.push(raw.slice(0, -2)); // waited -> wait
    candidates.push(raw.slice(0, -1)); // agreed -> agree, liked -> like
    // Double consonant: stopped -> stop, planned -> plan
    if (raw.length > 4 && raw[raw.length - 3] === raw[raw.length - 4]) {
      candidates.push(raw.slice(0, -3));
    }
  }

  // Continuous -ing
  if (raw.endsWith('ing') && raw.length > 4) {
    candidates.push(raw.slice(0, -3)); // sing -> singing
    candidates.push(raw.slice(0, -3) + 'e'); // write -> writing, make -> making
    // Double consonant: running -> run, swimming -> swim
    if (raw.length > 5 && raw[raw.length - 4] === raw[raw.length - 5]) {
      candidates.push(raw.slice(0, -4));
    }
  }

  // Adverb -ly
  if (raw.endsWith('ly') && raw.length > 3) {
    candidates.push(raw.slice(0, -2)); // quickly -> quick
    if (raw.endsWith('ily') && raw.length > 4) {
      candidates.push(raw.slice(0, -3) + 'y'); // happily -> happy
    }
  }

  // Comparatives -er, -est
  if (raw.endsWith('est') && raw.length > 4) {
    candidates.push(raw.slice(0, -3));
    candidates.push(raw.slice(0, -2));
  } else if (raw.endsWith('er') && raw.length > 3) {
    candidates.push(raw.slice(0, -2));
    candidates.push(raw.slice(0, -1));
  }

  for (const cand of candidates) {
    row = db.getFirstSync<any>('SELECT * FROM words WHERE LOWER(english) = ?', [cand]);
    if (row) {
      return { ...row, is_mastered: Boolean(row.is_mastered) };
    }
  }

  return null;
};

export interface AddWordResult {
  success: boolean;
  word?: Word;
  existingWord?: Word;
  message?: string;
}

export const addCustomWord = (
  english: string,
  turkish: string,
  example_en = '',
  example_tr = '',
  level: CEFRLevel = 'B1',
  category = 'daily',
  image_url = ''
): AddWordResult => {
  const db = getDB();
  const cleanEn = english.trim().toLowerCase();

  // Check if word already exists in any level
  const existing = findWordByEnglish(cleanEn);
  if (existing) {
    return {
      success: false,
      existingWord: existing,
      message: `"${cleanEn}" kelimesi zaten [${existing.level}] seviyesinde (${existing.is_mastered ? 'Öğrenilenler' : 'Çalışılanlar'}) havuzunuzda bulunmaktadır. Tekrar eklenemez.`
    };
  }

  const today = new Date().toISOString().split('T')[0];
  const result = db.runSync(`
    INSERT INTO words (
      english, turkish, level, category, part_of_speech, example_en, example_tr, image_url,
      box_level, interval_days, repetition_count, ease_factor, next_review_date, is_mastered
    ) VALUES (?, ?, ?, ?, 'custom', ?, ?, ?, 1, 1, 0, 2.5, ?, 0)
  `, [cleanEn, turkish.trim(), level, category, example_en, example_tr, image_url, today]);

  const newWord: Word = {
    id: result.lastInsertRowId,
    english: cleanEn,
    turkish: turkish.trim(),
    level,
    category: category as any,
    part_of_speech: 'custom',
    example_en,
    example_tr,
    image_url,
    box_level: 1,
    interval_days: 1,
    repetition_count: 0,
    ease_factor: 2.5,
    next_review_date: today,
    is_mastered: false
  };

  return {
    success: true,
    word: newWord,
    message: `"${cleanEn}" başarıyla [${level}] seviyesine eklendi!`
  };
};

// --- SRS (Spaced Repetition) Algorithm Update ---
export const updateWordSRS = (
  wordId: number, 
  isCorrect: boolean, 
  exerciseType: StudyLog['exercise_type']
): void => {
  const db = getDB();
  const current = db.getFirstSync<any>('SELECT * FROM words WHERE id = ?', [wordId]);
  if (!current) return;

  let newBox = current.box_level;
  let newInterval = current.interval_days;
  let newRepCount = current.repetition_count + 1;
  let isMastered = current.is_mastered;

  if (isCorrect) {
    newBox = Math.min(newBox + 1, 5);
    const intervals = [1, 3, 7, 16, 35];
    newInterval = intervals[newBox - 1];
    if (newBox >= 5) {
      isMastered = 1;
    }
  } else {
    newBox = 1;
    newInterval = 1;
    isMastered = 0;
  }

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + newInterval);
  const nextDateStr = nextDate.toISOString().split('T')[0];

  db.runSync(`
    UPDATE words SET
      box_level = ?,
      interval_days = ?,
      repetition_count = ?,
      next_review_date = ?,
      is_mastered = ?
    WHERE id = ?
  `, [newBox, newInterval, newRepCount, nextDateStr, isMastered, wordId]);

  db.runSync(`
    INSERT INTO study_logs (word_id, exercise_type, is_correct)
    VALUES (?, ?, ?)
  `, [wordId, exerciseType, isCorrect ? 1 : 0]);
};

export const markWordDirectlyMastered = (wordId: number): void => {
  const db = getDB();
  const futureDate = '2099-12-31';
  db.runSync(`
    UPDATE words SET
      box_level = 5,
      interval_days = 90,
      next_review_date = ?,
      is_mastered = 1
    WHERE id = ?
  `, [futureDate, wordId]);

  db.runSync(`
    INSERT INTO study_logs (word_id, exercise_type, is_correct)
    VALUES (?, 'flashcard', 1)
  `, [wordId]);
};

export const toggleWordMastery = (wordId: number, isMastered: boolean): void => {
  const db = getDB();
  const today = new Date().toISOString().split('T')[0];
  const futureDate = '2099-12-31';

  db.runSync(`
    UPDATE words SET
      box_level = ?,
      next_review_date = ?,
      is_mastered = ?
    WHERE id = ?
  `, [isMastered ? 5 : 1, isMastered ? futureDate : today, isMastered ? 1 : 0, wordId]);
};

export const updateWordDetails = (
  id: number,
  fields: { english: string; turkish: string; example_en: string; example_tr: string; level: CEFRLevel }
): void => {
  const db = getDB();
  db.runSync(`
    UPDATE words SET
      english = ?,
      turkish = ?,
      example_en = ?,
      example_tr = ?,
      level = ?
    WHERE id = ?
  `, [fields.english.trim(), fields.turkish.trim(), fields.example_en.trim(), fields.example_tr.trim(), fields.level, id]);
};

export const deleteWord = (id: number): void => {
  const db = getDB();
  const item = db.getFirstSync<{ english: string }>('SELECT english FROM words WHERE id = ?', [id]);
  if (item?.english) {
    db.runSync(
      "INSERT OR REPLACE INTO user_settings (key, value) VALUES (?, 'deleted')",
      [`deleted_word_${item.english.toLowerCase().trim()}`]
    );
  }
  db.runSync('DELETE FROM words WHERE id = ?', [id]);
  db.runSync('DELETE FROM study_logs WHERE word_id = ?', [id]);
};

// --- Reading Materials ---

export const getReadingsByCategory = (category?: ReadingCategory): ReadingMaterial[] => {
  const db = getDB();
  const rows = category 
    ? db.getAllSync<any>('SELECT * FROM readings WHERE (is_deleted IS NULL OR is_deleted = 0) AND category = ? ORDER BY id DESC', [category])
    : db.getAllSync<any>('SELECT * FROM readings WHERE (is_deleted IS NULL OR is_deleted = 0) ORDER BY id DESC');

  return rows.map(r => ({
    ...r,
    vocabulary_highlights: r.vocabulary_highlights ? JSON.parse(r.vocabulary_highlights) : [],
    sentences: r.sentences ? JSON.parse(r.sentences) : []
  }));
};

export const deleteReading = (id: number): void => {
  const db = getDB();
  const reading = db.getFirstSync<{ title: string }>('SELECT title FROM readings WHERE id = ?', [id]);
  if (reading?.title) {
    db.runSync(
      "INSERT OR REPLACE INTO user_settings (key, value) VALUES (?, 'deleted')",
      [`deleted_reading_${reading.title}`]
    );
  }
  db.runSync('UPDATE readings SET is_deleted = 1 WHERE id = ?', [id]);
};

export const addCustomReading = (
  title: string,
  category: ReadingCategory,
  level: CEFRLevel,
  source: string,
  content: string
): ReadingMaterial => {
  const db = getDB();
  const result = db.runSync(`
    INSERT INTO readings (title, category, level, source, content, vocabulary_highlights)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [title, category, level, source, content, JSON.stringify([])]);

  return {
    id: result.lastInsertRowId,
    title,
    category,
    level,
    source,
    content,
    vocabulary_highlights: []
  };
};

// --- Stats & Streak ---

export const getAppStats = () => {
  const db = getDB();
  const totalWords = db.getFirstSync<{ c: number }>('SELECT COUNT(*) as c FROM words')?.c || 0;
  const masteredWords = db.getFirstSync<{ c: number }>('SELECT COUNT(*) as c FROM words WHERE is_mastered = 1')?.c || 0;
  const learningWords = totalWords - masteredWords;
  
  const totalReviews = db.getFirstSync<{ c: number }>('SELECT COUNT(*) as c FROM study_logs')?.c || 0;
  const correctReviews = db.getFirstSync<{ c: number }>('SELECT COUNT(*) as c FROM study_logs WHERE is_correct = 1')?.c || 0;
  
  const accuracy = totalReviews > 0 ? Math.round((correctReviews / totalReviews) * 100) : 100;

  return {
    totalWords,
    masteredWords,
    learningWords,
    totalReviews,
    accuracy
  };
};
