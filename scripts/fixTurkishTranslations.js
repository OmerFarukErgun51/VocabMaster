const fs = require('fs');
const path = require('path');

const sozluk1 = require('./turkceSozluk.js');
const sozluk2 = require('./phrasalAndIdioms.js');
const sozluk3 = require('./problematicWords.js');

const masterDict = { ...sozluk1, ...sozluk2, ...sozluk3 };

const massivePath = path.join(__dirname, '../src/data/massiveWords.json');
let words = JSON.parse(fs.readFileSync(massivePath, 'utf8'));

console.log('Original word count:', words.length);

// 1. Remove invalid entries (yanliş, doğru)
words = words.filter(w => {
  const eng = w.english.trim().toLowerCase();
  return eng !== 'yanliş' && eng !== 'doğru';
});

let updatedCount = 0;
let cleanImperativesCount = 0;

// Common single imperative endings to infinitives mapping
const imperativeMap = {
  'ekle': 'eklemek',
  'kabul et': 'kabul etmek',
  'sor': 'sormak',
  'seç': 'seçmek',
  'gel': 'gelmek',
  'git': 'gitmek',
  'dur': 'durmak',
  'bekle': 'beklemek',
  'bak': 'bakmak',
  'tut': 'tutmak',
  'al': 'almak',
  'ver': 'vermek',
  'aç': 'açmak',
  'kapa': 'kapatmak',
  'yık': 'yıkmak',
  'koş': 'koşmak',
  'otur': 'oturmak',
  'kalk': 'kalkmak',
  'başla': 'başlamak',
  'bitir': 'bitirmek',
  'öğren': 'öğrenmek',
  'öğret': 'öğretmek',
  'anla': 'anlamak',
  'düşün': 'düşünmek',
  'iste': 'istemek',
  'dene': 'denemek',
  'hisset': 'hissetmek',
  'gör': 'görmek',
  'bil': 'bilmek',
  'söyle': 'söylemek',
  'bul': 'bulmak',
  'kullan': 'kullanmak',
  'yardım et': 'yardım etmek',
  'anlat': 'anlatmak',
  'açıkla': 'açıklamak',
  'değiştir': 'değiştirmek',
  'hatırla': 'hatırlamak',
  'unut': 'unutmak',
  'dinle': 'dinlemek',
  'izle': 'izlemek',
  'kaydet': 'kaydetmek',
  'karar ver': 'karar vermek',
  'çalış': 'çalışmak',
  'nefes al': 'nefes almak',
  'nefes ver': 'nefes vermek',
  'geri getir': 'geri getirmek',
  'geri al': 'geri almak',
  'geri ver': 'geri vermek',
  'sakin ol': 'sakinleşmek',
  'teslim et': 'teslim etmek',
  'devam et': 'devam etmek',
  'aşağı in': 'aşağı inmek',
  'yukarı git': 'yukarı çıkmak',
  'ile git': 'birlikte gitmek',
  'ayağa kalk': 'ayağa kalkmak',
  'geri çekil': 'geri çekilmek',
  'uzak dur': 'uzak durmak',
  'dikkat et': 'dikkat etmek',
  'geri dön': 'geri dönmek',
  'kapat': 'kapatmak'
};

const preservedAcronyms = new Set(['CD', 'DVD', 'ABD', 'Euro', 'İnternet', 'PC', 'TV']);

for (let w of words) {
  const originalTr = w.turkish;
  const engKey = w.english.trim().toLowerCase();

  // If we have an exact curated definition
  if (masterDict[engKey]) {
    w.turkish = masterDict[engKey];
    updatedCount++;
    continue;
  }

  // Check if english without numbers is in masterDict
  const cleanEng = engKey.replace(/\s*\d+$/, '').trim();
  if (masterDict[cleanEng] && engKey !== cleanEng) {
    w.turkish = masterDict[cleanEng];
    updatedCount++;
    continue;
  }

  // Check imperative
  let currentTr = w.turkish.trim();
  const lowerTr = currentTr.toLowerCase();
  if (imperativeMap[lowerTr]) {
    w.turkish = imperativeMap[lowerTr];
    cleanImperativesCount++;
    continue;
  }

  // Check if starts with uppercase and not an acronym
  if (!preservedAcronyms.has(currentTr) && currentTr.length > 0) {
    // Only lowercase the very first letter if not a proper noun / acronym
    if (currentTr === currentTr.toUpperCase() && currentTr.length > 3) {
      currentTr = currentTr.toLowerCase();
    } else if (/^[A-ZÇĞİÖŞÜ][a-zçğıöşü]/.test(currentTr)) {
      currentTr = currentTr.charAt(0).toLowerCase() + currentTr.slice(1);
    }
  }

  // Clean trailing spaces and double spaces around commas
  currentTr = currentTr.replace(/\s*,\s*/g, ', ').trim();
  if (currentTr !== originalTr) {
    w.turkish = currentTr;
  }
}

// Clean Oxford numbers from English display key where applicable
for (let w of words) {
  if (w.english === 'can 1') { w.english = 'can (fiil)'; w.turkish = 'yapabilmek, edebilmek'; }
  else if (w.english === 'can 2') { w.english = 'can (kutu)'; w.turkish = 'teneke kutu, konserve'; }
  else if (w.english === 'close 1') { w.english = 'close (kapatmak)'; w.turkish = 'kapatmak, kapanmak'; }
  else if (w.english === 'close 2') { w.english = 'close (yakın)'; w.turkish = 'yakın, samimi, bitişik'; }
  else if (w.english === 'lie 1') { w.english = 'lie (yalan)'; w.turkish = 'yalan söylemek, yalan'; }
  else if (w.english === 'lie 2') { w.english = 'lie (uzanmak)'; w.turkish = 'uzanmak, yatmak'; }
  else if (w.english === 'live 1') { w.english = 'live (yaşamak)'; w.turkish = 'yaşamak, oturmak'; }
  else if (w.english === 'live 2') { w.english = 'live (canlı)'; w.turkish = 'canlı (yayın/konser)'; }
  else if (w.english === 'tear 1') { w.english = 'tear (gözyaşı)'; w.turkish = 'gözyaşı'; }
  else if (w.english === 'tear 2') { w.english = 'tear (yırtmak)'; w.turkish = 'yırtmak, parçalamak'; }
  else if (w.english === 'wind 1') { w.english = 'wind (rüzgar)'; w.turkish = 'rüzgar, esinti'; }
  else if (w.english === 'wind 2') { w.english = 'wind (sarmak)'; w.turkish = 'sarmak, dolamak, kurmak'; }
  else if (w.english === 'used 1') { w.english = 'used (ikinci el)'; w.turkish = 'kullanılmış, ikinci el'; }
  else if (w.english === 'used 2') { w.english = 'used (alışkın)'; w.turkish = 'alışkın olmak, eskiden yapardı'; }
  else if (w.english === 'ring 1') { w.english = 'ring (yüzük/zil)'; w.turkish = 'yüzük, halka, zil çalmak'; }
  else if (w.english === 'ring 2') { w.english = 'ring (boks ringi)'; w.turkish = 'çember, ring'; }
  else if (/\s+1$/.test(w.english)) {
    w.english = w.english.replace(/\s+1$/, '');
  }
}

fs.writeFileSync(massivePath, JSON.stringify(words, null, 2), 'utf8');

console.log('Finished updating massiveWords.json!');
console.log('Final word count:', words.length);
console.log('Words updated from master dictionary:', updatedCount);
console.log('Imperatives converted to infinitives:', cleanImperativesCount);
