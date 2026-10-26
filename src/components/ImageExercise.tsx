import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Word } from '../types';
import { speakWord } from '../services/speech';
import { getWordImageUrl } from '../services/imageService';

interface ImageExerciseProps {
  currentWord: Word;
  allWords: Word[];
  onAnswer: (isCorrect: boolean) => void;
}

export const ImageExercise: React.FC<ImageExerciseProps> = ({
  currentWord,
  allWords,
  onAnswer,
}) => {
  const [subMode, setSubMode] = useState<'type' | 'choice'>('type');
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  // Generate 4 image choices
  const choices = React.useMemo(() => {
    const distractors = allWords
      .filter(w => w.id !== currentWord.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(w => w.english);

    return [...distractors, currentWord.english].sort(() => 0.5 - Math.random());
  }, [currentWord.id]);

  const handleCheckTyping = () => {
    if (!input.trim() || feedback !== 'idle') return;

    const normalized = input.trim().toLowerCase();
    const target = currentWord.english.trim().toLowerCase();

    if (normalized === target) {
      setFeedback('correct');
      speakWord(currentWord.english);
      setTimeout(() => {
        setInput('');
        setFeedback('idle');
        onAnswer(true);
      }, 1200);
    } else {
      setFeedback('wrong');
      setTimeout(() => {
        setFeedback('idle');
        onAnswer(false);
      }, 1800);
    }
  };

  const handleSelectChoice = (choice: string) => {
    if (selectedChoice !== null) return;
    setSelectedChoice(choice);

    const isCorrect = choice.toLowerCase() === currentWord.english.toLowerCase();
    speakWord(currentWord.english);

    setTimeout(() => {
      setSelectedChoice(null);
      onAnswer(isCorrect);
    }, 1200);
  };

  const [imageLoading, setImageLoading] = useState(false);
  const imageUrl = getWordImageUrl(currentWord.english, currentWord.image_url, currentWord.category);

  return (
    <View style={styles.container}>
      {/* Submode Switcher */}
      <View style={styles.subModeRow}>
        <TouchableOpacity
          style={[styles.subModeBtn, subMode === 'type' && styles.activeSubModeBtn]}
          onPress={() => setSubMode('type')}
        >
          <Ionicons name="pencil" size={14} color={subMode === 'type' ? '#2563eb' : '#64748b'} />
          <Text style={[styles.subModeText, subMode === 'type' && styles.activeSubModeText]}>
            Görselden Yazma
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subModeBtn, subMode === 'choice' && styles.activeSubModeBtn]}
          onPress={() => setSubMode('choice')}
        >
          <Ionicons name="list" size={14} color={subMode === 'choice' ? '#2563eb' : '#64748b'} />
          <Text style={[styles.subModeText, subMode === 'choice' && styles.activeSubModeText]}>
            Görselden Seçme
          </Text>
        </TouchableOpacity>
      </View>

      {/* Image Card */}
      <View style={styles.imageCard}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.mainImage}
          resizeMode="cover"
          onLoadStart={() => setImageLoading(true)}
          onLoadEnd={() => setImageLoading(false)}
        />
        {imageLoading && (
          <View style={styles.imageLoadingOverlay}>
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        )}

        <View style={styles.imageOverlayBadge}>
          <Text style={styles.overlayBadgeText}>{currentWord.level}</Text>
        </View>

        <Text style={styles.turkishClue}>"{currentWord.turkish}"</Text>
      </View>

      {/* Typing Submode */}
      {subMode === 'type' ? (
        <View style={styles.typingSection}>
          <View style={styles.hintLetterRow}>
            <Text style={styles.hintLetterLabel}>
              İpucu: İlk harf <Text style={styles.bold}>{currentWord.english[0].toUpperCase()}</Text> ({currentWord.english.length} harf)
            </Text>
          </View>

          <TextInput
            style={[
              styles.textInput,
              feedback === 'correct' && styles.correctInput,
              feedback === 'wrong' && styles.wrongInput,
            ]}
            placeholder="Bu görseli anlatan İngilizce kelime..."
            placeholderTextColor="#94a3b8"
            value={input}
            onChangeText={setInput}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handleCheckTyping}
          />

          {feedback === 'wrong' && (
            <View style={styles.answerBox}>
              <Text style={styles.answerLabel}>Doğru Kelime:</Text>
              <Text style={styles.answerText}>{currentWord.english}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.checkBtn, !input.trim() && styles.disabledCheckBtn]}
            onPress={handleCheckTyping}
            disabled={!input.trim()}
          >
            <Text style={styles.checkBtnText}>Cevabı Onayla</Text>
            <Ionicons name="arrow-forward" size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
      ) : (
        /* Multiple Choice Submode */
        <View style={styles.choiceGrid}>
          {choices.map((choice, idx) => {
            const isCorrect = choice.toLowerCase() === currentWord.english.toLowerCase();
            const isSelected = selectedChoice === choice;

            let btnStyle: any = styles.choiceBtn;
            let textStyle: any = styles.choiceText;

            if (selectedChoice !== null) {
              if (isCorrect) {
                btnStyle = { ...styles.choiceBtn, ...styles.correctChoiceBtn };
                textStyle = { ...styles.choiceText, ...styles.correctChoiceText };
              } else if (isSelected) {
                btnStyle = { ...styles.choiceBtn, ...styles.wrongChoiceBtn };
                textStyle = { ...styles.choiceText, ...styles.wrongChoiceText };
              }
            }

            return (
              <TouchableOpacity
                key={`ch-${idx}`}
                activeOpacity={0.8}
                style={btnStyle}
                onPress={() => handleSelectChoice(choice)}
                disabled={selectedChoice !== null}
              >
                <Text style={textStyle}>{choice}</Text>
                {selectedChoice !== null && isCorrect && (
                  <Ionicons name="checkmark-circle" size={18} color="#16a34a" />
                )}
                {selectedChoice !== null && isSelected && !isCorrect && (
                  <Ionicons name="close-circle" size={18} color="#dc2626" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    gap: 16,
  },
  subModeRow: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  subModeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  activeSubModeBtn: {
    backgroundColor: '#eff6ff',
  },
  subModeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  activeSubModeText: {
    color: '#2563eb',
    fontWeight: '700',
  },
  imageCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: 180,
    borderRadius: 18,
  },
  imageLoadingOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    height: 180,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    zIndex: 2,
  },
  imageOverlayBadge: {
    position: 'absolute',
    top: 26,
    right: 26,
    backgroundColor: '#2563eb',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  overlayBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  turkishClue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 12,
    textAlign: 'center',
  },
  typingSection: {
    gap: 12,
  },
  hintLetterRow: {
    alignItems: 'center',
  },
  hintLetterLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  bold: {
    fontWeight: '800',
    color: '#2563eb',
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    textAlign: 'center',
  },
  correctInput: {
    borderColor: '#22c55e',
    backgroundColor: '#f0fdf4',
  },
  wrongInput: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  answerBox: {
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  answerLabel: {
    fontSize: 12,
    color: '#991b1b',
    fontWeight: '600',
  },
  answerText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#b91c1c',
    marginTop: 2,
  },
  checkBtn: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  disabledCheckBtn: {
    backgroundColor: '#94a3b8',
  },
  checkBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  choiceGrid: {
    gap: 10,
  },
  choiceBtn: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  choiceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  correctChoiceBtn: {
    backgroundColor: '#f0fdf4',
    borderColor: '#22c55e',
  },
  correctChoiceText: {
    color: '#15803d',
    fontWeight: '700',
  },
  wrongChoiceBtn: {
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
  },
  wrongChoiceText: {
    color: '#b91c1c',
    fontWeight: '700',
  },
});
