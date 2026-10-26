const fs = require('fs');
const path = require('path');

const wordsPath = path.join(__dirname, '../src/data/massiveWords.json');
const words = JSON.parse(fs.readFileSync(wordsPath, 'utf8'));

// Common natural patterns
const VERB_SUFFIXES = ['ing', 'ed', 'ate', 'ise', 'ize', 'fy'];
const ADJ_SUFFIXES = ['ful', 'ous', 'ive', 'able', 'ible', 'al', 'ic', 'less', 'ish'];
const ADV_SUFFIXES = ['ly'];
const NOUN_SUFFIXES = ['tion', 'sion', 'ment', 'ance', 'ence', 'ity', 'ness', 'ship', 'ism', 'er', 'or'];

// High frequency hand-crafted sentences
const CUSTOM_SENTENCES = {
  abandon: {
    en: "They had to abandon the sinking ship immediately.",
    tr: "Batan gemiyi derhal terk etmek zorunda kaldılar."
  },
  abandoned: {
    en: "The old house was abandoned many years ago.",
    tr: "Eski ev yıllar önce terk edilmişti."
  },
  ability: {
    en: "She has an extraordinary ability to learn new languages quickly.",
    tr: "Yeni dilleri hızla öğrenme konusunda olağanüstü bir kabiliyeti var."
  },
  able: {
    en: "Will you be able to finish the report by tomorrow morning?",
    tr: "Raporu yarın sabaha kadar bitirebilecek misin?"
  },
  about: {
    en: "We talked about our future plans for hours.",
    tr: "Saatlerce gelecek planlarımız hakkında konuştuk."
  },
  above: {
    en: "The airplane was flying high above the white clouds.",
    tr: "Uçak, beyaz bulutların çok üzerinde uçuyordu."
  },
  abroad: {
    en: "Studying abroad gave her a broader perspective on life.",
    tr: "Yurt dışında okumak ona hayata dair daha geniş bir bakış açısı kazandırdı."
  },
  absence: {
    en: "His absence was noticed by everyone during the meeting.",
    tr: "Toplantı boyunca yokluğu herkes tarafından fark edildi."
  },
  absent: {
    en: "Three students were absent from school yesterday.",
    tr: "Dün üç öğrenci okula gelmemişti."
  },
  absolute: {
    en: "I have absolute confidence in our team's success.",
    tr: "Ekibimizin başarısına kesin ve tam bir güvenim var."
  },
  absolutely: {
    en: "You are absolutely right about this decision.",
    tr: "Bu karar konusunda kesinlikle haklısın."
  },
  absorb: {
    en: "Plants absorb water and nutrients from the soil.",
    tr: "Bitkiler topraktan su ve besinleri emer."
  },
  academic: {
    en: "He published several important papers in top academic journals.",
    tr: "Önde gelen akademik dergilerde birçok önemli makale yayımladı."
  },
  accept: {
    en: "She happily decided to accept the new job offer.",
    tr: "Yeni iş teklifini mutlulukla kabul etmeye karar verdi."
  },
  acceptable: {
    en: "The proposed terms are completely acceptable to both sides.",
    tr: "Önerilen şartlar her iki taraf için de tamamen kabul edilebilirdir."
  },
  access: {
    en: "All students have unlimited access to the digital library.",
    tr: "Tüm öğrencilerin dijital kütüphaneye sınırsız erişimi vardır."
  },
  accident: {
    en: "Drive carefully on the wet road to prevent an accident.",
    tr: "Islak yolda kaza olmasını önlemek için dikkatli sürün."
  },
  achieve: {
    en: "With hard work and dedication, you can achieve any goal.",
    tr: "Çok çalışarak ve azimle her hedefe ulaşabilirsiniz."
  },
  achievement: {
    en: "Graduating with honors was her greatest achievement.",
    tr: "Onur derecesiyle mezun olmak onun en büyük başarısıydı."
  },
  action: {
    en: "We need to take immediate action to resolve this issue.",
    tr: "Bu sorunu çözmek için acil eyleme geçmemiz gerekiyor."
  },
  active: {
    en: "Regular exercise helps you maintain an active lifestyle.",
    tr: "Düzenli egzersiz aktif bir yaşam tarzını sürdürmenize yardımcı olur."
  },
  activity: {
    en: "Reading books is my favorite leisure activity.",
    tr: "Kitap okumak en sevdiğim serbest zaman aktivitemdir."
  },
  actor: {
    en: "The lead actor delivered a breathtaking performance.",
    tr: "Başrol oyuncusu nefes kesici bir performans sergiledi."
  },
  actually: {
    en: "Actually, I did not expect the exam to be this easy.",
    tr: "Aslında sınavın bu kadar kolay olmasını beklemiyordum."
  },
  adapt: {
    en: "Animals must quickly adapt to changes in their habitat.",
    tr: "Hayvanlar yaşam alanlarındaki değişikliklere hızla uyum sağlamalıdır."
  },
  add: {
    en: "Please add a pinch of salt to the soup.",
    tr: "Lütfen çorbaya bir tutam tuz ekleyin."
  },
  address: {
    en: "Could you please send me your current email address?",
    tr: "Lütfen bana güncel e-posta adresinizi gönderebilir misiniz?"
  },
  admire: {
    en: "I really admire people who never give up on their dreams.",
    tr: "Hayallerinden asla vazgeçmeyen insanlara gerçekten hayranlık duyuyorum."
  },
  adventure: {
    en: "Traveling across the mountains was an unforgettable adventure.",
    tr: "Dağların arasından seyahat etmek unutulmaz bir maceraydı."
  },
  advice: {
    en: "My grandfather always gave me wise and helpful advice.",
    tr: "Dedem bana her zaman bilgece ve faydalı tavsiyeler verirdi."
  },
  affect: {
    en: "Climate changes deeply affect agriculture across the world.",
    tr: "İklim değişiklikleri dünya çapında tarımı derinden etkiler."
  },
  afraid: {
    en: "Do not be afraid to make mistakes while learning English.",
    tr: "İngilizce öğrenirken hata yapmaktan korkmayın."
  },
  agree: {
    en: "I completely agree with your thoughts on this matter.",
    tr: "Bu konudaki düşüncelerine tamamen katılıyorum."
  },
  airport: {
    en: "We arrived at the airport two hours before our flight.",
    tr: "Uçuşumuzdan iki saat önce havalimanına vardık."
  },
  allow: {
    en: "The rules do not allow smoking inside the building.",
    tr: "Kurallar bina içinde sigara içilmesine izin vermez."
  },
  almost: {
    en: "It is almost midnight, so we should head home now.",
    tr: "Neredeyse gece yarısı oldu, bu yüzden artık eve gitmeliyiz."
  },
  alone: {
    en: "He prefers studying alone in a quiet room.",
    tr: "Sessiz bir odada tek başına çalışmayı tercih eder."
  },
  already: {
    en: "I have already finished my homework for tomorrow.",
    tr: "Yarınki ödevlerimi çoktan bitirdim bile."
  },
  always: {
    en: "She always greets everyone with a warm and friendly smile.",
    tr: "Herkese her zaman sıcak ve dostane bir gülümsemeyle selam verir."
  },
  amazing: {
    en: "The view of the city from the mountain top was amazing.",
    tr: "Dağın tepesinden şehrin manzarası inanılmazdı."
  },
  angry: {
    en: "He was very angry because his flight had been cancelled.",
    tr: "Uçuşu iptal edildiği için çok kızgındı."
  },
  animal: {
    en: "Dolphins are among the most intelligent animals in the world.",
    tr: "Yunuslar dünyadaki en zeki hayvanlar arasındadır."
  },
  answer: {
    en: "She raised her hand to answer the teacher's question.",
    tr: "Öğretmenin sorusunu cevaplamak için elini kaldırdı."
  },
  apartment: {
    en: "They just rented a beautiful apartment in the city center.",
    tr: "Şehir merkezinde çok güzel bir daire kiraladılar."
  },
  apple: {
    en: "An apple a day keeps the doctor away.",
    tr: "Günde bir elma doktoru evden uzak tutar."
  },
  appreciate: {
    en: "I really appreciate your kind support and encouragement.",
    tr: "Nazik desteğinizi ve cesaretlendirmenizi gerçekten takdir ediyorum."
  },
  area: {
    en: "There are many green parks and playgrounds in this area.",
    tr: "Bu bölgede birçok yeşil park ve oyun alanı bulunmaktadır."
  },
  arrive: {
    en: "The train is scheduled to arrive at noon.",
    tr: "Trenin öğle saatinde varması planlanıyor."
  },
  art: {
    en: "Visiting modern art museums inspires her creativity.",
    tr: "Modern sanat müzelerini ziyaret etmek onun yaratıcılığına ilham veriyor."
  },
  article: {
    en: "I read an insightful article about artificial intelligence today.",
    tr: "Bugün yapay zeka hakkında ufuk açıcı bir makale okudum."
  },
  ask: {
    en: "Feel free to ask questions if you don't understand something.",
    tr: "Bir şeyi anlamadığınızda soru sormaktan çekinmeyin."
  },
  attention: {
    en: "Pay close attention to the instructions before starting.",
    tr: "Başlamadan önce talimatlara çok dikkat edin."
  },
  author: {
    en: "The author spent five years writing this historical novel.",
    tr: "Yazar bu tarihi romanı yazmak için beş yıl harcadı."
  },
  available: {
    en: "The manager will be available for a meeting tomorrow morning.",
    tr: "Müdür yarın sabah toplantı için müsait olacaktır."
  },
  avoid: {
    en: "You should avoid eating too much sugar for better health.",
    tr: "Daha iyi bir sağlık için çok fazla şeker tüketmekten kaçınmalısınız."
  },
  baby: {
    en: "The baby fell asleep peacefully in her mother's arms.",
    tr: "Bebek annesinin kollarında huzurla uyuyakaldı."
  },
  beautiful: {
    en: "It was a beautiful sunny afternoon by the seaside.",
    tr: "Deniz kenarında çok güzel, güneşli bir öğleden sonraydı."
  },
  because: {
    en: "We stayed indoors because it started raining heavily.",
    tr: "Şiddetli yağmur başladığı için içeride kaldık."
  },
  become: {
    en: "With patience and practice, you can become fluent in English.",
    tr: "Sabır ve pratikle İngilizcede akıcı hale gelebilirsiniz."
  },
  before: {
    en: "Wash your hands thoroughly before sitting at the dinner table.",
    tr: "Yemek masasına oturmadan önce ellerinizi iyice yıkayın."
  },
  begin: {
    en: "The concert will begin in about ten minutes.",
    tr: "Konser yaklaşık on dakika içinde başlayacak."
  },
  believe: {
    en: "Always believe in your own skills and potential.",
    tr: "Her zaman kendi yeteneklerinize ve potansiyelinize inanın."
  },
  book: {
    en: "I couldn't put the book down until I finished the last page.",
    tr: "Son sayfayı bitirene kadar kitabı elimden bırakamadım."
  },
  brain: {
    en: "The human brain has remarkable capacity to learn new concepts.",
    tr: "İnsan beyni yeni kavramlar öğrenmek için olağanüstü bir kapasiteye sahiptir."
  },
  business: {
    en: "They started a successful tech business together last year.",
    tr: "Geçen yıl birlikte başarılı bir teknoloji şirketi kurdular."
  },
  call: {
    en: "I will call you back as soon as I arrive at the hotel.",
    tr: "Otele varır varmaz seni tekrar arayacağım."
  },
  camera: {
    en: "He captured stunning landscape pictures with his new camera.",
    tr: "Yeni kamerasıyla büyüleyici manzara fotoğrafları çekti."
  },
  challenge: {
    en: "Every challenge brings an opportunity to grow stronger.",
    tr: "Her zorluk daha da güçlenmek için bir fırsat getirir."
  },
  chance: {
    en: "Take the chance while you have the opportunity.",
    tr: "Fırsatınız varken şansınızı değerlendirin."
  },
  change: {
    en: "Positive habits can completely change your daily life.",
    tr: "Olumlu alışkanlıklar günlük hayatınızı tamamen değiştirebilir."
  },
  city: {
    en: "Istanbul is a vibrant city connecting two continents.",
    tr: "İstanbul iki kıtayı birbirine bağlayan canlı bir şehirdir."
  },
  clean: {
    en: "Make sure your desk is clean and organized before working.",
    tr: "Çalışmaya başlamadan önce masanızın temiz ve düzenli olduğundan emin olun."
  },
  clear: {
    en: "His explanation was very clear and easy to understand.",
    tr: "Açıklaması son derece net ve anlaşılması kolaydı."
  },
  coffee: {
    en: "A hot cup of coffee helps me stay focused in the morning.",
    tr: "Sıcak bir fincan kahve sabahları odaklanmama yardımcı olur."
  },
  computer: {
    en: "Modern computers can process vast amounts of data in seconds.",
    tr: "Modern bilgisayarlar devasa miktardaki veriyi saniyeler içinde işleyebilir."
  },
  courage: {
    en: "It takes great courage to speak the truth in difficult times.",
    tr: "Zor zamanlarda doğruyu söylemek büyük cesaret gerektirir."
  },
  create: {
    en: "Artists use their imagination to create meaningful works.",
    tr: "Sanatçılar anlamlı eserler üretmek için hayal güçlerini kullanır."
  },
  culture: {
    en: "Learning a language also introduces you to its unique culture.",
    tr: "Bir dil öğrenmek sizi aynı zamanda onun benzersiz kültürüyle de tanıştırır."
  },
  curious: {
    en: "Children are naturally curious about everything around them.",
    tr: "Çocuklar çevrelerindeki her şey hakkında doğal olarak meraklıdırlar."
  },
  danger: {
    en: "The warning sign indicated danger near the steep cliff.",
    tr: "Uyarı tabelası sarp uçurumun yakınındaki tehlikeyi gösteriyordu."
  },
  decision: {
    en: "Making a big decision requires careful thinking and reflection.",
    tr: "Büyük bir karar vermek dikkatli düşünme ve değerlendirme gerektirir."
  },
  develop: {
    en: "Reading every day helps develop your vocabulary and comprehension.",
    tr: "Her gün okumak kelime dağarcığınızı ve anlama yetinizi geliştirmeye yardımcı olur."
  },
  difference: {
    en: "A small positive deed can make a big difference in someone's day.",
    tr: "Küçük olumlu bir davranış birinin gününde büyük bir fark yaratabilir."
  },
  discover: {
    en: "Scientists continue to discover new species in deep oceans.",
    tr: "Bilim insanları derin okyanuslarda yeni türler keşfetmeye devam ediyor."
  },
  dream: {
    en: "Never give up on your dream, no matter how hard it seems.",
    tr: "Ne kadar zor görünürse görünsün hayalinizden asla vazgeçmeyin."
  },
  education: {
    en: "Quality education opens doors to countless opportunities.",
    tr: "Kaliteli eğitim sayısız fırsata kapı aralar."
  },
  energy: {
    en: "Renewable energy from the sun and wind is the future.",
    tr: "Güneş ve rüzgardan elde edilen yenilenebilir enerji gelecektir."
  },
  environment: {
    en: "We must protect our environment for future generations.",
    tr: "Çevremizi gelecek nesiller için korumalıyız."
  },
  experience: {
    en: "Living in another country is a life-changing experience.",
    tr: "Başka bir ülkede yaşamak hayat değiştiren bir deneyimdir."
  },
  family: {
    en: "Spending quality time with family brings immense joy.",
    tr: "Aileyle kaliteli vakit geçirmek büyük bir neşe getirir."
  },
  future: {
    en: "The future belongs to those who prepare for it today.",
    tr: "Gelecek, bugünden ona hazırlananlarındır."
  },
  generation: {
    en: "Each generation brings fresh ideas and innovations.",
    tr: "Her nesil taze fikirler ve yenilikler getirir."
  },
  goal: {
    en: "Setting a realistic goal helps you stay motivated.",
    tr: "Gerçekçi bir hedef belirlemek motivasyonunuzu korumanıza yardımcı olur."
  },
  happiness: {
    en: "True happiness comes from meaningful relationships and peace of mind.",
    tr: "Gerçek mutluluk anlamlı ilişkilerden ve iç huzurundan gelir."
  },
  health: {
    en: "Good health is the greatest treasure in life.",
    tr: "İyi sağlık hayattaki en büyük hazinedir."
  },
  history: {
    en: "Studying history helps us understand the present world.",
    tr: "Tarih çalışmak bugünkü dünyayı anlamamıza yardımcı olur."
  },
  hope: {
    en: "Hope gives people the strength to overcome adversity.",
    tr: "Umut insanlara zorlukların üstesinden gelme gücü verir."
  },
  idea: {
    en: "A single good idea can change the course of history.",
    tr: "Tek bir iyi fikir tarihin akışını değiştirebilir."
  },
  important: {
    en: "It is important to review vocabulary every single day.",
    tr: "Her gün kelime tekrarı yapmak çok önemlidir."
  },
  improve: {
    en: "Consistent daily practice will improve your speaking fluency.",
    tr: "Düzenli günlük pratik konuşma akıcılığınızı geliştirecektir."
  },
  journey: {
    en: "A journey of a thousand miles begins with a single step.",
    tr: "Bin millik bir yolculuk tek bir adımla başlar."
  },
  knowledge: {
    en: "Knowledge becomes power only when it is applied.",
    tr: "Bilgi ancak uygulandığında güce dönüşür."
  },
  language: {
    en: "Learning a new language expands your mindset and worldview.",
    tr: "Yeni bir dil öğrenmek zihninizi ve dünya görüşünüzü genişletir."
  },
  learn: {
    en: "Curious people never stop wanting to learn new things.",
    tr: "Meraklı insanlar yeni şeyler öğrenme isteğinden asla vazgeçmezler."
  },
  life: {
    en: "Life is full of wonderful surprises if you keep an open heart.",
    tr: "Açık bir kalple yaklaşırsanız hayat harika sürprizlerle doludur."
  },
  listen: {
    en: "Good communicators know how to listen attentively.",
    tr: "İyi iletişimciler dikkatle nasıl dinleyeceklerini bilirler."
  },
  memory: {
    en: "Spaced repetition is the most effective way to strengthen memory.",
    tr: "Aralıklı tekrar, hafızayı güçlendirmenin en etkili yoludur."
  },
  mind: {
    en: "A peaceful mind leads to clearer thinking and better decisions.",
    tr: "Huzurlu bir zihin daha net düşünmeye ve daha iyi kararlara yol açar."
  },
  opportunity: {
    en: "Every morning is a new opportunity to become a better version of yourself.",
    tr: "Her sabah kendinizin daha iyi bir versiyonu olmak için yeni bir fırsattır."
  },
  patience: {
    en: "Patience and persistence are key to mastering any skill.",
    tr: "Sabır ve sebat herhangi bir beceride ustalaşmanın anahtarıdır."
  },
  peace: {
    en: "Inner peace is more valuable than external material wealth.",
    tr: "İç huzur dışsal maddi zenginlikten çok daha değerlidir."
  },
  practice: {
    en: "Practice makes progress; never worry about making mistakes.",
    tr: "Pratik yapmak ilerleme sağlar; hata yapmaktan asla endişelenmeyin."
  },
  question: {
    en: "Asking the right question is the beginning of wisdom.",
    tr: "Doğru soruyu sormak bilgeliğin başlangıcıdır."
  },
  reason: {
    en: "There is always a logical reason behind every natural phenomenon.",
    tr: "Her doğa olayının arkasında her zaman mantıklı bir sebep vardır."
  },
  success: {
    en: "Success is the sum of small efforts repeated day in and day out.",
    tr: "Başarı, her gün bıkmadan tekrarlanan küçük çabaların toplamıdır."
  },
  time: {
    en: "Time is our most precious non-renewable resource.",
    tr: "Zaman bizim en değerli ve geri getirilemez kaynağımızdır."
  },
  understand: {
    en: "To truly understand someone, listen with empathy.",
    tr: "Birini gerçekten anlamak için empatiyle dinleyin."
  },
  world: {
    en: "The world is full of wonders waiting to be explored.",
    tr: "Dünya keşfedilmeyi bekleyen harikalarla doludur."
  }
};

