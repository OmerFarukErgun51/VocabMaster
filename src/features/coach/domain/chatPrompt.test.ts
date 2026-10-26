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
