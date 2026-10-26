import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Word, CEFRLevel } from '../types';
import { getAllWords, getWordsByLevel, getDueReviewWords, getPreviouslyStudiedWords, getPhrasesAndQuestions, updateWordSRS, markWordDirectlyMastered } from '../services/database';
import { WordCard } from '../components/WordCard';
import { QuizMode } from '../components/QuizMode';
import { MatchingGame } from '../components/MatchingGame';
import { WritingExercise } from '../components/WritingExercise';
import { JumbledWordsExercise } from '../components/JumbledWordsExercise';
import { useTheme } from '../context/ThemeContext';

export type StudyMode = 'card' | 'quiz' | 'writing' | 'matching' | 'jumbled' | 'fast';

interface StudyScreenProps {
  initialLevel?: CEFRLevel;
  onlyDue?: boolean;
  onBack: () => void;
}

export const StudyScreen: React.FC<StudyScreenProps> = ({ initialLevel, onlyDue, onBack }) => {
  const { colors, mode } = useTheme();

  // Navigation: null = in Hub (the 6-card menu), or active mode
  const [activeMode, setActiveMode] = useState<StudyMode | null>(null);

  // Mode Type: Words vs Phrases/Questions
  const [studyTab, setStudyTab] = useState<'words' | 'phrases'>('words');
  const [selectedPhraseCategory, setSelectedPhraseCategory] = useState<string>('all');

  // Filters
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel | 'due' | 'all'>(
    onlyDue ? 'due' : initialLevel || 'A1'
  );
  const [sessionLimit, setSessionLimit] = useState<number>(25);

  // Active Session State (Round-Based Mastery)
  const [initialSessionWords, setInitialSessionWords] = useState<Word[]>([]);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [roundWords, setRoundWords] = useState<Word[]>([]);
  const [roundIndex, setRoundIndex] = useState<number>(0);
  const [allDistractorWords, setAllDistractorWords] = useState<Word[]>([]);
  
  // Tracking
  const [roundFailedWords, setRoundFailedWords] = useState<Word[]>([]);
  const [sessionKnownWords, setSessionKnownWords] = useState<Word[]>([]);
  const [sessionFailedWords, setSessionFailedWords] = useState<Word[]>([]);
  
  // View states
  const [isRoundSummaryVisible, setIsRoundSummaryVisible] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  useEffect(() => {
    if (activeMode) {
      loadStudySession();
    }
  }, [activeMode, studyTab, selectedPhraseCategory, selectedLevel, sessionLimit]);

  const loadStudySession = () => {
    let list: Word[] = [];
    if (studyTab === 'phrases') {
      const lvl = selectedLevel === 'due' ? 'all' : selectedLevel;
      list = getPhrasesAndQuestions(selectedPhraseCategory, lvl);
    } else {
      if (selectedLevel === 'due') {
        list = getDueReviewWords();
        if (list.length === 0) {
          list = getPreviouslyStudiedWords();
        }
      } else if (selectedLevel === 'all') {
        list = getAllWords(false);
      } else {
        list = getWordsByLevel(selectedLevel);
      }
    }

    setAllDistractorWords(list);
    const shuffled = [...list].sort(() => 0.5 - Math.random());
    const limited = sessionLimit > 0 ? shuffled.slice(0, sessionLimit) : shuffled;

    setInitialSessionWords(limited);
    setCurrentRound(1);
    setRoundWords(limited);
    setRoundIndex(0);
    setRoundFailedWords([]);
    setIsRoundSummaryVisible(false);
    setCompleted(false);
    setSessionKnownWords([]);
    setSessionFailedWords([]);
  };

  const handleStartFailedWordsSession = () => {
    if (sessionFailedWords.length === 0) return;
    const shuffled = [...sessionFailedWords].sort(() => 0.5 - Math.random());
    setInitialSessionWords(shuffled);
    setCurrentRound(1);
    setRoundWords(shuffled);
    setRoundIndex(0);
    setRoundFailedWords([]);
    setIsRoundSummaryVisible(false);
    setCompleted(false);
    setSessionKnownWords([]);
    setSessionFailedWords([]);
  };

  const handleStartNextRound = () => {
    if (roundFailedWords.length === 0) {
      setCompleted(true);
      setIsRoundSummaryVisible(false);
      return;
    }
    const nextWords = [...roundFailedWords];
    setRoundWords(nextWords);
    setRoundIndex(0);
    setRoundFailedWords([]);
    setCurrentRound(prev => prev + 1);
    setIsRoundSummaryVisible(false);
  };

  const handleWordAnswer = (isCorrect: boolean) => {
    if (roundWords.length === 0) {
      setCompleted(true);
      return;
    }

    const currentWord = roundWords[roundIndex];
    if (currentWord) {
      const exerciseType = activeMode === 'card' ? 'flashcard' : (activeMode === 'quiz') ? 'quiz' : 'writing';
      updateWordSRS(currentWord.id, isCorrect, exerciseType);

      if (isCorrect) {
        setSessionKnownWords(prev => (prev.some(w => w.id === currentWord.id) ? prev : [...prev, currentWord]));
      } else {
        setRoundFailedWords(prev => (prev.some(w => w.id === currentWord.id) ? prev : [...prev, currentWord]));
        setSessionFailedWords(prev => (prev.some(w => w.id === currentWord.id) ? prev : [...prev, currentWord]));
      }
    }

    if (roundIndex + 1 < roundWords.length) {
      setRoundIndex(roundIndex + 1);
    } else {
      // Current round finished!
      const finalFailed = isCorrect
        ? roundFailedWords
        : (roundFailedWords.some(w => w.id === currentWord?.id) ? roundFailedWords : [...roundFailedWords, currentWord!]);

      if (finalFailed.length === 0) {
        // 100% correct in this round! All words in session are passed!
        setCompleted(true);
      } else {
        // Seamlessly continue into next round with remaining unlearned words
        setRoundWords([...finalFailed]);
        setRoundIndex(0);
        setRoundFailedWords([]);
        setCurrentRound(prev => prev + 1);
      }
    }
  };

  const handleDirectMaster = () => {
    if (roundWords.length === 0) {
      setCompleted(true);
      return;
    }

    const currentWord = roundWords[roundIndex];
    if (currentWord) {
      markWordDirectlyMastered(currentWord.id);
      setSessionKnownWords(prev => (prev.some(w => w.id === currentWord.id) ? prev : [...prev, currentWord]));
      setRoundFailedWords(prev => prev.filter(w => w.id !== currentWord.id));
    }

    if (roundIndex + 1 < roundWords.length) {
      setRoundIndex(roundIndex + 1);
    } else {
      const finalFailed = roundFailedWords.filter(w => w.id !== currentWord?.id);
      if (finalFailed.length === 0) {
        setCompleted(true);
      } else {
        setRoundWords([...finalFailed]);
        setRoundIndex(0);
        setRoundFailedWords([]);
        setCurrentRound(prev => prev + 1);
      }
    }
  };

  const handleSkipWord = () => {
    const currentWord = roundWords[roundIndex];
    const newFailed = currentWord && !roundFailedWords.some(w => w.id === currentWord.id)
      ? [...roundFailedWords, currentWord]
      : roundFailedWords;

    if (currentWord) {
      setRoundFailedWords(newFailed);
    }

    if (roundIndex + 1 < roundWords.length) {
      setRoundIndex(roundIndex + 1);
    } else {
      if (newFailed.length === 0) {
        setCompleted(true);
      } else {
        setRoundWords([...newFailed]);
        setRoundIndex(0);
        setRoundFailedWords([]);
        setCurrentRound(prev => prev + 1);
      }
    }
  };

  const handleWordUpdated = (updatedWord: Word) => {
    setRoundWords(prev => prev.map(w => (w.id === updatedWord.id ? updatedWord : w)));
    setInitialSessionWords(prev => prev.map(w => (w.id === updatedWord.id ? updatedWord : w)));
  };

  const handleMatchingRoundComplete = (score: number) => {
    const batch = roundWords.slice(roundIndex, roundIndex + 5);
    setSessionKnownWords(prev => [...prev, ...batch]);

    if (roundIndex + 5 < roundWords.length) {
      setRoundIndex(roundIndex + 5);
    } else {
      setCompleted(true);
    }
  };

  const handleExitStudy = () => {
    if (roundWords.length > 0 && sessionKnownWords.length > 0) {
      Alert.alert(
        'Çalışmayı Sonlandır',
        `Şu ana kadar ${sessionKnownWords.length} kelimeyi doğru bildiniz.\n\nSeansı şimdi bitirmek istiyor musunuz?`,
        [
          { text: 'Devam Et', style: 'cancel' },
          { text: 'Seansı Bitir', onPress: () => setCompleted(true) },
          { text: 'Mod Seçimine Dön', style: 'destructive', onPress: () => setActiveMode(null) },
        ]
      );
    } else {
      setActiveMode(null);
    }
  };

  const currentWord = roundWords[roundIndex];
  const initialTotal = initialSessionWords.length;
  const roundTotal = roundWords.length;
  const currentWordNum = roundWords.length > 0 ? roundIndex + 1 : 0;
  const progressPercent = roundTotal > 0 ? (currentWordNum / roundTotal) * 100 : 0;
  
  const levels: (CEFRLevel | 'due' | 'all')[] = studyTab === 'phrases'
    ? ['all', 'A1', 'A2', 'B1', 'B2']
    : ['due', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  const limitOptions = studyTab === 'phrases'
    ? [
        { label: '15 Kalıp', val: 15 },
        { label: '25 Kalıp', val: 25 },
        { label: '50 Kalıp', val: 50 },
        { label: 'Tümü', val: 0 },
      ]
    : [
        { label: '25 Kelime', val: 25 },
        { label: '50 Kelime', val: 50 },
        { label: '100 Kelime', val: 100 },
        { label: 'Tümü', val: 0 },
      ];

  const phraseCategories = [
    { id: 'all', label: '✨ Tümü' },
    { id: 'question', label: '❓ Soru Cümleleri' },
    { id: 'business', label: '💼 İş & Toplantı' },
    { id: 'daily', label: '☕ Sipariş & Kafe' },
    { id: 'travel', label: '✈️ Seyahat & Otel' },
    { id: 'idioms', label: '🗣️ Günlük Sosyal' },
  ];

  // ================= 1. STUDY HUB VIEW (The 6-Card Grid from Screenshot 1) =================
  if (!activeMode) {
    return (
      <View style={[styles.hubContainer, { backgroundColor: colors.background }]}>
        {/* Top Header */}
        <View style={styles.hubHeader}>
          <View style={[styles.hubHeaderPill, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={styles.hubHeaderEmoji}>🎯</Text>
            <Text style={[styles.hubHeaderPillText, { color: colors.text }]}>
              {studyTab === 'phrases'
                ? '💬 Pratik Cümle & Soru Kalıpları'
                : selectedLevel === 'due'
                ? 'En Çok Unutulanlar (SRS)'
                : `${selectedLevel} Seviyesi Çalışması`}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.hubSettingsBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setShowInfoModal(true)}
          >
            <Ionicons name="information-circle-outline" size={22} color={colors.subtext} />
          </TouchableOpacity>
        </View>

        {/* Study Type Switcher: Kelimeler vs. Cümle & Soru Kalıpları */}
        <View style={[styles.hubTabSwitchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.hubTabSwitchBtn, studyTab === 'words' && [styles.activeHubTabSwitchBtn, { backgroundColor: colors.surface }]]}
            onPress={() => {
              setStudyTab('words');
              if (selectedLevel === 'all') setSelectedLevel('A1');
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="book-outline" size={17} color={studyTab === 'words' ? colors.primary : colors.subtext} />
            <Text style={[styles.hubTabSwitchText, { color: colors.subtext }, studyTab === 'words' && { color: colors.primary, fontWeight: '800' }]}>
              Kelimeler
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.hubTabSwitchBtn, studyTab === 'phrases' && [styles.activeHubTabSwitchBtn, { backgroundColor: colors.surface }]]}
            onPress={() => {
              setStudyTab('phrases');
              if (selectedLevel === 'due') setSelectedLevel('all');
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="chatbubbles-outline" size={17} color={studyTab === 'phrases' ? colors.primary : colors.subtext} />
            <Text style={[styles.hubTabSwitchText, { color: colors.subtext }, studyTab === 'phrases' && { color: colors.primary, fontWeight: '800' }]}>
              Cümle & Soru Kalıpları
            </Text>
          </TouchableOpacity>
        </View>

        {/* Phrase Categories Selector (Only when studyTab === 'phrases') */}
        {studyTab === 'phrases' && (
          <View style={styles.hubFilterSection}>
            <Text style={[styles.hubFilterLabel, { color: colors.subtext }]}>Kategori / Konu Seçin:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hubFilterScroll}>
              {phraseCategories.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.hubLevelChip,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    selectedPhraseCategory === cat.id && styles.activeHubLevelChip
                  ]}
                  onPress={() => setSelectedPhraseCategory(cat.id)}
                >
                  <Text style={[styles.hubLevelChipText, { color: colors.text }, selectedPhraseCategory === cat.id && styles.activeHubLevelChipText]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Level Selector */}
        <View style={styles.hubFilterSection}>
          <Text style={[styles.hubFilterLabel, { color: colors.subtext }]}>Seviye Seçin:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hubFilterScroll}>
            {levels.map(lvl => (
              <TouchableOpacity
                key={lvl}
                style={[
                  styles.hubLevelChip,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  selectedLevel === lvl && styles.activeHubLevelChip
                ]}
                onPress={() => setSelectedLevel(lvl)}
              >
                <Text style={[styles.hubLevelChipText, { color: colors.text }, selectedLevel === lvl && styles.activeHubLevelChipText]}>
                  {lvl === 'due' ? '🔥 Tekrarlar' : lvl === 'all' ? '✨ Tümü' : lvl}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Session Count Selector (25, 50, 100, Tümü) */}
        <View style={styles.hubLimitSection}>
          <Text style={[styles.hubFilterLabel, { color: colors.subtext }]}>{studyTab === 'phrases' ? 'Kalıp Sınırı:' : 'Kelime Sınırı:'}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hubFilterScroll}>
            {limitOptions.map(opt => (
              <TouchableOpacity
                key={opt.val}
                style={[
                  styles.hubLimitChip,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  sessionLimit === opt.val && styles.activeHubLimitChip
                ]}
                onPress={() => setSessionLimit(opt.val)}
              >
                <Text style={[styles.hubLimitChipText, { color: colors.text }, sessionLimit === opt.val && styles.activeHubLimitChipText]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 6 Large Colorful Study Mode Cards (Screenshot 1 Exact Layout) */}
        <ScrollView contentContainerStyle={styles.hubGridScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.hubGrid}>
            {/* 1. Kelime / Kalıp Kartları (Blue) */}
            <TouchableOpacity
              activeOpacity={0.88}
              style={[styles.modeCard, styles.cardBlue]}
              onPress={() => setActiveMode('card')}
            >
              <Text style={styles.modeCardTitle}>
                {studyTab === 'phrases' ? `Kalıp & Soru\nKartları` : `Kelime\nKartları`}
              </Text>
              <View style={styles.modeCardIconWrap}>
                <Ionicons name="document-text-outline" size={42} color="rgba(255,255,255,0.9)" />
              </View>
            </TouchableOpacity>

            {/* 2. Çoktan Seçmeli (Red) */}
            <TouchableOpacity
              activeOpacity={0.88}
              style={[styles.modeCard, styles.cardRed]}
              onPress={() => setActiveMode('quiz')}
            >
              <Text style={styles.modeCardTitle}>Çoktan{'\n'}Seçmeli</Text>
              <View style={styles.modeCardIconWrap}>
                <Ionicons name="checkbox-outline" size={42} color="rgba(255,255,255,0.9)" />
              </View>
            </TouchableOpacity>

            {/* 3. Yazma Çalışması (Green) */}
            <TouchableOpacity
              activeOpacity={0.88}
              style={[styles.modeCard, styles.cardGreen]}
              onPress={() => setActiveMode('writing')}
            >
              <Text style={styles.modeCardTitle}>Yazma{'\n'}Çalışması</Text>
              <View style={styles.modeCardIconWrap}>
                <Ionicons name="create-outline" size={42} color="rgba(255,255,255,0.9)" />
              </View>
            </TouchableOpacity>

            {/* 4. Kelime / Cümle Eşleştirme (Mustard/Yellow) */}
            <TouchableOpacity
              activeOpacity={0.88}
              style={[styles.modeCard, styles.cardYellow]}
              onPress={() => setActiveMode('matching')}
            >
              <Text style={[styles.modeCardTitle, styles.titleYellow]}>
                {studyTab === 'phrases' ? `Cümle\nEşleştirme` : `Kelime\nEşleştirme`}
              </Text>
              <View style={styles.modeCardIconWrap}>
                <Ionicons name="extension-puzzle-outline" size={42} color="rgba(255,243,196,0.95)" />
              </View>
            </TouchableOpacity>

            {/* 5. Karışık Kelimeler / Cümleler (Burgundy/Purple - Anagram) */}
            <TouchableOpacity
              activeOpacity={0.88}
              style={[styles.modeCard, styles.cardPurple]}
              onPress={() => setActiveMode('jumbled')}
            >
              <Text style={styles.modeCardTitle}>
                {studyTab === 'phrases' ? `Karışık\nCümleler` : `Karışık\nKelimeler`}
              </Text>
              <View style={styles.modeCardIconWrap}>
                <Ionicons name="shuffle-outline" size={42} color="rgba(255,255,255,0.9)" />
              </View>
            </TouchableOpacity>

            {/* 6. Hızlı Kartlar (Deep Violet) */}
            <TouchableOpacity
              activeOpacity={0.88}
              style={[styles.modeCard, styles.cardViolet]}
              onPress={() => setActiveMode('fast')}
            >
              <Text style={styles.modeCardTitle}>Hızlı{'\n'}Kartlar</Text>
              <View style={styles.modeCardIconWrap}>
                <Ionicons name="flash-outline" size={42} color="rgba(255,255,255,0.9)" />
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Info Modal */}
        <Modal visible={showInfoModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.modalHeader}>
                <Ionicons name="information-circle" size={24} color={colors.primary} />
                <Text style={[styles.modalTitle, { color: colors.text }]}>Çalışma Modları & Değerlendirme</Text>
              </View>
              <ScrollView style={styles.modalScroll}>
                <Text style={[styles.modalText, { color: colors.text }]}>
                  • <Text style={[styles.boldText, { color: colors.text }]}>🌟 Kesin Biliyorum:</Text> Kelimeyi 5. Kutuya (Öğrenilenlere) arşivler, bir daha testlerde karşınıza çıkmaz.{'\n\n'}
                  • <Text style={[styles.boldText, { color: colors.text }]}>🟢 Biliyorum:</Text> Kelimenin kutu seviyesini 1 artırarak bir sonraki unutma eşiğine erteler.{'\n\n'}
                  • <Text style={[styles.boldText, { color: colors.text }]}>🔴 Öğreneceğim:</Text> Kelimeyi 1. Kutuya alarak zayıf kelimeler havuzuna ekler.
                </Text>
              </ScrollView>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowInfoModal(false)}>
                <Text style={styles.modalCloseBtnText}>Anladım</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // ================= 2. ACTIVE EXERCISE VIEW =================
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header */}
      <View style={[styles.exerciseHeader, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backToHubBtn} onPress={handleExitStudy}>
          <Ionicons name="grid-outline" size={18} color="#2563eb" />
          <Text style={styles.backToHubText}>Modlar</Text>
        </TouchableOpacity>

        <View style={styles.titleWrapper}>
          <Text style={[styles.exerciseHeaderTitle, { color: colors.text }]}>
            {activeMode === 'card' && (studyTab === 'phrases' ? 'Kalıp & Soru Kartları' : 'Kelime Kartları')}
            {activeMode === 'quiz' && 'Çoktan Seçmeli'}
            {activeMode === 'writing' && 'Yazma Çalışması'}
            {activeMode === 'matching' && (studyTab === 'phrases' ? 'Cümle Eşleştirme' : 'Kelime Eşleştirme')}
            {activeMode === 'jumbled' && (studyTab === 'phrases' ? 'Karışık Cümleler' : 'Karışık Kelimeler')}
            {activeMode === 'fast' && 'Hızlı Kartlar'}
          </Text>
          <Text style={[styles.exerciseHeaderSub, { color: colors.subtext }]}>
            Tur {currentRound} • Soru {currentWordNum}/{roundTotal} ({initialTotal} Kelime)
          </Text>
        </View>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={[styles.headerSkipBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={handleSkipWord}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="play-forward" size={12} color={colors.primary} />
            <Text style={[styles.headerSkipText, { color: colors.primary }]}>Geç</Text>
          </TouchableOpacity>

          <View style={[styles.counterBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.counterText, { color: colors.primary }]}>
              {`${currentWordNum}/${roundTotal}`}
            </Text>
          </View>
        </View>
      </View>

      {/* Progress Bar Track */}
      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
      </View>

      {/* Main Content Area */}
      <View style={styles.contentArea}>
        {completed ? (
          <ScrollView contentContainerStyle={styles.completedScroll}>
            <View style={styles.completedCard}>
              <View style={styles.trophyCircle}>
                <Ionicons name="trophy" size={50} color="#f59e0b" />
              </View>
              <Text style={styles.completedTitle}>Tebrikler! Seans Tamamlandı 🎉</Text>
              <Text style={styles.completedSub}>
                Seçtiğiniz {initialTotal} kelimenin tamamını başarıyla öğrendiniz ve geçtiniz!
              </Text>

              {/* Havuzlar Özeti */}
              <View style={styles.poolsSummary}>
                <View style={styles.poolCardSuccess}>
                  <View style={styles.poolHeader}>
                    <Ionicons name="checkmark-circle" size={18} color="#16a34a" />
                    <Text style={styles.poolSuccessTitle}>Öğrenilen Kelimeler ({sessionKnownWords.length})</Text>
                  </View>
                  <Text style={styles.poolWordsList} numberOfLines={3}>
                    {sessionKnownWords.length > 0
                      ? sessionKnownWords.map(w => w.english).join(', ')
                      : 'Bu seansta öğrenilen kelimeler tamamlandı.'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity style={styles.restartBtn} onPress={loadStudySession}>
                <Ionicons name="refresh" size={18} color="#ffffff" />
                <Text style={styles.restartBtnText}>Yeni Bir Seansa Başla</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.finishBtn} onPress={() => setActiveMode(null)}>
                <Text style={styles.finishBtnText}>Mod Seçimine Dön</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : currentWord ? (
          <View style={styles.activeExerciseContainer}>
            {(activeMode === 'card' || activeMode === 'fast') && (
              <WordCard
                word={currentWord}
                onAnswer={handleWordAnswer}
                onDirectMaster={handleDirectMaster}
                onWordUpdated={handleWordUpdated}
                onSkip={handleSkipWord}
              />
            )}

            {activeMode === 'quiz' && (
              <QuizMode
                currentWord={currentWord}
                allWords={allDistractorWords.length > 0 ? allDistractorWords : initialSessionWords}
                onAnswer={handleWordAnswer}
                onDirectMaster={handleDirectMaster}
                onSkip={handleSkipWord}
              />
            )}

            {activeMode === 'writing' && (
              <WritingExercise
                currentWord={currentWord}
                onAnswer={handleWordAnswer}
                onDirectMaster={handleDirectMaster}
                onSkip={handleSkipWord}
              />
            )}

            {activeMode === 'matching' && (
              <MatchingGame
                words={roundWords.slice(roundIndex, roundIndex + 5)}
                onRoundComplete={handleMatchingRoundComplete}
              />
            )}

            {activeMode === 'jumbled' && (
              <JumbledWordsExercise
                currentWord={currentWord}
                onAnswer={handleWordAnswer}
                onDirectMaster={handleDirectMaster}
                onSkip={handleSkipWord}
              />
            )}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-done-circle-outline" size={64} color="#16a34a" />
            <Text style={styles.emptyTitle}>
              {studyTab === 'phrases'
                ? 'Kalıp / Cümle Bulunamadı'
                : selectedLevel === 'due'
                ? 'Tekrar Edilecek Kelime Yok 🎉'
                : 'Kelime Bulunamadı'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {studyTab === 'phrases'
                ? 'Seçtiğiniz kategori veya seviyede kalıp bulunamadı. Lütfen başka bir kategori veya seviye seçerek deneyin.'
                : selectedLevel === 'due'
                ? 'Önceden çalışılmış ve tekrar zamanı gelmiş bir kelimeniz yok. Yeni kelimeler öğrenmek için A1, A2 gibi seviyelerden çalışma başlatabilirsiniz!'
                : 'Bu seviyede gösterilecek kelime bulunamadı veya tüm kelimeler tamamlandı.'}
            </Text>
            <TouchableOpacity style={styles.restartBtn} onPress={() => setActiveMode(null)}>
              <Text style={styles.restartBtnText}>Mod Seçimine Dön</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // HUB CLEAN MODERN WHITE THEME
  hubContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: 8,
  },
  hubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  hubHeaderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    gap: 8,
    flex: 1,
    marginRight: 12,
  },
  hubHeaderEmoji: {
    fontSize: 18,
  },
  hubHeaderPillText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1e40af',
  },
  hubSettingsBtn: {
    padding: 8,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  hubTabSwitchContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    padding: 4,
    marginHorizontal: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  hubTabSwitchBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  activeHubTabSwitchBtn: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  hubTabSwitchText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  activeHubTabSwitchText: {
    color: '#2563eb',
  },
  hubFilterSection: {
    paddingHorizontal: 18,
    marginBottom: 10,
  },
  hubFilterLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  hubFilterScroll: {
    gap: 8,
  },
  hubLevelChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  activeHubLevelChip: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  hubLevelChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  activeHubLevelChipText: {
    color: '#ffffff',
  },
  hubLimitSection: {
    paddingHorizontal: 18,
    marginBottom: 16,
  },
  hubLimitChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  activeHubLimitChip: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  hubLimitChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  activeHubLimitChipText: {
    color: '#ffffff',
  },
  hubGridScroll: {
    paddingHorizontal: 18,
    paddingBottom: 40,
  },
  hubGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 14,
  },
  modeCard: {
    width: '48%',
    height: 165,
    borderRadius: 22,
    padding: 16,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  cardBlue: {
    backgroundColor: '#1565c0',
  },
  cardRed: {
    backgroundColor: '#b71c1c',
  },
  cardGreen: {
    backgroundColor: '#2e7d32',
  },
  cardYellow: {
    backgroundColor: '#8d6e15',
  },
  cardPurple: {
    backgroundColor: '#7b1fa2',
  },
  cardViolet: {
    backgroundColor: '#4a148c',
  },
  modeCardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
    lineHeight: 22,
  },
  titleYellow: {
    color: '#ffffff',
  },
  modeCardIconWrap: {
    alignSelf: 'flex-start',
    marginTop: 'auto',
  },

  // EXERCISE ACTIVE SCREEN (Clean Light Theme)
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 10,
  },
  backToHubBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  backToHubText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563eb',
  },
  titleWrapper: {
    flex: 1,
  },
  exerciseHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  exerciseHeaderSub: {
    fontSize: 11,
    color: '#64748b',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerSkipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  headerSkipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  counterBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  counterText: {
    color: '#2563eb',
    fontWeight: '800',
    fontSize: 12,
  },
  progressBarTrack: {
    width: '100%',
    height: 4,
    backgroundColor: '#e2e8f0',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2563eb',
  },
  contentArea: {
    flex: 1,
    paddingVertical: 10,
  },
  activeExerciseContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedScroll: {
    padding: 16,
  },
  roundSummaryScroll: {
    padding: 16,
    width: '100%',
  },
  roundSummaryCard: {
    width: '100%',
    padding: 22,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  roundBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  roundBadgeText: {
    color: '#2563eb',
    fontSize: 13,
    fontWeight: '800',
  },
  roundSummaryTitle: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  roundSummaryDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  failedPreviewBox: {
    width: '100%',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
    marginVertical: 4,
  },
  failedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  failedPreviewTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#dc2626',
  },
  failedPreviewList: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  nextRoundBtn: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    gap: 8,
    width: '100%',
    marginTop: 6,
  },
  nextRoundBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  finishEarlyBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  finishEarlyText: {
    fontSize: 13,
    fontWeight: '600',
  },
  completedCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  trophyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  completedTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 6,
  },
  completedSub: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
  },
  poolsSummary: {
    width: '100%',
    gap: 12,
    marginBottom: 18,
  },
  poolCardSuccess: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 16,
    padding: 12,
    gap: 4,
  },
  poolCardDanger: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 16,
    padding: 12,
    gap: 4,
  },
  poolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  poolSuccessTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#166534',
  },
  poolDangerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#991b1b',
  },
  poolWordsList: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  repeatFailedBtn: {
    backgroundColor: '#dc2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    gap: 8,
    width: '100%',
    marginBottom: 10,
  },
  repeatFailedBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  restartBtn: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    gap: 8,
    width: '100%',
    marginBottom: 10,
  },
  restartBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  finishBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  finishBtnText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
    flex: 1,
  },
  modalScroll: {
    maxHeight: 340,
  },
  modalText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 10,
  },
  boldText: {
    fontWeight: '800',
    color: '#0f172a',
  },
  modalCloseBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  modalCloseBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
});
