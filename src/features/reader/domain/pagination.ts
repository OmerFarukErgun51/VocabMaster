/**
 * Saf sayfalama mantığı — RN/expo'ya bağımlı değildir, birim testlerle kanıtlanır.
 * Kelimeleri bölmeden ve mümkün olduğunca paragraf sınırlarını koruyarak
 * metni "sayfa" dizisine böler.
 */

export interface ScreenMetrics {
  width: number;
  height: number;
  fontSize: number;
  lineHeight: number;
}

/** Ekran boyutuna göre bir sayfaya yaklaşık kaç karakter sığacağını tahmin eder. */
export const computeCharsPerPage = ({ width, height, fontSize, lineHeight }: ScreenMetrics): number => {
  const avgCharWidth = Math.max(1, fontSize * 0.5); // ortalama karakter genişliği yaklaşımı
  const columns = Math.floor(width / avgCharWidth);
  const rows = Math.floor(height / Math.max(1, lineHeight));
  // Kenar boşlukları için ~%85 doluluk payı bırak.
  return Math.max(1, Math.floor(columns * rows * 0.85));
};

/** Metni sayfalara böler. Her zaman en az bir sayfa döndürür (boş metin → ['']). */
export const paginate = (text: string, charsPerPage: number): string[] => {
  if (!text || text.trim() === '') return [''];

  const limit = Math.max(1, charsPerPage);
  const paragraphs = text.split(/\n{2,}/);
  const pages: string[] = [];
  let current = '';

  const flush = () => {
    if (current !== '') {
      pages.push(current);
      current = '';
    }
  };

  for (const para of paragraphs) {
    if (para.length > limit) {
      // Tek başına bir sayfaya sığmayan paragrafı kelime kelime böl.
      flush();
      let line = '';
      for (const word of para.split(/\s+/)) {
        const candidate = line === '' ? word : `${line} ${word}`;
        if (candidate.length > limit && line !== '') {
          pages.push(line);
          line = word;
        } else {
          line = candidate;
        }
      }
      current = line; // kalan, sonraki paragrafla birlikte paketlenebilir
    } else {
      const candidate = current === '' ? para : `${current}\n\n${para}`;
      if (candidate.length > limit && current !== '') {
        pages.push(current);
        current = para;
      } else {
        current = candidate;
      }
    }
  }

  flush();
  return pages.length ? pages : [''];
};
