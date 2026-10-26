import { CEFRLevel, Category } from '../types';

export interface PhraseItem {
  english: string;
  turkish: string;
  level: CEFRLevel;
  category: Category;
  part_of_speech: 'phrase' | 'question';
  example_en: string;
  example_tr: string;
  collocations?: string;
}

export const ESSENTIAL_PHRASES: PhraseItem[] = [
  // ================= 1. GÜNLÜK SORU CÜMLELERİ (DAILY QUESTIONS - A1 & A2) =================
  {
    english: "Could you please help me with this?",
    turkish: "Bana bu konuda yardımcı olabilir misiniz lütfen?",
    level: "A1",
    category: "daily",
    part_of_speech: "question",
    example_en: "Excuse me, could you please help me with this heavy suitcase?",
    example_tr: "Afedersiniz, bu ağır bavulda bana yardımcı olabilir misiniz lütfen?",
    collocations: "could you please, help with"
  },
  {
    english: "How much does this cost?",
    turkish: "Bunun fiyatı ne kadar?",
    level: "A1",
    category: "daily",
    part_of_speech: "question",
    example_en: "I love this blue sweater. How much does this cost?",
    example_tr: "Bu mavi kazağı çok beğendim. Bunun fiyatı ne kadar?",
    collocations: "how much, does it cost"
  },
  {
    english: "Where is the nearest subway station?",
    turkish: "En yakın metro istasyonu nerede?",
    level: "A1",
    category: "travel",
    part_of_speech: "question",
    example_en: "Excuse me, where is the nearest subway station around here?",
    example_tr: "Afedersiniz, buralarda en yakın metro istasyonu nerede?",
    collocations: "where is, nearest station"
  },
  {
    english: "What time does the store close?",
    turkish: "Mağaza saat kaçta kapanıyor?",
    level: "A1",
    category: "daily",
    part_of_speech: "question",
    example_en: "Do we have time to shop? What time does the store close?",
    example_tr: "Alışveriş yapmaya vaktimiz var mı? Mağaza saat kaçta kapanıyor?",
    collocations: "what time, does it close"
  },
  {
    english: "Do you have this in a smaller size?",
    turkish: "Bunun daha küçük bir bedeni var mı?",
    level: "A2",
    category: "daily",
    part_of_speech: "question",
    example_en: "This jacket is a bit loose on me. Do you have this in a smaller size?",
    example_tr: "Bu ceket bana biraz bol geldi. Bunun daha küçük bir bedeni var mı?",
    collocations: "smaller size, in medium"
  },
  {
    english: "Would you mind if I sit here?",
    turkish: "Buraya oturmamın bir sakıncası var mı?",
    level: "A2",
    category: "daily",
    part_of_speech: "question",
    example_en: "Is this seat taken? Would you mind if I sit here?",
    example_tr: "Bu koltuk dolu mu? Buraya oturmamın bir sakıncası var mı?",
    collocations: "would you mind, sit here"
  },
  {
    english: "Can I pay by credit card?",
    turkish: "Kredi kartıyla ödeyebilir miyim?",
    level: "A1",
    category: "daily",
    part_of_speech: "question",
    example_en: "I don't have enough cash on me. Can I pay by credit card?",
    example_tr: "Üzerimde yeterli nakit yok. Kredi kartıyla ödeyebilir miyim?",
    collocations: "pay by card, contactless pay"
  },
  {
    english: "How long does it take to get there?",
    turkish: "Oraya gitmek ne kadar sürer?",
    level: "A2",
    category: "travel",
    part_of_speech: "question",
    example_en: "If we take the bus, how long does it take to get there?",
    example_tr: "Otobüse binersek oraya gitmek ne kadar sürer?",
    collocations: "how long, does it take"
  },
  {
    english: "Could you speak a little slower, please?",
    turkish: "Biraz daha yavaş konuşabilir misiniz lütfen?",
    level: "A1",
    category: "daily",
    part_of_speech: "question",
    example_en: "I'm still learning English. Could you speak a little slower, please?",
    example_tr: "Hala İngilizce öğreniyorum. Biraz daha yavaş konuşabilir misiniz lütfen?",
    collocations: "speak slower, repeat please"
  },
  {
    english: "How do I get to the city center from here?",
    turkish: "Buradan şehir merkezine nasıl gidebilirim?",
    level: "A2",
    category: "travel",
    part_of_speech: "question",
    example_en: "I'm a bit lost. How do I get to the city center from here?",
    example_tr: "Biraz kayboldum. Buradan şehir merkezine nasıl gidebilirim?",
    collocations: "how do I get to, city center"
  },
  {
    english: "Are you free this weekend?",
    turkish: "Bu hafta sonu müsait misin?",
    level: "A1",
    category: "daily",
    part_of_speech: "question",
    example_en: "We are planning a barbecue. Are you free this weekend?",
    example_tr: "Barbekü yapmayı planlıyoruz. Bu hafta sonu müsait misin?",
    collocations: "are you free, this weekend"
  },
  {
    english: "What do you recommend from the menu?",
    turkish: "Menüden ne tavsiye edersiniz?",
    level: "A2",
    category: "daily",
    part_of_speech: "question",
    example_en: "Everything looks delicious! What do you recommend from the menu?",
    example_tr: "Her şey çok lezzetli görünüyor! Menüden ne tavsiye edersiniz?",
    collocations: "what do you recommend, customer favorite"
  },

  // ================= 2. SİPARİŞ & KAFE / RESTORAN KALIPLARI (ORDERING FOOD & DRINKS) =================
  {
    english: "I would like to order a cappuccino, please.",
    turkish: "Bir cappuccino sipariş etmek istiyorum lütfen.",
    level: "A1",
    category: "daily",
    part_of_speech: "phrase",
    example_en: "Good morning! I would like to order a cappuccino, please.",
    example_tr: "Günaydın! Bir cappuccino sipariş etmek istiyorum lütfen.",
    collocations: "I would like to, order coffee"
  },
  {
    english: "Could we have the bill, please?",
    turkish: "Hesabı alabilir miyiz lütfen?",
    level: "A1",
    category: "daily",
    part_of_speech: "question",
    example_en: "We finished our dinner. Could we have the bill, please?",
    example_tr: "Yemeğimizi bitirdik. Hesabı alabilir miyiz lütfen?",
    collocations: "have the bill, check please"
  },
  {
    english: "Can I get this to go?",
    turkish: "Bunu paket yaptırabilir miyim?",
    level: "A1",
    category: "daily",
    part_of_speech: "question",
    example_en: "I don't have time to sit down. Can I get this to go?",
    example_tr: "Oturmaya vaktim yok. Bunu paket yaptırabilir miyim?",
    collocations: "to go, takeaway"
  },
  {
    english: "Does this dish contain any nuts or dairy?",
    turkish: "Bu yemek fındık/fıstık veya süt ürünü içeriyor mu?",
    level: "A2",
    category: "daily",
    part_of_speech: "question",
    example_en: "I have a severe allergy. Does this dish contain any nuts or dairy?",
    example_tr: "Ciddi bir alerjim var. Bu yemek fındık/fıstık veya süt ürünü içeriyor mu?",
    collocations: "contain nuts, dairy-free"
  },
  {
    english: "A table for two, please.",
    turkish: "İki kişilik bir masa lütfen.",
    level: "A1",
    category: "daily",
    part_of_speech: "phrase",
    example_en: "Good evening! A table for two by the window, please.",
    example_tr: "İyi akşamlar! Pencere kenarında iki kişilik bir masa lütfen.",
    collocations: "table for two, by the window"
  },
  {
    english: "Keep the change.",
    turkish: "Para üstü kalsın.",
    level: "A1",
    category: "daily",
    part_of_speech: "phrase",
    example_en: "Here is twenty pounds for the taxi ride. Keep the change.",
    example_tr: "Taksi ücreti için yirmi pound buyrun. Para üstü kalsın.",
    collocations: "keep the change, tip the driver"
  },
  {
    english: "Is service included in the bill?",
    turkish: "Bahşiş hesaba dahil mi?",
    level: "A2",
    category: "daily",
    part_of_speech: "question",
    example_en: "Before I add a tip, is service included in the bill?",
    example_tr: "Bahşiş eklemeden önce sorayım, servis ücreti hesaba dahil mi?",
    collocations: "service included, gratuity"
  },
  {
    english: "We are ready to order now.",
    turkish: "Şu an sipariş vermeye hazırız.",
    level: "A1",
    category: "daily",
    part_of_speech: "phrase",
    example_en: "Excuse me, we have chosen our meals and we are ready to order now.",
    example_tr: "Afedersiniz, yemeklerimizi seçtik ve şu an sipariş vermeye hazırız.",
    collocations: "ready to order, call the waiter"
  },
  {
    english: "Can I have a glass of tap water, please?",
    turkish: "Bir bardak musluk suyu alabilir miyim lütfen?",
    level: "A1",
    category: "daily",
    part_of_speech: "question",
    example_en: "Along with my coffee, can I have a glass of tap water, please?",
    example_tr: "Kahvemin yanına bir bardak musluk suyu alabilir miyim lütfen?",
    collocations: "tap water, glass of water"
  },

  // ================= 3. İŞ HAYATI & TOPLANTI KALIPLARI (BUSINESS ENGLISH & WORKPLACE - B1 & B2) =================
  {
    english: "Thank you for taking the time to meet with me today.",
    turkish: "Bugün benimle görüşmeye zaman ayırdığınız için teşekkür ederim.",
    level: "B1",
    category: "business",
    part_of_speech: "phrase",
    example_en: "Good morning everyone. Thank you for taking the time to meet with me today.",
    example_tr: "Herkese günaydın. Bugün benimle görüşmeye zaman ayırdığınız için teşekkür ederim.",
    collocations: "taking the time, meet with"
  },
  {
    english: "Let's touch base on this project next Monday.",
    turkish: "Bu proje hakkında önümüzdeki Pazartesi tekrar haberleşelim.",
    level: "B2",
    category: "business",
    part_of_speech: "phrase",
    example_en: "I'll review the draft over the weekend. Let's touch base on this project next Monday.",
    example_tr: "Hafta sonu taslağı inceleyeceğim. Bu proje hakkında Pazartesi tekrar haberleşelim.",
    collocations: "touch base, follow up"
  },
  {
    english: "I will follow up with you via email by tomorrow morning.",
    turkish: "Yarın sabaha kadar sizinle e-posta yoluyla iletişime geçeceğim.",
    level: "B1",
    category: "business",
    part_of_speech: "phrase",
    example_en: "Once I have the client's approval, I will follow up with you via email by tomorrow morning.",
    example_tr: "Müşteri onayını alır almaz, yarın sabaha kadar sizinle e-posta yoluyla iletişime geçeceğim.",
    collocations: "follow up with, via email"
  },
  {
    english: "Could you please keep me in the loop?",
    turkish: "Beni de gelişmelerden haberdar edebilir misiniz?",
    level: "B2",
    category: "business",
    part_of_speech: "question",
    example_en: "As you work with the design team, could you please keep me in the loop?",
    example_tr: "Tasarım ekibiyle çalışırken beni de gelişmelerden haberdar edebilir misiniz?",
    collocations: "keep in the loop, stay informed"
  },
  {
    english: "We need to meet the deadline by the end of this week.",
    turkish: "Bu haftanın sonuna kadar teslim tarihine yetişmemiz gerekiyor.",
    level: "B1",
    category: "business",
    part_of_speech: "phrase",
    example_en: "The client is expecting the delivery on Friday, so we need to meet the deadline by the end of this week.",
    example_tr: "Müşteri teslimatı Cuma günü bekliyor, bu yüzden bu haftanın sonuna kadar teslim tarihine yetişmemiz gerek.",
    collocations: "meet the deadline, tight deadline"
  },
  {
    english: "I agree with your point, but we should also consider the budget.",
    turkish: "Görüşünüze katılıyorum ancak bütçeyi de göz önünde bulundurmalıyız.",
    level: "B1",
    category: "business",
    part_of_speech: "phrase",
    example_en: "That is a great feature idea. I agree with your point, but we should also consider the budget.",
    example_tr: "Bu harika bir özellik fikri. Görüşünüze katılıyorum ancak bütçeyi de göz önünde bulundurmalıyız.",
    collocations: "agree with point, consider budget"
  },
  {
    english: "Let's move on to the next item on the agenda.",
    turkish: "Gündemdeki bir sonraki maddeye geçelim.",
    level: "B2",
    category: "business",
    part_of_speech: "phrase",
    example_en: "Since we have agreed on the quarterly goals, let's move on to the next item on the agenda.",
    example_tr: "Üç aylık hedefler üzerinde anlaştığımıza göre, gündemdeki bir sonraki maddeye geçelim.",
    collocations: "move on to, next item on agenda"
  },
  {
    english: "Please find the attached document for your review.",
    turkish: "İncelemeniz için ekteki belgeyi bilgilerinize sunarım.",
    level: "B1",
    category: "business",
    part_of_speech: "phrase",
    example_en: "Dear Mr. Jenkins, please find the attached document for your review.",
    example_tr: "Sayın Bay Jenkins, incelemeniz için ekteki belgeyi bilgilerinize sunarım.",
    collocations: "please find attached, for your review"
  },
  {
    english: "I am looking forward to our collaboration.",
    turkish: "İş birliğimizi dört gözle bekliyorum.",
    level: "B1",
    category: "business",
    part_of_speech: "phrase",
    example_en: "Thank you for the warm partnership proposal. I am looking forward to our collaboration.",
    example_tr: "Sıcak ortaklık teklifiniz için teşekkür ederim. İş birliğimizi dört gözle bekliyorum.",
    collocations: "looking forward to, collaboration"
  },
  {
    english: "Due to unforeseen circumstances, we have to reschedule the meeting.",
    turkish: "Öngörülemeyen durumlardan dolayı toplantıyı yeniden planlamak zorundayız.",
    level: "B2",
    category: "business",
    part_of_speech: "phrase",
    example_en: "I sincerely apologize, but due to unforeseen circumstances, we have to reschedule the meeting.",
    example_tr: "İçtenlikle özür dilerim ancak öngörülemeyen durumlardan dolayı toplantıyı ertelemek zorundayız.",
    collocations: "unforeseen circumstances, reschedule meeting"
  },
  {
    english: "Could you send me the latest presentation slides?",
    turkish: "Bana en güncel sunum slaytlarını gönderebilir misiniz?",
    level: "A2",
    category: "business",
    part_of_speech: "question",
    example_en: "Before tomorrow's pitch, could you send me the latest presentation slides?",
    example_tr: "Yarınki sunumdan önce, bana en güncel sunum slaytlarını gönderebilir misiniz?",
    collocations: "presentation slides, send via email"
  },

  // ================= 4. GÜNLÜK SOSYAL HAYAT & ALIŞVERİŞ KALIPLARI (DAILY LIFE & SHOPPING) =================
  {
    english: "How has your day been so far?",
    turkish: "Günün şu ana kadar nasıl geçti?",
    level: "A2",
    category: "daily",
    part_of_speech: "question",
    example_en: "Hey Sarah! Good to see you. How has your day been so far?",
    example_tr: "Selam Sarah! Seni görmek çok güzel. Günün şu ana kadar nasıl geçti?",
    collocations: "so far, how has your day been"
  },
  {
    english: "It's on the tip of my tongue.",
    turkish: "Dilimin ucunda (tam hatırlamak üzereyim).",
    level: "B1",
    category: "daily",
    part_of_speech: "phrase",
    example_en: "I know the name of this actor! Wait a second, it's on the tip of my tongue.",
    example_tr: "Bu oyuncunun adını biliyorum! Bir saniye bekle, tam dilimin ucunda.",
    collocations: "tip of my tongue, recall"
  },
  {
    english: "I didn't catch that, could you repeat it?",
    turkish: "Tam anlayamadım, tekrar edebilir misiniz?",
    level: "A2",
    category: "daily",
    part_of_speech: "question",
    example_en: "The room was a bit noisy. I didn't catch that, could you repeat it?",
    example_tr: "Oda biraz gürültülüydü. Tam anlayamadım, tekrar edebilir misiniz?",
    collocations: "didn't catch that, repeat please"
  },
  {
    english: "I'm just browsing, thank you.",
    turkish: "Sadece bakınıyorum, teşekkürler.",
    level: "A1",
    category: "daily",
    part_of_speech: "phrase",
    example_en: "When the shop assistant asked if I needed help, I replied: 'I'm just browsing, thank you.'",
    example_tr: "Mağaza görevlisi yardıma ihtiyacım olup olmadığını sorduğunda: 'Sadece bakınıyorum, teşekkürler' dedim.",
    collocations: "just browsing, looking around"
  },
  {
    english: "Can I try this on in the fitting room?",
    turkish: "Bunu deneme kabininde deneyebilir miyim?",
    level: "A2",
    category: "daily",
    part_of_speech: "question",
    example_en: "I love the color of this dress. Can I try this on in the fitting room?",
    example_tr: "Bu elbisenin rengine bayıldım. Bunu deneme kabininde deneyebilir miyim?",
    collocations: "try this on, fitting room"
  },
  {
    english: "It was great catching up with you!",
    turkish: "Seninle konuşmak/hasret gidermek harikaydı!",
    level: "B1",
    category: "daily",
    part_of_speech: "phrase",
    example_en: "Thanks for the coffee! It was great catching up with you after so long.",
    example_tr: "Kahve için teşekkürler! Bunca zaman sonra seninle hasret gidermek harikaydı.",
    collocations: "catching up, great to see you"
  },
  {
    english: "Take your time, there is no rush.",
    turkish: "Acele etmeyin, hiç acelesi yok.",
    level: "A2",
    category: "daily",
    part_of_speech: "phrase",
    example_en: "Don't worry about finishing right now. Take your time, there is no rush.",
    example_tr: "Şu an bitirme konusunda endişelenme. Acele etme, hiç acelesi yok.",
    collocations: "take your time, no rush"
  },
  {
    english: "I really appreciate your help.",
    turkish: "Yardımınız için gerçekten çok teşekkür ederim.",
    level: "A2",
    category: "daily",
    part_of_speech: "phrase",
    example_en: "You saved me so much time today. I really appreciate your help.",
    example_tr: "Bugün bana çok zaman kazandırdınız. Yardımınız için gerçekten çok teşekkür ederim.",
    collocations: "really appreciate, thank you so much"
  },
  {
    english: "That sounds like a great plan!",
    turkish: "Kulağa harika bir plan gibi geliyor!",
    level: "A1",
    category: "daily",
    part_of_speech: "phrase",
    example_en: "A road trip this weekend? That sounds like a great plan!",
    example_tr: "Bu hafta sonu arabayla gezi mi? Kulağa harika bir plan gibi geliyor!",
    collocations: "sounds like, great plan"
  },
  {
    english: "Never mind, it's not a big deal.",
    turkish: "Boşver, önemli bir mesele değil.",
    level: "A2",
    category: "daily",
    part_of_speech: "phrase",
    example_en: "If you forgot to bring the charger, never mind, it's not a big deal.",
    example_tr: "Şarj aletini getirmeyi unuttuysan boşver, önemli bir mesele değil.",
    collocations: "never mind, not a big deal"
  },

  // ================= 5. SEYAHAT, OTEL & YÖN SORMA (TRAVEL, HOTEL & DIRECTIONS) =================
  {
    english: "I have a reservation under the name Miller.",
    turkish: "Miller adına bir rezervasyonum var.",
    level: "A2",
    category: "travel",
    part_of_speech: "phrase",
    example_en: "Good afternoon! I am checking in. I have a reservation under the name Miller.",
    example_tr: "Tünaydın! Giriş yaptırmak istiyorum. Miller adına bir rezervasyonum var.",
    collocations: "reservation under the name, check-in"
  },
  {
    english: "What time is checkout tomorrow morning?",
    turkish: "Yarın sabah otelden çıkış saati kaçta?",
    level: "A2",
    category: "travel",
    part_of_speech: "question",
    example_en: "Could you tell me what time is checkout tomorrow morning?",
    example_tr: "Yarın sabah otelden çıkış saatinin kaçta olduğunu söyleyebilir misiniz?",
    collocations: "what time is checkout, late checkout"
  },
  {
    english: "Can I leave my luggage here for a few hours?",
    turkish: "Bagajımı birkaç saatliğine buraya bırakabilir miyim?",
    level: "A2",
    category: "travel",
    part_of_speech: "question",
    example_en: "Our flight is in the evening. Can I leave my luggage here for a few hours?",
    example_tr: "Uçuşumuz akşam vakti. Bagajımı birkaç saatliğine buraya bırakabilir miyim?",
    collocations: "leave luggage, luggage storage"
  },
  {
    english: "Go straight ahead and take the second turning on the right.",
    turkish: "Düz devam edin ve sağdaki ikinci sokaktan dönün.",
    level: "A2",
    category: "travel",
    part_of_speech: "phrase",
    example_en: "To reach the museum, go straight ahead and take the second turning on the right.",
    example_tr: "Müzeye ulaşmak için düz devam edin ve sağdaki ikinci sokaktan dönün.",
    collocations: "straight ahead, second turning"
  },
  {
    english: "Is breakfast included in the room price?",
    turkish: "Oda fiyatına kahvaltı dahil mi?",
    level: "A2",
    category: "travel",
    part_of_speech: "question",
    example_en: "We booked the double suite. Is breakfast included in the room price?",
    example_tr: "Çift kişilik süit oda ayırttık. Oda fiyatına kahvaltı dahil mi?",
    collocations: "breakfast included, complimentary breakfast"
  },
  {
    english: "Excuse me, does this train go to Central Station?",
    turkish: "Afedersiniz, bu tren Merkez İstasyonu'na gidiyor mu?",
    level: "A1",
    category: "travel",
    part_of_speech: "question",
    example_en: "Excuse me, does this train go to Central Station or the airport?",
    example_tr: "Afedersiniz, bu tren Merkez İstasyonu'na mı yoksa havalimanına mı gidiyor?",
    collocations: "does this train go to, platform number"
  },
  {
    english: "Can you call a taxi for me, please?",
    turkish: "Benim için bir taksi çağırabilir misiniz lütfen?",
    level: "A1",
    category: "travel",
    part_of_speech: "question",
    example_en: "It is raining heavily outside. Can you call a taxi for me, please?",
    example_tr: "Dışarıda çok şiddetli yağmur yağıyor. Benim için bir taksi çağırabilir misiniz lütfen?",
    collocations: "call a taxi, cab service"
  },
  {
    english: "Where can I exchange foreign currency?",
    turkish: "Nerede döviz bozdurabilirim?",
    level: "B1",
    category: "travel",
    part_of_speech: "question",
    example_en: "I just landed. Where can I exchange foreign currency near the terminal?",
    example_tr: "Az önce iniş yaptım. Terminalin yakınında nerede döviz bozdurabilirim?",
    collocations: "exchange currency, exchange rate"
  }
];
