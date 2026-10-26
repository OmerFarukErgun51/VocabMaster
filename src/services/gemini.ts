import AsyncStorage from '@react-native-async-storage/async-storage';
import { Word } from '../types';

const GEMINI_API_KEY_STORAGE_KEY = '@vocabmaster_gemini_api_key';

// Güncel, ücretsiz katmanda çalışan model. Eski "gemini-1.5-flash" artık 404 veriyor.
const GEMINI_MODEL = 'gemini-2.0-flash';

export const saveGeminiApiKey = async (key: string) => {
  await AsyncStorage.setItem(GEMINI_API_KEY_STORAGE_KEY, key.trim());
};

export const getGeminiApiKey = async (): Promise<string | null> => {
  return await AsyncStorage.getItem(GEMINI_API_KEY_STORAGE_KEY);
};

export interface SentenceEvaluation {
  score: number; // 0-100
  isCorrect: boolean;
  feedback: string;
  improvedSentence: string;
  explanation: string;
}

export const callGemini = async (prompt: string, jsonMode = false): Promise<string> => {
  const apiKey = await getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Lütfen Ayarlar sekmesinden Google Gemini API anahtarınızı giriniz.');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const generationConfig: Record<string, unknown> = {
    temperature: 0.7,
    maxOutputTokens: 1000,
  };
  // JSON beklediğimiz çağrılarda modeli katı JSON dönmeye zorla; parse hatalarını azaltır.
  if (jsonMode) {
    generationConfig.responseMimeType = 'application/json';
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig,
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `API Hatası: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini boş yanıt döndürdü.');
  }
  return text;
};

// JSON bekleyen çağrılar için güvenli parse yardımcısı (olası ```json çitlerini de temizler).
const parseGeminiJson = <T>(raw: string): T => {
  const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned) as T;
};

// 1. Zayıf kelimelerden pratik mini hikaye üretimi
export const generateStoryFromWords = async (targetWords: Word[]): Promise<{ title: string; story: string; turkishTranslation: string }> => {
  const wordList = targetWords.map(w => `${w.english} (${w.turkish})`).join(', ');
  const prompt = `
You are an expert English teacher.
Create a short, engaging, natural story (approx 100-150 words) suitable for intermediate English learners that naturally includes these target words:
${wordList}

Respond strictly in valid JSON format with keys:
{
  "title": "Title in English",
  "story": "The English story text with paragraphs",
  "turkishTranslation": "Akıcı Türkçe çevirisi"
}
Do not include markdown backticks around JSON if possible, just raw JSON.
`;

  try {
    const raw = await callGemini(prompt, true);
    return parseGeminiJson(raw);
  } catch (err: any) {
    // Offline / fallback demo story if API key is not yet set
    return {
      title: "The Unexpected Breakthrough",
      story: `Sarah was facing an inevitable challenge in her research. Instead of calling off the experiment, she decided to negotiate with her team for more time. Through meticulous observation, they accomplished a major breakthrough that provided a sustainable solution.`,
      turkishTranslation: `Sarah araştırmasında kaçınılmaz bir zorlukla karşı karşıyaydı. Deneyi iptal etmek yerine, ekibiyle daha fazla zaman için müzakere etmeye karar verdi. Titiz bir gözlem sayesinde, sürdürülebilir bir çözüm sağlayan büyük bir buluş gerçekleştirdiler.`
    };
  }
};

// 2. Kullanıcının yazdığı cümleyi değerlendirme
export const evaluateUserSentence = async (targetWord: string, userSentence: string): Promise<SentenceEvaluation> => {
  const prompt = `
Evaluate this English sentence written by a language learner using the target word "${targetWord}".
User Sentence: "${userSentence}"

Analyze:
1. Is the target word used with correct grammar, part of speech, and natural collocation?
2. Are there any spelling or grammatical errors?
3. Provide a score from 0 to 100.
4. Provide constructive feedback in Turkish.
5. Provide a polished, native-like improved sentence.

Respond strictly in valid JSON format:
{
  "score": 85,
  "isCorrect": true,
  "feedback": "Türkçe geri bildirim ve analiz",
  "improvedSentence": "Daha doğal ve hatasız İngilizce alternatif",
  "explanation": "Türkçe gramer açıklaması"
}
`;

  try {
    const raw = await callGemini(prompt, true);
    return parseGeminiJson(raw);
  } catch (err) {
    return {
      score: 90,
      isCorrect: true,
      feedback: "Cümleniz anlaşılır ve kelime doğru bağlamda kullanılmış! (Çevrimdışı önizleme modu)",
      improvedSentence: userSentence,
      explanation: "Hedef kelime cümlenizde başarıyla yer alıyor."
    };
  }
};

// 3. Tıklanan kelime için anlık Türkçe anlam ve örnek
export const lookupWordDetails = async (word: string, contextSentence?: string): Promise<{ turkish: string; partOfSpeech: string; example: string }> => {
  const prompt = `
Give the Turkish translation, part of speech, and a short example sentence for the English word "${word}".
${contextSentence ? `Context where it appeared: "${contextSentence}"` : ''}

Respond strictly in valid JSON format:
{
  "turkish": "en uygun Türkçe karşılık",
  "partOfSpeech": "noun/verb/adj vb.",
  "example": "Kısa ve net bir İngilizce örnek cümle"
}
`;

  try {
    const raw = await callGemini(prompt, true);
    return parseGeminiJson(raw);
  } catch (err) {
    return {
      turkish: "anlam aranıyor...",
      partOfSpeech: "kelime",
      example: `He used the word "${word}" in a sentence.`
    };
  }
};

// 4. Metni basitleştirme (Simplify text to A2/B1)
export const simplifyTextWithAI = async (text: string, targetLevel = 'B1'): Promise<string> => {
  const prompt = `
Rewrite the following English text to make it easy to understand for a ${targetLevel} level English student.
Preserve the core meaning, but use simpler vocabulary, shorter sentences, and clear structures.

Original Text:
"${text}"

Return only the simplified English text.
`;

  try {
    return await callGemini(prompt);
  } catch (err: any) {
    throw new Error(err.message || 'Metin basitleştirilemedi.');
  }
};
