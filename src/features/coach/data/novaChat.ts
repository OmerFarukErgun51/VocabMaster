import { callGemini } from '../../../services/gemini';
import { buildNovaChatPrompt, parseNovaReply, ChatTurn, NovaReply } from '../domain/chatPrompt';

/**
 * Nova ile gerçek sohbet. Gemini'ye son konuşma geçmişini gönderir, yanıtı ayrıştırır.
 * API anahtarı yoksa veya ağ hatasında nazik bir fallback döner (çökmez).
 */
export const chatWithNova = async (history: ChatTurn[], userMessage: string): Promise<NovaReply> => {
  try {
    const prompt = buildNovaChatPrompt(history, userMessage);
    const raw = await callGemini(prompt, true);
    return parseNovaReply(raw);
  } catch {
    return {
      reply: "I'm having trouble connecting right now. Please check your Gemini API key in Settings and try again.",
      replyTr: 'Şu an bağlanamıyorum. Lütfen Ayarlar bölümünden Gemini API anahtarını kontrol edip tekrar dene.',
    };
  }
};

export type { ChatTurn, NovaReply };
