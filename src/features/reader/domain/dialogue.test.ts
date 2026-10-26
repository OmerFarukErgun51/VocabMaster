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
