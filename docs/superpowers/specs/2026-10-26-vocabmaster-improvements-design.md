# VocabMaster — İyileştirme & Yeniden Yapılandırma Tasarımı

**Tarih:** 2026-10-26
**Durum:** Onay bekliyor

---

## 1. Amaç ve Neden

VocabMaster şu an çalışan, zengin özellikli bir dil öğrenme uygulaması. Ancak:
- İçindeki "yapay zeka" bozuktu (eski model → her çağrı hata → sabit demo mesajı). **Düzeltildi.**
- Kütüphane tek sayfalık statik metinler; gerçek "kitap okuma" hissi yok.
- Filmler kısa repliklerle sınırlı; parça parça, daha uzun diyalog deneyimi yok.
- İçerik bitince pekiştirme (test) yok.
- Kod, özellik büyüdükçe bakımı zorlaşan büyük dosyalara dağılmış (StudyScreen 1236, VocabularyScreen 1158 satır).
- Depolama verimsiz: `massiveWords.json` (1.1 MB) hem gömülü hem SQLite'a kopyalanıyor (çift depolama).
- Arayüz yorucu ve bölük; daha sade, pratik ve gerçekçi bir his isteniyor.

**Hedef:** Clean architecture'a kademeli geçerek; gerçek AI, kitap/film/makale okuma deneyimi, bitiş testleri ve yenilenmiş bir arayüz eklemek — hepsi hafif, çevrimdışı ve performanslı kalacak şekilde.

---

## 2. Hedefler / Hedef Olmayanlar / Anti-Hedefler

### Hedefler
- Gerçek, "düşünen" AI (Gemini ücretsiz katman) — sahte sohbet dahil.
- Sayfalı, "gerçek kitap gibi" okuma (Sayfa X / Y, kaldığın yerden devam).
- Filmler: parça parça, daha uzun diyalog segmentleri + senkron çeviri.
- Makaleler: kolayca eklenebilen (artırılabilen) içerik listesi.
- Her içerik türü için bitiş testi (o içeriğin kelime + cümlelerinden).
- Kademeli clean architecture: yeni kod katmanlı, mevcut ekranlar bozulmadan zamanla taşınır.
- Hafif depolama: içerik gömülü dosya olarak okunur, SQLite yalnızca kullanıcı verisi tutar.
- Sade, yormayan, pratik, gerçekçi bir arayüz.

### Hedef Olmayanlar
- Çevrimiçi hesap/sunucu/senkronizasyon (uygulama çevrimdışı-öncelikli kalır).
- Tüm 12.000 satırın şimdi tek seferde yeniden yazılması (kademeli tercih edildi).
- Ses tanıma / konuşma telaffuz puanlama (ileride).

### Anti-Hedefler (başarısızlık sayılır)
- Uygulamanın ilk açılışının yavaşlaması veya depolamanın gereksiz şişmesi.
- Mevcut çalışan özelliklerin (SRS, egzersizler) bozulması.
- "Clean architecture" adına aşırı soyutlama / gereksiz katman (over-engineering).

---

## 3. Kısıtlar / İlkeler

- **Çevrimdışı-öncelikli:** İçerik ve çalışma internet olmadan çalışır; yalnızca AI özellikleri internet ister.
- **Hafiflik:** İçerik SQLite'a KOPYALANMAZ. Statik dosyadan okunur; DB yalnızca kullanıcı verisi (ilerleme, kayıtlı kelime, SRS, test sonucu) tutar.
- **Kademeli & güvenli:** Her adım sonunda uygulama derlenir ve çalışır (`tsc --noEmit` temiz).
- **Sadelik:** Katmanlar yalnızca değer kattığında eklenir; gereksiz soyutlamadan kaçınılır.
- **Expo kuralları:** Yeni paket gerekirse `npx expo install`; önce mevcut Expo modülleri tercih edilir.

---

## 4. Mimari (Kademeli Clean Architecture)

Özellik-öncelikli (feature-first) hafif clean architecture. **Yeni** özellikler bu yapıda yazılır; mevcut ekranlar çalışmaya devam eder ve adım adım taşınır.

```
src/
  core/                      # paylaşılan çekirdek
    db/                      # sqlite kurulum + migration + kullanıcı-verisi tabloları
    theme/                   # ThemeContext (mevcut taşınır)
    types/                   # ortak tipler
  content/                   # STATİK, salt-okunur içerik (gömülü)
    books/                   # her kitap: meta + bölümler (JSON)
    movies/                  # her film: meta + diyalog segmentleri
    articles/                # makaleler
    manifest.ts              # tüm içeriğin indeksi (artırılabilir: yeni dosya ekle → listede belirir)
  features/
    reader/                  # kitap + makale okuma (sayfalı)
      domain/                # saf TS: entity + repository arayüzü
      data/                  # repo impl: içerik dosyası + ilerleme DB'si
      presentation/          # ekran, bileşen, hook
    movies/
    study/                   # SRS + egzersizler (mevcut, zamanla taşınır)
    coach/                   # AI (Nova)
  shared/
    ui/                      # ortak arayüz bileşenleri (buton, kart, başlık, ilerleme çubuğu)
    utils/
```

**Katman kuralı:** `presentation → domain ← data`. Domain saf iş mantığı (React/SQLite bilmez). Data katmanı içerik dosyasını okur + DB'ye yazar. Presentation yalnızca hook'lar üzerinden domain'e konuşur.

