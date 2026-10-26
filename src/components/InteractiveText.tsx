import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { findWordByEnglish, addCustomWord } from '../services/database';
import { lookupWordDetails } from '../services/gemini';
import { speakWord } from '../services/speech';
import { autoDetectWordInfo } from '../services/cefrDetector';
import { useTheme } from '../context/ThemeContext';

interface InteractiveTextProps {
  content: string;
  source?: string;
  onWordAdded?: (word: string) => void;
}

export const InteractiveText: React.FC<InteractiveTextProps> = ({ content, source, onWordAdded }) => {
  const { colors, mode } = useTheme();
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [wordDetails, setWordDetails] = useState<{
    turkish: string;
    partOfSpeech?: string;
    example?: string;
    level?: string;
    isSaved: boolean;
  } | null>(null);

  const cleanWord = (raw: string) => {
    return raw.replace(/^[^\w]+|[^\w]+$/g, '').trim();
  };

  const handleWordPress = async (rawWord: string) => {
    const cleaned = cleanWord(rawWord);
    if (!cleaned || cleaned.length < 2) return;

    setSelectedWord(cleaned);
    setModalVisible(true);

    // 1. Instant local SQLite DB search (exact + irregulars + lemmatized stems)
    const localWord = findWordByEnglish(cleaned);
    if (localWord) {
      setWordDetails({
        turkish: localWord.turkish,
        partOfSpeech: localWord.part_of_speech,
        example: localWord.example_en,
        level: localWord.level,
        isSaved: true,
      });
      setLoading(false);
      return;
    }

    // 2. Fast AI / CEFR detector with 2.5s maximum timeout
    setLoading(true);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 2500)
    );

    try {
      const details = await Promise.race([
        autoDetectWordInfo(cleaned),
        timeoutPromise
      ]);

      const trMeaning = (details.turkish && details.turkish !== 'anlam giriniz...')
        ? details.turkish
        : 'Anlamı eklemek için dokunun';

      setWordDetails({
        turkish: trMeaning,
        partOfSpeech: details.partOfSpeech || 'kelime',
        example: details.example_en || `Example for "${cleaned}".`,
        level: details.level || 'B1',
        isSaved: false,
      });
    } catch {
      // Instant graceful fallback when offline or timeout
      setWordDetails({
        turkish: 'Anlamı eklemek için dokunun',
        partOfSpeech: 'kelime',
        example: `Example for "${cleaned}".`,
        level: cleaned.length <= 4 ? 'A1' : cleaned.length <= 7 ? 'A2' : 'B1',
        isSaved: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWord = () => {
    if (!selectedWord || !wordDetails) return;

    // Check duplicate
    const existing = findWordByEnglish(selectedWord);
    if (existing) {
      Alert.alert(
        'Kelime Zaten Mevcut',
        `"${selectedWord}" kelimesi zaten [${existing.level}] seviyesinde (${existing.is_mastered ? 'Öğrenilenler' : 'Çalışılanlar'}) havuzunuzda bulunmaktadır. Tekrar ekleyemezsiniz.`
      );
      return;
    }

    const result = addCustomWord(
      selectedWord,
      wordDetails.turkish,
      wordDetails.example || '',
      '',
      (wordDetails.level as any) || 'B1',
      'reading'
    );

    if (result.success) {
      setWordDetails({ ...wordDetails, isSaved: true });
      if (onWordAdded) onWordAdded(selectedWord);
    } else {
      Alert.alert('Uyarı', result.message || 'Kelime eklenemedi.');
    }
  };

  const renderParagraphs = () => {
    const paragraphs = content.split('\n\n');
    return paragraphs.map((para, pIdx) => {
      const words = para.split(/\s+/);
      return (
        <View key={`p-${pIdx}`} style={styles.paragraph}>
          {words.map((w, wIdx) => {
            const cleaned = cleanWord(w);
            const isClickable = cleaned.length >= 2;
            return (
              <TouchableOpacity
                key={`w-${pIdx}-${wIdx}`}
                activeOpacity={0.6}
                onPress={() => handleWordPress(w)}
                disabled={!isClickable}
              >
                <Text style={[styles.wordText, isClickable && styles.clickableWord, { color: colors.text }]}>
                  {w}{' '}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      );
    });
  };

  return (
    <View style={styles.container}>
      {source ? <Text style={styles.sourceText}>{source}</Text> : null}
      <View style={styles.textContainer}>{renderParagraphs()}</View>

      {/* Word Details Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <View style={styles.modalWordRow}>
                <Text style={[styles.modalWord, { color: colors.text }]}>{selectedWord}</Text>
                {wordDetails?.level ? (
                  <View style={styles.levelTag}>
                    <Text style={styles.levelTagText}>{wordDetails.level}</Text>
                  </View>
                ) : null}
                <TouchableOpacity
                  style={[styles.speakerBtn, { backgroundColor: colors.surface }]}
                  onPress={() => selectedWord && speakWord(selectedWord)}
                >
                  <Ionicons name="volume-high" size={22} color={colors.primary} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={26} color={colors.subtext} />
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.subtext }]}>Seviye ve anlam tespiti yapılıyor...</Text>
              </View>
            ) : wordDetails ? (
              <View style={styles.detailsBody}>
                <Text style={styles.turkishText}>{wordDetails.turkish}</Text>
                {wordDetails.partOfSpeech ? (
                  <Text style={[styles.partOfSpeechText, { color: colors.subtext }]}>({wordDetails.partOfSpeech})</Text>
                ) : null}

                {wordDetails.example ? (
                  <View style={[styles.exampleBox, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.exampleLabel, { color: colors.subtext }]}>Örnek:</Text>
                    <Text style={[styles.exampleText, { color: colors.text }]}>"{wordDetails.example}"</Text>
                  </View>
                ) : null}

                <TouchableOpacity
                  style={[
                    styles.saveBtn,
                    wordDetails.isSaved ? styles.savedBtn : styles.unsavedBtn,
                  ]}
                  onPress={handleSaveWord}
                  disabled={wordDetails.isSaved}
                >
                  <Ionicons
                    name={wordDetails.isSaved ? 'checkmark-circle' : 'add-circle-outline'}
                    size={20}
                    color="#ffffff"
                  />
                  <Text style={styles.saveBtnText}>
                    {wordDetails.isSaved ? 'Kelimelerinizde Kayıtlı' : `Havuzuma Ekle (${wordDetails.level || 'B1'})`}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  sourceText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  textContainer: {
    gap: 16,
  },
  paragraph: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    lineHeight: 28,
  },
  wordText: {
    fontSize: 17,
    lineHeight: 28,
  },
  clickableWord: {
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalWordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalWord: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0f172a',
  },
  levelTag: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  levelTagText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563eb',
  },
  speakerBtn: {
    backgroundColor: '#eff6ff',
    padding: 6,
    borderRadius: 16,
  },
  loadingContainer: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
  },
  detailsBody: {
    gap: 12,
  },
  turkishText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2563eb',
  },
  partOfSpeechText: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
  },
  exampleBox: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    marginTop: 6,
  },
  exampleLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 4,
  },
  exampleText: {
    fontSize: 14,
    color: '#334155',
    fontStyle: 'italic',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    marginTop: 12,
  },
  unsavedBtn: {
    backgroundColor: '#2563eb',
  },
  savedBtn: {
    backgroundColor: '#16a34a',
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
