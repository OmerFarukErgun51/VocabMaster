import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Word } from '../types';
import { speakWord } from '../services/speech';
import { useTheme } from '../context/ThemeContext';

interface QuizOption {
  id: number;
  text: string;
  isCorrect: boolean;
}

interface QuizModeProps {
  currentWord: Word;
  allWords: Word[];
  onAnswer: (isCorrect: boolean) => void;
  onDirectMaster?: () => void;
  onSkip?: () => void;
}

export const QuizMode: React.FC<QuizModeProps> = ({
  currentWord,
  allWords,
  onAnswer,
  onDirectMaster,
  onSkip,
}) => {
  const { colors, mode } = useTheme();
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // Reset state whenever the question word changes
  useEffect(() => {
    setSelectedOptionId(null);
    setIsAnswered(false);
  }, [currentWord.id]);

  // Generate 4 strictly distinct options (1 correct, 3 distinct distractors)
  const options = useMemo<QuizOption[]>(() => {
    const currentTr = currentWord.turkish.trim();
    const currentTrNorm = currentTr.toLowerCase();

    const seen = new Set<string>([currentTrNorm]);
    const distractors: string[] = [];

    // Shuffle pool to pick distinct distractors
    const shuffled = [...allWords].sort(() => 0.5 - Math.random());
    for (const w of shuffled) {
      if (w.id === currentWord.id) continue;
      const tr = w.turkish.trim();
      const trNorm = tr.toLowerCase();
      if (!seen.has(trNorm) && tr.length > 0) {
        seen.add(trNorm);
        distractors.push(tr);
        if (distractors.length === 3) break;
      }
    }

    const combined = [
      ...distractors.map(text => ({ text, isCorrect: false })),
      { text: currentTr, isCorrect: true }
    ].sort(() => 0.5 - Math.random());

    return combined.map((item, idx) => ({
      id: idx,
      text: item.text,
      isCorrect: item.isCorrect
    }));
  }, [currentWord.id, allWords]);

  const handleSelect = (optionId: number) => {
    if (isAnswered) return;
    setSelectedOptionId(optionId);
    setIsAnswered(true);

    speakWord(currentWord.english);
  };

  const handleNext = () => {
    const chosen = options.find(o => o.id === selectedOptionId);
    const isCorrect = Boolean(chosen?.isCorrect);
    setSelectedOptionId(null);
    setIsAnswered(false);
    onAnswer(isCorrect);
  };

  return (
    <View style={styles.container}>
      {/* Top Header Control Icons */}
      <View style={styles.topControlRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{currentWord.level}</Text>
        </View>

        <TouchableOpacity
          style={styles.speakerBtn}
          onPress={() => speakWord(currentWord.english)}
        >
          <Ionicons name="volume-high" size={22} color="#2563eb" />
        </TouchableOpacity>
      </View>

      {/* Main Question Word */}
      <View style={[styles.wordBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text
          style={[
            styles.questionWord,
            { color: colors.text },
            currentWord.english.length > 30
              ? { fontSize: 18, lineHeight: 26, textAlign: 'center' }
              : currentWord.english.length > 18
              ? { fontSize: 21, lineHeight: 28, textAlign: 'center' }
              : { textAlign: 'center' },
          ]}
        >
          {currentWord.english}
        </Text>
      </View>

      {/* 4 Choices */}
      <View style={styles.optionsContainer}>
        {options.map((option) => {
          let btnStyle: any = [styles.optionBtn, { backgroundColor: colors.card, borderColor: colors.border }];
          let textStyle: any = [styles.optionText, { color: colors.text }];

          if (isAnswered) {
            if (option.isCorrect) {
              // The correct option turns green
              btnStyle = [styles.optionBtn, styles.correctBtn];
              textStyle = [styles.optionText, styles.correctText];
            } else if (option.id === selectedOptionId) {
              // Only the wrong option that was specifically clicked turns red
              btnStyle = [styles.optionBtn, styles.wrongBtn];
              textStyle = [styles.optionText, styles.wrongText];
            } else {
              // Other unselected wrong options stay neutral/dimmed
              btnStyle = [styles.optionBtn, styles.dimmedBtn, { backgroundColor: colors.surface, borderColor: colors.border }];
              textStyle = [styles.optionText, styles.dimmedText];
            }
          }

          return (
            <TouchableOpacity
              key={option.id}
              activeOpacity={0.8}
              style={btnStyle}
              onPress={() => handleSelect(option.id)}
              disabled={isAnswered}
            >
              <Text style={textStyle} numberOfLines={3}>
                {option.text}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Next Question Button */}
      {isAnswered && (
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextBtnText}>SONRAKİ SORU</Text>
          <Ionicons name="arrow-forward" size={16} color="#2563eb" />
        </TouchableOpacity>
      )}

      {/* Quick Evaluation Buttons */}
      <View style={styles.quickEvalRow}>
        <TouchableOpacity
          style={[styles.evalBtn, styles.learnBtn]}
          onPress={() => onAnswer(false)}
        >
          <Ionicons name="reload-outline" size={15} color="#dc2626" />
          <Text style={styles.learnBtnText}>Öğreneceğim</Text>
        </TouchableOpacity>

        {onSkip && (
          <TouchableOpacity
            style={[styles.evalBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={onSkip}
          >
            <Ionicons name="play-forward-outline" size={15} color={colors.subtext} />
            <Text style={{ color: colors.subtext, fontSize: 11, fontWeight: '700' }}>Geç</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.evalBtn, styles.knowBtn]}
          onPress={() => onAnswer(true)}
        >
          <Ionicons name="checkmark-circle-outline" size={15} color="#16a34a" />
          <Text style={styles.knowBtnText}>Öğrendim</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.evalBtn, styles.masterBtn]}
          onPress={() => onDirectMaster ? onDirectMaster() : onAnswer(true)}
        >
          <Ionicons name="star" size={15} color="#b45309" />
          <Text style={styles.masterBtnText}>Kesin Biliyorum</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 16,
  },
  topControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  badge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  badgeText: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '800',
  },
  speakerBtn: {
    backgroundColor: '#eff6ff',
    padding: 8,
    borderRadius: 12,
  },
  wordBox: {
    backgroundColor: '#ffffff',
    width: '100%',
    paddingVertical: 26,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  questionWord: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: 0.5,
  },
  optionsContainer: {
    width: '100%',
    gap: 10,
  },
  optionBtn: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
    minHeight: 52,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
  },
  correctBtn: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  correctText: {
    color: '#16a34a',
    fontWeight: '700',
  },
  wrongBtn: {
    borderColor: '#dc2626',
    backgroundColor: '#fef2f2',
  },
  wrongText: {
    color: '#dc2626',
    fontWeight: '700',
  },
  dimmedBtn: {
    opacity: 0.55,
  },
  dimmedText: {
    color: '#64748b',
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: '#eff6ff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  nextBtnText: {
    color: '#2563eb',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  quickEvalRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    marginTop: 8,
  },
  evalBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  learnBtn: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  learnBtnText: {
    color: '#dc2626',
    fontSize: 11,
    fontWeight: '700',
  },
  knowBtn: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  knowBtnText: {
    color: '#16a34a',
    fontSize: 11,
    fontWeight: '700',
  },
  masterBtn: {
    backgroundColor: '#fefce8',
    borderColor: '#fef08a',
  },
  masterBtnText: {
    color: '#b45309',
    fontSize: 11,
    fontWeight: '700',
  },
});
