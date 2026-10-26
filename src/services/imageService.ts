/**
 * Image Service for VocabMaster
 * Provides high-quality, relevant, and unique photography for every English word.
 */

// Curated high-resolution Unsplash images for common concepts
const CURATED_IMAGES: Record<string, string> = {
  apple: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600',
  airport: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=600',
  book: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600',
  car: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600',
  cat: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600',
  dog: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600',
  city: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=600',
  coffee: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600',
  computer: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600',
  friend: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600',
  house: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600',
  money: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600',
  music: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600',
  nature: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600',
  ocean: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600',
  school: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600',
  star: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=600',
  sun: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600',
  water: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=600',
  world: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600',
  journey: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600',
  doctor: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600',
  flower: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600',
  family: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600',
  food: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600',
  sleep: 'https://images.unsplash.com/photo-1520206183501-b80df61043c2?w=600',
  run: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=600',
  write: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600',
  read: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600',
  smile: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600',
};

/**
 * Returns a high quality, relevant image URL for any English word.
 */
export const getWordImageUrl = (
  englishWord: string,
  existingUrl?: string | null,
  category?: string
): string => {
  if (existingUrl && existingUrl.trim().length > 10 && !existingUrl.includes('photo-1457369804613-52c61a468e7d')) {
    return existingUrl;
  }

  const clean = englishWord.toLowerCase().trim();

  // Check curated mapping
  if (CURATED_IMAGES[clean]) {
    return CURATED_IMAGES[clean];
  }

  // Generate a direct photographic image URL matching the English word
  const prompt = encodeURIComponent(`${clean} clear realistic photograph high quality`);
  return `https://image.pollinations.ai/prompt/${prompt}?width=500&height=360&nologo=true`;
};
