import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Word } from '../types';
import { speakWord } from '../services/speech';
import { useTheme } from '../context/ThemeContext';

interface WritingExerciseProps {
  currentWord: Word;
  onAnswer: (isCorrect: boolean) => void;
  onDirectMaster?: () => void;
  onSkip?: () => void;
}

export const WritingExercise: React.FC<WritingExerciseProps> = ({
  currentWord,
  onAnswer,
  onDirectMaster,
  onSkip,
}) => {
  const { colors, mode } = useTheme();
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [hintCount, setHintCount] = useState(0);

  // Reset when word changes
  useEffect(() => {
    setInput('');
    setFeedback('idle');
    setHintCount(0);
  }, [currentWord.id]);

  const target = currentWord.english.trim();
  const isPhrase = target.includes(' ');

  // "Harf Al" - Reveal the next correct letter
  const handleGetLetter = () => {
    if (feedback !== 'idle') return;
    const cleanTarget = target.toLowerCase();
    const currentInput = input.toLowerCase();

    // Check how many letters from start match target
    let matchLen = 0;
    while (
      matchLen < currentInput.length &&
      matchLen < cleanTarget.length &&
      currentInput[matchLen] === cleanTarget[matchLen]
    ) {
      matchLen++;
    }

    if (matchLen < cleanTarget.length) {
      let nextLen = matchLen + 1;
      // If the character is space or punctuation, advance to include the following letter
      while (nextLen < cleanTarget.length && /[\s,.'?!]/.test(cleanTarget[nextLen - 1])) {
        nextLen++;
      }
      const newRevealed = target.slice(0, nextLen);
      setInput(newRevealed);
      setHintCount(prev => prev + 1);
    }
  };

  const handleCheck = () => {
    if (!input.trim() || feedback !== 'idle') return;

    const normalizedInput = input.trim().toLowerCase();
    const normalizedTarget = target.toLowerCase();

    if (normalizedInput === normalizedTarget) {
      setFeedback('correct');
      speakWord(currentWord.english);
      setTimeout(() => {
        setInput('');
        setFeedback('idle');
        setHintCount(0);
        onAnswer(true);
      }, 1200);
    } else {
      setFeedback('wrong');
      setTimeout(() => {
        setFeedback('idle');
      }, 2000);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header Control Icons */}
      <View style={styles.topControlRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{currentWord.level}</Text>
        </View>

        <View style={styles.wordLengthBadge}>
          <Ionicons name={isPhrase ? "chatbubbles-outline" : "text-outline"} size={14} color="#64748b" />
          <Text style={styles.wordLengthText}>
            {isPhrase ? `${target.split(/\s+/).length} Kelime` : `${target.length} Harf`}
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.iconBtn}
          onPress={() => speakWord(currentWord.english)}
        >
          <Ionicons name="volume-high" size={20} color="#2563eb" />
        </TouchableOpacity>
      </View>

      {/* Centered Turkish Meaning */}
      <View style={[styles.promptCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.promptHeader, { color: colors.subtext }]}>Türkçe Anlamı:</Text>
        <Text
          style={[
            styles.turkishWord,
            { color: colors.text },
            currentWord.turkish.length > 30 ? { fontSize: 21, lineHeight: 30 } : undefined,
          ]}
        >
          {currentWord.turkish}
        </Text>
      </View>

      {/* Input Box & Action Row */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[
              styles.textInput,
              { backgroundColor: colors.card, borderColor: colors.border, color: colors.text },
              feedback === 'correct' && styles.correctInput,
              feedback === 'wrong' && styles.wrongInput,
            ]}
            value={input}
            onChangeText={setInput}
            placeholder="İngilizce karşılığını yazın..."
            placeholderTextColor={colors.subtext}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handleCheck}
          />

          {/* "Harf Al" Hint Button */}
          <TouchableOpacity
            style={styles.hintBtn}
            onPress={handleGetLetter}
            activeOpacity={0.7}
          >
            <Ionicons name="bulb-outline" size={16} color="#d97706" />
            <Text style={styles.hintBtnText}>Harf Al</Text>
          </TouchableOpacity>
        </View>

        {feedback === 'wrong' && (
          <View style={styles.answerReveal}>
            <Text style={styles.revealLabel}>
              Doğru Cevap: <Text style={styles.bold}>{currentWord.english}</Text>
            </Text>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.submitBtn, !input.trim() && styles.disabledBtn]} 
          onPress={handleCheck}
          disabled={!input.trim()}
        >
          <Text style={styles.submitBtnText}>Kontrol Et</Text>
          <Ionicons name="arrow-forward" size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>

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
  wordLengthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  wordLengthText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  iconBtn: {
    backgroundColor: '#f1f5f9',
    padding: 8,
    borderRadius: 14,
  },
  promptCard: {
    backgroundColor: '#ffffff',
    width: '100%',
    paddingVertical: 24,
    paddingHorizontal: 20,
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
    gap: 6,
  },
  promptHeader: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  turkishWord: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    gap: 12,
  },
  inputWrapper: {
    position: 'relative',
    width: '100%',
    justifyContent: 'center',
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderRadius: 16,
    paddingVertical: 14,
    paddingLeft: 16,
    paddingRight: 100, // Space for hint button
    fontSize: 17,
    fontWeight: '600',
    color: '#0f172a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  hintBtn: {
    position: 'absolute',
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  hintBtnText: {
    color: '#b45309',
    fontSize: 12,
    fontWeight: '700',
  },
  correctInput: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  wrongInput: {
    borderColor: '#dc2626',
    backgroundColor: '#fef2f2',
  },
  answerReveal: {
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
    alignItems: 'center',
  },
  revealLabel: {
    fontSize: 14,
    color: '#991b1b',
  },
  bold: {
    fontWeight: '800',
    color: '#dc2626',
  },
  submitBtn: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  disabledBtn: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
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
