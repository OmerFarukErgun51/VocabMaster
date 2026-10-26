import { useEffect, useMemo, useState } from 'react';
import { paginate, computeCharsPerPage, ScreenMetrics } from '../domain/pagination';
import { ReaderContent } from '../domain/types';
import { getProgress, saveProgress } from '../data/progressRepository';

export interface PagedReader {
  pages: string[];
  page: number;
  total: number;
  goTo: (n: number) => void;
  finished: boolean;
  content: ReaderContent;
}

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

/**
 * İçeriği ekran boyutuna göre sayfalara böler (tek sefer, memoize),
 * kaldığı sayfadan başlatır ve her sayfa değişiminde ilerlemeyi kaydeder.
 */
export const usePagedReader = (content: ReaderContent, metrics: ScreenMetrics): PagedReader => {
  const charsPerPage = useMemo(
    () => computeCharsPerPage(metrics),
    [metrics.width, metrics.height, metrics.fontSize, metrics.lineHeight]
  );

  const pages = useMemo(
    () => paginate(content.content, charsPerPage),
    [content.content, charsPerPage]
  );
  const total = pages.length;

  const [page, setPage] = useState(0);

  // Kaldığı sayfadan devam; last_page total'dan büyükse son geçerli sayfaya sıkıştır.
  useEffect(() => {
    const saved = getProgress(content.id);
    setPage(clamp(saved.lastPage, 0, total - 1));
  }, [content.id, total]);

  const goTo = (n: number) => {
    const clamped = clamp(n, 0, total - 1);
    setPage(clamped);
    saveProgress({
      contentId: content.id,
      lastPage: clamped,
      totalPages: total,
      finished: clamped >= total - 1,
    });
  };

  return { pages, page, total, goTo, finished: page >= total - 1, content };
};
