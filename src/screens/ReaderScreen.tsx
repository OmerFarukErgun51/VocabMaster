import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReadingMaterial } from '../types';
import { InteractiveText } from '../components/InteractiveText';
import { speakWord, stopSpeech } from '../services/speech';
import { simplifyTextWithAI } from '../services/gemini';
import { deleteReading } from '../services/database';
import { useTheme } from '../context/ThemeContext';

interface ReaderScreenProps {
  reading: ReadingMaterial;
  onBack: () => void;
}

export const ReaderScreen: React.FC<ReaderScreenProps> = ({ reading, onBack }) => {
  const { colors, mode, toggleTheme } = useTheme();
  const [content, setContent] = useState(reading.content);
  const [isSimplified, setIsSimplified] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [addedWordNotice, setAddedWordNotice] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'interactive' | 'sentences'>('interactive');
  const [revealedTranslations, setRevealedTranslations] = useState<Record<number, boolean>>({});

  // Generate sentences list if available from reading.sentences or parse paragraphs
  const sentencesList = React.useMemo(() => {
    if (reading.sentences && reading.sentences.length > 0) {
      return reading.sentences;
    }
    // Fallback split sentences from content
    const rawSentences = content
      .split(/(?<=[.?!])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 5);

    return rawSentences.map(s => ({
      en: s,
      tr: 'Cümle çevirisi için Gemini AI veya sözlük modunu kullanabilirsiniz.'
    }));
  }, [reading.sentences, content]);

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      stopSpeech();
      setIsPlayingAudio(false);
    } else {
      speakWord(content, 0.85);
      setIsPlayingAudio(true);
    }
  };

  const handleSpeakSentence = (text: string) => {
    speakWord(text, 0.85);
  };

  const handleToggleSentenceTranslation = (idx: number) => {
    setRevealedTranslations(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handleRevealAll = () => {
    const all: Record<number, boolean> = {};
    sentencesList.forEach((_, i) => { all[i] = true; });
    setRevealedTranslations(all);
  };

  const handleHideAll = () => {
    setRevealedTranslations({});
  };

  const handleSimplifyAI = async () => {
    if (isSimplified) {
      setContent(reading.content);
      setIsSimplified(false);
      return;
    }

    setLoadingAI(true);
    try {
      const simplified = await simplifyTextWithAI(reading.content, 'B1');
      setContent(simplified);
      setIsSimplified(true);
    } catch (err: any) {
      Alert.alert('AI Hatası', err.message || 'Metin basitleştirilemedi. Ayarlardan API anahtarınızı kontrol ediniz.');
    } finally {
      setLoadingAI(false);
    }
  };

  const handleWordAdded = (word: string) => {
    setAddedWordNotice(`"${word}" kelime havuzunuza eklendi!`);
    setTimeout(() => {
      setAddedWordNotice(null);
    }, 2500);
  };

  const handleDeleteCurrentReading = () => {
    Alert.alert(
      'Okuma Parçasını Sil',
      `"${reading.title}" metnini kütüphanenizden silmek istediğinize emin misiniz?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            deleteReading(reading.id);
            onBack();
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            {reading.title}
          </Text>
          <Text style={[styles.headerSub, { color: colors.subtext }]}>{reading.source}</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <TouchableOpacity
            style={[styles.audioBtn, { backgroundColor: mode === 'dark' ? '#334155' : '#f1f5f9' }]}
            onPress={toggleTheme}
            activeOpacity={0.7}
            accessibilityLabel="Tema Değiştir"
          >
            <Ionicons
              name={mode === 'dark' ? 'sunny' : 'moon'}
              size={20}
              color={mode === 'dark' ? '#fbbf24' : '#6366f1'}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.audioBtn} onPress={handleToggleAudio}>
            <Ionicons
              name={isPlayingAudio ? 'stop-circle' : 'volume-high-outline'}
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.audioBtn, { backgroundColor: mode === 'dark' ? '#334155' : '#f1f5f9' }]}
            onPress={handleDeleteCurrentReading}
            activeOpacity={0.7}
            accessibilityLabel="Metni Kütüphaneden Sil"
          >
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Added Word Notification Toast */}
      {addedWordNotice && (
        <View style={styles.toastNotice}>
          <Ionicons name="checkmark-circle" size={18} color="#ffffff" />
          <Text style={styles.toastText}>{addedWordNotice}</Text>
        </View>
      )}

      {/* Mode Switcher Tabs */}
      <View style={[styles.modeTabBar, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.modeTab, { backgroundColor: colors.card }, viewMode === 'interactive' && styles.activeModeTab]}
          onPress={() => setViewMode('interactive')}
        >
          <Ionicons name="book-outline" size={16} color={viewMode === 'interactive' ? colors.primary : colors.subtext} />
          <Text style={[styles.modeTabText, { color: colors.subtext }, viewMode === 'interactive' && styles.activeModeTabText]}>
            Kelimeye Dokunarak Oku
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeTab, { backgroundColor: colors.card }, viewMode === 'sentences' && styles.activeModeTab]}
          onPress={() => setViewMode('sentences')}
        >
          <Ionicons name="language-outline" size={16} color={viewMode === 'sentences' ? colors.primary : colors.subtext} />
          <Text style={[styles.modeTabText, { color: colors.subtext }, viewMode === 'sentences' && styles.activeModeTabText]}>
            Cümle Cümle Çeviri
          </Text>
        </TouchableOpacity>
      </View>

      {/* AI Controls Bar */}
      <View style={[styles.aiControlsBar, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[styles.aiPill, isSimplified && styles.activeAiPill]}
          onPress={handleSimplifyAI}
          disabled={loadingAI}
        >
          {loadingAI ? (
            <ActivityIndicator size="small" color="#2563eb" />
          ) : (
            <>
              <Ionicons name="sparkles" size={15} color={isSimplified ? '#ffffff' : '#2563eb'} />
              <Text style={[styles.aiPillText, isSimplified && styles.activeAiPillText]}>
                {isSimplified ? 'Orijinal Metne Dön' : 'Metni Kolaylaştır (B1 AI)'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {viewMode === 'sentences' && (
          <View style={styles.revealAllRow}>
            <TouchableOpacity style={[styles.smallActionBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={handleRevealAll}>
              <Text style={[styles.smallActionText, { color: colors.text }]}>Tümünü Göster</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.smallActionBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={handleHideAll}>
              <Text style={[styles.smallActionText, { color: colors.text }]}>Gizle</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Reader Body */}
      <ScrollView contentContainerStyle={styles.readerScroll} showsVerticalScrollIndicator={false}>
        {/* Poster / Header Cover */}
        {reading.image_url ? (
          <View style={styles.coverImageContainer}>
            <Image source={{ uri: reading.image_url }} style={styles.coverImage} resizeMode="cover" />
            <View style={styles.coverGradient}>
              <View style={styles.levelBadge}>
                <Text style={styles.levelBadgeText}>{reading.level}</Text>
              </View>
              <Text style={styles.coverTitle}>{reading.title}</Text>
            </View>
          </View>
        ) : null}

        {/* View Mode 1: Interactive Word Reading */}
        {viewMode === 'interactive' ? (
          <View>
            <View style={[styles.readerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <InteractiveText content={content} onWordAdded={handleWordAdded} />
            </View>

            <View style={[styles.helperFooter, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
              <Text style={[styles.helperFooterText, { color: colors.subtext }]}>
                Bilmediğiniz herhangi bir kelimeye dokunarak anında telaffuzunu, Türkçe anlamını görebilir ve tek tuşla kelime havuzunuza ekleyebilirsiniz.
              </Text>
            </View>
          </View>
        ) : (
          /* View Mode 2: Sentence-by-Sentence Parallel Translation */
          <View style={styles.sentencesContainer}>
            {sentencesList.map((item, idx) => {
              const isRevealed = Boolean(revealedTranslations[idx]);
              return (
                <View key={idx} style={[styles.sentenceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.sentenceTopRow}>
                    <View style={styles.sentenceIndexBadge}>
                      <Text style={styles.sentenceIndexText}>{idx + 1}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.sentenceSpeakBtn}
                      onPress={() => handleSpeakSentence(item.en)}
                    >
                      <Ionicons name="volume-medium-outline" size={18} color={colors.primary} />
                    </TouchableOpacity>
                  </View>

                  <Text style={[styles.sentenceEnText, { color: colors.text }]}>{item.en}</Text>

                  <TouchableOpacity
                    style={styles.revealBtn}
                    onPress={() => handleToggleSentenceTranslation(idx)}
                  >
                    <Ionicons
                      name={isRevealed ? 'eye-off-outline' : 'eye-outline'}
                      size={16}
                      color={colors.primary}
                    />
                    <Text style={[styles.revealBtnText, { color: colors.primary }]}>
                      {isRevealed ? 'Çeviriyi Gizle' : 'Türkçe Çeviriyi Gör'}
                    </Text>
                  </TouchableOpacity>

                  {isRevealed && (
                    <View style={[styles.translationBox, { backgroundColor: colors.surface }]}>
                      <Text style={[styles.translationText, { color: colors.text }]}>{item.tr}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 12,
  },
  backBtn: {
    padding: 6,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  headerSub: {
    fontSize: 12,
    color: '#64748b',
  },
  audioBtn: {
    padding: 6,
  },
  modeTabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 12,
    gap: 6,
    backgroundColor: '#f1f5f9',
  },
  activeModeTab: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  activeModeTabText: {
    color: '#2563eb',
  },
  toastNotice: {
    backgroundColor: '#16a34a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 8,
  },
  toastText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  aiControlsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f8fafc',
  },
  aiPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  activeAiPill: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  aiPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563eb',
  },
  activeAiPillText: {
    color: '#ffffff',
  },
  revealAllRow: {
    flexDirection: 'row',
    gap: 6,
  },
  smallActionBtn: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  smallActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  readerScroll: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  coverImageContainer: {
    width: '100%',
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0f172a',
    marginBottom: 8,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    padding: 16,
    gap: 6,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#2563eb',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  levelBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  coverTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  readerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  helperFooter: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    padding: 14,
    borderRadius: 16,
    gap: 10,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  helperFooterText: {
    flex: 1,
    fontSize: 12,
    color: '#1e40af',
    lineHeight: 18,
    fontWeight: '500',
  },
  sentencesContainer: {
    gap: 14,
  },
  sentenceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    gap: 10,
  },
  sentenceTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sentenceIndexBadge: {
    backgroundColor: '#f1f5f9',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sentenceIndexText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
  },
  sentenceSpeakBtn: {
    padding: 4,
  },
  sentenceEnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    lineHeight: 24,
  },
  revealBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#eff6ff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  revealBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563eb',
  },
  translationBox: {
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#16a34a',
  },
  translationText: {
    fontSize: 14,
    color: '#166534',
    lineHeight: 22,
    fontWeight: '500',
  },
});