**Not:** Bu yapı hedef; kademeli uygulanır. Mevcut `screens/` ve `components/` taşınana kadar durur.

---

## 5. Depolama Modeli

**Statik içerik (gömülü, salt-okunur):** `src/content/` altındaki JSON dosyaları. `require`/dinamik import ile tembel (lazy) yüklenir; SQLite'a yazılmaz.

**SQLite — yalnızca kullanıcı verisi:**
- `user_words` — kayıtlı kelimeler + SRS alanları (mevcut)
- `study_log` — egzersiz geçmişi (mevcut)
- `reading_progress` — `content_id, type, last_page, total_pages, finished, updated_at`
- `test_results` — `content_id, score, total, taken_at`
- `user_settings` — tema, hatırlatıcı, aksan, API anahtarı referansı (mevcut)

**Depolama optimizasyonu:** Mevcut 1.1 MB kelime seed'inin DB'ye çift kopyalanması bir sonraki migration adımında ele alınır (çekirdek SRS'yi bozmadan). Yeni içerik (kitap/film/makale) bu sorunu yaşamaz çünkü hiç kopyalanmaz.

---

## 6. İçerik Modeli

**Kitap** (`content/books/<id>.json`):
```
{ id, title, author, level, coverEmoji?, category,
  chapters: [ { title, paragraphs: string[] } ],
  highlights?: string[] }        // hedef kelimeler
```
Okuyucu tüm bölümleri birleştirip ekrana göre sayfalara böler → "Sayfa X / Y".

**Film** (`content/movies/<id>.json`):
```
{ id, title, year, level, posterEmoji?,
  segments: [ { scene?, lines: [ { en, tr, speaker? } ] } ] }   // parça parça, uzun diyalog
```

**Makale** (`content/articles/<id>.json`): kitap ile benzer, tek bölüm; liste `manifest.ts`'e satır eklenerek büyür.

---

## 7. Okuma Deneyimi (Sayfalı)

- Metin, font boyutu + ekran yüksekliğine göre tahmini karakter/sayfa ile parçalanır (paragraf bütünlüğü korunur).
- Yatay, sayfa-kaydırmalı (pagingEnabled) görünüm; altta "Sayfa X / Y" + ince ilerleme çubuğu.
- Kaldığın yerden devam: `reading_progress.last_page`.
- "Dokun-Öğren" korunur: kelimeye dokun → anlam + "Havuza Ekle" (mevcut InteractiveText taşınır).
- Son sayfaya ulaşınca `finished = true` → **Bitiş Testi** kilidi açılır.

---

## 8. Bitiş Testleri

Bir içerik bitince o içeriğe özel test:
- **Kaynak:** içeriğin `highlights` kelimeleri + kullanıcının o metinden kaydettiği kelimeler + metindeki cümleler.
- **Soru tipleri (mevcut bileşenler yeniden kullanılır):** boşluk doldurma (cümleden), çoktan seçmeli anlam, cümle eşleştirme, (opsiyonel) çeviri yazma.
- Sonuç `test_results`'a yazılır; tekrar çözülebilir.
- Filmlerde test segment bazlı veya film sonu olarak sunulur.

---

## 9. Arayüz (UI/UX) Yenileme

- **İlke:** sade, yormayan, pratik, gerçekçi. Tutarlı boşluk/tipografi ölçeği, yumuşak kartlar, net hiyerarşi, az ama anlamlı renk.
- Ortak `shared/ui` bileşenleri (Button, Card, SectionHeader, ProgressBar, Badge) → ekranlar arası tutarlılık.
- Ana ekranda motivasyon döngüsü: günlük hedef, seri (🔥), kısa haftalık ilerleme.
- Hareketler ölçülü (yorucu değil): yumuşak geçişler, dokunma geri bildirimi.
- Light/dark mevcut tema korunur ve rafine edilir.
- Tasarım kararları için `ui-ux-pro-max` skill'i referans alınır.

---

## 10. Adım Adım Yol Haritası

Her adım bağımsız, derlenir-çalışır ve ayrı test edilir.

0. **Çekirdek iskelet** — `core/`, `content/`, `shared/` klasörleri; içerik yükleyici; `reading_progress` + `test_results` tabloları. (Özellik yok, temel.)
1. **Sayfalı Kitap Okuyucu** — mevcut okumaları içerik dosyalarına taşı; sayfalama + ilerleme + kaldığın yerden devam.
2. **Bitiş Testi** — kitap bitince kelime + cümle testi.
3. **Filmler** — parça parça uzun diyalog + senkron çeviri + test.
4. **Makaleler** — artırılabilir liste + aynı okuyucu + test.
5. **Gerçek AI Sohbeti** — sahte chat'i Gemini'ye bağla; Nova gerçekten yanıtlasın + nazik düzeltme.
6. **UI/UX Yenileme + Oyunlaştırma** — ortak bileşenler, ana ekran motivasyon döngüsü, rozetler, parlatma.

> Sıra önerilendir; istenirse değiştirilebilir. UI iyileştirmeleri her adımda da kısmen uygulanır, 6. adımda bütünleştirilir.

---

## 11. Builder'a Bırakılanlar

- Sayfalama algoritmasının tam ayarı (karakter/sayfa kalibrasyonu, ölçüm yöntemi).
- `shared/ui` bileşenlerinin tam API'si.
- Her adımın kendi küçük uygulama planı (yazılırken `superpowers:writing-plans`).
- Test soru dağılımı oranları.
