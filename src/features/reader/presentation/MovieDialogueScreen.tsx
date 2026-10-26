import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReadingMaterial } from '../../../types';
import { InteractiveText } from '../../../components/InteractiveText';
import { speakWord } from '../../../services/speech';
import { useTheme } from '../../../context/ThemeContext';
import { ReaderContent } from '../domain/types';
import { toDialogueLines } from '../domain/dialogue';
import { EndOfContentTest } from './EndOfContentTest';

interface MovieDialogueScreenProps {
  reading: ReadingMaterial;
  onBack: () => void;
}

export const MovieDialogueScreen: React.FC<MovieDialogueScreenProps> = ({ reading, onBack }) => {
  const { colors } = useTheme();
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [showTest, setShowTest] = useState(false);

  const content: ReaderContent = useMemo(
    () => ({
      id: `reading-${reading.id}`,
      title: reading.title,
      source: reading.source,
      category: reading.category,
      level: reading.level,
      content: reading.content,
      sentences: reading.sentences,
      highlights: reading.vocabulary_highlights ?? [],
    }),
    [reading]
  );

  const lines = useMemo(() => toDialogueLines(content), [content]);

  const toggle = (i: number) => setRevealed(prev => ({ ...prev, [i]: !prev[i] }));

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.iconBtn} accessibilityLabel="Geri">
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>{content.title}</Text>
          <Text style={[styles.headerSource, { color: colors.subtext }]} numberOfLines={1}>🎬 {content.source}</Text>
        </View>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {lines.map((line, i) => {
          const isOpen = !!revealed[i];
          const hasTr = line.tr.trim().length > 0;
          return (
            <View key={`line-${i}`} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.cardTop}>
                <View style={styles.lineTextWrap}>
                  <InteractiveText content={line.en} source={content.source} />
                </View>
                <TouchableOpacity onPress={() => speakWord(line.en, 0.9)} style={styles.speakBtn} accessibilityLabel="Seslendir">
                  <Ionicons name="volume-medium-outline" size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>

              {hasTr && (
                isOpen ? (
                  <Text style={[styles.trText, { color: colors.subtext, borderTopColor: colors.border }]}>{line.tr}</Text>
                ) : (
                  <TouchableOpacity onPress={() => toggle(i)} style={styles.revealBtn}>
                    <Ionicons name="eye-outline" size={15} color={colors.primary} />
                    <Text style={[styles.revealText, { color: colors.primary }]}>Çeviriyi göster</Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          );
        })}

        <TouchableOpacity style={[styles.testBtn, { backgroundColor: colors.primary }]} onPress={() => setShowTest(true)} activeOpacity={0.85}>
          <Ionicons name="trophy-outline" size={18} color="#fff" />
          <Text style={styles.testBtnText}>Bitiş Testi</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showTest} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowTest(false)}>
        <EndOfContentTest content={content} onClose={() => setShowTest(false)} />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700' },
  headerSource: { fontSize: 12 },
  body: { padding: 16, gap: 12 },
  card: { borderRadius: 14, borderWidth: 1, padding: 14 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  lineTextWrap: { flex: 1 },
  speakBtn: { padding: 4 },
  revealBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10 },
  revealText: { fontSize: 13, fontWeight: '600' },
  trText: { fontSize: 15, marginTop: 10, paddingTop: 10, borderTopWidth: 1, lineHeight: 22 },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  testBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
