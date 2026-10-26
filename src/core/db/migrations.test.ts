import { READING_PROGRESS_DDL, TEST_RESULTS_DDL } from './migrations';

test('reading_progress DDL IF NOT EXISTS ve content_id PK içerir', () => {
  expect(READING_PROGRESS_DDL).toMatch(/CREATE TABLE IF NOT EXISTS reading_progress/);
  expect(READING_PROGRESS_DDL).toMatch(/content_id TEXT PRIMARY KEY/);
});

test('test_results DDL IF NOT EXISTS içerir', () => {
  expect(TEST_RESULTS_DDL).toMatch(/CREATE TABLE IF NOT EXISTS test_results/);
});
