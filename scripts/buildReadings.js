const fs = require('fs');
const path = require('path');

const readings = [
  // ================= 1. GOLDILOCKS AND THE THREE BEARS (A1 - TAM MASAL) =================
  {
    title: 'Goldilocks and the Three Bears',
    category: 'books',
    level: 'A1',
    source: 'English Fairy Tale Classic - Robert Southey',
    image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800',
    vocabulary_highlights: ['porridge', 'forest', 'bowl', 'chair', 'asleep', 'taste', 'soft', 'hard'],
    content: `Once upon a time, there were three bears who lived in a cozy house in the middle of a green forest. There was a Great Big Papa Bear, a Middle-sized Mama Bear, and a Little Wee Baby Bear.

One sunny morning, Mama Bear made delicious warm porridge for breakfast. She poured it into three bowls: a big bowl for Papa Bear, a middle-sized bowl for Mama Bear, and a tiny little bowl for Baby Bear.

"The porridge is too hot to eat right now," said Papa Bear with his deep voice. "Let us take a walk in the forest while it cools down."

"That is a wonderful idea," agreed Mama Bear. So the three bears went for a peaceful walk in the woods.

While they were walking, a curious little girl named Goldilocks came to their cottage. She saw the door was open, and she peeked inside. Seeing nobody in the house, she walked right in.

On the dining table, she saw three steaming bowls of porridge. Goldilocks was very hungry from her long walk. First, she tasted the porridge in the great big bowl. "Ouch! This porridge is much too hot!" she cried.

Next, she tasted the porridge from the middle-sized bowl. "Ugh! This porridge is much too cold!" she complained.

Finally, she tasted the porridge in the tiny little bowl. "Mmm! This porridge is just right!" she smiled happily, and she ate it all up until the bowl was completely empty.

After eating, Goldilocks felt tired. She walked into the living room and saw three chairs. First, she sat in the great big chair. "This chair is much too hard!" she said. Next, she sat in the middle-sized chair. "This chair is much too soft!" she sighed. Then, she tried the tiny little chair. "This chair is just right!" she cheered. But as she sat down, the little chair broke into pieces with a loud crash!

Goldilocks was now very sleepy. She went upstairs to the bedroom. First, she lay down on the great big bed, but it was too hard at the head. Then, she lay on the middle-sized bed, but it was too soft at the feet. Finally, she lay down on the tiny little bed. It was just right, so she closed her eyes and fell fast asleep.

Soon, the three bears returned home from their walk, feeling hungry.

Papa Bear looked at his bowl on the table. "Somebody has been tasting my porridge!" he roared in his great big voice.

"Somebody has been tasting my porridge too!" gasped Mama Bear in her middle-sized voice.

Little Baby Bear looked into his tiny bowl and started to cry. "Somebody has been eating my porridge, and they have eaten it all up!"

Then the three bears walked into the living room.

"Somebody has been sitting in my chair!" growled Papa Bear.

"Somebody has been sitting in my chair too!" said Mama Bear.

"Somebody has been sitting in my chair, and they have broken it all to pieces!" sobbed Baby Bear.

The bears walked quietly upstairs into the bedroom.

"Somebody has been lying in my bed!" whispered Papa Bear.

"Somebody has been lying in my bed too!" whispered Mama Bear.

"Somebody has been lying in my bed, and look?"she is still there!" shouted Baby Bear.

Just then, Goldilocks woke up and saw the three bears looking at her. She screamed in fright, jumped out of bed, and leaped out of the low window. She ran into the forest as fast as her legs could carry her, and she never returned to the home of the three bears again.`,
    sentences: [
      { en: "Once upon a time, there were three bears who lived in a cozy house in the middle of a green forest.", tr: "Bir varmış bir yokmuş, yeşil bir ormanın ortasındaki sıcak bir evde yaşayan üç ayı varmış." },
      { en: "There was a Great Big Papa Bear, a Middle-sized Mama Bear, and a Little Wee Baby Bear.", tr: "Büyük bir Baba Ayı, orta boy bir Anne Ayı ve küçücük bir Bebek Ayı varmış." },
      { en: "One sunny morning, Mama Bear made delicious warm porridge for breakfast.", tr: "Güneşli bir sabah, Anne Ayı kahvaltı için nefis ılık bir yulaf lapası hazırlamış." },
      { en: "The porridge is too hot to eat right now, so let us take a walk in the forest while it cools down.", tr: "Lapa şu an yemek için çok sıcak, o yüzden soğurken ormanda biraz yürüyüş yapalım." },
      { en: "While they were walking, a curious little girl named Goldilocks came to their cottage.", tr: "Onlar yürürken, Goldilocks adında meraklı küçük bir kız kulübelerine gelmiş." },
      { en: "First, she tasted the porridge in the great big bowl: 'This porridge is much too hot!'", tr: "Önce büyük kasedeki lapayı tatmış: 'Bu lapa çok fazla sıcak!'" },
      { en: "Finally, she tasted the porridge in the tiny little bowl: 'This porridge is just right!' and she ate it all up.", tr: "Sonunda minik kasedeki lapayı tatmış: 'Bu lapa tam kıvamında!' diyerek hepsini silip süpürmüş." },
      { en: "She tried the tiny little chair, but as she sat down, the chair broke into pieces!", tr: "Minik sandalyeyi denemiş ama oturur oturmaz sandalye tuzla buz olmuş!" },
      { en: "She lay down on the tiny little bed; it was just right, and she fell fast asleep.", tr: "Küçük yatağa uzanmış; tam istediği gibiymiş ve hemen derin bir uykuya dalmış." },
      { en: "Soon, the three bears returned home from their walk, feeling hungry.", tr: "Çok geçmeden üç ayı acıkmış bir halde yürüyüşten eve dönmüşler." },
      { en: "'Somebody has been eating my porridge, and they have eaten it all up!' cried Baby Bear.", tr: "'Biri benim lapamı yemiş ve hepsini bitirmiş!' diye ağlamış Bebek Ayı." },
      { en: "'Somebody has been lying in my bed, and look?she is still there!' shouted Baby Bear.", tr: "'Biri benim yatağımda yatmış ve bakın, hala orada!' diye bağırmış Bebek Ayı." },
      { en: "Goldilocks woke up, saw the three bears, screamed in fright, and jumped out of the window.", tr: "Goldilocks uyanmış, üç ayıyı görmüş, korkuyla çığlık atıp pencereden dışarı fırlamış." },
      { en: "She ran into the forest as fast as she could, and she never returned again.", tr: "Bacaklarının taşıyabildiği kadar hızlı ormana doğru koşmuş ve bir daha asla geri dönmemiş." }
    ]
  },

  // ================= 2. THE THREE LITTLE PIGS (A1 - TAM MASAL) =================
  {
    title: 'The Three Little Pigs',
    category: 'books',
    level: 'A1',
    source: 'English Folk Tale Classic - Joseph Jacobs',
    image_url: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800',
    vocabulary_highlights: ['straw', 'sticks', 'brick', 'blow', 'huff', 'puff', 'chimney', 'safe'],
    content: `Once upon a time, there were three little pigs who left their mother's home to seek their fortunes in the big world.

"Be careful of the Big Bad Wolf," their mother warned them before they left. "Build your houses strong, so you will always be safe."

The first little pig was very lazy. He did not want to work hard under the sun. He met a man selling straw and decided to build his house out of straw. It was very quick and easy. In just two hours, his little house was finished, and he danced and played happily.

The second little pig was a little less lazy, but he still preferred playing to working. He met a man carrying bundles of sticks. "I will build my house out of sticks," he said. It took him only one day to finish his wooden house. Now both pigs were playing happily outside.

The third little pig was clever and hardworking. He wanted a strong home that could protect him from the winter cold and danger. He met a builder with a cart of bricks. "Bricks will make a solid house," thought the pig. He worked diligently for many days, laying brick upon brick with cement until his sturdy house was complete.

The very next day, a hungry Big Bad Wolf came creeping through the forest. He knocked on the door of the straw house.

"Little pig, little pig, let me come in!" the wolf called out in a sweet voice.

The first pig peeked through the window and replied, "No, no, by the hair of my chinny chin chin, I will not let you in!"

"Then I'll huff, and I'll puff, and I'll blow your house down!" growled the wolf.

The wolf took a deep breath, huffed and puffed, and blew the flimsy straw house completely away! The terrified first pig ran as fast as his little trotters could carry him to his brother's house of sticks.

The wolf followed him and knocked on the wooden door.

"Little pigs, little pigs, let me come in!"

"No, no, by the hair of our chinny chin chins, we will not let you in!" answered the two pigs together.

"Then I'll huff, and I'll puff, and I'll blow your house down!"

The wolf huffed and puffed with all his might, and the house of sticks collapsed to the ground! Both frightened pigs ran with all their speed toward the third pig's brick house.

The third pig welcomed his brothers warmly and locked his heavy oak door securely. Soon, the wolf arrived at the brick house. He knocked loudly.

"Little pigs, little pigs, let me come in!"

"No, no, by the hair of our chinny chin chins, we will never let you in!" shouted all three pigs.

"Then I'll huff, and I'll puff, and I'll blow your house down!" roared the wolf furiously.

The wolf took an enormous breath. He huffed and he puffed! He puffed and he huffed! He blew until his face turned bright red, but the sturdy brick house did not move a single inch.

The wolf was furious. He climbed up onto the roof and decided to slide down the chimney to catch the pigs. But the clever third pig heard the wolf on the roof and quickly hung a large pot of boiling water over the blazing fireplace.

When the wolf slid down the chimney, splash! He fell right into the boiling water! The wolf let out a terrible howl of pain, jumped straight out of the chimney, and ran deep into the forest, never to trouble the three little pigs again.

The three pigs lived happily, safely, and peacefully in the brick house ever after.`,
    sentences: [
      { en: "Once upon a time, there were three little pigs who left their mother's home to build their own houses.", tr: "Bir varmış bir yokmuş, kendi evlerini yapmak için annelerinin evinden ayrılan üç küçük domuzcuk varmış." },
      { en: "The first little pig was lazy and built his house out of straw in just two hours.", tr: "İlk küçük domuzcuk tembelmiş ve evini sadece iki saat içinde samandan inşa etmiş." },
      { en: "The second little pig built his house out of sticks, taking only one day.", tr: "İkinci küçük domuzcuk evini tahtalardan yapmış ve bu sadece bir gün sürmüş." },
      { en: "The third little pig worked hard for days to build a strong, solid house out of bricks.", tr: "Üçüncü küçük domuzcuk ise tuğladan sağlam ve güçlü bir ev yapmak için günlerce çok çalışmış." },
      { en: "The Big Bad Wolf came to the straw house and said: 'Little pig, little pig, let me come in!'", tr: "Kötü Büyük Kurt saman eve gelmiş ve: 'Küçük domuzcuk, küçük domuzcuk, içeri girmeme izin ver!' demiş." },
      { en: "'No, no, by the hair of my chinny chin chin, I will not let you in!' replied the pig.", tr: "'Hayır, hayır, çenemdeki tüyler hakkı için seni içeri almayacağım!' diye cevap vermiş domuzcuk." },
      { en: "The wolf huffed and puffed, and blew the flimsy straw house completely down.", tr: "Kurt solumuş, üflemiş ve dayanıksız saman evi yerle bir etmiş." },
      { en: "The first pig ran to his brother's stick house, but the wolf blew that house down too.", tr: "İlk domuzcuk kardeşinin tahta evine kaçmış ama kurt o evi de üfleyip yıkmış." },
      { en: "Both pigs ran to the brick house, where their brother welcomed them and locked the door.", tr: "İki domuzcuk da kardeşlerinin onları içeri alıp kapıyı kilitlediği tuğla eve sığınmış." },
      { en: "The wolf huffed and puffed with all his strength, but the sturdy brick house did not move.", tr: "Kurt var gücüyle solumuş ve üflemiş ama sağlam tuğla ev yerinden bile oynamamış." },
      { en: "The wolf tried to climb down the chimney, but fell into a pot of boiling water.", tr: "Kurt bacadan aşağı inmeye çalışmış ama kaynayan bir kazan suyun içine düşmüş." },
      { en: "He howled in pain and ran away forever, and the three little pigs lived safely ever after.", tr: "Acıyla uluyarak bir daha dönmemek üzere kaçmış ve üç küçük domuzcuk sonsuza dek güvende yaşamış." }
    ]
  },

  // ================= 3. THE TALE OF PETER RABBIT (A2 - BEATRIX POTTER - TAM KLASİK) =================
  {
    title: 'The Tale of Peter Rabbit',
    category: 'books',
    level: 'A2',
    source: 'The Tale of Peter Rabbit (1902) - Beatrix Potter',
    image_url: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=800',
    vocabulary_highlights: ['mischief', 'garden', 'cucumbers', 'radishes', 'gate', 'chase', 'jacket', 'chamomile'],
    content: `Once upon a time there were four little Rabbits, and their names were?"Flopsy, Mopsy, Cotton-tail, and Peter. They lived with their mother in a sand-bank, underneath the root of a very big fir-tree.

"Now, my dears," said old Mrs. Rabbit one morning, "you may go into the fields or down the lane, but do not go into Mr. McGregor's garden: your father had an accident there; he was put in a pie by Mrs. McGregor."

"Now run along, and don't get into mischief. I am going out."

Then old Mrs. Rabbit took a basket and her umbrella, and went through the wood to the baker's. She bought a loaf of brown bread and five currant buns.

Flopsy, Mopsy, and Cotton-tail, who were good little bunnies, went down the lane to gather sweet blackberries.

But Peter, who was very naughty, ran straight away to Mr. McGregor's garden, and squeezed under the gate!

First he ate some lettuces and some French beans; and then he ate some radishes; and then, feeling rather sick, he went to look for some parsley to soothe his tummy.

But round the end of a cucumber frame, whom should he meet but Mr. McGregor!

Mr. McGregor was on his hands and knees planting out young cabbages, but he jumped up and ran after Peter, waving a rake and calling out, "Stop thief!"

Peter was most dreadfully frightened; he rushed all over the garden, for he had forgotten the way back to the gate. He lost one of his shoes among the cabbages, and the other shoe amongst the potatoes.

After losing them, he ran on four legs and went faster, so that I think he might have got away altogether if he had not unfortunately run into a gooseberry net, and got caught by the large buttons on his blue jacket. It was a brand-new jacket with brass buttons.

Peter gave himself up for lost, and shed big tears; but his sobs were overheard by some friendly sparrows, who flew to him in great excitement, and implored him to exert himself and escape.

Mr. McGregor came up with a sieve, which he intended to pop on the top of Peter; but Peter wriggled out just in time, leaving his blue jacket behind him.

He rushed into the tool-shed, and jumped into a watering-can. It would have been a beautiful thing to hide in, if it had not had so much cold water in it!

Mr. McGregor was quite sure that Peter was somewhere in the tool-shed, perhaps hidden underneath a flower-pot. He began to turn them over carefully, looking under each.

Presently Peter sneezed?"Kertyschoo!"

Mr. McGregor was after him in an instant, trying to put his foot upon Peter, who jumped out of a window, upsetting three plants. The window was too small for Mr. McGregor, and he was tired of running after Peter. He went back to his work.

Peter sat down to rest; he was out of breath and trembling with fright, and he had not the least idea which way to go. Also he was very damp with sitting in that can.

After a time he began to wander about, going lippity-lippity?"not very fast, and looking all round. He found a door in a wall; but it was locked, and there was no room for a fat little rabbit to squeeze underneath.

An old mouse was running in and out over the stone doorstep, carrying peas and beans to her family in the wood. Peter asked her the way to the gate, but she had such a large pea in her mouth that she could not answer. She only shook her head at him. Peter began to cry.

Then he tried to find his way straight across the garden, but he became more and more puzzled. Presently, he came to a pond where a white cat was staring at some goldfish; she sat very, very still, but now and then the tip of her tail twitched as if it were alive. Peter thought it best to go away without speaking to her; he had heard about cats from his cousin, Benjamin Bunny.

He went back towards the tool-shed, but suddenly, quite close to him, he heard the noise of a hoe?"scr-r-ritch, scratch, scratch, scritch. Peter scuttered underneath the bushes. But presently, as nothing happened, he came out, and climbed upon a wheelbarrow and peeped over. The first thing he saw was Mr. McGregor hoeing onions. His back was turned towards Peter, and beyond him was the gate!

Peter got down very quietly off the wheelbarrow, and started running as fast as he could go, along a straight walk behind some black-currant bushes.

Mr. McGregor caught sight of him at the corner, but Peter did not care. He slipped underneath the gate, and was safe at last in the wood outside the garden.

Mr. McGregor hung up the little jacket and the shoes for a scare-crow to frighten the blackbirds.

Peter never stopped running or looked behind him till he got home to the big fir-tree. He was so tired that he flopped down upon the nice soft sand on the floor of the rabbit-hole, and shut his eyes. His mother was busy cooking; she wondered what he had done with his clothes. It was the second little jacket and pair of shoes that Peter had lost in a fortnight!

I am sorry to say that Peter was not very well during the evening. His mother put him to bed, and made some chamomile tea, and she gave a dose of it to Peter: "One table-spoonful to be taken at bedtime."

But Flopsy, Mopsy, and Cotton-tail had bread and milk and blackberries for supper.`,
    sentences: [
      { en: "Flopsy, Mopsy, Cotton-tail, and Peter lived with their mother underneath the root of a big fir-tree.", tr: "Flopsy, Mopsy, Cotton-tail ve Peter, anneleriyle birlikte büyük bir köknar ağacının kökleri altında yaşıyorlardı." },
      { en: "'You may go into the fields, but do not go into Mr. McGregor's garden,' warned Mrs. Rabbit.", tr: "'Tarlalara gidebilirsiniz ama Bay McGregor'un bahçesine sakın girmeyin,' diye uyardı Bayan Tavşan." },
      { en: "Flopsy, Mopsy, and Cotton-tail went down the lane to gather sweet blackberries.", tr: "Flopsy, Mopsy ve Cotton-tail tatlı böğürtlenler toplamak için patikaya gittiler." },
      { en: "Peter, who was very naughty, ran straight away and squeezed under Mr. McGregor's garden gate.", tr: "Çok yaramaz olan Peter ise hemen koşup Bay McGregor'un bahçe kapısının altından süzüldü." },
      { en: "First he ate some lettuces and radishes, but soon he met Mr. McGregor face to face!", tr: "Önce biraz marul ve turp yedi, ama çok geçmeden Bay McGregor ile yüz yüze geldi!" },
      { en: "Mr. McGregor jumped up, waved his rake and shouted: 'Stop thief!'", tr: "Bay McGregor ayağa fırladı, tırmığını salladı ve bağırdı: 'Dur hırsız!'" },
      { en: "Peter lost his shoes and his brand-new blue jacket while running away in panic.", tr: "Peter panik içinde kaçarken ayakkabılarını ve yepyeni mavi ceketini kaybetti." },
      { en: "He jumped into a watering-can in the tool-shed, but it was full of cold water.", tr: "Alet kulübesindeki bir sulama kabının içine atladı ama kap soğuk suyla doluydu." },
      { en: "Peter found the gate beyond the wheelbarrow, ran with all his might, and squeezed safely underneath.", tr: "Peter el arabasının ötesindeki kapıyı gördü, tüm gücüyle koştu ve güvenle altından geçip kurtuldu." },
      { en: "Peter got home exhausted, and his mother gave him warm chamomile tea before bed.", tr: "Peter eve bitkin bir halde vardı ve annesi yatmadan önce ona ılık papatya çayı verdi." }
    ]
  },

  // ================= 4. THE LITTLE PRINCE: THE FOX AND THE SECRET (A2 - KÜÇÜK PRENS) =================
  {
    title: 'The Little Prince - Tame Me and The Secret',
    category: 'books',
    level: 'A2',
    source: 'The Little Prince (1943) - Antoine de Saint-Exupéry',
    image_url: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=800',
    vocabulary_highlights: ['tame', 'essential', 'invisible', 'responsible', 'heart', 'ties', 'unique', 'golden'],
    content: `It was then that the fox appeared.

"Good morning," said the fox.

"Good morning," the little prince responded politely, although when he turned around he saw nothing.

"I am right here," the voice said, "under the apple tree."

"Who are you?" asked the little prince. "You are very pretty to look at."

"I am a fox," said the fox.

"Come and play with me," proposed the little prince. "I am so sad today."

"I cannot play with you," the fox said. "I am not tamed."

"Ah! Please excuse me," said the little prince. But after some thought, he added: "What does that mean?'tame'?"

"It is an act too often neglected," said the fox. "It means to establish ties."

"To establish ties?"

"Just that," said the fox. "To me, you are still nothing more than a little boy who is just like a hundred thousand other little boys. And I have no need of you. And you, on your part, have no need of me. To you, I am nothing more than a fox like a hundred thousand other foxes. But if you tame me, then we shall need each other. To me, you will be unique in all the world. To you, I shall be unique in all the world..."

"I am beginning to understand," said the little prince. "There is a flower... I think that she has tamed me."

"It is possible," said the fox. "On the Earth one sees all kinds of things."

The fox gazed at the little prince for a long time. "Please?tame me!" he said.

"I want to, very much," the little prince replied. "But I have not much time. I have friends to discover, and a great many things to understand."

"One only understands the things that one tames," said the fox. "Men have no more time to understand anything. They buy things all ready-made at the shops. But there is no shop anywhere where one can buy friendship, and so men have no more friends. If you want a friend, tame me!"

"What must I do to tame you?" asked the little prince.

"You must be very patient," replied the fox. "First you will sit down at a little distance from me?like that?in the grass. I shall look at you out of the corner of my eye, and you will say nothing. Words are the source of misunderstandings. But every day you will sit a little closer to me..."

The next day the little prince returned.

"It would have been better to come back at the same hour," said the fox. "If, for example, you come at four o'clock in the afternoon, then at three o'clock I shall begin to be happy. I shall feel happier and happier as the hour approaches. At four o'clock, I shall already be worrying and jumping about. I shall show you how happy I am! But if you come at just any time, I shall never know at what hour my heart is to be ready to greet you... One must observe proper rites."

So the little prince tamed the fox. And when the hour of his departure drew near?

"Ah!" said the fox. "I shall cry."

"It is your own fault," said the little prince. "I never wished you any sort of harm; but you wanted me to tame you..."

"Yes, that is so," said the fox.

"Then it has done you no good at all!"

"It has done me good," the fox said, "because of the color of the wheat fields."

Then he added: "Go and look again at the roses. You will understand now that yours is unique in all the world. Then come back to say goodbye to me, and I will make you a present of a secret."

The little prince went away, to look again at the roses.

"You are not at all like my rose," he told them. "As yet you are nothing. No one has tamed you, and you have tamed no one. You are like my fox was when I first knew him. He was only a fox like a hundred thousand other foxes. But I have made him my friend, and now he is unique in all the world."

And he went back to meet the fox.

"Goodbye," he said.

"Goodbye," said the fox. "And now here is my secret, a very simple secret: It is only with the heart that one can see rightly; what is essential is invisible to the eye."

"What is essential is invisible to the eye," the little prince repeated, so that he would be sure to remember.

"It is the time you have wasted for your rose that makes your rose so important."

"It is the time I have wasted for my rose?" said the little prince, so that he would be sure to remember.

"Men have forgotten this truth," said the fox. "But you must not forget it. You become responsible, forever, for what you have tamed. You are responsible for your rose..."

"I am responsible for my rose," the little prince repeated, so that he would be sure to remember.`,
    sentences: [
      { en: "'I cannot play with you,' the fox said. 'I am not tamed.'", tr: "'Seninle oynayamam,' dedi tilki. 'Ben evcilleştirilmedim.'" },
      { en: "'What does that mean?'tame'?' asked the little prince. 'It means to establish ties,' said the fox.", tr: "'Evcilleştirmek ne demek?' diye sordu küçük prens. 'Bağ kurmak anlamına gelir,' dedi tilki." },
      { en: "'To me, you are still nothing more than a little boy who is just like a hundred thousand other little boys.'", tr: "'Benim için sen hala yüz binlerce diğer küçük erkek çocuğuna benzeyen bir çocuksun.'" },
      { en: "'But if you tame me, then we shall need each other. To me, you will be unique in all the world.'", tr: "'Ama beni evcilleştirirsen, birbirimize ihtiyacımız olacak. Benim için dünyada eşsiz olacaksın.'" },
      { en: "'If you come at four in the afternoon, then at three o'clock I shall begin to be happy.'", tr: "'Eğer öğleden sonra saat dörtte gelirsen, saat üçte mutlu olmaya başlarım.'" },
      { en: "'Here is my secret, a very simple secret: It is only with the heart that one can see rightly.'", tr: "'İşte sırrım, çok basit bir sır: İnsan yalnızca kalbiyle doğruyu görebilir.'" },
      { en: "'What is essential is invisible to the eye,' repeated the little prince.", tr: "'Asıl önemli olan şey gözle görülemez,' diye tekrarladı küçük prens." },
      { en: "'It is the time you have spent for your rose that makes your rose so important.'", tr: "'Gülün için harcadığın zamandır gülünü bu kadar önemli kılan.'" },
      { en: "'You become responsible, forever, for what you have tamed. You are responsible for your rose.'", tr: "'Evcilleştirdiğin şeyden her zaman sen sorumlusun. Gülünden sen sorumlusun.'" }
    ]
  },

  // ================= 5. MEETING A NEW NEIGHBOR (A1 - GÜNLÜK DİYALOG) =================
  {
    title: 'Meeting a New Neighbor & Making Friends',
    category: 'daily_dialogues',
    level: 'A1',
    source: 'Everyday English Dialogues - Social Life',
    image_url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800',
    vocabulary_highlights: ['neighbor', 'building', 'introduce', 'originally', 'hobbies', 'weekend', 'apartment', 'picnic'],
    content: `SARAH: Hi there! Good morning! Are you moving into apartment 4B?

ALEX: Hello! Yes, exactly. I just arrived this morning with the moving truck. My name is Alex.

SARAH: Very nice to meet you, Alex! I am Sarah. I live right across the hall in apartment 4A. Welcome to our building!

ALEX: Thank you so much, Sarah. It is a pleasure to meet you. This neighborhood seems very peaceful and lovely.

SARAH: It really is. Everyone here is friendly and helpful. Where are you from originally?

ALEX: I am originally from Chicago, but I lived in Boston for three years before moving here for my new job.

SARAH: Oh, wonderful! What kind of work do you do?

ALEX: I work as a graphic designer for an advertising company downtown. I can work from home two days a week, which is very convenient. How about you?

SARAH: I am an elementary school English teacher at the local school down the street. It is only a ten-minute walk from here.

ALEX: That sounds fantastic! You don't have to worry about morning traffic at all.

SARAH: Exactly! By the way, do you have any pets? I saw a small pet carrier near your door.

ALEX: Yes, I have a friendly orange cat named Oliver. He is very quiet and loves sleeping in sunny windows.

SARAH: Oh, I adore cats! I have a golden retriever named Max. Don't worry, he is very well-behaved and loves other animals.

ALEX: That is great to hear. By the way, is there a good supermarket or bakery nearby? I need to buy some groceries and fresh bread later today.

SARAH: Yes, absolutely! If you walk down the street and turn left at the traffic light, there is a wonderful bakery called Green Oven. They make the best fresh croissants and bread every morning. And right next to it, there is a large supermarket open until 10 PM.

ALEX: That is so helpful, thank you so much! I was worried I would have to drive far for groceries today.

SARAH: Not at all! Also, a few neighbors are planning a casual picnic in the park this Saturday afternoon if the weather stays sunny. You are warmly invited to join us and meet everyone.

ALEX: That sounds amazing! I would love to come. Thank you for making me feel so welcome, Sarah.

SARAH: You are very welcome! If you need anything?extra boxes, tools, or sugar?just knock on my door. Good luck with the unpacking!

ALEX: Thank you, Sarah! Have a wonderful day!`,
    sentences: [
      { en: "Hi there! Good morning! Are you moving into apartment 4B?", tr: "Merhaba! Günaydın! 4B numaralı daireye mi taşınıyorsunuz?" },
      { en: "Hello! Yes, exactly. I just arrived this morning. My name is Alex.", tr: "Merhaba! Evet, aynen öyle. Bu sabah geldim. Benim adım Alex." },
      { en: "Nice to meet you, Alex! I am Sarah, your neighbor across the hall.", tr: "Tanıştığıma memnun oldum Alex! Ben Sarah, karşı dairenizdeki komşunuzum." },
      { en: "Where are you from originally? I am originally from Chicago.", tr: "Aslen nerelisiniz? Ben aslen Chicago'luyum." },
      { en: "I work as a graphic designer for an advertising company downtown.", tr: "Şehir merkezinde bir reklam ajansında grafik tasarımcı olarak çalışıyorum." },
      { en: "I am an elementary school English teacher at the school down the street.", tr: "Ben de caddedeki yerel okulda ilkokul İngilizce öğretmeniyim." },
      { en: "Is there a good supermarket or bakery nearby for groceries?", tr: "Yakınlarda market alışverişi yapabileceğim iyi bir süpermarket ya da fırın var mı?" },
      { en: "Turn left at the traffic light; there is a great bakery with fresh bread every morning.", tr: "Trafik ışıklarından sola dönün; her sabah taze ekmek çıkaran harika bir fırın var." },
      { en: "We are planning a casual picnic in the park this Saturday; you are warmly invited!", tr: "Bu cumartesi parkta piknik planlıyoruz; siz de içtenlikle davetlisiniz!" },
      { en: "If you need anything?tools or sugar?just knock on my door.", tr: "Herhangi bir şeye ihtiyacınız olursa?alet veya şeker?kapımı çalmanız yeterli." }
    ]
  },

  // ================= 6. ORDERING AT A COFFEE SHOP & BAKERY (A2 - GÜNLÜK DİYALOG) =================
  {
    title: 'At the Busy London Coffee Shop & Bakery',
    category: 'daily_dialogues',
    level: 'A2',
    source: 'Real Life Situations - British English',
    image_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800',
    vocabulary_highlights: ['barista', 'cappuccino', 'pastry', 'receipt', 'oat milk', 'decaf', 'takeaway', 'delicious'],
    content: `BARISTA: Good morning! Welcome to Bean & Leaf. What can I get started for you today?

EMILY: Good morning! Could I please get a large cappuccino with oat milk?

BARISTA: Absolutely! Would you like chocolate dusting on top of the foam?

EMILY: Yes, please. A little bit of chocolate powder would be lovely.

BARISTA: Great choice. And is that for here or takeaway?

EMILY: I will have it here, please. I brought my laptop and plan to do some reading.

BARISTA: Perfect, we have plenty of quiet tables upstairs with power outlets. Would you care for something to eat this morning? We just took fresh almond croissants and blueberry muffins out of the oven ten minutes ago.

EMILY: Oh, those almond croissants smell heavenly! Are they sweet or buttery?

BARISTA: They are wonderfully flaky and buttery, with a sweet almond paste filling inside and toasted sliced almonds on top. They are our customer favorite!

EMILY: That sounds irresistible. I will take one almond croissant as well, please. Could you warm it up slightly for me?

BARISTA: Certainly! Just twenty seconds in the oven makes it warm and crisp. Anything else for you today? A bottle of sparkling water or fresh orange juice?

EMILY: Just a small glass of tap water alongside the coffee, if possible.

BARISTA: Of course, tap water is completely complimentary. You can also refill it at the water station near the window anytime.

EMILY: That is very kind, thank you. How much is that altogether?

BARISTA: That comes to six pounds and forty pence in total. How would you like to pay?

EMILY: Can I pay by contactless card?

BARISTA: Yes, contactless or mobile pay is perfect. Just tap your card right here on the terminal.

EMILY: There you go. Beep!

BARISTA: Payment successful! Here is your receipt. Your order number is forty-two. You can take a seat upstairs, and we will bring your warm croissant and cappuccino directly to your table in about three minutes.

EMILY: Thank you very much for your great service! By the way, what is the Wi-Fi password here?

BARISTA: The Wi-Fi network is called "BeanLeaf_Guest" and the password is printed right at the bottom of your receipt: "coffeelover2026".

EMILY: Brilliant! Thanks again, have a wonderful morning!

BARISTA: You too! Enjoy your coffee and your reading!`,
    sentences: [
      { en: "Good morning! What can I get started for you today?", tr: "Günaydın! Bugün sizin için ne hazırlayabilirim?" },
      { en: "Could I please get a large cappuccino with oat milk?", tr: "Yulaf sütlü büyük boy bir cappuccino alabilir miyim lütfen?" },
      { en: "Is that for here or takeaway? I will have it here, please.", tr: "Burada mı içeceksiniz yoksa paket mi? Burada alacağım lütfen." },
      { en: "We just took fresh almond croissants and blueberry muffins out of the oven.", tr: "Fırından az önce taze bademli kruvasanlar ve yaban mersinli kekler çıkardık." },
      { en: "I will take one almond croissant; could you warm it up slightly for me?", tr: "Bir tane bademli kruvasan alayım; benim için biraz ısıtabilir misiniz?" },
      { en: "Tap water is complimentary, and you can refill it at the counter anytime.", tr: "Musluk suyu ikramımızdır ve dilediğiniz zaman tezgahtan tekrar doldurabilirsiniz." },
      { en: "That comes to six pounds and forty pence in total. How would you like to pay?", tr: "Toplamda altı pound kırk peni tutuyor. Nasıl ödemek istersiniz?" },
      { en: "Can I pay by contactless card? Just tap your card on the terminal.", tr: "Temassız kartla ödeyebilir miyim? Kartınızı terminale dokundurmanız yeterli." },
      { en: "The Wi-Fi password is printed right at the bottom of your receipt.", tr: "Wi-Fi şifresi fişinizin hemen alt kısmında yazmaktadır." },
      { en: "Enjoy your warm coffee and have a wonderful morning!", tr: "Sıcak kahvenizin tadını çıkarın ve harika bir sabah geçirin!" }
    ]
  },

  // ================= 7. AT THE AIRPORT & CHECKING IN (B1 - GÜNLÜK SEYAHAT DİYALOĞU) =================
  {
    title: 'At the Airport - Check-in & Security Control',
    category: 'daily_dialogues',
    level: 'B1',
    source: 'International Travel English - Airport Scenarios',
    image_url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800',
    vocabulary_highlights: ['boarding pass', 'luggage', 'passport', 'overweight', 'security', 'departure', 'gate', 'delay'],
    content: `AGENT: Good afternoon, welcome to British Airways. Where are you flying today?

DAVID: Good afternoon! I am flying to Toronto with a connection in London Heathrow.

AGENT: May I please see your passport and your electronic ticket confirmation?

DAVID: Here is my passport, and here is the booking reference on my smartphone.

AGENT: Thank you very much, Mr. Miller. I see your reservation. You are booked on flight BA 118 departing at 3:45 PM. Are you checking any baggage today, or do you have carry-on luggage only?

DAVID: I have one large suitcase to check in, and this small backpack as my cabin bag.

AGENT: Perfect. Please place your suitcase flat on the luggage scale next to you.

DAVID: Sure, here it goes. Is the weight within the limit?

AGENT: Let's see... Your bag is twenty-one kilograms. The maximum allowance is twenty-three kilograms, so you are well within the limit! Did you pack the suitcase yourself, and have you left it unattended at any time since packing?

DAVID: Yes, I packed it entirely myself last night, and it has been with me the whole time.

AGENT: Excellent. Are you carrying any prohibited items, such as spare lithium batteries, lighters, or liquids exceeding one hundred milliliters in your hand luggage?

DAVID: No, I put all liquid toiletries and large bottles in my checked suitcase. My backpack only contains my laptop, an e-reader, and a book.

AGENT: Wonderful. Would you prefer a window seat or an aisle seat for the first leg to London?

DAVID: An aisle seat would be fantastic, please, so that I can stretch my legs during the flight.

AGENT: I was able to assign you seat 14C, which is an aisle seat in the forward cabin. Here are your boarding passes for both flights: flight BA 118 to London, and your connecting flight to Toronto. Your luggage is checked all the way through to Toronto Pearson Airport, so you won't need to collect it during your layover in London.

DAVID: That is a huge relief! I was worried about re-checking my suitcase in Heathrow.

AGENT: No need to worry at all! Your flight departs from Gate B22. Boarding will commence at 3:05 PM, exactly forty minutes prior to departure. Please proceed through security checkpoint 2 immediately, as lines can be a bit long during peak hours.

DAVID: Thank you so much for your thorough assistance. Have a great day!

AGENT: You are very welcome, Mr. Miller! Have a pleasant flight and a safe journey!`,
    sentences: [
      { en: "Where are you flying today? I am flying to Toronto with a connection in London.", tr: "Bugün nereye uçuyorsunuz? Londra aktarmalı olarak Toronto'ya uçuyorum." },
      { en: "May I please see your passport and your booking reference number?", tr: "Pasaportunuzu ve rezervasyon referans numaranızı görebilir miyim lütfen?" },
      { en: "Please place your suitcase flat on the luggage scale to check the weight.", tr: "Ağırlığını kontrol etmek için lütfen valizinizi yanınızdaki bagaj tartısına koyun." },
      { en: "Your bag is twenty-one kilograms, which is well within the twenty-three kilogram limit.", tr: "Çantanız yirmi bir kilo, yani yirmi üç kiloluk sınırın gayet altında." },
      { en: "Did you pack the bag yourself, and have you left it unattended at any time?", tr: "Çantayı kendiniz mi hazırladınız ve hiçbir zaman başıboş bıraktınız mı?" },
      { en: "Would you prefer a window seat or an aisle seat for this long flight?", tr: "Bu uzun uçuş için cam kenarı mı yoksa koridor tarafı mı tercih edersiniz?" },
      { en: "Your luggage is checked all the way through to your final destination in Toronto.", tr: "Bagajınız son varış noktanız olan Toronto'ya kadar doğrudan aktarılacaktır." },
      { en: "Boarding will commence at 3:05 PM at Gate B22. Have a safe journey!", tr: "Uçağa binişler B22 kapısında saat 15:05'te başlayacaktır. İyi yolculuklar!" }
    ]
  },

  // ================= 8. JOB INTERVIEW (B2 - İŞ MÜLAKATI DİYALOĞU) =================
  {
    title: 'A Job Interview for a Creative Company',
    category: 'daily_dialogues',
    level: 'B2',
    source: 'Professional & Business English Dialogues',
    image_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800',
    vocabulary_highlights: ['strengths', 'weaknesses', 'collaborate', 'deadline', 'accomplishment', 'initiative', 'resume', 'skills'],
    content: `INTERVIEWER: Good morning, Clara. Welcome to Nova Media. Did you have any trouble finding our offices today?

CLARA: Good morning, Mr. Harrison. Not at all, thank you! The directions provided in the confirmation email were very clear, and the subway station is just two blocks away.

INTERVIEWER: Excellent! We are thrilled to meet you in person. To begin, could you please walk us through your professional background and what motivated you to apply for this Senior Product Designer position?

CLARA: Certainly! For the past four years, I have been working as a UI/UX designer at an educational technology startup. During my time there, I led the complete redesign of our mobile learning application, which increased daily active user retention by thirty-five percent within six months. What drew me to Nova Media is your commitment to building intuitive, accessible digital tools that empower independent creators. I feel my background in user research, design systems, and rapid prototyping aligns seamlessly with your roadmap.

INTERVIEWER: That is impressive. In your resume, you highlighted your experience collaborating closely with software engineers. How do you handle situations where engineers push back on a design due to technical constraints or tight deadlines?

CLARA: I believe the best products come from open, early collaboration rather than rigid handoffs. Whenever engineers point out technical limitations, I see it as a creative opportunity rather than a roadblock. I always sit down with the engineering lead to understand the root bottleneck. Often, by simplifying unnecessary animations or breaking the feature into modular iterative releases, we achieve ninety percent of the intended user experience without delaying the sprint.

INTERVIEWER: A very pragmatic approach. Now, candidates often find this question challenging, but how would you describe your greatest professional strength and an area you actively work to improve?

CLARA: My greatest strength is empathy-driven problem solving combined with data literacy. I don't just rely on intuition; I run quantitative usability tests to validate design decisions. As for an area of improvement, in the past I had a tendency to take on too many tasks simultaneously because I wanted to ensure perfection in every detail. Over the last year, I have consciously practiced delegation and established clearer sprint boundaries, which has made me a much more effective leader and mentor to junior designers.

INTERVIEWER: That shows great self-awareness. Where do you see yourself professionally in the next three to five years?

CLARA: I see myself growing into a Design Director role, mentoring cross-functional teams and shaping strategic product vision from early inception through global launch.

INTERVIEWER: Outstanding. Do you have any questions for us regarding the team or company culture?

CLARA: Yes, I would love to know: what is the single biggest challenge the design team is currently tackling this quarter?

INTERVIEWER: That is a perceptive question! We are currently unified in redesigning our multi-platform collaboration workflow...`,
    sentences: [
      { en: "Could you please walk us through your background and what motivated you to apply?", tr: "Bize profesyonel geçmişinizden ve başvurma motivasyonunuzdan bahsedebilir misiniz?" },
      { en: "I led the redesign of our mobile app, increasing user retention by thirty-five percent.", tr: "Kullanıcı bağlılığını yüzde otuz beş artıran mobil uygulama yeniden tasarımını yönettim." },
      { en: "How do you handle situations where engineers push back on designs due to technical constraints?", tr: "Mühendislerin teknik kısıtlamalar nedeniyle tasarıma itiraz ettiği durumları nasıl yönetirsiniz?" },
      { en: "I see technical limitations as creative opportunities rather than roadblocks.", tr: "Teknik kısıtlamaları bir engel olarak değil, yaratıcı fırsatlar olarak görürüm." },
      { en: "My greatest strength is empathy-driven problem solving combined with data literacy.", tr: "En güçlü yönüm, veri okuryazarlığı ile birleşen empati odaklı problem çözme yeteneğimdir." },
      { en: "I have consciously practiced delegation, which has made me a more effective leader.", tr: "Bilinçli olarak görev dağıtımı pratiği yaptım, bu da beni çok daha etkili bir lider kıldı." },
      { en: "What is the single biggest challenge the design team is currently tackling this quarter?", tr: "Tasarım ekibinin bu çeyrekte çözmeye çalıştığı en büyük zorluk nedir?" }
    ]
  },

  // ================= 9. SHERLOCK HOLMES: THE RED-HEADED LEAGUE (B2 - SIR ARTHUR CONAN DOYLE) =================
  {
    title: 'Sherlock Holmes - The Red-Headed League',
    category: 'books',
    level: 'B2',
    source: 'The Adventures of Sherlock Holmes (1892) - Sir Arthur Conan Doyle',
    image_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800',
    vocabulary_highlights: ['pawnbroker', 'advertisement', 'curious', 'bizarre', 'tunnel', 'conspiracy', 'detective', 'intellect'],
    content: `I had called upon my friend, Mr. Sherlock Holmes, one day in the autumn of last year and found him in deep conversation with a very stout, florid-faced, elderly gentleman with fiery red hair.

"You could not have come at a better time, my dear Watson," Holmes cried cordially. "Mr. Jabez Wilson here has been explaining to me one of the most singular little narratives that I have listened to for some time."

The portly client puffed out his chest with an appearance of some little pride and pulled a dirty and wrinkled newspaper from the inside pocket of his greatcoat.

"Look at this, gentlemen," said Mr. Wilson, pointing with his thick finger to an advertisement in the column. "This began it all just two months ago."

I took the paper and read:
"TO THE RED-HEADED LEAGUE: On account of the bequest of the late Ezekiah Hopkins, of Lebanon, Pennsylvania, U.S.A., there is now another vacancy open which entitles a member of the League to a salary of 4 a week for purely nominal services. All red-headed men who are sound in body and mind, and above the age of twenty-one years, are eligible. Apply in person on Monday, at eleven o'clock, to Duncan Ross, at the offices of the League, 7 Pope's Court, Fleet Street."

"What on earth does this mean?" I exclaimed, after I had twice read over the extraordinary announcement.

Holmes chuckled and wriggled in his armchair. "It is a little off the beaten track, isn't it? Pray, Mr. Wilson, tell Dr. Watson the rest of your adventure."

"Well, sir," said the client, "I keep a small pawnbroker's shop at Coburg Square. It brings in just enough to live upon. A few weeks ago, my young assistant, Vincent Spaulding, brought this paper to my notice. He urged me to apply, pointing out that my own hair was of a remarkably vibrant crimson shade.

To make a long story short, I went to Pope's Court. The street was crammed with red-headed men of every shade?straw, lemon, orange, brick, and flame. Yet Mr. Duncan Ross looked at my hair, congratulated me warmly, and selected me above all others!

My sole duty was to sit in an empty office from ten in the morning until two in the afternoon and copy out the Encyclopedia Britannica in longhand with my own quill pen! The pay was four golden sovereigns every Saturday. For eight weeks, I went every day, copying out articles under the letter 'A'?'Architecture', 'Attica', and so on.

Then, this very morning, I walked up to the office as usual, but the door was shut and locked. Nailed to the middle of the wooden panel with a brass pin was this cardboard square:
'THE RED-HEADED LEAGUE IS DISSOLVED. October 9, 1890.'

I asked around the neighborhood, but no one had ever heard of the Red-Headed League or Mr. Duncan Ross. I felt so foolish that I came straight to you, Mr. Holmes!"

Holmes sat motionless for several minutes with his eyes closed and his long fingers pressed together. When he opened his eyes, a keen spark shone within them.

"Your assistant, Vincent Spaulding?how long has he worked for you?"

"About three months, sir. He is very smart and works for half wages to learn the business. His only fault is a fondness for photography; he is always slipping down into the dark cellar to develop pictures."

"Ah!" said Holmes softly. "The cellar. Watson, this case promises to be exceptionally entertaining. Tonight, we shall visit Coburg Square with pistols and a dark lantern, for we have a daring bank burglary to prevent!"`,
    sentences: [
      { en: "Mr. Jabez Wilson explained one of the most singular and bizarre narratives Holmes had ever heard.", tr: "Bay Jabez Wilson, Holmes'ün şimdiye kadar dinlediği en tuhaf ve sıra dışı anlatılardan birini açıkladı." },
      { en: "An advertisement invited red-headed men to apply for a well-paid job with the Red-Headed League.", tr: "Bir gazete ilanı, kızıl saçlı erkekleri Kızıl Saçlılar Derneği'nde dolgun maaşlı bir işe başvurmaya davet ediyordu." },
      { en: "Mr. Wilson was hired simply to copy the Encyclopedia Britannica for four golden pounds a week.", tr: "Bay Wilson, haftalık dört altın lira karşılığında yalnızca Britanya Ansiklopedisi'ni kopyalamak üzere işe alındı." },
      { en: "After eight weeks, he arrived at the office to find a note: 'The Red-Headed League is dissolved.'", tr: "Sekiz hafta sonra ofise vardığında şu notu buldu: 'Kızıl Saçlılar Derneği feshedilmiştir.'" },
      { en: "'My assistant works for half wages, but spends hours in the cellar developing photographs.'", tr: "'Yardımcım yarı maaşla çalışıyor ama bodrumda saatlerce fotoğraf tab etmekle vakit geçiriyor.'" },
      { en: "Holmes realized the assistant was digging an underground tunnel straight into the city bank vault!", tr: "Holmes, yardımcının bodrumdan şehir bankası kasasına doğru bir yeraltı tüneli kazdığını fark etti!" }
    ]
  },

  // ================= 10. THE GIFT OF THE MAGI (B1 - O. HENRY - TAM HİKAYE) =================
  {
    title: 'The Gift of the Magi',
    category: 'books',
    level: 'B1',
    source: 'The Gift of the Magi (1905) - O. Henry',
    image_url: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=800',
    vocabulary_highlights: ['sacrifice', 'treasure', 'combs', 'platinum', 'pocket watch', 'precious', 'generosity', 'tears'],
    content: `One dollar and eighty-seven cents. That was all. And sixty cents of it was in pennies. Pennies saved one and two at a time by bargaining with the grocer and the vegetable man and the butcher until one's cheeks burned with the silent imputation of parsimony. Three times Della counted it. One dollar and eighty-seven cents. And the next day would be Christmas.

There was clearly nothing to do but flop down on the shabby little couch and howl. So Della did it.

Della finished her cry and attended to her cheeks with the powder rag. She stood by the window and looked out dully at a gray cat walking a gray fence in a gray backyard. Tomorrow would be Christmas Day, and she had only $1.87 with which to buy Jim a present. She had been saving every penny she could for months, with this result. Twenty dollars a week doesn't go far. Expenses had been greater than she had calculated. They always are. Only $1.87 to buy a present for Jim. Her Jim. Many a happy hour she had spent planning for something nice for him. Something fine and rare and sterling?something just a little bit near to being worthy of the honor of being owned by Jim.

Now, there were two possessions of the James Dillingham Youngs in which they both took a mighty pride. One was Jim's gold watch that had been his father's and his grandfather's. The other was Della's hair.

Had the queen of Sheba lived in the flat across the airshaft, Della would have let her hair hang out the window some day to dry just to depreciate Her Majesty's jewels and gifts. Had King Solomon been the janitor, with all his treasures piled up in the basement, Jim would have pulled out his watch every time he passed, just to see him pluck at his beard from envy.

So now Della's beautiful hair fell about her rippling and shining like a cascade of brown waters. It reached below her knee and made itself almost a garment for her. And then she did it up again nervously and quickly. Once she faltered for a minute and stood still while a tear or two splashed on the worn red carpet.

On went her old brown jacket; on went her old brown hat. With a whirl of skirts and with the brilliant sparkle still in her eyes, she fluttered out the door and down the stairs to the street.

Where she stopped the sign read: "Mme. Sofronie. Hair Goods of All Kinds." One flight up Della ran, and collected herself, panting.

"Will you buy my hair?" asked Della.

"I buy hair," said Madame. "Take yer hat off and let's have a sight at the looks of it."

Down rippled the brown cascade.

"Twenty dollars," said the Madame, lifting the mass with a practiced hand.

"Give it to me quick," said Della.

Oh, and the next two hours tripped by on rosy wings. She was ransacking the stores for Jim's present.

She found it at last. It surely had been made for Jim and no one else. There was no other like it in any of the stores, and she had turned all of them inside out. It was a platinum pocket-watch chain simple and chaste in design, properly proclaiming its value by substance alone and not by meretricious ornamentation. As soon as she saw it she knew that it must be Jim's. It was like him. Quietness and value?the description applied to both. Twenty-one dollars they took from her for it, and she hurried home with the 87 cents.

When Jim arrived home that evening, he stopped inside the door as immovable as a setter at the scent of quail. His eyes were fixed upon Della, and there was an expression in them that she could not read, and it terrified her. It was not anger, nor surprise, nor disapproval, nor horror, nor any of the sentiments that she had been prepared for. He simply stared at her peculiarly with that strange expression on his face.

"Jim, darling," she cried, "don't look at me that way! I had my hair cut off and sold because I couldn't have lived through Christmas without giving you a present. It'll grow out again?you won't mind, will you? Say 'Merry Christmas!' Jim, and let's be happy."

Jim drew a package from his overcoat pocket and threw it upon the table.

"Don't make any mistake, Dell," he said, "about me. I don't think there's any sort of haircut that could make me like my girl any less. But if you'll unwrap that package you may see why you had me going a while at first."

White fingers tore at the string and paper. And then an ecstatic scream of joy; and then, alas! a quick feminine change to hysterical tears and wails.

For there lay The Combs?the set of combs, side and back, that Della had worshipped long in a Broadway window. Beautiful combs, pure tortoiseshell, with jewelled rims?just the shade to wear in the beautiful vanished hair. They were expensive combs, she knew, and her heart had simply craved and yearned over them without the least hope of possession. And now, they were hers, but the tresses that should have adorned the coveted adornments were gone.

But she hugged them to her bosom, and at length she was able to look up with dim eyes and a smile and say: "My hair grows so fast, Jim!"

And then Della leaped up like a little singed cat and cried, "Oh, oh!"

Jim had not yet seen his beautiful present. She held it out to him eagerly upon her open palm. The dull precious metal seemed to flash with a reflection of her bright and ardent spirit.

"Isn't it a dandy, Jim? I hunted all over town to find it. You'll have to look at the time a hundred times a day now. Give me your watch. I want to see how it looks on it."

Instead of obeying, Jim tumbled down on the couch and put his hands under the back of his head and smiled.

"Dell," said he, "let's put our Christmas presents away and keep 'em a while. They're too nice to use just at present. I sold the watch to get the money to buy your combs."

The magi, as you know, were wise men?wonderfully wise men?who brought gifts to the Babe in the manger. They invented the art of giving Christmas presents. Being wise, their gifts were no doubt wise ones. And here I have lamely related to you the uneventful chronicle of two foolish children in a flat who most unwisely sacrificed for each other the greatest treasures of their house. But in a last word to the wise of these days let it be said that of all who give gifts these two were the wisest. Of all who give and receive gifts, such as they are wisest. Everywhere they are wisest. They are the magi.`,
    sentences: [
      { en: "Tomorrow would be Christmas Day, and Della had only one dollar and eighty-seven cents to buy Jim a present.", tr: "Yarın Noel günüydü ve Della'nın Jim'e bir hediye almak için sadece bir dolar seksen yedi senti vardı." },
      { en: "There were two treasures in which they both took pride: Jim's gold watch and Della's beautiful hair.", tr: "İkisinin de gurur duyduğu iki hazine vardı: Jim'in altın saati ve Della'nın güzel saçları." },
      { en: "Della went to Madame Sofronie and sold her hair for twenty dollars to buy Jim a gift.", tr: "Della, Bayan Sofronie'ye gitti ve Jim'e hediye alabilmek için saçlarını yirmi dolara sattı." },
      { en: "She found a pure platinum pocket-watch chain that was perfect for Jim's cherished gold watch.", tr: "Jim'in değerli altın saati için mükemmel olan saf platin bir köstekli saat zinciri buldu." },
      { en: "When Jim came home, he stared at her short hair with a strange and stunned expression.", tr: "Jim eve geldiğinde, onun kısa saçlarına tuhaf ve şaşkın bir ifadeyle baktı." },
      { en: "Jim gave her a package: inside were the beautiful tortoiseshell combs Della had long dreamed of.", tr: "Jim ona bir paket verdi: içinde Della'nın uzun zamandır hayalini kurduğu güzel bağa saç tarakları vardı." },
      { en: "Della smiled and showed Jim the platinum chain, asking him to put it on his watch.", tr: "Della gülümsedi ve platini zinciri Jim'e göstererek saatine takmasını istedi." },
      { en: "'I sold the watch to get the money to buy your combs,' Jim said with a tender smile.", tr: "'Taraklarını alacak parayı bulmak için saatimi sattım,' dedi Jim şefkatli bir gülümsemeyle." },
      { en: "Of all who give and receive gifts, those who sacrifice for love are the wisest of all: they are the magi.", tr: "Hediye verip alanların içinde, sevgi için fedakarlık yapanlar en bilge olanlardır: onlar bilgelerin ta kendisidir." }
    ]
  }
];

const fileContent = `import { ReadingMaterial } from '../types';

export const INITIAL_READINGS: Omit<ReadingMaterial, 'id'>[] = ${JSON.stringify(readings, null, 2)};
`;

const outputPath = path.join(__dirname, '../src/data/seedReadings.ts');
fs.writeFileSync(outputPath, fileContent, 'utf8');

console.log('Successfully generated seedReadings.ts with', readings.length, 'complete books, fairy tales, and daily dialogues!');
