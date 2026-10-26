const fs = require('fs');
const path = require('path');

const additionalReadings = [
  // ================= 11. AESOP'S FABLES (A1 - KLASİK ÇOCUK FABLLARI) =================
  {
    title: "Aesop's Fables: The Ant & The Lion",
    category: 'books',
    level: 'A1',
    source: "Aesop's Fables - Ancient Children's Classics",
    image_url: 'https://images.unsplash.com/photo-1574063413132-355dbfd83e25?w=800',
    vocabulary_highlights: ['grasshopper', 'winter', 'grain', 'hunter', 'mouse', 'rope', 'gnaw', 'gratitude'],
    content: `STORY ONE: THE ANT AND THE GRASSHOPPER

On a warm summer day, a happy Grasshopper was hopping about in a sunny field, chirping and singing to his heart's content. An Ant walked past, carrying a heavy ear of corn to his nest.

"Why not come and sing with me," said the Grasshopper, "instead of toiling and moiling in that way?"

"I am helping to lay up food for the winter," replied the hardworking Ant, "and I recommend you do the same."

"Why bother about winter?" asked the Grasshopper. "We have plenty of food at present, and the sun is shining so bright."

The Ant shook his head and went on his way, continuing his hard work.

When the cold winter came, the snow covered the ground and the bitter wind blew. The Grasshopper found himself freezing and dying of hunger, while he saw the ants distributing corn and grain every day from the stores they had collected in the summer.

Then the Grasshopper knew: It is best to prepare for the days of need.

STORY TWO: THE LION AND THE MOUSE

A great Lion was fast asleep in the afternoon shade when a playful little Mouse ran across his nose. The king of beasts woke up with an angry roar, laid his huge paw upon the tiny creature, and opened his jaws to swallow him.

"Pardon, O King!" cried the little Mouse. "Forgive me this time, and I shall never forget it! Who knows? Perhaps I may be able to do you a good turn one of these days."

The Lion laughed aloud at the idea of a tiny mouse helping the king of beasts, but being good-natured, he lifted his paw and let him go.

A few days later, the Lion was caught in a hunter's net in the forest. Unable to free himself, he filled the forest with his mighty roars.

The little Mouse recognized the voice and ran to the spot. Finding the great beast tied up, the mouse set to work with his sharp teeth and gnawed through the thick ropes until the Lion was completely free.

"Was I not right?" whispered the little Mouse proudly. "Even a tiny mouse can help a mighty lion."

Little friends may prove to be great friends.`,
    sentences: [
      { en: "A Grasshopper was singing in the field while an Ant carried food for the winter.", tr: "Bir Çekirge tarlada şarkı söylerken, bir Karınca kış için yiyecek taşıyordu." },
      { en: "'Why not sing with me instead of working so hard?' asked the Grasshopper.", tr: "'Bu kadar çok çalışmak yerine neden gelip benimle şarkı söylemiyorsun?' diye sordu Çekirge." },
      { en: "When winter came, the Grasshopper had no food and was freezing in the snow.", tr: "Kış geldiğinde Çekirgenin hiç yiyeceği yoktu ve karda donuyordu." },
      { en: "The Grasshopper learned that it is always best to prepare for the days of need.", tr: "Çekirge, ihtiyaç duyulacak günler için önceden hazırlık yapmanın en doğrusu olduğunu anladı." },
      { en: "A playful Mouse ran over a sleeping Lion's nose, and the angry Lion caught him.", tr: "Oyuncu bir Fare uyuyan Aslanın burnunun üzerinden koştu ve öfkeli Aslan onu yakaladı." },
      { en: "'Forgive me, O King, and perhaps one day I can help you,' begged the Mouse.", tr: "'Beni bağışla ey Kral, belki bir gün ben de sana yardım edebilirim,' diye yalvardı Fare." },
      { en: "The Lion laughed at the idea, but kindly lifted his paw and set the mouse free.", tr: "Aslan bu fikre güldü ama iyi niyetle pençesini kaldırıp fareyi serbest bıraktı." },
      { en: "Days later, the Lion was trapped in a hunter's net and roared for help.", tr: "Günler sonra Aslan bir avcı ağına yakalandı ve yardım için kükredi." },
      { en: "The little Mouse heard his roar and gnawed through the ropes with his sharp teeth.", tr: "Küçük Fare kükremeyi duydu ve keskin dişleriyle ipleri kemirerek Aslanı kurtardı." },
      { en: "The Lion learned that even a tiny friend can prove to be a great help.", tr: "Aslan, minik bir dostun bile çok büyük bir yardımı dokunabileceğini öğrendi." }
    ]
  },

  // ================= 12. CINDERELLA (A2 - ÇOCUK MASALI / TAM HİKAYE) =================
  {
    title: 'Cinderella and the Glass Slipper',
    category: 'books',
    level: 'A2',
    source: 'Classic Fairy Tales - Charles Perrault',
    image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
    vocabulary_highlights: ['stepmother', 'fireplace', 'palace', 'godmother', 'pumpkin', 'slipper', 'midnight', 'prince'],
    content: `Once upon a time, there was a kind and gentle young girl named Cinderella. After her father passed away, she was forced to live with her cruel stepmother and two selfish stepsisters. They treated her like a servant, making her clean the whole house from morning till night, wash all the heavy dishes, and sleep near the dusty chimney ashes. Yet Cinderella never complained.

One day, a golden royal proclamation arrived at the door. The King was throwing an enormous grand ball at the royal palace so that his son, the young Prince, could choose a bride! Every young lady in the kingdom was cordially invited.

The two stepsisters screamed with joy. For days, they ordered Cinderella to iron their silk dresses, curl their hair, and polish their shoes.

"May I come to the ball too?" Cinderella asked timidly.

The stepsisters burst into harsh laughter. "You? Go to the royal palace in those dirty rags? The guards would throw you straight into the dungeon!"

When evening came, the stepmother and sisters drove off in their fine carriage, leaving poor Cinderella weeping softly by the fireplace.

Suddenly, a warm, sparkling light filled the room, and an elderly woman with silver hair and a glittering wand appeared.

"Do not weep, my child," she said with a soothing smile. "I am your Fairy Godmother, and you shall indeed go to the ball!"

The Fairy Godmother touched a large round pumpkin in the garden, and it instantly transformed into a magnificent gilded carriage. She touched six mice, and they turned into six handsome white horses. Finally, she touched Cinderella's worn apron with her wand. In an instant, Cinderella was dressed in an exquisite gown of shimmering blue silk, and upon her delicate feet were two sparkling slippers made of pure glass!

"Go and dance with joy," said the Fairy Godmother. "But heed my solemn warning: you must leave the palace before the clock strikes midnight. At the twelfth stroke, the magic will vanish, your carriage will become a pumpkin again, and your gown will turn back into rags!"

Cinderella promised to remember, and the carriage swept her away to the palace.

When Cinderella entered the ballroom, a hush fell over the crowd. The music stopped, and everyone marvelled at her grace and beauty. The Prince immediately walked up to her, bowed low, and asked her to dance. They danced together all evening, and the Prince could look at no one else.

Cinderella was so happy that she completely forgot the time. Suddenly, the great palace clock began to strike twelve!"Dong! Dong!"

Remembering the warning, Cinderella gasped and fled from the ballroom. She rushed down the grand marble staircase as fast as she could. In her hurry, one of her glass slippers slipped off her foot and remained behind on the step.

The Prince ran after her, but she had vanished into the darkness. He found only the tiny glass slipper upon the cold marble.

The next morning, the Prince announced that he would marry the maiden whose foot fit the delicate slipper. The royal heralds traveled from house to house, trying the slipper on every lady. At Cinderella's cottage, both stepsisters pushed and squeezed their large feet with all their might, but the slipper was far too small.

"Is there no other maiden in this house?" asked the royal messenger.

"Only a little cinder-girl who works in the kitchen," said the stepmother dismissively.

"The Prince commanded that every maiden must try," insisted the messenger.

Cinderella washed her hands, stepped forward, and sat down. She slipped her foot into the glass slipper, and it fitted her perfectly, like a glove! She then pulled the matching glass slipper from her apron pocket.

The stepsisters gasped in astonishment and fell to their knees to beg for forgiveness. Cinderella, who was as kind as she was beautiful, forgave them with all her heart.

The Prince was overjoyed to find his true love, and Cinderella was escorted to the royal palace in honor. They were married in a grand celebration and lived in peace, kindness, and happiness ever after.`,
    sentences: [
      { en: "Cinderella was forced to work as a servant by her cruel stepmother and sisters.", tr: "Külkedisi, zalim üvey annesi ve kız kardeşleri tarafından hizmetçi gibi çalıştırılmaya zorlanıyordu." },
      { en: "The King invited every maiden in the kingdom to a grand ball at the royal palace.", tr: "Kral, krallıktaki tüm genç kızları saraydaki görkemli baloya davet etti." },
      { en: "Her Fairy Godmother appeared and turned a pumpkin into a golden carriage.", tr: "İyilik Perisi ortaya çıktı ve bir balkabağını altın bir faytona dönüştürdü." },
      { en: "'You must leave before midnight, for at the twelfth stroke the magic will end!'", tr: "'Gece yarısından önce ayrılmalısın, çünkü saat on ikiyi vurduğunda büyü sona erecek!'" },
      { en: "The Prince fell in love with Cinderella and danced with her all evening.", tr: "Prens, Külkedisi'ne aşık oldu ve bütün akşam sadece onunla dans etti." },
      { en: "As the clock struck midnight, Cinderella fled and lost one glass slipper on the stairs.", tr: "Saat gece yarısını çalarken Külkedisi kaçtı ve merdivenlerde cam ayakkabısının tekini düşürdü." },
      { en: "The royal messenger tried the slipper on every maiden in the kingdom.", tr: "Saray ulakları ayakkabıyı krallıktaki her genç kıza tek tek denetti." },
      { en: "The slipper fitted Cinderella perfectly, and the Prince married her with great joy.", tr: "Ayakkabı Külkedisi'nin ayağına kusursuzca uydu ve Prens büyük bir sevinçle onunla evlendi." }
    ]
  },

  // ================= 13. PINOCCHIO (A2 - ÇOCUK KLASİĞİ / CARLO COLLODI) =================
  {
    title: 'The Adventures of Pinocchio',
    category: 'books',
    level: 'A2',
    source: 'The Adventures of Pinocchio (1883) - Carlo Collodi',
    image_url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800',
    vocabulary_highlights: ['puppet', 'carpenter', 'carve', 'mischievous', 'cricket', 'conscience', 'schoolbook', 'truth'],
    content: `Once upon a time, in a small Italian village, an old and lonely carpenter named Geppetto received a piece of wood.

"I will carve myself a wooden puppet," Geppetto said to himself. "I will call him Pinocchio, and he will be like a son to me."

Geppetto took his sharp chisels and set to work. As soon as he carved the eyes, the wooden eyes began to blink! When he carved the mouth, the mouth started to laugh and make funny faces! And when Geppetto finished the wooden legs, the puppet jumped off the workbench and ran right out the front door into the cobblestone street!

"Come back, Pinocchio!" shouted the old man, chasing after him with all his breath.

Pinocchio was very mischievous, but Geppetto loved him deeply. The good old man sold his only warm winter coat so that he could buy an alphabet book for Pinocchio to go to school and learn like a real boy.

The next morning, Pinocchio set off for school holding his new spelling book under his arm. But on the way, he heard lively music and saw a colorful puppet theater. Instead of going to class, the foolish puppet sold his spelling book to buy a ticket to the show!

While sitting in the theater, a wise little Talking Cricket appeared on his shoulder.

"Pinocchio!" warned the Cricket in a squeaky voice. "Listen to your conscience! Go to school, obey your father, and tell the truth. If you do not, great troubles will follow you!"

"Be quiet, annoying insect!" cried Pinocchio, waving the cricket away.

Soon, Pinocchio met a sly Fox and a limping Cat. They told him that if he planted his few coins in the magical Field of Miracles, a golden tree full of money would grow overnight. Pinocchio believed their lies, and while he was sleeping under a tree, the thieves stole all his money!

Cold and weeping in the forest, Pinocchio was rescued by a beautiful Blue Fairy with azure hair.

"Where is your schoolbook, Pinocchio?" the Fairy asked gently.

"I... I lost it at school," lied Pinocchio.

Suddenly, his wooden nose began to grow longer by two inches!

"And where are the four gold coins your father gave you?" asked the Fairy.

"I swallowed them while drinking water," lied Pinocchio again.

Immediately, his nose grew so long that he could not even turn his head without bumping into the walls!

"Why are you laughing at me?" asked the frightened puppet, crying bitter tears.

"I am not laughing at you, my dear boy," replied the Fairy kindly. "I am laughing at the lies you tell. Lies, my dear Pinocchio, are easily recognized. There are two kinds of lies: lies with short legs, and lies with long noses. Yours happen to have very long noses!"

Pinocchio was so ashamed that he begged for forgiveness and promised never to lie again. The Fairy touched his nose with her wand, and it shrank back to its normal size.

After many more dangerous adventures?including turning into a donkey on the Island of Toys and being swallowed by a giant dogfish in the deep ocean?Pinocchio finally rescued his dear father Geppetto from inside the fish's belly. He worked hard every day to care for the old carpenter, study his lessons, and tell the truth.

One morning, Pinocchio woke up, looked into the mirror, and gasped with joy. He was no longer a wooden puppet tied with strings?he had become a real, living, flesh-and-blood boy!`,
    sentences: [
      { en: "An old Italian carpenter named Geppetto carved a wooden puppet and named him Pinocchio.", tr: "Geppetto adındaki yaşlı bir İtalyan marangoz ahşap bir kukla oydu ve ona Pinokyo adını verdi." },
      { en: "Geppetto sold his only winter coat to buy a spelling schoolbook for Pinocchio.", tr: "Geppetto, Pinokyo'ya bir alfabe okul kitabı alabilmek için tek kışlık paltosunu sattı." },
      { en: "The wise Talking Cricket warned him to listen to his conscience and tell the truth.", tr: "Bilge Konuşan Kriket, ona vicdanını dinlemesini ve doğruyu söylemesini tembihledi." },
      { en: "Whenever Pinocchio told a lie to the Blue Fairy, his wooden nose grew longer and longer!", tr: "Pinokyo Mavi Peri'ye her yalan söylediğinde, tahta burnu uzadıkça uzadı!" },
      { en: "'There are two kinds of lies: lies with short legs, and lies with long noses.'", tr: "'İki tür yalan vardır: kısa bacaklı yalanlar ve uzun burunlu yalanlar.'" },
      { en: "Pinocchio rescued his father Geppetto from the belly of a giant sea fish.", tr: "Pinokyo, babası Geppetto'yu devasa bir deniz balığının karnından kurtardı." },
      { en: "Because he learned honesty and love, Pinocchio turned into a real living boy!", tr: "Dürüstlüğü ve sevgiyi öğrendiği için Pinokyo sonunda gerçek, yaşayan bir erkek çocuğuna dönüştü!" }
    ]
  },

  // ================= 14. SHOPPING FOR CLOTHES (A2 - GÜNLÜK MAĞAZA DİYALOĞU) =================
  {
    title: 'Shopping for Clothes & Shoes at the Mall',
    category: 'daily_dialogues',
    level: 'A2',
    source: 'Real Life English Dialogues - Shopping Scenarios',
    image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
    vocabulary_highlights: ['fitting room', 'discount', 'size', 'receipt', 'jacket', 'exchange', 'cotton', 'refund'],
    content: `CLERK: Hello! Welcome to Urban Style. Let me know if you need help finding anything today.

MARK: Hi there! Thank you. I am looking for a warm, casual jacket for the autumn weather.

CLERK: We have a great collection over on this rack. This navy blue bomber jacket is very popular right now. It is made of water-resistant cotton with a warm inner lining.

MARK: That looks very sharp! Do you have this jacket in a medium?

CLERK: Let me check the rack for you... Yes, here is a medium in navy blue, and we also have it in olive green.

MARK: I really like the navy blue. Where are your fitting rooms located?

CLERK: The fitting rooms are straight in the back, just to the left of the mirrors. Go right ahead and try it on!

(A few minutes later...)

CLERK: How did it fit?

MARK: The shoulders fit comfortably, but the sleeves feel just a tiny bit short when I raise my arms. Do you think I should try a large?

CLERK: Let's grab the large and compare. Here you go, try this one on.

MARK: Wow, the large fits much better! It gives me room to wear a warm sweater underneath during colder days. How much is this jacket?

CLERK: The original price is eighty dollars, but all outerwear is currently twenty percent off this weekend. So it comes to sixty-four dollars before tax.

MARK: That is a very reasonable discount! I will definitely take it. Also, what is your exchange and return policy just in case?

CLERK: You have thirty days to return or exchange any item with the original receipt and tags attached. We provide a full refund to your card.

MARK: Excellent. I would also like to buy these two pairs of black cotton socks near the register.

CLERK: Perfect. Your total comes to seventy-two dollars and fifty cents. Will you be paying with cash or card today?

MARK: Card, please.

CLERK: Great, please tap or insert your card whenever you are ready. Here is your receipt in the bag. Thank you for shopping with us, and enjoy your new jacket!

MARK: Thank you so much for your help! Have a great weekend!`,
    sentences: [
      { en: "I am looking for a warm, casual jacket for the autumn weather.", tr: "Sonbahar havası için sıcak ve rahat bir ceket arıyorum." },
      { en: "Do you have this jacket in a medium? The fitting rooms are straight in the back.", tr: "Bu ceketin medium bedeni var mı? Deneme kabinleri hemen arkada yer alıyor." },
      { en: "The large fits much better and gives me room to wear a sweater underneath.", tr: "Large beden çok daha iyi oldu ve içine kazak giymek için bana alan sağlıyor." },
      { en: "All outerwear is currently twenty percent off this weekend.", tr: "Bu hafta sonu tüm dış giyim ürünlerinde yüzde yirmi indirim var." },
      { en: "What is your return policy? You have thirty days with the original receipt.", tr: "İade politikanız nedir? Orijinal fiş ile birlikte otuz gün süreniz var." },
      { en: "Will you be paying with cash or card today? Card, please.", tr: "Bugün nakit mi yoksa kartla mı ödeyeceksiniz? Kart lütfen." }
    ]
  },

  // ================= 15. AT THE DOCTOR'S CLINIC (B1 - GÜNLÜK SAĞLIK DİYALOĞU) =================
  {
    title: "Visiting the Doctor's Clinic & Describing Symptoms",
    category: 'daily_dialogues',
    level: 'B1',
    source: 'Medical & Healthcare English Dialogues',
    image_url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800',
    vocabulary_highlights: ['symptoms', 'fever', 'headache', 'prescription', 'pharmacy', 'examination', 'allergic', 'dosage'],
    content: `DOCTOR: Good morning, Mr. Davis. Please have a seat. What brings you into the clinic today?

JASON: Good morning, Dr. Evans. I haven't been feeling well for the past three days. I have a severe sore throat, a persistent dry cough, and I have been running a mild fever since Tuesday evening.

DOCTOR: I'm sorry to hear that. Have you measured your temperature at home?

JASON: Yes, it was around thirty-eight point two degrees Celsius yesterday afternoon. I took two paracetamol tablets, which brought the fever down temporarily, but it returned during the night along with chills and a headache.

DOCTOR: Are you experiencing any shortness of breath, chest congestion, or body aches?

JASON: No shortness of breath, but my entire body feels exhausted and fatigued, especially my shoulders and lower back. Swallowing anything?even water?feels quite painful.

DOCTOR: Let's do a quick physical examination. Please open your mouth wide and say "Ahhh" so I can examine your throat and tonsils.

JASON: Ahhh...

DOCTOR: Your throat is indeed quite inflamed and reddened, and your tonsils are slightly swollen. Now, let me listen to your lungs with the stethoscope. Please take a deep breath in through your mouth... and exhale slowly... Once more, please.

JASON: (Breathes deeply and exhales)

DOCTOR: Good news: your lungs sound completely clear. There is no wheezing or deep chest congestion, which indicates this is an upper respiratory viral infection rather than bacterial pneumonia or bronchitis.

JASON: That is a relief. Do I need antibiotics?

DOCTOR: Since this is a viral pharyngitis, antibiotics would not be effective and could cause unnecessary side effects. Instead, I am going to prescribe a targeted throat-soothing spray with an anti-inflammatory agent, and an effervescent pain reliever to take every eight hours after meals.

JASON: That sounds very sensible. Are there any dietary or lifestyle precautions I should take?

DOCTOR: Absolutely. Drink plenty of warm fluids?herbal teas with honey and lemon work wonders. Rest as much as possible for the next forty-eight hours, and gargle with warm salt water three times a day to reduce throat swelling.

JASON: Should I stay home from work?

DOCTOR: Yes, I am writing you a medical note for three days of sick leave. If your fever persists above thirty-eight point five for more than two more days, or if you develop difficulty breathing, please call our clinic immediately for a follow-up.

JASON: Thank you so much, Dr. Evans. Where can I pick up the prescribed medication?

DOCTOR: There is a full-service pharmacy right on the ground floor next to the clinic entrance. They have everything in stock right now. Take care and get plenty of rest!`,
    sentences: [
      { en: "What brings you into the clinic today? I have had a severe sore throat and fever.", tr: "Bugün sizi kliniğimize getiren şikayet nedir? Üç gündür şiddetli boğaz ağrım ve ateşim var." },
      { en: "I took paracetamol, which brought the fever down temporarily, but it returned with chills.", tr: "Parasetamol aldım, ateşi geçici olarak düşürdü ama titremeyle birlikte geri geldi." },
      { en: "Your throat is quite inflamed, but your lungs sound completely clear.", tr: "Boğazınız oldukça iltihaplı ancak akciğerleriniz tamamen temiz duyuluyor." },
      { en: "Since this is a viral infection, antibiotics would not be effective.", tr: "Bu viral bir enfeksiyon olduğu için antibiyotikler etkili olmayacaktır." },
      { en: "I am prescribing an anti-inflammatory throat spray and a pain reliever for you.", tr: "Sizin için iltihap giderici bir boğaz spreyi ve bir ağrı kesici reçete ediyorum." },
      { en: "Drink plenty of warm herbal tea with honey and rest at home for three days.", tr: "Ballı ılık bitki çayları için ve üç gün boyunca evde dinlenin." }
    ]
  },

  // ================= 16. THE MATRIX: RED PILL OR BLUE PILL (B1 - FİLM DİYALOĞU) =================
  {
    title: 'The Matrix - The Red Pill or The Blue Pill',
    category: 'movies',
    level: 'B1',
    source: 'The Matrix (1999) - Directed by The Wachowskis',
    image_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
    vocabulary_highlights: ['prison', 'inevitable', 'illusion', 'unplugged', 'bondage', 'splinter', 'choice'],
    content: `MORPHEUS: Let me tell you why you are here. You are here because you know something. What you know you cannot explain, but you feel it. You have felt it your entire life?that there is something wrong with the world. You do not know what it is, but it is there, like a splinter in your mind, driving you mad. It is this feeling that has brought you to me. Do you know what I am talking about?

NEO: The Matrix?

MORPHEUS: Do you want to know what it is? The Matrix is everywhere. It is all around us. Even now, in this very room. You can see it when you look out your window or when you turn on your television. You can feel it when you go to work, when you go to church, when you pay your taxes. It is the world that has been pulled over your eyes to blind you from the truth.

NEO: What truth?

MORPHEUS: That you are a slave, Neo. Like everyone else you were born into bondage. Born into a prison that you cannot smell or taste or touch. A prison for your mind. Unfortunately, no one can be told what the Matrix is. You have to see it for yourself.

This is your last chance. After this, there is no turning back. You take the blue pill?the story ends, you wake up in your bed and believe whatever you want to believe. You take the red pill?you stay in Wonderland, and I show you how deep the rabbit hole goes. Remember: all I am offering is the truth. Nothing more.`,
    sentences: [
      { en: "Let me tell you why you are here: you have felt that there is something wrong with the world.", tr: "Neden burada olduğunu sana söyleyeyim: dünyada ters giden bir şeyler olduğunu hissettin." },
      { en: "It is like a splinter in your mind, driving you mad.", tr: "Zihninde bir kıymık gibi duruyor, seni deliye döndürüyor." },
      { en: "The Matrix is everywhere. It is the world that has been pulled over your eyes to blind you from the truth.", tr: "Matrix her yerdedir. Gerçekleri görmeni engellemek için gözlerinin önüne çekilmiş bir dünyadır." },
      { en: "You take the blue pill?the story ends, you wake up in your bed and believe whatever you want to believe.", tr: "Mavi hapı alırsan hikaye biter, yatağında uyanır ve neye inanmak istiyorsan ona inanırsın." },
      { en: "You take the red pill?you stay in Wonderland, and I show you how deep the rabbit hole goes.", tr: "Kırmızı hapı alırsan Harikalar Diyarı'nda kalırsın ve tavşan deliğinin ne kadar derine indiğini sana gösteririm." },
      { en: "Remember: all I am offering is the truth. Nothing more.", tr: "Unutma: Sana sunduğum tek şey gerçek. Fazlası değil." }
    ]
  }
];

// Read existing seedReadings.ts and append new items
const targetPath = path.join(__dirname, '../src/data/seedReadings.ts');
let existing = [];
try {
  const content = fs.readFileSync(targetPath, 'utf8');
  // Extract JSON array
  const jsonMatch = content.match(/INITIAL_READINGS:\s*Omit<ReadingMaterial,\s*'id'>\[\]\s*=\s*(\[[\s\S]*\]);/);
  if (jsonMatch) {
    existing = JSON.parse(jsonMatch[1]);
  }
} catch (e) {
  console.log('Error parsing existing:', e);
}

// Merge by title
const titleMap = new Map();
existing.forEach(item => titleMap.set(item.title, item));
additionalReadings.forEach(item => titleMap.set(item.title, item));

const merged = Array.from(titleMap.values());

const outputCode = `import { ReadingMaterial } from '../types';

export const INITIAL_READINGS: Omit<ReadingMaterial, 'id'>[] = ${JSON.stringify(merged, null, 2)};
`;

fs.writeFileSync(targetPath, outputCode, 'utf8');
console.log('Successfully written', merged.length, 'rich, complete readings to seedReadings.ts in UTF-8!');
