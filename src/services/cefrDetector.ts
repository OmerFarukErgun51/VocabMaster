import { CEFRLevel } from '../types';
import { callGemini, getGeminiApiKey } from './gemini';

// Common CEFR word indicators & heuristics
const A1_A2_COMMON = new Set([
  'go', 'come', 'see', 'look', 'take', 'make', 'give', 'get', 'know', 'think',
  'time', 'year', 'day', 'world', 'school', 'house', 'family', 'food', 'water',
  'good', 'new', 'first', 'last', 'long', 'great', 'little', 'own', 'other',
  'happy', 'easy', 'fast', 'slow', 'big', 'small', 'friend', 'city', 'country',
  'travel', 'hotel', 'airport', 'ticket', 'station', 'bus', 'car', 'plane',
  'work', 'office', 'money', 'buy', 'sell', 'price', 'cost', 'pay', 'job'
]);

const B1_B2_COMMON = new Set([
  'achieve', 'accomplish', 'adapt', 'adequate', 'advantage', 'affect', 'afford',
  'analyze', 'apparent', 'approach', 'appropriate', 'aspect', 'assess', 'assume',
  'attitude', 'authority', 'available', 'benefit', 'brief', 'capable', 'challenge',
  'circumstance', 'collapse', 'commit', 'community', 'complex', 'concentrate',
  'conclude', 'conduct', 'consequence', 'considerable', 'consist', 'constant',
  'consume', 'contact', 'contemporary', 'context', 'contrast', 'contribute',
  'convenient', 'convince', 'crucial', 'culture', 'decade', 'decline', 'demonstrate',
  'departure', 'destination', 'environment', 'sustainable', 'negotiate', 'efficient'
]);

const C1_C2_COMMON = new Set([
  'aberration', 'acumen', 'anomaly', 'antithesis', 'apathy', 'arcane', 'belligerent',
  'catalyst', 'cogent', 'collusion', 'conundrum', 'copious', 'dearth', 'debilitate',
  'deference', 'demagogue', 'derivative', 'didactic', 'disparate', 'eclectic',
  'egregious', 'eloquent', 'ephemeral', 'equanimity', 'equivocal', 'esoteric',
  'euphemism', 'exacerbate', 'exemplary', 'expedient', 'fallacious', 'fastidious',
  'frenetic', 'garrulous', 'gregarious', 'hackneyed', 'hapless', 'iconoclast',
  'immutable', 'impervious', 'inchoate', 'indefatigable', 'ineffable', 'ingenuous',
  'insidious', 'intransigent', 'inundate', 'invective', 'juxtaposition', 'laconic',
  'magnanimous', 'malevolent', 'maverick', 'mellifluous', 'mendacious', 'mercurial',
  'meticulous', 'mitigate', 'nefarious', 'obfuscate', 'oblivious', 'obsequious',
  'obstinate', 'panacea', 'paradigm', 'pariah', 'paucity', 'pejorative', 'perfunctory',
  'pernicious', 'perspicacity', 'plethora', 'polemic', 'precocious', 'proclivity',
  'profligate', 'propensity', 'puerile', 'pugnacious', 'quagmire', 'quandary',
  'querulous', 'rancor', 'recalcitrant', 'redolent', 'replete', 'rescind',
  'resplendent', 'sagacious', 'salient', 'sanctimonious', 'scintillating',
  'serendipity', 'specious', 'spurious', 'staid', 'stolid', 'strident',
  'subjugate', 'sublime', 'superfluous', 'surreptitious', 'sycophant', 'tacit',
  'taciturn', 'tantamount', 'temerity', 'tenuous', 'torpor', 'tractable',
  'transient', 'trenchant', 'ubiquitous', 'umbrage', 'unctuous', 'vacillate',
  'venerable', 'veracity', 'vicarious', 'vilify', 'visceral', 'vitriolic',
  'vociferous', 'voracious', 'waive', 'wanton', 'winsome', 'zealous'
]);

export interface DetectedWordInfo {
  level: CEFRLevel;
  turkish: string;
  partOfSpeech: string;
  example_en: string;
  example_tr: string;
  category: 'daily' | 'business' | 'travel' | 'technology' | 'idioms' | 'academic';
}

export const autoDetectWordInfo = async (englishWord: string): Promise<DetectedWordInfo> => {
  const clean = englishWord.trim().toLowerCase();

  // Try AI detection first if API key is present
  const apiKey = await getGeminiApiKey();
  if (apiKey) {
    const prompt = `
Analyze the English word or phrase "${clean}".
1. Accurately assign its CEFR level strictly from: A1, A2, B1, B2, C1, or C2.
2. Provide the best Turkish translation.
3. Identify its part of speech (noun, verb, adjective, phrasal verb, etc.).
4. Provide a natural example sentence in English.
5. Provide the Turkish translation of that example sentence.
6. Categorize it strictly as one of: daily, business, travel, technology, idioms, academic.

Respond strictly in valid JSON format:
{
  "level": "B2",
  "turkish": "çeviri",
  "partOfSpeech": "adjective",
  "example_en": "Example sentence in English.",
  "example_tr": "Örnek cümlenin Türkçe çevirisi.",
  "category": "business"
}
`;
    try {
      const raw = await callGemini(prompt);
      const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(parsed.level)) {
        return parsed;
      }
    } catch {
      // Fallback to heuristic
    }
  }

  // Heuristic rule-based detection
  let level: CEFRLevel = 'B1';
  let category: DetectedWordInfo['category'] = 'daily';

  if (A1_A2_COMMON.has(clean)) {
    level = clean.length <= 4 ? 'A1' : 'A2';
  } else if (B1_B2_COMMON.has(clean)) {
    level = 'B2';
    category = 'business';
  } else if (C1_C2_COMMON.has(clean)) {
    level = 'C1';
    category = 'academic';
  } else {
    // Length & morphology heuristic
    if (clean.length <= 4) {
      level = 'A1';
    } else if (clean.length <= 6) {
      level = 'A2';
    } else if (clean.length <= 8) {
      level = 'B1';
    } else if (clean.length <= 11) {
      level = 'B2';
    } else {
      level = 'C1';
      category = 'academic';
    }

    if (clean.includes(' ') || clean.includes('-')) {
      category = 'idioms';
      level = 'B2';
    }
  }

  return {
    level,
    turkish: 'anlam giriniz...',
    partOfSpeech: 'kelime',
    example_en: `He learned how to use "${clean}" in daily conversation.`,
    example_tr: `Günlük konuşmada "${clean}" kelimesini nasıl kullanacağını öğrendi.`,
    category,
  };
};
