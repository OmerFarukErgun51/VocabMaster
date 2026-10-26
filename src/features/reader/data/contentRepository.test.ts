import { getAllContent, getContentById } from './contentRepository';

test('gömülü okumaları kararlı id ile döndürür', () => {
  const all = getAllContent();
  expect(all.length).toBeGreaterThan(0);
  expect(all[0].id).toMatch(/^reading-\d+$/);
  expect(typeof all[0].content).toBe('string');
  expect(Array.isArray(all[0].highlights)).toBe(true);
});

test('getContentById doğru içeriği döndürür, bilinmeyen id için undefined', () => {
  const first = getAllContent()[0];
  expect(getContentById(first.id)?.title).toBe(first.title);
  expect(getContentById('yok-boyle-id')).toBeUndefined();
});
