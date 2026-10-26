import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Word } from '../types';
import { getWeakWords, getDueReviewWords, getAppStats, getAllWords, updateWordSRS } from '../services/database';
import { callGemini, getGeminiApiKey } from '../services/gemini';
import { speakWord } from '../services/speech';
import { useTheme } from '../context/ThemeContext';

interface AICoachModalProps {
  visible: boolean;
  onClose: () => void;
}

type RobotMode = 'menu' | 'fill_blank' | 'advice' | 'story' | 'chat';

interface FillBlankQuestion {
  sentence: string; // "She decided to _______ the old car."
  correctWord: string;
  turkishTranslation: string;
  options: string[];
}

export const AICoachModal: React.FC<AICoachModalProps> = ({ visible, onClose }) => {
  const { colors, mode } = useTheme();
  const [activeMode, setActiveMode] = useState<RobotMode>('menu');
  const [loading, setLoading] = useState(false);
  const [robotMessage, setRobotMessage] = useState('Merhaba! Ben senin akıllı İngilizce asistanın Nova 🤖. Bugün ne çalışmak istersin?');

  // Fill in the blank quiz state
  const [quizQuestions, setQuizQuestions] = useState<FillBlankQuestion[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [quizScore, setQuizScore] = useState(0);

  // Advice state
  const [adviceText, setAdviceText] = useState<string>('');

  // Story state
  const [storyData, setStoryData] = useState<{ title: string; story: string; turkish: string; words: string[] } | null>(null);

  // Interactive quick chat state
  const [chatLog, setChatLog] = useState<{ sender: 'nova' | 'user'; text: string; tr?: string }[]>([
    {
      sender: 'nova',
      text: 'Hi there! Ready to practice some English today? Choose a topic below to chat with me!',
      tr: 'Selam! Bugün biraz İngilizce pratik yapmaya hazır mısın? Benimle konuşmak için aşağıdaki konulardan birini seç!'
    }
  ]);

  useEffect(() => {
    if (visible) {
      resetToMenu();
    }
  }, [visible]);

  const resetToMenu = () => {
    setActiveMode('menu');
    setLoading(false);
    setSelectedOption(null);
    setQuizFeedback(null);
    setRobotMessage('Merhaba! Ben senin akıllı İngilizce asistanın Nova 🤖. Bir butona bas, hemen başlayalım!');
  };

  // ================= 1. FILL IN THE BLANK QUIZ (BOŞLUK DOLDURMA) =================
  const startFillBlankQuiz = async () => {
    setActiveMode('fill_blank');
    setLoading(true);
    setQuizFeedback(null);
    setSelectedOption(null);
    setCurrentQuizIndex(0);
    setQuizScore(0);
    setRobotMessage('Harika seçim! Çalıştığın kelimelerden sana özel bir boşluk doldurma testi hazırlıyorum...');

    try {
      // Pick target words from weak words or due words or pool
      let candidates = getWeakWords(5);
      if (candidates.length < 3) {
        candidates = getDueReviewWords(5);
      }
      if (candidates.length < 3) {
        candidates = getAllWords(false).slice(0, 5);
      }

      const allPool = getAllWords(false);
      const questions: FillBlankQuestion[] = [];

      for (const w of candidates.slice(0, 4)) {
        // Build distractors
        const distractors = allPool
          .filter(x => x.id !== w.id)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3)
          .map(x => x.english);

        const options = [...distractors, w.english].sort(() => 0.5 - Math.random());

        // Create blank in example sentence if available
        let sentenceWithBlank = `She wanted to _______ because it was important.`;
        if (w.example_en && w.example_en.toLowerCase().includes(w.english.toLowerCase())) {
          const regex = new RegExp(`\\b${w.english}\\b`, 'gi');
          sentenceWithBlank = w.example_en.replace(regex, '_______');
        } else {
          sentenceWithBlank = `Understanding how to use "_______" is essential.`;
        }

        questions.push({
          sentence: sentenceWithBlank,
          correctWord: w.english,
          turkishTranslation: w.turkish,
          options
        });
      }

      setQuizQuestions(questions);
      setRobotMessage(`Hazır! İşte 1. soru. Cümledeki boşluğa en uygun kelimeyi seç:`);
    } catch {
      setRobotMessage('Bir hata oluştu, lütfen tekrar dene.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuizOption = (opt: string) => {
    if (selectedOption || quizFeedback) return;
    setSelectedOption(opt);

    const currentQ = quizQuestions[currentQuizIndex];
    const isCorrect = opt.toLowerCase() === currentQ.correctWord.toLowerCase();

    if (isCorrect) {
      setQuizFeedback('correct');
      setQuizScore(prev => prev + 1);
      setRobotMessage('Tebrikler! Doğru cevap! 🎉 Boşluğa tam oturdu.');
      speakWord(currentQ.correctWord);
    } else {
      setQuizFeedback('wrong');
      setRobotMessage(`Yaklaştın ama doğru cevap "${currentQ.correctWord}" olmalıydı.`);
      speakWord(currentQ.correctWord);
    }
  };

  const handleNextQuizQuestion = () => {
    if (currentQuizIndex + 1 < quizQuestions.length) {
      setCurrentQuizIndex(prev => prev + 1);
      setSelectedOption(null);
      setQuizFeedback(null);
      setRobotMessage(`Soru ${currentQuizIndex + 2} / ${quizQuestions.length}: Boşluğa uygun kelimeyi seç:`);
    } else {
      // Quiz complete
      setQuizFeedback(null);
      setSelectedOption(null);
      setRobotMessage(`Sınav tamamlandı! 🏆 Toplam Puanın: ${quizScore + (quizFeedback === 'correct' ? 1 : 0)} / ${quizQuestions.length}. Çok iyi iş çıkardın!`);
    }
  };

  // ================= 2. HOW TO IMPROVE (KOÇ GELİŞİM TAVSİYESİ) =================
  const startAdviceMode = async () => {
    setActiveMode('advice');
    setLoading(true);
    setRobotMessage('İlerlemeni ve öğrenme verilerini analiz ediyorum...');

    try {
      const stats = getAppStats();
      const weaks = getWeakWords(4);
      const apiKey = await getGeminiApiKey();

      if (apiKey) {
        const prompt = `
Act as an empathetic, encouraging English language AI tutor named Nova.
User Stats:
- Total words studied: ${stats.totalWords}
- Mastered words: ${stats.masteredWords}
- Learning words: ${stats.learningWords}
- Practice accuracy: ${stats.accuracy}%
- Struggling words: ${weaks.map(w => w.english).join(', ') || 'None yet'}

In 3 concise, friendly bullet points in Turkish:
1. Praise their progress and highlight their strong points.
2. Give actionable, specific advice on how to improve faster this week.
3. Motivate them with an encouraging closing sentence.
`;
        const res = await callGemini(prompt);
        setAdviceText(res);
      } else {
        // Smart offline advice generator
        const advice = `
📊 **Senin İçin Gelişim Analizi:**

• **Mevcut Durumun:** Toplam **${stats.totalWords}** kelime havuzunda **%${stats.accuracy}** doğruluk oranıyla ilerliyorsun. Bu harika bir temel!
• **Hızlı İlerleme Tavsiyesi:** ${
          weaks.length > 0
            ? `Şu an en çok **"${weaks.map(w => w.english).join(', ')}"** kelimelerinde hata yapıyorsun. Bu kelimeleri "Yazma Çalışması" modunda harf alarak pekiştirmek hafızanı 3 kat güçlendirecektir.`
            : `Günde en az 25 kelimelik bir çalışma seansı ve 1 kısa çocuk hikayesi okuyarak kelime dağarcığını hızla büyütebilirsin.`
        }
• **Günlük Alışkanlık:** Akıllı Tekrar (SRS) aralıklarını aksatmadan her gün 10 dakika pratik yapmak, kelimeleri kalıcı hafızaya aktarmanın en kanıtlanmış yoludur. Sen bu işi başaracaksın! 🚀
`;
        setAdviceText(advice.trim());
      }

      setRobotMessage('İşte senin için özel hazırladığım gelişim haritası:');
    } catch {
      setAdviceText('Gelişim tavsiyesi hazırlanırken bir sorun oluştu. Lütfen tekrar deneyiniz.');
    } finally {
      setLoading(false);
    }
  };

  // ================= 3. MINI STORY WITH WEAK WORDS =================
  const startStoryMode = async () => {
    setActiveMode('story');
    setLoading(true);
    setRobotMessage('Çalıştığın kelimeleri kullanarak senin için eğlenceli ve akılda kalıcı bir mini hikaye yazıyorum...');

    try {
      let weaks = getWeakWords(3);
      if (weaks.length < 2) {
        weaks = getAllWords(false).slice(0, 3);
      }
      const wordNames = weaks.map(w => w.english);

      const apiKey = await getGeminiApiKey();
      if (apiKey) {
        const prompt = `
Create an engaging, fun, 3-sentence short story in English for an English learner.
The story MUST naturally include these exact words: ${wordNames.join(', ')}.
Format as JSON:
{
  "title": "Short Fun Title",
  "story": "Sentence 1. Sentence 2. Sentence 3.",
  "turkish": "Cümle 1 çevirisi. Cümle 2 çevirisi. Cümle 3 çevirisi."
}
`;
        const raw = await callGemini(prompt, true);
        const clean = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(clean);
        setStoryData({ ...parsed, words: wordNames });
      } else {
        // Smart offline curated template
        setStoryData({
          title: 'A Sunny Adventure',
          story: `Leo woke up early because he did not want to ${wordNames[0] || 'abandon'} his big dream. He decided to ${wordNames[1] || 'achieve'} his goals step by step. In the end, he was able to ${wordNames[2] || 'arrive'} at his destination happily.`,
          turkish: `Leo büyük hayalinden vazgeçmek istemediği için erkenden uyandı. Hedeflerine adım adım ulaşmaya karar verdi. Sonunda varış noktasına mutlulukla ulaşabildi.`,
          words: wordNames
        });
      }

      setRobotMessage('İşte hikayen hazır! Kelimeleri bağlamı içinde görmek hatırlamayı çok kolaylaştırır.');
    } catch {
      setStoryData({
        title: 'Daily Practice',
        story: 'Every day is a new chance to learn and grow your language skills.',
        turkish: 'Her gün dil becerilerini öğrenmek ve geliştirmek için yeni bir fırsattır.',
        words: []
      });
    } finally {
      setLoading(false);
    }
  };

  // ================= 4. QUICK CHAT WITH PREDEFINED CHIPS =================
  const handleChatUserChoice = (text: string, replyEn: string, replyTr: string) => {
    setChatLog(prev => [
      ...prev,
      { sender: 'user', text },
      { sender: 'nova', text: replyEn, tr: replyTr }
    ]);
    speakWord(replyEn);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Top Minimalist Header */}
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <View style={styles.headerTitleWrap}>
            <View style={styles.robotAvatarSmall}>
              <Text style={styles.robotAvatarEmoji}>🤖</Text>
            </View>
            <View>
              <Text style={[styles.headerName, { color: colors.text }]}>Nova</Text>
              <Text style={[styles.headerStatus, { color: colors.subtext }]}>Akıllı İngilizce Asistanın • Çevrimiçi</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={colors.subtext} />
          </TouchableOpacity>
        </View>

        {/* Robot Speech Bubble */}
        <View style={[styles.bubbleCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.robotBigAvatar}>
            <Text style={styles.robotBigEmoji}>🤖</Text>
          </View>
          <View style={styles.bubbleContent}>
            <Text style={[styles.bubbleText, { color: colors.text }]}>{robotMessage}</Text>
          </View>
        </View>

        {/* Mode Content or Hub */}
        <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
          {loading && (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.subtext }]}>Nova hazırlıyor...</Text>
            </View>
          )}

          {/* ================= HUB (MAIN 1-TAP OPTIONS) ================= */}
          {!loading && activeMode === 'menu' && (
            <View style={styles.menuGrid}>
              <Text style={[styles.menuHeader, { color: colors.subtext }]}>Bana bir görev seç:</Text>

              {/* 1. Boşluk Doldurma Sınavı */}
              <TouchableOpacity
                style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={startFillBlankQuiz}
              >
                <View style={[styles.iconCircle, { backgroundColor: '#dbeafe' }]}>
                  <Ionicons name="create-outline" size={24} color="#2563eb" />
                </View>
                <View style={styles.menuCardInfo}>
                  <Text style={[styles.menuCardTitle, { color: colors.text }]}>Boşluk Doldurma Sınavı 🎯</Text>
                  <Text style={[styles.menuCardDesc, { color: colors.subtext }]}>Çalıştığın kelimelerle sana özel 4 soruluk mini test</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.primary} />
              </TouchableOpacity>

              {/* 2. Nasıl Gelişebilirim? (Koç Tavsiyesi) */}
              <TouchableOpacity
                style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={startAdviceMode}
              >
                <View style={[styles.iconCircle, { backgroundColor: '#dcfce7' }]}>
                  <Ionicons name="trending-up-outline" size={24} color="#16a34a" />
                </View>
                <View style={styles.menuCardInfo}>
                  <Text style={[styles.menuCardTitle, { color: colors.text }]}>Nasıl Gelişebilirim? 💡</Text>
                  <Text style={[styles.menuCardDesc, { color: colors.subtext }]}>Zayıf kelimelerini ve çalışma hızını analiz etsin</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#16a34a" />
              </TouchableOpacity>

              {/* 3. Kelimelerimle Mini Hikaye */}
              <TouchableOpacity
                style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={startStoryMode}
              >
                <View style={[styles.iconCircle, { backgroundColor: '#f3e8ff' }]}>
                  <Ionicons name="book-outline" size={24} color="#9333ea" />
                </View>
                <View style={styles.menuCardInfo}>
                  <Text style={[styles.menuCardTitle, { color: colors.text }]}>Kelimelerimle Mini Hikaye 📖</Text>
                  <Text style={[styles.menuCardDesc, { color: colors.subtext }]}>Zorlandığın kelimeleri akıcı bir öyküde birleştirsin</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9333ea" />
              </TouchableOpacity>

              {/* 4. İngilizce Pratik Sohbeti */}
              <TouchableOpacity
                style={[styles.menuCard, styles.menuCardAmber]}
                onPress={() => {
                  setActiveMode('chat');
                  setRobotMessage('Harika! Yazmana gerek yok, aşağıdaki seçeneklere dokunarak benimle konuşabilirsin.');
                }}
              >
                <View style={[styles.iconCircle, { backgroundColor: '#fef3c7' }]}>
                  <Ionicons name="chatbubbles-outline" size={24} color="#d97706" />
                </View>
                <View style={styles.menuCardInfo}>
                  <Text style={styles.menuCardTitle}>İngilizce Sohbet Pratiği 💬</Text>
                  <Text style={styles.menuCardDesc}>Tek dokunuşlu yanıtlarla konuşma pratiği yap</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#d97706" />
              </TouchableOpacity>
            </View>
          )}

          {/* ================= 1. FILL IN THE BLANK VIEW ================= */}
          {!loading && activeMode === 'fill_blank' && quizQuestions.length > 0 && (
            <View style={styles.quizWrapper}>
              {currentQuizIndex < quizQuestions.length ? (
                <>
                  <View style={styles.quizCard}>
                    <Text style={styles.questionNumText}>Soru {currentQuizIndex + 1} / {quizQuestions.length}</Text>
                    <Text style={styles.sentenceText}>{quizQuestions[currentQuizIndex].sentence}</Text>
                    <Text style={styles.sentenceTrHint}>
                      İpucu (Türkçe): "{quizQuestions[currentQuizIndex].turkishTranslation}"
                    </Text>
                  </View>

                  <View style={styles.optionsList}>
                    {quizQuestions[currentQuizIndex].options.map((opt, i) => {
                      const isChosen = selectedOption === opt;
                      const isCorrect = opt.toLowerCase() === quizQuestions[currentQuizIndex].correctWord.toLowerCase();

                      let btnStyle: any = styles.quizOptionBtn;
                      let textStyle: any = styles.quizOptionText;

                      if (selectedOption) {
                        if (isCorrect) {
                          btnStyle = [styles.quizOptionBtn, styles.quizCorrectBtn];
                          textStyle = [styles.quizOptionText, styles.quizCorrectText];
                        } else if (isChosen) {
                          btnStyle = [styles.quizOptionBtn, styles.quizWrongBtn];
                          textStyle = [styles.quizOptionText, styles.quizWrongText];
                        }
                      }

                      return (
                        <TouchableOpacity
                          key={`opt-${i}`}
                          style={btnStyle}
                          activeOpacity={0.8}
                          onPress={() => handleSelectQuizOption(opt)}
                          disabled={Boolean(selectedOption)}
                        >
                          <Text style={textStyle}>{opt}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {selectedOption && (
                    <TouchableOpacity style={styles.nextQBtn} onPress={handleNextQuizQuestion}>
                      <Text style={styles.nextQBtnText}>
                        {currentQuizIndex + 1 === quizQuestions.length ? 'Sonuçları Gör' : 'Sıradaki Soru'}
                      </Text>
                      <Ionicons name="arrow-forward" size={18} color="#ffffff" />
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <View style={styles.resultBox}>
                  <Text style={styles.resultTitle}>Sınav Başarıyla Bitti! 🏅</Text>
                  <Text style={styles.resultScoreText}>{quizScore} / {quizQuestions.length} Doğru</Text>
                  <TouchableOpacity style={styles.backMenuBtn} onPress={resetToMenu}>
                    <Text style={styles.backMenuBtnText}>Nova Menüsüne Dön</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* ================= 2. ADVICE VIEW ================= */}
          {!loading && activeMode === 'advice' && (
            <View style={styles.adviceWrapper}>
              <View style={styles.adviceCard}>
                <Text style={styles.adviceContentText}>{adviceText}</Text>
              </View>

              <TouchableOpacity style={styles.backMenuBtn} onPress={resetToMenu}>
                <Ionicons name="arrow-back" size={18} color="#2563eb" />
                <Text style={styles.backMenuBtnText}>Diğer Seçeneklere Dön</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ================= 3. STORY VIEW ================= */}
          {!loading && activeMode === 'story' && storyData && (
            <View style={styles.storyWrapper}>
              <View style={styles.storyCard}>
                <View style={styles.storyHeaderRow}>
                  <Text style={styles.storyTitleText}>{storyData.title}</Text>
                  <TouchableOpacity style={styles.listenBtn} onPress={() => speakWord(storyData.story)}>
                    <Ionicons name="volume-high" size={20} color="#2563eb" />
                  </TouchableOpacity>
                </View>

                {storyData.words.length > 0 && (
                  <View style={styles.storyChipsRow}>
                    <Text style={styles.chipLabel}>Hedef Kelimeler:</Text>
                    {storyData.words.map((w, idx) => (
                      <View key={`sw-${idx}`} style={styles.wordChip}>
                        <Text style={styles.wordChipText}>{w}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <Text style={styles.storyEnText}>{storyData.story}</Text>
                <View style={styles.storyDivider} />
                <Text style={styles.storyTrText}>{storyData.turkish}</Text>
              </View>

              <TouchableOpacity style={styles.backMenuBtn} onPress={resetToMenu}>
                <Ionicons name="arrow-back" size={18} color="#2563eb" />
                <Text style={styles.backMenuBtnText}>Diğer Seçeneklere Dön</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ================= 4. QUICK CHAT VIEW ================= */}
          {!loading && activeMode === 'chat' && (
            <View style={styles.chatWrapper}>
              <View style={styles.chatContainer}>
                {chatLog.map((msg, i) => (
                  <View
                    key={`c-${i}`}
                    style={[
                      styles.chatBubble,
                      msg.sender === 'user' ? styles.userBubble : styles.novaBubble
                    ]}
                  >
                    <Text style={msg.sender === 'user' ? styles.userBubbleText : styles.novaBubbleText}>
                      {msg.text}
                    </Text>
                    {msg.tr && <Text style={styles.bubbleTrText}>{msg.tr}</Text>}
                  </View>
                ))}
              </View>

              <Text style={styles.quickPromptTitle}>Bir yanıt seç:</Text>
              <View style={styles.quickChipsWrap}>
                <TouchableOpacity
                  style={styles.chatActionChip}
                  onPress={() =>
                    handleChatUserChoice(
                      'I had a productive day studying English!',
                      "That's wonderful to hear! Consistency is the key to fluency.",
                      "Bunu duymak harika! Akıcılığın anahtarı düzenli çalışmaktır."
                    )
                  }
                >
                  <Text style={styles.chatActionChipText}>Günün güzel geçtiğini söyle 😊</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.chatActionChip}
                  onPress={() =>
                    handleChatUserChoice(
                      'Can you tell me an interesting idiom?',
                      '"Piece of cake" means something is very easy to do! Example: This test was a piece of cake.',
                      '"Piece of cake", bir şeyin çok kolay olduğunu anlatır (Çantada keklik).'
                    )
                  }
                >
                  <Text style={styles.chatActionChipText}>Bana ilginç bir deyim öğret 💡</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.chatActionChip}
                  onPress={() =>
                    handleChatUserChoice(
                      'How can I speak faster without pausing?',
                      'Try listening to English podcasts and repeat sentences out loud. This is called shadowing!',
                      'İngilizce podcast dinleyip cümleleri sesli tekrar et. Buna gölgeleme tekniği denir!'
                    )
                  }
                >
                  <Text style={styles.chatActionChipText}>Nasıl daha akıcı konuşurum? 🗣️</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.backMenuBtn} onPress={resetToMenu}>
                <Ionicons name="arrow-back" size={18} color="#2563eb" />
                <Text style={styles.backMenuBtnText}>Diğer Seçeneklere Dön</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  robotAvatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  robotAvatarEmoji: {
    fontSize: 22,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  headerStatus: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '600',
  },
  closeBtn: {
    padding: 6,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
  },
  bubbleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    marginHorizontal: 18,
    marginTop: 14,
    marginBottom: 8,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  robotBigAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  robotBigEmoji: {
    fontSize: 26,
  },
  bubbleContent: {
    flex: 1,
  },
  bubbleText: {
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 20,
    fontWeight: '600',
  },
  scrollBody: {
    padding: 18,
    paddingBottom: 40,
  },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  menuGrid: {
    gap: 12,
  },
  menuHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  menuCardBlue: {
    borderColor: '#bfdbfe',
  },
  menuCardGreen: {
    borderColor: '#bbf7d0',
  },
  menuCardPurple: {
    borderColor: '#e9d5ff',
  },
  menuCardAmber: {
    borderColor: '#fde68a',
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuCardInfo: {
    flex: 1,
    gap: 2,
  },
  menuCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  menuCardDesc: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
  },
  quizWrapper: {
    gap: 16,
  },
  quizCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  questionNumText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  sentenceText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 26,
  },
  sentenceTrHint: {
    fontSize: 13,
    color: '#64748b',
    fontStyle: 'italic',
    marginTop: 4,
  },
  optionsList: {
    gap: 10,
  },
  quizOptionBtn: {
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  quizOptionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  quizCorrectBtn: {
    backgroundColor: '#f0fdf4',
    borderColor: '#16a34a',
  },
  quizCorrectText: {
    color: '#16a34a',
  },
  quizWrongBtn: {
    backgroundColor: '#fef2f2',
    borderColor: '#dc2626',
  },
  quizWrongText: {
    color: '#dc2626',
  },
  nextQBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginTop: 8,
  },
  nextQBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  resultBox: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  resultScoreText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#16a34a',
  },
  adviceWrapper: {
    gap: 16,
  },
  adviceCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#bbf7d0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  adviceContentText: {
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 22,
  },
  storyWrapper: {
    gap: 16,
  },
  storyCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#e9d5ff',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  storyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  storyTitleText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  listenBtn: {
    padding: 6,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
  },
  storyChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  chipLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  wordChip: {
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  wordChipText: {
    fontSize: 12,
    color: '#9333ea',
    fontWeight: '700',
  },
  storyEnText: {
    fontSize: 16,
    color: '#0f172a',
    lineHeight: 24,
    fontWeight: '500',
  },
  storyDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
  },
  storyTrText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  chatWrapper: {
    gap: 14,
  },
  chatContainer: {
    gap: 10,
    marginBottom: 8,
  },
  chatBubble: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 16,
    gap: 4,
  },
  novaBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
    borderTopLeftRadius: 4,
  },
  novaBubbleText: {
    fontSize: 14,
    color: '#0f172a',
    lineHeight: 20,
    fontWeight: '500',
  },
  bubbleTrText: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#2563eb',
    borderTopRightRadius: 4,
  },
  userBubbleText: {
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 20,
    fontWeight: '600',
  },
  quickPromptTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    marginTop: 4,
  },
  quickChipsWrap: {
    gap: 8,
  },
  chatActionChip: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  chatActionChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  backMenuBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#eff6ff',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    marginTop: 10,
  },
  backMenuBtnText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '700',
  },
});
