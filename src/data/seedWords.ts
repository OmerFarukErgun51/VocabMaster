import { CEFRLevel, Category } from '../types';

export interface SeedWord {
  english: string;
  turkish: string;
  level: CEFRLevel;
  category: Category;
  part_of_speech: string;
  pronunciation?: string;
  example_en: string;
  example_tr: string;
  collocations?: string;
  frequency_rank?: number;
  image_url?: string;
}

export const INITIAL_WORDS: SeedWord[] = [
  // ================= A1 LEVEL (FOUNDATION) =================
  {
    english: 'welcome',
    turkish: 'hoş geldiniz, karşılamak',
    level: 'A1',
    category: 'daily',
    part_of_speech: 'verb',
    pronunciation: '/ˈwel.kəm/',
    example_en: 'Welcome to our home, make yourself comfortable.',
    example_tr: 'Evimize hoş geldiniz, rahatınıza bakın.',
    collocations: 'warm welcome, welcome back',
    frequency_rank: 210
  },
  {
    english: 'delicious',
    turkish: 'lezzetli, nefis',
    level: 'A1',
    category: 'daily',
    part_of_speech: 'adjective',
    pronunciation: '/dɪˈlɪʃ.əs/',
    example_en: 'The dinner yesterday was absolutely delicious.',
    example_tr: 'Dünkü akşam yemeği kesinlikle çok lezzetliydi.',
    collocations: 'delicious meal, taste delicious',
    frequency_rank: 920
  },
  {
    english: 'arrive',
    turkish: 'varmak, ulaşmak',
    level: 'A1',
    category: 'travel',
    part_of_speech: 'verb',
    pronunciation: '/əˈraɪv/',
    example_en: 'The train will arrive at the station at noon.',
    example_tr: 'Tren öğleyin istasyona varacak.',
    collocations: 'arrive at the airport, arrive on time',
    frequency_rank: 450
  },
  {
    english: 'passport',
    turkish: 'pasaport',
    level: 'A1',
    category: 'travel',
    part_of_speech: 'noun',
    pronunciation: '/ˈpɑːs.pɔːt/',
    example_en: 'Please have your passport ready at the gate.',
    example_tr: 'Lütfen kapıda pasaportunuzu hazır bulundurun.',
    collocations: 'valid passport, passport control',
    frequency_rank: 820
  },
  {
    english: 'meeting',
    turkish: 'toplantı, buluşma',
    level: 'A1',
    category: 'business',
    part_of_speech: 'noun',
    pronunciation: '/ˈmiː.tɪŋ/',
    example_en: 'We have an important team meeting at nine.',
    example_tr: 'Saat dokuzda önemli bir ekip toplantımız var.',
    collocations: 'attend a meeting, business meeting',
    frequency_rank: 350
  },
  {
    english: 'schedule',
    turkish: 'zaman çizelgesi, program',
    level: 'A1',
    category: 'business',
    part_of_speech: 'noun',
    pronunciation: '/ˈʃedʒ.uːl/',
    example_en: 'My schedule is very busy this week.',
    example_tr: 'Bu hafta programım çok yoğun.',
    collocations: 'tight schedule, on schedule',
    frequency_rank: 530
  },
  {
    english: 'message',
    turkish: 'mesaj, ileti',
    level: 'A1',
    category: 'daily',
    part_of_speech: 'noun',
    pronunciation: '/ˈmes.ɪdʒ/',
    example_en: 'Did you get my text message yesterday?',
    example_tr: 'Dün sana attığım kısa mesajı aldın mı?',
    collocations: 'send a message, leave a message',
    frequency_rank: 410
  },

  // ================= A2 LEVEL (ELEMENTARY) =================
  {
    english: 'opportunity',
    turkish: 'fırsat, imkan',
    level: 'A2',
    category: 'business',
    part_of_speech: 'noun',
    pronunciation: '/ˌɒp.əˈtjuː.nə.ti/',
    example_en: 'This job offer is a great opportunity for my career.',
    example_tr: 'Bu iş teklifi kariyerim için harika bir fırsat.',
    collocations: 'golden opportunity, seize an opportunity',
    frequency_rank: 650
  },
  {
    english: 'journey',
    turkish: 'yolculuk, seyahat',
    level: 'A2',
    category: 'travel',
    part_of_speech: 'noun',
    pronunciation: '/ˈdʒɜː.ni/',
    example_en: 'Have a safe journey and text me when you get there.',
    example_tr: 'İyi yolculuklar, oraya vardığında bana mesaj at.',
    collocations: 'safe journey, long journey',
    frequency_rank: 880
  },
  {
    english: 'improve',
    turkish: 'geliştirmek, iyileştirmek',
    level: 'A2',
    category: 'daily',
    part_of_speech: 'verb',
    pronunciation: '/ɪmˈpruːv/',
    example_en: 'I practice every day to improve my speaking skills.',
    example_tr: 'Konuşma becerilerimi geliştirmek için her gün pratik yapıyorum.',
    collocations: 'improve skills, significantly improve',
    frequency_rank: 510
  },
  {
    english: 'reservation',
    turkish: 'rezervasyon, ayırtma',
    level: 'A2',
    category: 'travel',
    part_of_speech: 'noun',
    pronunciation: '/ˌrez.əˈveɪ.ʃən/',
    example_en: 'I would like to make a table reservation for two.',
    example_tr: 'İki kişilik bir masa rezervasyonu yaptırmak istiyorum.',
    collocations: 'make a reservation, hotel reservation',
    frequency_rank: 950
  },
  {
    english: 'colleague',
    turkish: 'iş arkadaşı, meslektaş',
    level: 'A2',
    category: 'business',
    part_of_speech: 'noun',
    pronunciation: '/ˈkɒl.iːɡ/',
    example_en: 'My colleagues helped me finish the presentation on time.',
    example_tr: 'İş arkadaşlarım sunumu vaktinde bitirmeme yardımcı oldu.',
    collocations: 'close colleague, former colleague',
    frequency_rank: 870
  },
  {
    english: 'look forward to',
    turkish: 'dört gözle beklemek, sabırsızlanmak',
    level: 'A2',
    category: 'idioms',
    part_of_speech: 'phrasal verb',
    pronunciation: '/lʊk ˈfɔː.wəd tuː/',
    example_en: 'I really look forward to hearing from you soon.',
    example_tr: 'Sizden en kısa zamanda haber almayı dört gözle bekliyorum.',
    collocations: 'look forward to seeing you, look forward to holiday',
    frequency_rank: 640
  },

  // ================= B1 LEVEL (INTERMEDIATE) =================
  {
    english: 'accomplish',
    turkish: 'başarmak, üstesinden gelmek',
    level: 'B1',
    category: 'business',
    part_of_speech: 'verb',
    pronunciation: '/əˈkʌm.plɪʃ/',
    example_en: 'If we work together, we can accomplish our goals.',
    example_tr: 'Birlikte çalışırsak hedeflerimizi başarabiliriz.',
    collocations: 'accomplish a mission, accomplish a task',
    frequency_rank: 1420
  },
  {
    english: 'reliable',
    turkish: 'güvenilir, itimat edilir',
    level: 'B1',
    category: 'daily',
    part_of_speech: 'adjective',
    pronunciation: '/rɪˈlaɪ.ə.bəl/',
    example_en: 'She is a very reliable person; she always keeps her word.',
    example_tr: 'Çok güvenilir bir insandır; her zaman sözünü tutar.',
    collocations: 'reliable source, highly reliable',
    frequency_rank: 1250
  },
  {
    english: 'negotiate',
    turkish: 'müzakere etmek, pazarlık yapmak',
    level: 'B1',
    category: 'business',
    part_of_speech: 'verb',
    pronunciation: '/nəˈɡəʊ.ʃi.eɪt/',
    example_en: 'The company is negotiating a new contract with the client.',
    example_tr: 'Şirket müşteriyle yeni bir sözleşme müzakere ediyor.',
    collocations: 'negotiate a deal, negotiate terms',
    frequency_rank: 1800
  },
  {
    english: 'figure out',
    turkish: 'çözmek, anlamak, halletmek',
    level: 'B1',
    category: 'idioms',
    part_of_speech: 'phrasal verb',
    pronunciation: '/ˈfɪɡ.ər aʊt/',
    example_en: 'I am trying to figure out how this machine works.',
    example_tr: 'Bu makinenin nasıl çalıştığını çözmeye çalışıyorum.',
    collocations: 'figure out a solution, figure out a problem',
    frequency_rank: 750
  },
  {
    english: 'efficient',
    turkish: 'verimli, etkili',
    level: 'B1',
    category: 'business',
    part_of_speech: 'adjective',
    pronunciation: '/ɪˈfɪʃ.ənt/',
    example_en: 'We need to find a more efficient way to process data.',
    example_tr: 'Verileri işlemek için daha verimli bir yol bulmalıyız.',
    collocations: 'energy efficient, cost efficient',
    frequency_rank: 1100
  },
  {
    english: 'destination',
    turkish: 'varış yeri, hedef nokta',
    level: 'B1',
    category: 'travel',
    part_of_speech: 'noun',
    pronunciation: '/ˌdes.tɪˈneɪ.ʃən/',
    example_en: 'Paris is one of the top tourist destinations in Europe.',
    example_tr: 'Paris, Avrupa\'daki en popüler turist varış noktalarından biridir.',
    collocations: 'popular destination, final destination',
    frequency_rank: 1350
  },
  {
    english: 'run out of',
    turkish: 'tükenmek, bitirmek (stok, para, zaman vb.)',
    level: 'B1',
    category: 'idioms',
    part_of_speech: 'phrasal verb',
    pronunciation: '/rʌn aʊt əv/',
    example_en: 'We are running out of time, please hurry up.',
    example_tr: 'Zamanımız tükeniyor, lütfen acele edin.',
    collocations: 'run out of money, run out of petrol',
    frequency_rank: 1200
  },
  {
    english: 'deadline',
    turkish: 'son teslim tarihi, bitiş süresi',
    level: 'B1',
    category: 'business',
    part_of_speech: 'noun',
    pronunciation: '/ˈded.laɪn/',
    example_en: 'We must work overtime to meet the project deadline.',
    example_tr: 'Projenin son teslim tarihine yetişmek için fazla mesai yapmalıyız.',
    collocations: 'meet a deadline, miss a deadline, tight deadline',
    frequency_rank: 1300
  },

  // ================= B2 LEVEL (UPPER INTERMEDIATE) =================
  {
    english: 'sustainable',
    turkish: 'sürdürülebilir',
    level: 'B2',
    category: 'technology',
    part_of_speech: 'adjective',
    pronunciation: '/səˈsteɪ.nə.bəl/',
    example_en: 'Solar energy provides a sustainable alternative to fossil fuels.',
    example_tr: 'Güneş enerjisi fosil yakıtlara sürdürülebilir bir alternatif sunar.',
    collocations: 'sustainable development, sustainable growth',
    frequency_rank: 2100
  },
  {
    english: 'inevitable',
    turkish: 'kaçınılmaz, çaresiz',
    level: 'B2',
    category: 'academic',
    part_of_speech: 'adjective',
    pronunciation: '/ɪnˈev.ɪ.tə.bəl/',
    example_en: 'Change is inevitable in the technology industry.',
    example_tr: 'Teknoloji sektöründe değişim kaçınılmazdır.',
    collocations: 'inevitable result, almost inevitable',
    frequency_rank: 2400
  },
  {
    english: 'call off',
    turkish: 'iptal etmek',
    level: 'B2',
    category: 'idioms',
    part_of_speech: 'phrasal verb',
    pronunciation: '/kɔːl ɒf/',
    example_en: 'They had to call off the football match because of heavy rain.',
    example_tr: 'Şiddetli yağmur yüzünden futbol maçını iptal etmek zorunda kaldılar.',
    collocations: 'call off the meeting, call off the deal',
    frequency_rank: 1600
  },
  {
    english: 'controversial',
    turkish: 'tartışmalı, fikir ayrılığı yaratan',
    level: 'B2',
    category: 'academic',
    part_of_speech: 'adjective',
    pronunciation: '/ˌkɒn.trəˈvɜː.ʃəl/',
    example_en: 'The government proposed a controversial new tax law.',
    example_tr: 'Hükümet tartışmalı yeni bir vergi yasası teklif etti.',
    collocations: 'highly controversial, controversial decision',
    frequency_rank: 2200
  },
  {
    english: 'breakthrough',
    turkish: 'büyük buluş, çığır açan gelişme',
    level: 'B2',
    category: 'technology',
    part_of_speech: 'noun',
    pronunciation: '/ˈbreɪk.θruː/',
    example_en: 'Scientists made a major breakthrough in cancer research.',
    example_tr: 'Bilim insanları kanser araştırmalarında çığır açan büyük bir buluş yaptı.',
    collocations: 'major breakthrough, technological breakthrough',
    frequency_rank: 2800
  },
  {
    english: 'resilient',
    turkish: 'dayanıklı, dirençli, çabuk toparlanan',
    level: 'B2',
    category: 'academic',
    part_of_speech: 'adjective',
    pronunciation: '/rɪˈzɪl.jənt/',
    example_en: 'Children are often remarkably resilient in challenging times.',
    example_tr: 'Çocuklar zor zamanlarda genellikle dikkat çekici derecede dirençlidir.',
    collocations: 'resilient economy, highly resilient',
    frequency_rank: 2950
  },
  {
    english: 'come up with',
    turkish: 'ileri sürmek, (fikir/çözüm) üretmek',
    level: 'B2',
    category: 'idioms',
    part_of_speech: 'phrasal verb',
    pronunciation: '/kʌm ʌp wɪð/',
    example_en: 'She came up with a brilliant strategy to increase sales.',
    example_tr: 'Satışları artırmak için harika bir strateji üretti.',
    collocations: 'come up with an idea, come up with a solution',
    frequency_rank: 1550
  },
  {
    english: 'adaptable',
    turkish: 'kolay uyum sağlayan, esnek',
    level: 'B2',
    category: 'business',
    part_of_speech: 'adjective',
    pronunciation: '/əˈdæp.tə.bəl/',
    example_en: 'Modern workers need to be highly adaptable to new software.',
    example_tr: 'Modern çalışanların yeni yazılımlara son derece uyumlu olması gerekir.',
    collocations: 'adaptable mindset, highly adaptable',
    frequency_rank: 3100
  },

  // ================= C1 LEVEL (ADVANCED) =================
  {
    english: 'ubiquitous',
    turkish: 'her yerde bulunan, yaygın',
    level: 'C1',
    category: 'technology',
    part_of_speech: 'adjective',
    pronunciation: '/juːˈbɪk.wɪ.təs/',
    example_en: 'Smartphones have become ubiquitous in modern society.',
    example_tr: 'Akıllı telefonlar modern toplumda her yerde bulunur hale geldi.',
    collocations: 'ubiquitous presence, virtually ubiquitous',
    frequency_rank: 4200
  },
  {
    english: 'mitigate',
    turkish: 'hafifletmek, etkisini azaltmak',
    level: 'C1',
    category: 'academic',
    part_of_speech: 'verb',
    pronunciation: '/ˈmɪt.ɪ.ɡeɪt/',
    example_en: 'Steps have been taken to mitigate the environmental impact.',
    example_tr: 'Çevresel etkiyi hafifletmek için adımlar atıldı.',
    collocations: 'mitigate risks, mitigate the consequences',
    frequency_rank: 3600
  },
  {
    english: 'eloquent',
    turkish: 'etkili konuşan, beliğ, anlamlı',
    level: 'C1',
    category: 'academic',
    part_of_speech: 'adjective',
    pronunciation: '/ˈel.ə.kwənt/',
    example_en: 'He gave an eloquent speech that moved the entire audience.',
    example_tr: 'Tüm izleyicileri duygulandıran etkili ve anlamlı bir konuşma yaptı.',
    collocations: 'eloquent speaker, eloquent testimony',
    frequency_rank: 4800
  },
  {
    english: 'meticulous',
    turkish: 'kılı kırk yaran, titiz, özenli',
    level: 'C1',
    category: 'daily',
    part_of_speech: 'adjective',
    pronunciation: '/məˈtɪk.jə.ləs/',
    example_en: 'Her meticulous attention to detail ensured the project succeeded.',
    example_tr: 'Detaylara gösterdiği titiz özen projenin başarılı olmasını sağladı.',
    collocations: 'meticulous planning, meticulous research',
    frequency_rank: 4100
  },
  {
    english: 'plausible',
    turkish: 'makul, akla yatkın, olası',
    level: 'C1',
    category: 'academic',
    part_of_speech: 'adjective',
    pronunciation: '/ˈplɔː.zə.bəl/',
    example_en: 'He provided a perfectly plausible explanation for the delay.',
    example_tr: 'Gecikme için son derece makul ve akla yatkın bir açıklama getirdi.',
    collocations: 'plausible explanation, plausible scenario',
    frequency_rank: 4300
  },
  {
    english: 'lucrative',
    turkish: 'kazançlı, çok karlı',
    level: 'C1',
    category: 'business',
    part_of_speech: 'adjective',
    pronunciation: '/ˈluː.krə.tɪv/',
    example_en: 'They signed a very lucrative deal in the Asian market.',
    example_tr: 'Asya pazarında oldukça kazançlı bir anlaşmaya imza attılar.',
    collocations: 'lucrative business, lucrative contract',
    frequency_rank: 4600
  },
  {
    english: 'take for granted',
    turkish: 'değerini bilmemek, çantada keklik görmek',
    level: 'C1',
    category: 'idioms',
    part_of_speech: 'phrasal verb',
    pronunciation: '/teɪk fɔː ˈɡrɑːn.tɪd/',
    example_en: 'You should never take good health for granted.',
    example_tr: 'İyi bir sağlığı asla çantada keklik görmemeli, kıymetini bilmelisiniz.',
    collocations: 'take people for granted, take things for granted',
    frequency_rank: 3400
  },

  // ================= C2 LEVEL (PROFICIENT / MASTERY) =================
  {
    english: 'ephemeral',
    turkish: 'kısa ömürlü, gelip geçici',
    level: 'C2',
    category: 'literature',
    part_of_speech: 'adjective',
    pronunciation: '/ɪˈfem.ər.əl/',
    example_en: 'Fame in the digital era can be remarkably ephemeral.',
    example_tr: 'Dijital çağda şöhret dikkat çekici derecede gelip geçici olabilir.',
    collocations: 'ephemeral nature, ephemeral pleasures',
    frequency_rank: 6800
  },
  {
    english: 'juxtaposition',
    turkish: 'yan yana koyma, tezat oluşturma',
    level: 'C2',
    category: 'academic',
    part_of_speech: 'noun',
    pronunciation: '/ˌdʒʌk.stə.pəˈzɪʃ.ən/',
    example_en: 'The dramatic juxtaposition of light and shadow created an intense mood.',
    example_tr: 'Işık ve gölgenin dramatik tezatlığı yoğun bir atmosfer yarattı.',
    collocations: 'striking juxtaposition, subtle juxtaposition',
    frequency_rank: 7200
  },
  {
    english: 'paradigm',
    turkish: 'model, paradigma, temel düşünce kalıbı',
    level: 'C2',
    category: 'technology',
    part_of_speech: 'noun',
    pronunciation: '/ˈpær.ə.daɪm/',
    example_en: 'Artificial intelligence represents a fundamental paradigm shift.',
    example_tr: 'Yapay zeka temel bir paradigma değişimini temsil ediyor.',
    collocations: 'paradigm shift, dominant paradigm',
    frequency_rank: 5100
  },
  {
    english: 'obfuscate',
    turkish: 'zihnini bulandırmak, kasten karmaşıklaştırmak',
    level: 'C2',
    category: 'academic',
    part_of_speech: 'verb',
    pronunciation: '/ˈɒb.fʌs.keɪt/',
    example_en: 'The politician tried to obfuscate the real issues during the debate.',
    example_tr: 'Politikacı münazara sırasında asıl meseleleri kasten karmaşıklaştırmaya çalıştı.',
    collocations: 'obfuscate the truth, deliberately obfuscate',
    frequency_rank: 8100
  },
  {
    english: 'serendipity',
    turkish: 'tesadüfen gelen hoş keşif, mutlu talih',
    level: 'C2',
    category: 'literature',
    part_of_speech: 'noun',
    pronunciation: '/ˌser.ənˈdɪp.ə.ti/',
    example_en: 'Finding that rare antique book was pure serendipity.',
    example_tr: 'O nadir antika kitabı bulmak tamamen mutlu bir tesadüftü.',
    collocations: 'pure serendipity, serendipity moment',
    frequency_rank: 7500
  },
  {
    english: 'quintessential',
    turkish: 'en mükemmel örneği olan, özü teşkil eden',
    level: 'C2',
    category: 'literature',
    part_of_speech: 'adjective',
    pronunciation: '/ˌkwɪn.tɪˈsen.ʃəl/',
    example_en: 'Afternoon tea is considered the quintessential British tradition.',
    example_tr: 'İkindi çayı İngiliz geleneğinin en mükemmel timsali kabul edilir.',
    collocations: 'quintessential example, quintessential style',
    frequency_rank: 6900
  }
];