// Generates an idiomatic sentence for any word
function buildNaturalSentence(w) {
  const eng = w.english.trim();
  const tr = w.turkish.trim();
  const lower = eng.toLowerCase();

  // Check if we already have a handcrafted sentence
  if (CUSTOM_SENTENCES[lower]) {
    return CUSTOM_SENTENCES[lower];
  }

  // Detect phrase or multi-word
  if (eng.includes(' ')) {
    return {
      en: `It is essential to know how to use "${eng}" properly in daily speech.`,
      tr: `Günlük konuşmada "${tr}" ifadesini doğru kullanmayı bilmek çok önemlidir.`
    };
  }

  // Pattern detection
  const isAdverb = ADV_SUFFIXES.some(s => lower.endsWith(s));
  const isAdjective = ADJ_SUFFIXES.some(s => lower.endsWith(s));
  const isNoun = NOUN_SUFFIXES.some(s => lower.endsWith(s));
  const isVerb = VERB_SUFFIXES.some(s => lower.endsWith(s)) || tr.endsWith('mek') || tr.endsWith('mak');

  if (isVerb) {
    const verbTemplates = [
      {
        en: `We should ${eng} carefully before making our final decision.`,
        tr: `Son kararımızı vermeden önce dikkatlice ${tr} yoluna gitmeliyiz.`
      },
      {
        en: `They tried to ${eng} the situation as quickly as possible.`,
        tr: `Durumu olabildiğince hızlı bir şekilde ${tr} için çabaladılar.`
      },
      {
        en: `She knows how to ${eng} effectively in challenging moments.`,
        tr: `Zorlu anlarda nasıl etkili şekilde ${tr} gerektiğini çok iyi bilir.`
      }
    ];
    return verbTemplates[Math.abs(hashString(eng)) % verbTemplates.length];
  }

  if (isAdverb) {
    return {
      en: `He spoke ${eng} about his experiences during the international conference.`,
      tr: `Uluslararası konferans sırasında deneyimlerinden ${tr} bahsetti.`
    };
  }

  if (isAdjective) {
    const adjTemplates = [
      {
        en: `This is a particularly ${eng} topic for anyone studying English.`,
        tr: `Bu, İngilizce çalışan herkes için özellikle ${tr} bir konudur.`
      },
      {
        en: `She gave a very ${eng} presentation that impressed everyone in the room.`,
        tr: `Salondaki herkesi etkileyen oldukça ${tr} bir sunum yaptı.`
      }
    ];
    return adjTemplates[Math.abs(hashString(eng)) % adjTemplates.length];
  }

  // Default Noun / Concept
  const nounTemplates = [
    {
      en: `Understanding the concept of ${eng} will broaden your language fluency.`,
      tr: `${capitalize(tr)} kavramını anlamak dil akıcılığınızı pekiştirecektir.`
    },
    {
      en: `The role of ${eng} is very significant in modern society.`,
      tr: `Modern toplumda ${tr} kavramının rolü son derece önemlidir.`
    },
    {
      en: `He shared interesting thoughts regarding the value of ${eng}.`,
      tr: `${capitalize(tr)} değeriyle ilgili ilgi çekici düşünceler paylaştı.`
    }
  ];
  return nounTemplates[Math.abs(hashString(eng)) % nounTemplates.length];
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

// Process all words
let enrichedCount = 0;
for (const word of words) {
  if (!word.example_en || word.example_en.includes('Example sentence for') || word.example_en.includes('Example for')) {
    const sentence = buildNaturalSentence(word);
    word.example_en = sentence.en;
    word.example_tr = sentence.tr;
    enrichedCount++;
  }
}

fs.writeFileSync(wordsPath, JSON.stringify(words, null, 2), 'utf8');
console.log(`Enriched ${enrichedCount} words with natural example sentences.`);
