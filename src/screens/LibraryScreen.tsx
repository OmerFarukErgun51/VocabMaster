import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReadingMaterial, ReadingCategory } from '../types';
import { getReadingsByCategory, addCustomReading, deleteReading } from '../services/database';
import { pickAndImportTextFile } from '../services/fileImporter';
import { useTheme } from '../context/ThemeContext';

interface LibraryScreenProps {
  onSelectReading: (reading: ReadingMaterial) => void;
}

export const LibraryScreen: React.FC<LibraryScreenProps> = ({ onSelectReading }) => {
  const { colors, mode } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<ReadingCategory | 'all'>('all');
  const [readings, setReadings] = useState<ReadingMaterial[]>([]);

  useEffect(() => {
    loadReadings();
  }, [selectedCategory]);

  const loadReadings = () => {
    const list = getReadingsByCategory(selectedCategory === 'all' ? undefined : selectedCategory);
    setReadings(list);
  };

  const handleConfirmDelete = (item: ReadingMaterial) => {
    Alert.alert(
      'Okuma Parçasını Sil',
      `"${item.title}" başlıklı metni kütüphanenizden silmek istediğinize emin misiniz?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            deleteReading(item.id);
            loadReadings();
          },
        },
      ]
    );
  };

  const handleImportPDF = async () => {
    const imported = await pickAndImportTextFile();
    if (imported) {
      const newReading = addCustomReading(
        imported.title,
        'custom_pdf',
        'B1',
        'Cihazımdan Yüklendi',
        imported.content
      );
      loadReadings();
      onSelectReading(newReading);
    }
  };

  const categories = [
    { id: 'all', label: 'Tümü', icon: 'grid-outline' },
    { id: 'stories', label: '🧸 A1/A2 Çocuk Kitapları', icon: 'heart-outline' },
    { id: 'daily_dialogues', label: '💬 Günlük Konuşmalar', icon: 'chatbubbles-outline' },
    { id: 'literature', label: '📚 B1/B2 Klasik Kitaplar', icon: 'book-outline' },
    { id: 'movies', label: '🎬 Film Replikleri', icon: 'film-outline' },
    { id: 'custom_pdf', label: '📄 PDF / Yüklediklerim', icon: 'document-text-outline' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Okuma Kütüphanesi</Text>
          <Text style={[styles.headerSubtitle, { color: colors.subtext }]}>Metinleri oku, kelimelere dokun veya cümle çevirisi aç</Text>
        </View>

        <TouchableOpacity style={styles.importBtn} onPress={handleImportPDF}>
          <Ionicons name="cloud-upload-outline" size={18} color="#ffffff" />
          <Text style={styles.importBtnText}>Metin / PDF Yükle</Text>
        </TouchableOpacity>
      </View>

      {/* Category Horizontal Filter */}
      <View style={styles.categoryWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              activeOpacity={0.7}
              style={[
                styles.catChip,
                { backgroundColor: colors.card, borderColor: colors.border },
                selectedCategory === cat.id && styles.activeCatChip
              ]}
              onPress={() => setSelectedCategory(cat.id as any)}
            >
              <Text style={[styles.catChipText, { color: colors.text }, selectedCategory === cat.id && styles.activeCatChipText]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Readings List */}
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {readings.length === 0 ? (
          <View style={[styles.emptyContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="book-outline" size={44} color={colors.subtext} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Bu alanda okuma metni yok</Text>
            <Text style={[styles.emptySubtitle, { color: colors.subtext }]}>
              Silinmiş içerikler gizlenir. Yukarıdaki butondan kendi metin veya PDF belgenizi ekleyebilirsiniz.
            </Text>
          </View>
        ) : (
          readings.map(item => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.85}
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => onSelectReading(item)}
            >
              {/* Visual Header Poster if available */}
              {item.image_url ? (
                <View style={styles.posterContainer}>
                  <Image source={{ uri: item.image_url }} style={styles.posterImage} resizeMode="cover" />
                  <View style={styles.posterOverlay}>
                    <View style={styles.levelTag}>
                      <Text style={styles.levelTagText}>{item.level}</Text>
                    </View>
                    <Text style={styles.posterSource} numberOfLines={1}>{item.source}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.cardDeleteBtn}
                    onPress={() => handleConfirmDelete(item)}
                    activeOpacity={0.75}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="trash-outline" size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.cardTop}>
                  <View style={styles.cardTopLeft}>
                    <View style={styles.levelTag}>
                      <Text style={styles.levelTagText}>{item.level}</Text>
                    </View>
                    <Text style={[styles.sourceText, { color: colors.subtext }]} numberOfLines={1}>
                      {item.source}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.cardDeleteBtnSimple, { backgroundColor: colors.surface }]}
                    onPress={() => handleConfirmDelete(item)}
                    activeOpacity={0.75}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="trash-outline" size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.cardBody}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.previewContent, { color: colors.subtext }]} numberOfLines={3}>
                  {item.content}
                </Text>

                <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
                  <View style={styles.featureRow}>
                    <View style={[styles.vocabCount, { backgroundColor: colors.surface }]}>
                      <Ionicons name="sparkles" size={14} color={colors.primary} />
                      <Text style={[styles.vocabCountText, { color: colors.primary }]}>Dokunarak Öğren</Text>
                    </View>
                    {item.sentences && item.sentences.length > 0 && (
                      <View style={[styles.sentenceCountBadge, { backgroundColor: mode === 'dark' ? '#064e3b' : '#ecfdf5' }]}>
                        <Ionicons name="language-outline" size={13} color={mode === 'dark' ? '#6ee7b7' : '#059669'} />
                        <Text style={[styles.sentenceCountText, { color: mode === 'dark' ? '#6ee7b7' : '#059669' }]}>Cümle Çevirili</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.readLink}>
                    <Text style={styles.readLinkText}>Oku</Text>
                    <Ionicons name="arrow-forward" size={15} color="#2563eb" />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    gap: 12,
  },
  titleWrap: {
    gap: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  importBtn: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 8,
    alignSelf: 'flex-start',
  },
  importBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  categoryWrapper: {
    paddingVertical: 4,
  },
  categoryScroll: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 8,
  },
  catChip: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activeCatChip: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  catChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  activeCatChipText: {
    color: '#ffffff',
  },
  listContent: {
    padding: 20,
    paddingTop: 6,
    gap: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  posterContainer: {
    width: '100%',
    height: 140,
    position: 'relative',
    backgroundColor: '#1e293b',
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  posterOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    gap: 8,
  },
  posterSource: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 0,
  },
  cardTopLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  cardDeleteBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  cardDeleteBtnSimple: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 36,
    borderRadius: 20,
    borderWidth: 1,
    marginVertical: 20,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  levelTag: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  levelTagText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  sourceText: {
    fontSize: 12,
    color: '#64748b',
    flex: 1,
  },
  cardBody: {
    padding: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },
  previewContent: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: '#f1f5f9',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  vocabCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  vocabCountText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '700',
  },
  sentenceCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  sentenceCountText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '700',
  },
  readLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readLinkText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2563eb',
  },
});
