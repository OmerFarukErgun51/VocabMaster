import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Word } from '../types';
import { speakWord } from '../services/speech';
import { useTheme } from '../context/ThemeContext';

interface JumbledWordsExerciseProps {
  currentWord: Word;
  onAnswer: (isCorrect: boolean) => void;
  onDirectMaster?: () => void;
  onSkip?: () => void;
}

export const JumbledWordsExercise: React.FC<JumbledWordsExerciseProps> = ({
  currentWord,
  onAnswer,
  onDirectMaster,
  onSkip,
}) => {
  const { colors, mode } = useTheme();
  const [jumbled, setJumbled] = useState('');
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const isPhrase = currentWord.english.trim().includes(' ');

  const scramble = (str: string): string => {
    if (str.trim().includes(' ')) {
      const words = str.trim().split(/\s+/);
      if (words.length <= 1) return str;
      const arr = [...words];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr.join('  •  ');
    }
    const arr = str.toLowerCase().replace(/[^a-z]/g, '').split('');
    if (arr.length <= 2) return str.toLowerCase();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    const result = arr.join('');
    return result === str.toLowerCase() ? scramble(str) : result;
  };

  useEffect(() => {
    setJumbled(scramble(currentWord.english));
    setInput('');
    setFeedback('idle');
  }, [currentWord.id]);

  const handleShuffle = () => {
    setJumbled(scramble(currentWord.english));
  };

  const handleCheck = () => {
    if (!input.trim() || feedback !== 'idle') return;
    const cleanInput = input.trim().toLowerCase();
    const target = currentWord.english.trim().toLowerCase();

    if (cleanInput === target) {
      setFeedback('correct');
      speakWord(currentWord.english);
      setTimeout(() => {
        onAnswer(true);
      }, 1200);
    } else {
      setFeedback('wrong');
      setTimeout(() => {
        setFeedback('idle');
      }, 1600);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header Controls */}
      <View style={styles.topControlRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{currentWord.level}</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={() => speakWord(currentWord.english)}>
          <Ionicons name="volume-high" size={20} color="#2563eb" />
        </TouchableOpacity>
      </View>

      {/* Scrambled Word Header (Like Screenshot 3) */}
      <View style={[styles.jumbledBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text
          style={[
            styles.jumbledWord,
            { color: colors.text },
            isPhrase ? { fontSize: 18, lineHeight: 26, letterSpacing: 1 } : undefined,
          ]}
        >
          {jumbled}
        </Text>
        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        <Text style={[styles.clueText, { color: colors.subtext }]}>"{currentWord.turkish}"</Text>
      </View>

      {/* Input Field Row */}
      <View style={styles.inputRow}>
        <TextInput
          style={[
            styles.textInput,
            { backgroundColor: colors.card, borderColor: colors.border, color: colors.text },
            feedback === 'correct' && styles.inputCorrect,
            feedback === 'wrong' && styles.inputWrong,
          ]}
          placeholder={isPhrase ? 'Cümleyi sırasıyla yazın...' : 'Doğru kelimeyi yazın...'}
          placeholderTextColor={colors.subtext}
          value={input}
          onChangeText={setInput}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={handleCheck}
        />
        <TouchableOpacity style={[styles.shuffleBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={handleShuffle}>
          <Ionicons name="shuffle" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {feedback === 'wrong' && (
        <View style={styles.wrongNotice}>
          <Text style={styles.wrongNoticeText}>
            Doğrusu: <Text style={styles.boldText}>{currentWord.english}</Text>
          </Text>
        </View>
      )}

      {/* Check / Next Button */}
      <TouchableOpacity
        style={[styles.checkBtn, !input.trim() && styles.checkBtnDisabled]}
        onPress={handleCheck}
        disabled={!input.trim()}
      >
        <Text style={styles.checkBtnText}>Kontrol Et</Text>
        <Ionicons name="checkmark" size={18} color="#ffffff" />
      </TouchableOpacity>

      {/* Quick Evaluation Buttons */}
      <View style={styles.quickEvalRow}>
        <TouchableOpacity
          style={[styles.evalBtn, styles.learnBtn]}
          onPress={() => onAnswer(false)}
        >
          <Ionicons name="reload-outline" size={16} color="#dc2626" />
          <Text style={styles.learnBtnText}>Öğreneceğim</Text>
        </TouchableOpacity>

        {onSkip && (
          <TouchableOpacity
            style={[styles.evalBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={onSkip}
          >
            <Ionicons name="play-forward-outline" size={16} color={colors.subtext} />
            <Text style={{ color: colors.subtext, fontSize: 11, fontWeight: '700' }}>Geç</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.evalBtn, styles.knowBtn]}
          onPress={() => onAnswer(true)}
        >
          <Ionicons name="checkmark-circle-outline" size={16} color="#16a34a" />
          <Text style={styles.knowBtnText}>Öğrendim</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.evalBtn, styles.masterBtn]}
          onPress={() => onDirectMaster ? onDirectMaster() : onAnswer(true)}
        >
          <Ionicons name="star" size={16} color="#b45309" />
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
  iconBtn: {
    backgroundColor: '#f1f5f9',
    padding: 8,
    borderRadius: 14,
  },
  jumbledBox: {
    alignItems: 'center',
    width: '100%',
    marginVertical: 12,
  },
  jumbledWord: {
    fontSize: 34,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: 2,
    textAlign: 'center',
  },
  dividerLine: {
    width: '80%',
    height: 1.5,
    backgroundColor: '#cbd5e1',
    marginVertical: 14,
  },
  clueText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    height: 56,
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 18,
    color: '#0f172a',
    fontWeight: '700',
  },
  inputCorrect: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  inputWrong: {
    borderColor: '#dc2626',
    backgroundColor: '#fef2f2',
  },
  shuffleBtn: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
  },
  wrongNotice: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  wrongNoticeText: {
    color: '#dc2626',
    fontSize: 14,
  },
  boldText: {
    fontWeight: '800',
  },
  checkBtn: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    width: '100%',
  },
  checkBtnDisabled: {
    backgroundColor: '#94a3b8',
  },
  checkBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
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
    paddingVertical: 10,
    borderRadius: 12,
    gap: 4,
  },
  learnBtn: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  learnBtnText: {
    color: '#dc2626',
    fontSize: 11,
    fontWeight: '800',
  },
  knowBtn: {
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#86efac',
  },
  knowBtnText: {
    color: '#16a34a',
    fontSize: 11,
    fontWeight: '800',
  },
  masterBtn: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  masterBtnText: {
    color: '#b45309',
    fontSize: 11,
    fontWeight: '800',
  },
});
