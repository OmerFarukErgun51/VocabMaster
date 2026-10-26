export interface DialogueLine {
  en: string;
  tr: string;
}

/**
 * İçeriği parça parça diyalog satırlarına çevirir. Hazır cümle çiftleri varsa
 * onları kullanır; yoksa metni cümlelere böler (çeviri boş bırakılır).
 */
export const toDialogueLines = (input: {
  sentences?: { en: string; tr: string }[];
  content: string;
}): DialogueLine[] => {
  if (input.sentences && input.sentences.length > 0) {
    return input.sentences;
  }
  if (!input.content || input.content.trim() === '') {
    return [];
  }
  return input.content
    .split(/(?<=[.?!])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(en => ({ en, tr: '' }));
};
