import { getDB } from '../../../services/database';

/** Kullanıcının bir içerikteki okuma ilerlemesi. Yalnızca bu veri DB'de tutulur. */
export interface ReadingProgress {
  contentId: string;
  lastPage: number;
  totalPages: number;
  finished: boolean;
}

interface ProgressRow {
  content_id: string;
  last_page: number;
  total_pages: number;
  finished: number;
}

/** İlerleme kaydı yoksa makul bir varsayılan döndürür (asla null). */
export const getProgress = (contentId: string): ReadingProgress => {
  const row = getDB().getFirstSync<ProgressRow>(
    'SELECT content_id, last_page, total_pages, finished FROM reading_progress WHERE content_id = ?',
    [contentId]
  );
  if (!row) {
    return { contentId, lastPage: 0, totalPages: 0, finished: false };
  }
  return {
    contentId: row.content_id,
    lastPage: row.last_page,
    totalPages: row.total_pages,
    finished: row.finished === 1,
  };
};

export const saveProgress = (p: ReadingProgress): void => {
  getDB().runSync(
    `INSERT OR REPLACE INTO reading_progress
       (content_id, type, last_page, total_pages, finished, updated_at)
     VALUES (?, 'book', ?, ?, ?, CURRENT_TIMESTAMP)`,
    [p.contentId, p.lastPage, p.totalPages, p.finished ? 1 : 0]
  );
};
