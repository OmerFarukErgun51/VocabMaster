import React, { useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReadingMaterial } from '../../../types';
import { InteractiveText } from '../../../components/InteractiveText';
import { useTheme } from '../../../context/ThemeContext';
import { ReaderContent } from '../domain/types';
import { usePagedReader } from './usePagedReader';

interface PagedReaderScreenProps {
  reading: ReadingMaterial;
  onBack: () => void;
}

const FONT_SIZE = 18;
const LINE_HEIGHT = 30;
const H_PADDING = 20;

export const PagedReaderScreen: React.FC<PagedReaderScreenProps> = ({ reading, onBack }) => {
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const listRef = useRef<FlatList<string>>(null);
  const didRestore = useRef(false);

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

  const metrics = useMemo(
    () => ({
      width: width - H_PADDING * 2,
      height: height - 180, // başlık + alt bar için pay
      fontSize: FONT_SIZE,
      lineHeight: LINE_HEIGHT,
    }),
    [width, height]
  );

  const { pages, page, total, goTo } = usePagedReader(content, metrics);

  // Kaldığı sayfaya bir kez kaydır.
  useEffect(() => {
    if (!didRestore.current && total > 0 && page > 0) {
      listRef.current?.scrollToIndex({ index: page, animated: false });
      didRestore.current = true;
    }
  }, [page, total]);

  const handleMomentumEnd = (e: { nativeEvent: { contentOffset: { x: number } } }) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    if (index !== page) goTo(index);
  };

  const progressPct = total > 0 ? ((page + 1) / total) * 100 : 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} accessibilityLabel="Geri">
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            {content.title}
          </Text>
          <Text style={[styles.headerSource, { color: colors.subtext }]} numberOfLines={1}>
            {content.source}
          </Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      {/* Pages */}
      <FlatList
        ref={listRef}
        data={pages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => `page-${i}`}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        onMomentumScrollEnd={handleMomentumEnd}
        onScrollToIndexFailed={() => {}}
        renderItem={({ item }) => (
          <ScrollView style={{ width }} contentContainerStyle={styles.pageContent}>
            <InteractiveText content={item} source={content.source} />
          </ScrollView>
        )}
      />

      {/* Footer: page indicator + progress bar */}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
          <View style={[styles.progressFill, { width: `${progressPct}%`, backgroundColor: colors.primary }]} />
        </View>
        <Text style={[styles.pageLabel, { color: colors.subtext }]}>
          Sayfa {total > 0 ? page + 1 : 0} / {total}
        </Text>
      </View>
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
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700' },
  headerSource: { fontSize: 12 },
  pageContent: { paddingHorizontal: H_PADDING, paddingVertical: 16 },
  footer: {
    paddingHorizontal: H_PADDING,
    paddingTop: 10,
    paddingBottom: 20,
    borderTopWidth: 1,
    gap: 8,
  },
  progressTrack: { height: 4, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 4, borderRadius: 2 },
  pageLabel: { fontSize: 12, textAlign: 'center', fontWeight: '600' },
});
