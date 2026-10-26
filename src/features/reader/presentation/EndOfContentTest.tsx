import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { ReaderContent } from '../domain/types';
import { TestQuestion } from '../domain/testTypes';
import { buildTestForContent, saveTestResult } from '../data/testRepository';

interface EndOfContentTestProps {
  content: ReaderContent;
  onClose: () => void;
}

export const EndOfContentTest: React.FC<EndOfContentTestProps> = ({ content, onClose }) => {
  const { colors } = useTheme();
  const questions: TestQuestion[] = useMemo(() => buildTestForContent(content), [content]);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  // Test oluşturulamadıysa
  if (questions.length === 0) {
    return (
      <View style={[styles.root, styles.center, { backgroundColor: colors.background }]}>
        <Ionicons name="clipboard-outline" size={48} color={colors.subtext} />
        <Text style={[styles.info, { color: colors.text }]}>Bu içerik için test oluşturulamadı.</Text>
        <Text style={[styles.infoSub, { color: colors.subtext }]}>
          Metindeki kelimeler henüz kelime havuzunda yok. Okurken kelimelere dokunup ekleyebilirsin.
        </Text>
        <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={onClose}>
          <Text style={styles.primaryBtnText}>Kapat</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <View style={[styles.root, styles.center, { backgroundColor: colors.background }]}>
        <Text style={styles.resultEmoji}>{pct >= 70 ? '🏆' : pct >= 40 ? '👍' : '📚'}</Text>
        <Text style={[styles.resultTitle, { color: colors.text }]}>Test Tamamlandı!</Text>
        <Text style={[styles.resultScore, { color: colors.primary }]}>
          {score} / {questions.length} doğru
        </Text>
        <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={onClose}>
          <Text style={styles.primaryBtnText}>Bitir</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const q = questions[index];

  const handleSelect = (opt: string) => {
    if (selected) return;
    setSelected(opt);
    if (opt === q.answer) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (index + 1 < questions.length) {
      setIndex(i => i + 1);
      setSelected(null);
    } else {
      const finalScore = score; // score zaten güncel (seçimde artırıldı)
      saveTestResult(content.id, finalScore, questions.length);
      setFinished(true);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.counter, { color: colors.subtext }]}>
          Soru {index + 1} / {questions.length}
        </Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color={colors.subtext} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Text style={[styles.qType, { color: colors.subtext }]}>
          {q.kind === 'meaning' ? 'Türkçe anlamı seç' : 'Boşluğa uygun kelimeyi seç'}
        </Text>
        <Text style={[styles.prompt, { color: colors.text }]}>
          {q.kind === 'meaning' ? q.prompt : q.sentence}
        </Text>

        <View style={styles.options}>
          {q.options.map((opt, i) => {
            const isAnswer = opt === q.answer;
            const isChosen = selected === opt;
            let bg = colors.card;
            let border = colors.border;
            if (selected) {
              if (isAnswer) { bg = '#dcfce7'; border = '#16a34a'; }
              else if (isChosen) { bg = '#fee2e2'; border = '#dc2626'; }
            }
            return (
              <TouchableOpacity
                key={`opt-${i}`}
                style={[styles.option, { backgroundColor: bg, borderColor: border }]}
                onPress={() => handleSelect(opt)}
                disabled={!!selected}
                activeOpacity={0.8}
              >
                <Text style={[styles.optionText, { color: colors.text }]}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {selected && (
        <TouchableOpacity style={[styles.primaryBtn, styles.nextBtn, { backgroundColor: colors.primary }]} onPress={handleNext}>
          <Text style={styles.primaryBtnText}>
            {index + 1 < questions.length ? 'Sıradaki' : 'Sonucu Gör'}
          </Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  counter: { fontSize: 13, fontWeight: '600' },
  body: { padding: 20, gap: 14 },
  qType: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  prompt: { fontSize: 22, fontWeight: '700', lineHeight: 30 },
  options: { gap: 10, marginTop: 8 },
  option: { padding: 16, borderRadius: 12, borderWidth: 1.5 },
  optionText: { fontSize: 16, fontWeight: '600' },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  nextBtn: { margin: 18 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  info: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  infoSub: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  resultEmoji: { fontSize: 64 },
  resultTitle: { fontSize: 22, fontWeight: '800' },
  resultScore: { fontSize: 28, fontWeight: '800' },
});
