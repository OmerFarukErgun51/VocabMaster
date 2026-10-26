const fs = require('fs');

async function build() {
  console.log('Fetching datasets...');
  const [cefr1, cefr2, trData] = await Promise.all([
    fetch('https://raw.githubusercontent.com/openlanguageprofiles/olp-en-cefrj/master/cefrj-vocabulary-profile-1.5.csv').then(r => r.text()),
    fetch('https://raw.githubusercontent.com/openlanguageprofiles/olp-en-cefrj/master/octanove-vocabulary-profile-c1c2-1.0.csv').then(r => r.text()),
    fetch('https://gist.githubusercontent.com/CagriAldemir/b5313cc134c07dc9c41951999252231b/raw/7699eccb0bcb487397b146d0dcd2be3124386fd5/oxford_3000.json').then(r => r.json())
  ]);

  const levelMap = new Map();
  for (const line of (cefr1 + '\n' + cefr2).split('\n')) {
    const parts = line.split(',');
    if (parts.length >= 3 && parts[0] && parts[2]) {
      const word = parts[0].trim().toLowerCase();
      const lvl = parts[2].trim().toUpperCase();
      if (['A1','A2','B1','B2','C1','C2'].includes(lvl) && !levelMap.has(word)) {
        levelMap.set(word, lvl);
      }
    }
  }

  function detectCat(word, tr) {
    const text = (word + ' ' + tr).toLowerCase();
    if (text.match(/travel|hotel|airport|ticket|flight|train|station|bus|plane|seyahat|uçak|otel|bilet|yolculuk/)) return 'travel';
    if (text.match(/business|company|money|work|job|market|sale|cost|price|şirket|iş|para|pazar|satış|fiyat|sözleşme|müdür/)) return 'business';
    if (text.match(/computer|tech|data|system|digital|science|yazılım|bilgisayar|veri|sistem|teknoloji|yapay zeka/)) return 'technology';
    if (text.match(/research|theory|analysis|study|academic|araştırma|teori|analiz|bilimsel|akademik/)) return 'academic';
    return 'daily';
  }

  const finalWords = [];
  const seen = new Set();

  for (const item of trData) {
    const en = item.en.trim().toLowerCase();
    const tr = item.tr.trim();
    if (!en || seen.has(en) || en.length < 2) continue;
    seen.add(en);

    let lvl = levelMap.get(en);
    if (!lvl) {
      if (en.length <= 4) lvl = 'A1';
      else if (en.length <= 6) lvl = 'A2';
      else if (en.length <= 8) lvl = 'B1';
      else lvl = 'B2';
    }

    finalWords.push({
      english: en,
      turkish: tr,
      level: lvl,
      category: detectCat(en, tr),
      example_en: `Example sentence for "${en}".`,
      example_tr: `"${tr}" için örnek cümle.`
    });
  }

  // Add rich C1 and C2 words
  const c1c2List = [
    { en: 'exterior', tr: 'dış, harici görünüm', lvl: 'C1', cat: 'academic' },
    { en: 'complexity', tr: 'karmaşıklık', lvl: 'C1', cat: 'academic' },
    { en: 'concur', tr: 'aynı fikirde olmak, mutabık kalmak', lvl: 'C1', cat: 'academic' },
    { en: 'avid', tr: 'hevesli, tutkulu', lvl: 'C1', cat: 'daily' },
    { en: 'preliminary', tr: 'ön, hazırlık niteliğinde', lvl: 'C1', cat: 'business' },
    { en: 'advocate', tr: 'savunmak, arka çıkmak', lvl: 'C1', cat: 'academic' },
    { en: 'constitute', tr: 'oluşturmak, teşkil etmek', lvl: 'C1', cat: 'academic' },
    { en: 'diminish', tr: 'azalmak, eksilmek', lvl: 'C1', cat: 'academic' },
    { en: 'fluctuate', tr: 'dalgalanmak', lvl: 'C1', cat: 'business' },
    { en: 'arbitrary', tr: 'keyfi, rastgele', lvl: 'C2', cat: 'academic' },
    { en: 'coherent', tr: 'tutarlı, mantıklı', lvl: 'C1', cat: 'academic' },
    { en: 'comprehensive', tr: 'kapsamlı, etraflı', lvl: 'C1', cat: 'academic' },
    { en: 'empirical', tr: 'deneysel, ampirik', lvl: 'C1', cat: 'academic' },
    { en: 'hypothetical', tr: 'varsayımsal', lvl: 'C1', cat: 'academic' },
    { en: 'intrinsic', tr: 'özünde olan, içsel', lvl: 'C2', cat: 'academic' },
    { en: 'lucid', tr: 'açık, berrak, anlaşılır', lvl: 'C2', cat: 'academic' },
    { en: 'prevalent', tr: 'yaygın, geçerli', lvl: 'C1', cat: 'academic' },
    { en: 'subsequent', tr: 'sonraki, müteakip', lvl: 'C1', cat: 'academic' },
    { en: 'tangible', tr: 'somut, elle tutulur', lvl: 'C1', cat: 'business' },
    { en: 'viable', tr: 'uygulanabilir, geçerli', lvl: 'C1', cat: 'business' },
    { en: 'subtle', tr: 'ince, hemen göze çarpmayan', lvl: 'C1', cat: 'academic' },
    { en: 'profound', tr: 'derin, etkileyici', lvl: 'C2', cat: 'academic' },
    { en: 'scrutinize', tr: 'dikkatle incelemek', lvl: 'C2', cat: 'academic' },
    { en: 'ubiquitous', tr: 'her yerde bulunan', lvl: 'C1', cat: 'technology' },
    { en: 'ephemeral', tr: 'kısa ömürlü, gelip geçici', lvl: 'C2', cat: 'literature' },
    { en: 'paradigm', tr: 'düşünce modeli, paradigma', lvl: 'C2', cat: 'technology' },
    { en: 'serendipity', tr: 'mutlu tesadüf', lvl: 'C2', cat: 'literature' },
    { en: 'juxtaposition', tr: 'tezat oluşturma', lvl: 'C2', cat: 'academic' },
    { en: 'obfuscate', tr: 'kasten karmaşıklaştırmak', lvl: 'C2', cat: 'academic' },
    { en: 'quintessential', tr: 'en mükemmel timsali', lvl: 'C2', cat: 'literature' }
  ];

  for (const c of c1c2List) {
    if (!seen.has(c.en)) {
      finalWords.push({
        english: c.en,
        turkish: c.tr,
        level: c.lvl,
        category: c.cat,
        example_en: `He used the word "${c.en}" effectively.`,
        example_tr: `"${c.tr}" kelimesini etkili bir şekilde kullandı.`
      });
      seen.add(c.en);
    }
  }

  console.log('Total words processed:', finalWords.length);
  fs.writeFileSync('C:/Users/narut/Desktop/VocabMaster/src/data/massiveWords.json', JSON.stringify(finalWords));
  console.log('Saved to massiveWords.json successfully!');
}

build().catch(console.error);
