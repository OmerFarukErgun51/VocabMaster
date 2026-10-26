export interface ChatTurn {
  role: 'user' | 'nova';
  text: string;
}

export interface NovaReply {
  reply: string;
  replyTr: string;
  correction?: string;
}

/** Nova sohbet istemini kurar; token şişmesini önlemek için yalnızca son `maxHistory` mesaj. */
export const buildNovaChatPrompt = (history: ChatTurn[], userMessage: string, maxHistory = 8): string => {
  const recent = history.slice(-maxHistory);
  const historyLines = recent
    .map(t => `${t.role === 'user' ? 'Student' : 'Nova'}: ${t.text}`)
    .join('\n');

  return `You are Nova, a friendly and encouraging English conversation tutor for a Turkish learner.
Continue the conversation naturally and keep replies short (1-3 sentences). Gently correct the student's English mistakes.

Conversation so far:
${historyLines}
Student: ${userMessage}

Respond ONLY as strict JSON (no markdown):
{
  "reply": "your natural English reply (1-3 sentences)",
  "replyTr": "Turkish translation of your reply",
  "correction": "if the student made an English mistake, a short friendly correction in Turkish; otherwise an empty string"
}`;
};

/** Gemini yanıtını ayrıştırır; geçerli JSON değilse ham metni reply olarak kabul eder. */
export const parseNovaReply = (raw: string): NovaReply => {
  const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
  try {
    const obj = JSON.parse(cleaned);
    if (obj && typeof obj.reply === 'string') {
      return {
        reply: obj.reply,
        replyTr: typeof obj.replyTr === 'string' ? obj.replyTr : '',
        ...(obj.correction ? { correction: String(obj.correction) } : {}),
      };
    }
  } catch {
    // JSON değil — düz metin olarak değerlendir
  }
  return { reply: raw.trim(), replyTr: '' };
};
