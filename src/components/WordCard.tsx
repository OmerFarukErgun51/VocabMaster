import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Word, CEFRLevel } from '../types';
import { speakWord } from '../services/speech';
import { updateWordDetails, markWordDirectlyMastered } from '../services/database';
import { useTheme } from '../context/ThemeContext';

interface WordCardProps {
  word: Word;
  onAnswer: (isCorrect: boolean) => void;
  onDirectMaster?: (word: Word) => void;
  onWordUpdated?: (updatedWord: Word) => void;
  onSkip?: () => void;
}

export const WordCard: React.FC<WordCardProps> = ({
  word,
  onAnswer,
  onDirectMaster,
  onWordUpdated,
  onSkip,
}) => {
  const { colors, mode } = useTheme();
  const [isFlipped, setIsFlipped] = useState(false);
  const [isRevealedForReview, setIsRevealedForReview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Reset card state when word changes
  React.useEffect(() => {
    setIsFlipped(false);
    setIsRevealedForReview(false);
  }, [word.id]);

  // Edit form state
  const [editEn, setEditEn] = useState(word.english);
  const [editTr, setEditTr] = useState(word.turkish);
  const [editExEn, setEditExEn] = useState(word.example_en);
  const [editExTr, setEditExTr] = useState(word.example_tr);
  const [editLevel, setEditLevel] = useState<CEFRLevel>(word.level);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'A1': return '#10b981';
      case 'A2': return '#059669';
      case 'B1': return '#3b82f6';
      case 'B2': return '#2563eb';
      case 'C1': return '#8b5cf6';
      case 'C2': return '#7c3aed';
      default: return '#6b7280';
    }
  };

  const handleSpeak = () => {
    speakWord(word.english);
  };

  const handleSpeakSentence = () => {
    speakWord(word.example_en);
  };

  const handleDirectMaster = () => {
    markWordDirectlyMastered(word.id);
    setIsFlipped(false);
    setIsRevealedForReview(false);
    if (onDirectMaster) {
      onDirectMaster(word);
    } else {
      onAnswer(true);
    }
  };

  const handleForgot = () => {
    if (!isFlipped) {
      // Don't immediately switch away! Flip card to show Turkish meaning and examples
      setIsFlipped(true);
      setIsRevealedForReview(true);
    } else {
      // Already flipped: advance to next card
      setIsFlipped(false);
      setIsRevealedForReview(false);
      onAnswer(false);
    }
  };

  const handleRemembered = () => {
    setIsFlipped(false);
    setIsRevealedForReview(false);
    onAnswer(true);
  };

  const handleSkip = () => {
    setIsFlipped(false);
    setIsRevealedForReview(false);
    if (onSkip) {
      onSkip();
    }
  };

  const handleSaveEdit = () => {
    if (!editEn.trim() || !editTr.trim()) {
      Alert.alert('Hata', 'Kelime ve Türkçe anlamı boş bırakılamaz.');
      return;
    }

    updateWordDetails(word.id, {
      english: editEn,
      turkish: editTr,
      example_en: editExEn,
      example_tr: editExTr,
      level: editLevel,
    });

    const updated: Word = {
      ...word,
      english: editEn.trim(),
      turkish: editTr.trim(),
      example_en: editExEn.trim(),
      example_tr: editExTr.trim(),
      level: editLevel,
    };

    setIsEditing(false);
    if (onWordUpdated) onWordUpdated(updated);
    Alert.alert('Güncellendi ✅', 'Kelime kartı başarıyla güncellendi.');
  };

  const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity 
        activeOpacity={0.92} 
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]} 
        onPress={() => setIsFlipped(!isFlipped)}
      >
        {/* Header Badges & Edit Button */}
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={[styles.badge, { backgroundColor: getLevelColor(word.level) }]}>
              <Text style={styles.badgeText}>{word.level}</Text>
            </View>
            <View style={[styles.srsBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.srsBadgeText, { color: word.is_mastered ? '#b45309' : colors.primary, fontWeight: '800' }]}>
                {word.is_mastered ? '⭐ 5. Kademe (Tam Hafıza)' : `${word.box_level || 1}. Kademe (${word.interval_days || 1} Gün)`}
              </Text>
            </View>
            <Text style={[styles.categoryText, { color: colors.subtext }]}>{(word.category || 'GENEL').toUpperCase()}</Text>
          </View>

          <TouchableOpacity
            style={[styles.editBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={(e) => {
              e.stopPropagation();
              setEditEn(word.english);
              setEditTr(word.turkish);
              setEditExEn(word.example_en);
              setEditExTr(word.example_tr);
              setEditLevel(word.level);
              setIsEditing(true);
            }}
          >
            <Ionicons name="create-outline" size={20} color={colors.subtext} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        {!isFlipped ? (
          // Front Side (English)
          <View style={styles.cardBody}>
            <Text
              style={[
                styles.mainWord,
                { color: colors.text },
                word.english.length > 30
                  ? { fontSize: 20, lineHeight: 28 }
                  : word.english.length > 18
                  ? { fontSize: 24, lineHeight: 32 }
                  : undefined,
              ]}
            >
              {word.english}
            </Text>
            {word.pronunciation ? (
              <Text style={[styles.phonetic, { color: colors.subtext }]}>{word.pronunciation}</Text>
            ) : null}

            <TouchableOpacity style={[styles.listenBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={handleSpeak}>
              <Ionicons name="volume-high" size={20} color={colors.primary} />
              <Text style={[styles.listenBtnText, { color: colors.primary }]}>Telaffuzu Dinle</Text>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            
            <View style={styles.exampleHeaderRow}>
              <Text style={[styles.sectionLabel, { color: colors.subtext }]}>Konuşma & Örnek Cümle:</Text>
              <TouchableOpacity onPress={handleSpeakSentence} style={styles.sentenceSpeakBtn}>
                <Ionicons name="volume-medium-outline" size={17} color={colors.primary} />
                <Text style={[styles.sentenceSpeakText, { color: colors.primary }]}>Cümleyi Dinle</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.exampleEn, { color: colors.text }]}>"{word.example_en}"</Text>

            <Text style={[styles.tapToFlipPrompt, { color: colors.subtext }]}>Türkçe anlamı ve detaylar için dokun 👆</Text>
          </View>
        ) : (
          // Back Side (Turkish & Details)
          <View style={styles.cardBody}>
            <Text
              style={[
                styles.turkishWord,
                word.turkish.length > 35
                  ? { fontSize: 20, lineHeight: 28 }
                  : word.turkish.length > 20
                  ? { fontSize: 24, lineHeight: 32 }
                  : undefined,
              ]}
            >
              {word.turkish}
            </Text>
            <Text style={[styles.partOfSpeech, { color: colors.subtext }]}>
              {word.part_of_speech === 'question'
                ? '(soru kalıbı)'
                : word.part_of_speech === 'phrase'
                ? '(günlük kalıp / ifade)'
                : `(${word.part_of_speech || 'kelime'})`}
            </Text>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <Text style={[styles.sectionLabel, { color: colors.subtext }]}>Cümle Çevirisi:</Text>
            <Text style={[styles.exampleTr, { color: colors.text }]}>"{word.example_tr}"</Text>

            {word.collocations ? (
              <View style={styles.collocationsBox}>
                <Text style={styles.collocationLabel}>Sık Kullanılan Kalıplar:</Text>
                <Text style={styles.collocationText}>{word.collocations}</Text>
              </View>
            ) : null}

            {isRevealedForReview && (
              <View style={styles.reviewBanner}>
                <Ionicons name="information-circle" size={17} color="#dc2626" />
                <Text style={styles.reviewBannerText}>
                  Bu kelime tur sonuna tekrar listesine eklendi. Anlamını inceleyiniz.
                </Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>

      {/* Button Row / Next Step */}
      {isRevealedForReview ? (
        <TouchableOpacity
          style={styles.continueReviewBtn}
          onPress={() => {
            setIsFlipped(false);
            setIsRevealedForReview(false);
            onAnswer(false);
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.continueReviewBtnText}>Anladım, Sonraki Kelimeye Geç</Text>
          <Ionicons name="arrow-forward" size={17} color="#ffffff" />
        </TouchableOpacity>
      ) : (
        <View style={styles.buttonRow}>
          {/* Öğreneceğim (Tekrar Sor) */}
          <TouchableOpacity 
            style={[styles.actionBtn, styles.forgotBtn]} 
            onPress={handleForgot}
            activeOpacity={0.75}
          >
            <Ionicons name="reload-outline" size={17} color="#dc2626" />
            <Text style={styles.forgotBtnText}>Öğreneceğim</Text>
          </TouchableOpacity>

          {/* Geç */}
          {onSkip && (
            <TouchableOpacity 
              style={[styles.actionBtn, styles.skipBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} 
              onPress={handleSkip}
              activeOpacity={0.75}
            >
              <Ionicons name="play-forward-outline" size={17} color={colors.subtext} />
              <Text style={[styles.skipBtnText, { color: colors.subtext }]}>Geç</Text>
            </TouchableOpacity>
          )}

          {/* Öğrendim */}
          <TouchableOpacity 
            style={[styles.actionBtn, styles.rememberedBtn]} 
            onPress={handleRemembered}
            activeOpacity={0.75}
          >
            <Ionicons name="checkmark-circle-outline" size={17} color="#16a34a" />
            <Text style={styles.rememberedBtnText}>Öğrendim</Text>
          </TouchableOpacity>

          {/* Kesin Biliyorum (Öğrenildi / Arşivle) */}
          <TouchableOpacity 
            style={[styles.actionBtn, styles.masteredBtn]} 
            onPress={handleDirectMaster}
            activeOpacity={0.75}
          >
            <Ionicons name="star" size={17} color="#b45309" />
            <Text style={styles.masteredBtnText}>Kesin Biliyorum</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Edit Word Modal */}
      <Modal visible={isEditing} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Kelimeyi Düzenle ✏️</Text>
              <TouchableOpacity onPress={() => setIsEditing(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <Text style={styles.fieldLabel}>İngilizce Kelime:</Text>
              <TextInput
                style={styles.inputField}
                value={editEn}
                onChangeText={setEditEn}
              />

              <Text style={styles.fieldLabel}>Türkçe Karşılığı:</Text>
              <TextInput
                style={styles.inputField}
                value={editTr}
                onChangeText={setEditTr}
              />

              <Text style={styles.fieldLabel}>Seviye (CEFR):</Text>
              <View style={styles.levelChipRow}>
                {levels.map(l => (
                  <TouchableOpacity
                    key={l}
                    style={[styles.levelChip, editLevel === l && styles.activeLevelChip]}
                    onPress={() => setEditLevel(l)}
                  >
                    <Text style={[styles.levelChipText, editLevel === l && styles.activeLevelChipText]}>
                      {l}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Örnek Cümle (İngilizce):</Text>
              <TextInput
                style={[styles.inputField, styles.multilineField]}
                value={editExEn}
                onChangeText={setEditExEn}
                multiline
              />

              <Text style={styles.fieldLabel}>Örnek Cümle (Türkçe):</Text>
              <TextInput
                style={[styles.inputField, styles.multilineField]}
                value={editExTr}
                onChangeText={setEditExTr}
                multiline
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setIsEditing(false)}>
                <Text style={styles.cancelModalBtnText}>Vazgeç</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveModalBtn} onPress={handleSaveEdit}>
                <Text style={styles.saveModalBtnText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  card: {
    width: '100%',
    minHeight: 400,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 12,
  },
  srsBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  srsBadgeText: {
    color: '#1d4ed8',
    fontSize: 11,
    fontWeight: '700',
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  editBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  cardBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 10,
  },
  mainWord: {
    fontSize: 34,
    fontWeight: '900',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 4,
  },
  phonetic: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 14,
    fontStyle: 'italic',
  },
  listenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
    marginBottom: 16,
  },
  listenBtnText: {
    color: '#2563eb',
    fontSize: 13,
    fontWeight: '700',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 14,
  },
  exampleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 6,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  sentenceSpeakBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  sentenceSpeakText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600',
  },
  exampleEn: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#1e293b',
    textAlign: 'center',
    lineHeight: 24,
    marginVertical: 8,
    paddingHorizontal: 8,
  },
  tapToFlipPrompt: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 18,
    fontWeight: '600',
  },
  turkishWord: {
    fontSize: 32,
    fontWeight: '900',
    color: '#16a34a',
    textAlign: 'center',
    marginBottom: 4,
  },
  partOfSpeech: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
    marginBottom: 14,
  },
  exampleTr: {
    fontSize: 16,
    color: '#1e293b',
    textAlign: 'center',
    lineHeight: 24,
    marginVertical: 8,
    paddingHorizontal: 8,
  },
  collocationsBox: {
    marginTop: 14,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    width: '100%',
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  collocationLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 2,
  },
  collocationText: {
    fontSize: 13,
    color: '#1e293b',
    fontWeight: '600',
  },
  masterNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 12,
    width: '100%',
  },
  masterNoticeText: {
    fontSize: 12,
    color: '#92400e',
    flex: 1,
    lineHeight: 18,
  },
  boldText: {
    fontWeight: '800',
  },
  reviewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  reviewBannerText: {
    fontSize: 12,
    color: '#b91c1c',
    fontWeight: '600',
    flex: 1,
    lineHeight: 17,
  },
  continueReviewBtn: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 16,
    gap: 8,
    width: '100%',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  continueReviewBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 8,
    marginTop: 16,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 2,
    borderRadius: 12,
    gap: 3,
  },
  forgotBtn: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  forgotBtnText: {
    color: '#dc2626',
    fontWeight: '700',
    fontSize: 11,
  },
  skipBtn: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  skipBtnText: {
    fontWeight: '700',
    fontSize: 11,
  },
  rememberedBtn: {
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#86efac',
  },
  rememberedBtnText: {
    color: '#16a34a',
    fontWeight: '700',
    fontSize: 11,
  },
  masteredBtn: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  masteredBtnText: {
    color: '#b45309',
    fontWeight: '800',
    fontSize: 11,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  modalScroll: {
    maxHeight: 380,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    marginTop: 10,
    marginBottom: 4,
  },
  inputField: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    padding: 10,
    fontSize: 14,
    color: '#0f172a',
  },
  multilineField: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  levelChipRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4,
  },
  levelChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
  },
  activeLevelChip: {
    backgroundColor: '#2563eb',
  },
  levelChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  activeLevelChipText: {
    color: '#ffffff',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  cancelModalBtn: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelModalBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
  },
  saveModalBtn: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveModalBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
