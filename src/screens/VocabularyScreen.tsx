import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal, Alert, ActivityIndicator, Platform, FlatList, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Word, CEFRLevel } from '../types';
import { queryFilteredWords, getCountsByLevel, addCustomWord, findWordByEnglish, toggleWordMastery, updateWordDetails, deleteWord } from '../services/database';
import { speakWord } from '../services/speech';
import { autoDetectWordInfo } from '../services/cefrDetector';
import { useTheme } from '../context/ThemeContext';

interface VocabularyScreenProps {
  initialLevel?: CEFRLevel | 'all';
  initialMastered?: boolean;
}

const PAGE_SIZE = 40;

export const VocabularyScreen: React.FC<VocabularyScreenProps> = ({ initialLevel = 'A1', initialMastered = false }) => {
  const { colors, mode } = useTheme();
  const [displayedWords, setDisplayedWords] = useState<Word[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<CEFRLevel>(initialLevel === 'all' ? 'A1' : initialLevel);
  const [tabFilter, setTabFilter] = useState<'learning' | 'mastered'>(initialMastered ? 'mastered' : 'learning');
  const [typeFilter, setTypeFilter] = useState<'words' | 'phrases'>('words');
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [levelCounts, setLevelCounts] = useState<Record<string, number>>({});

  const offsetRef = useRef(0);
  const canLoadMoreRef = useRef(true);

  const ALL_CEFR: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const availableLevels = React.useMemo(() => {
    return ALL_CEFR.filter(lvl => (levelCounts[lvl] || 0) > 0);
  }, [levelCounts]);

  // Add word modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEn, setNewEn] = useState('');
  const [newTr, setNewTr] = useState('');
  const [newExEn, setNewExEn] = useState('');
  const [newExTr, setNewExTr] = useState('');
  const [newLevel, setNewLevel] = useState<CEFRLevel>('B1');
  const [detecting, setDetecting] = useState(false);

  // Edit existing word modal state
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [editEn, setEditEn] = useState('');
  const [editTr, setEditTr] = useState('');
  const [editExEn, setEditExEn] = useState('');
  const [editExTr, setEditExTr] = useState('');
  const [editLevel, setEditLevel] = useState<CEFRLevel>('B1');

  useEffect(() => {
    if (initialLevel && initialLevel !== 'all') {
      setLevelFilter(initialLevel);
    }
    if (initialMastered !== undefined) {
      setTabFilter(initialMastered ? 'mastered' : 'learning');
    }
  }, [initialLevel, initialMastered]);

  // Load level counts whenever tabFilter or typeFilter changes
  useEffect(() => {
    try {
      const counts = getCountsByLevel(tabFilter === 'mastered', typeFilter);
      setLevelCounts(counts);
    } catch {}
  }, [tabFilter, typeFilter]);

  // If selected level has no words in this category/tab, auto-switch to first available level
  useEffect(() => {
    if (availableLevels.length > 0 && !availableLevels.includes(levelFilter)) {
      setLevelFilter(availableLevels[0]);
    }
  }, [availableLevels, levelFilter]);

  // Reload list when levelFilter, tabFilter, typeFilter, or search changes
  useEffect(() => {
    offsetRef.current = 0;
    canLoadMoreRef.current = true;
    loadFirstPage();
  }, [levelFilter, tabFilter, typeFilter, search]);

  const loadFirstPage = () => {
    setLoading(true);
    try {
      const isMastered = tabFilter === 'mastered';
      const result = queryFilteredWords(levelFilter, isMastered, search, PAGE_SIZE, 0, typeFilter);
      setDisplayedWords(result.words);
      setTotalCount(result.totalCount);
      offsetRef.current = result.words.length;
      canLoadMoreRef.current = result.words.length < result.totalCount;
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (loading || loadingMore || !canLoadMoreRef.current) return;

    setLoadingMore(true);
    try {
      const isMastered = tabFilter === 'mastered';
      const result = queryFilteredWords(levelFilter, isMastered, search, PAGE_SIZE, offsetRef.current, typeFilter);
      if (result.words.length > 0) {
        setDisplayedWords(prev => [...prev, ...result.words]);
        offsetRef.current += result.words.length;
        canLoadMoreRef.current = offsetRef.current < result.totalCount;
      } else {
        canLoadMoreRef.current = false;
      }
    } finally {
      setLoadingMore(false);
    }
  };

  const handleEnWordBlur = async () => {
    const clean = newEn.trim().toLowerCase();
    if (!clean) return;

    const existing = findWordByEnglish(clean);
    if (existing) {
      Alert.alert(
        'Kelime Zaten Bulunuyor ⚠️',
        `"${clean}" kelimesi zaten [${existing.level}] seviyesinde (${existing.is_mastered ? 'Öğrenilenler / Hafızada' : 'Çalışılanlar'}) havuzunuzda bulunmaktadır. Tekrar ekleyemezsiniz.`
      );
      return;
    }

    setDetecting(true);
    try {
      const info = await autoDetectWordInfo(clean);
      setNewLevel(info.level);
      if (!newTr && info.turkish && info.turkish !== 'anlam giriniz...') {
        setNewTr(info.turkish);
      }
      if (!newExEn && info.example_en) {
        setNewExEn(info.example_en);
      }
      if (!newExTr && info.example_tr) {
        setNewExTr(info.example_tr);
      }
    } catch {
    } finally {
      setDetecting(false);
    }
  };

  const handleSaveWord = () => {
    const clean = newEn.trim().toLowerCase();
    if (!clean || !newTr.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen İngilizce ve Türkçe karşılıklarını giriniz.');
      return;
    }

    const existing = findWordByEnglish(clean);
    if (existing) {
      Alert.alert(
        'Kelime Zaten Bulunuyor ⚠️',
        `"${clean}" kelimesi zaten [${existing.level}] seviyesinde bulunmaktadır. Tekrar ekleyemezsiniz.`
      );
      return;
    }

    const result = addCustomWord(clean, newTr, newExEn, newExTr, newLevel, 'custom');
    if (result.success) {
      setNewEn('');
      setNewTr('');
      setNewExEn('');
      setNewExTr('');
      setIsAddModalOpen(false);
      loadFirstPage();
      try {
        setLevelCounts(getCountsByLevel(tabFilter === 'mastered', typeFilter));
      } catch {}
      Alert.alert('Başarılı 🎉', `"${clean}" kelimesi otomatik olarak [${newLevel}] seviyesine eklendi!`);
    } else {
      Alert.alert('Uyarı', result.message || 'Kelime eklenemedi.');
    }
  };

  const handleToggleMastery = (w: Word) => {
    const newMastered = !w.is_mastered;
    toggleWordMastery(w.id, newMastered);
    setDisplayedWords(prev => prev.filter(item => item.id !== w.id));
    setTotalCount(prev => Math.max(0, prev - 1));
    try {
      setLevelCounts(getCountsByLevel(tabFilter === 'mastered', typeFilter));
    } catch {}
    Alert.alert(
      newMastered ? 'Öğrenilenlere Eklendi ⭐' : 'Çalışılacaklara Alındı 📚',
      `"${w.english}" kelimesi ${newMastered ? 'Öğrenilenler' : 'Çalışılacaklar'} listesine taşındı.`
    );
  };

  const handleOpenEdit = (w: Word) => {
    setEditingWord(w);
    setEditEn(w.english);
    setEditTr(w.turkish);
    setEditExEn(w.example_en);
    setEditExTr(w.example_tr);
    setEditLevel(w.level);
  };

  const handleSaveEditWord = () => {
    if (!editingWord || !editEn.trim() || !editTr.trim()) return;
    updateWordDetails(editingWord.id, {
      english: editEn,
      turkish: editTr,
      example_en: editExEn,
      example_tr: editExTr,
      level: editLevel
    });
    setDisplayedWords(prev => prev.map(w => (w.id === editingWord.id ? {
      ...w,
      english: editEn.trim(),
      turkish: editTr.trim(),
      example_en: editExEn.trim(),
      example_tr: editExTr.trim(),
      level: editLevel
    } : w)));
    setEditingWord(null);
    Alert.alert('Başarılı ✅', 'Kelime başarıyla güncellendi.');
  };

  const handleDeleteWord = (w: Word) => {
    Alert.alert(
      'Kelimeyi Sil',
      `"${w.english}" (${w.turkish}) kelimesini havuzunuzdan silmek istediğinize emin misiniz?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            deleteWord(w.id);
            setDisplayedWords(prev => prev.filter(item => item.id !== w.id));
            setTotalCount(prev => Math.max(0, prev - 1));
            try {
              const counts = getCountsByLevel(tabFilter === 'mastered', typeFilter);
              setLevelCounts(counts);
            } catch {}
          },
        },
      ]
    );
  };

  const renderWordItem = useCallback(({ item: w }: { item: Word }) => {
    const box = w.is_mastered ? 5 : Math.max(1, Math.min(5, w.box_level || 1));
    const kademeTitles = [
      '1. Kademe • Başlangıç (1 gün)',
      '2. Kademe • Pekiştiriliyor (3 gün)',
      '3. Kademe • Güçleniyor (7 gün)',
      '4. Kademe • Kalıcı Bellek (16 gün)',
      '5. Kademe • Tam Hafızada ⭐',
    ];

    return (
      <View style={[styles.wordCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.wordMainRow}>
          <View style={styles.wordTextWrap}>
            <View style={styles.wordTitleRow}>
              <Text style={[styles.wordEnglish, { color: colors.text }]}>{w.english}</Text>
              <View style={styles.levelBadge}>
                <Text style={styles.levelBadgeText}>{w.level}</Text>
              </View>
            </View>
            <Text style={styles.wordTurkish}>{w.turkish}</Text>
          </View>

          <View style={styles.actionBtnRow}>
            <TouchableOpacity style={[styles.itemEditBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => handleOpenEdit(w)}>
              <Ionicons name="pencil-outline" size={17} color={colors.subtext} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.speakerBtn, { backgroundColor: colors.surface }]} onPress={() => speakWord(w.english)}>
              <Ionicons name="volume-high" size={19} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.itemDeleteBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => handleDeleteWord(w)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Ionicons name="trash-outline" size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>

        {w.example_en ? (
          <Text style={[styles.wordExample, { color: colors.subtext }]}>"{w.example_en}"</Text>
        ) : null}

        {/* 5-Kademe SRS Hafıza Göstergesi */}
        <View style={[styles.kademeBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.kademeStepsRow}>
            {[1, 2, 3, 4, 5].map(step => {
              const isFilled = step <= box;
              const isMaster = box === 5;
              return (
                <View
                  key={step}
                  style={[
                    styles.kademeStep,
                    isFilled
                      ? isMaster
                        ? styles.kademeStepMastered
                        : styles.kademeStepActive
                      : { backgroundColor: mode === 'dark' ? '#334155' : '#e2e8f0' }
                  ]}
                />
              );
            })}
          </View>

          <View style={styles.kademeInfoRow}>
            <Text style={[styles.kademeTitle, { color: box === 5 ? '#b45309' : colors.text }]}>
              {kademeTitles[box - 1]}
            </Text>
            <Text style={[styles.kademeNextReview, { color: colors.subtext }]}>
              {w.is_mastered ? 'Kalıcı Arşiv' : `Tekrar: ${w.next_review_date || 'Bugün'}`}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={{ flex: 1 }} />
          {w.is_mastered ? (
            <TouchableOpacity style={styles.demoteBtn} onPress={() => handleToggleMastery(w)}>
              <Ionicons name="arrow-undo-outline" size={13} color="#2563eb" />
              <Text style={styles.demoteBtnText}>Çalışılacaklara Al</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.promoteBtn} onPress={() => handleToggleMastery(w)}>
              <Ionicons name="star" size={13} color="#b45309" />
              <Text style={styles.promoteBtnText}>Öğrenilene Taşı</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }, [colors, mode]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Kelime Sözlüğüm</Text>
          <Text style={[styles.headerSubtitle, { color: colors.subtext }]}>
            {totalCount} Kelime Bulundu
          </Text>
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={() => setIsAddModalOpen(true)}>
          <Ionicons name="add" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Tabs: Learning vs Mastered */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[
            styles.tabBtn,
            { backgroundColor: colors.card, borderColor: colors.border },
            tabFilter === 'learning' && styles.activeTabBtn
          ]}
          onPress={() => setTabFilter('learning')}
        >
          <Text style={[styles.tabBtnText, { color: colors.subtext }, tabFilter === 'learning' && styles.activeTabBtnText]}>
            Çalışılacaklar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabBtn,
            { backgroundColor: colors.card, borderColor: colors.border },
            tabFilter === 'mastered' && styles.activeTabBtn
          ]}
          onPress={() => setTabFilter('mastered')}
        >
          <Ionicons name="checkmark-done-circle" size={16} color={tabFilter === 'mastered' ? '#16a34a' : colors.subtext} />
          <Text style={[styles.tabBtnText, { color: colors.subtext }, tabFilter === 'mastered' && styles.activeTabBtnText]}>
            Öğrenilenler
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="search-outline" size={20} color={colors.subtext} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="İngilizce veya Türkçe ara..."
          placeholderTextColor={colors.subtext}
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={colors.subtext} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Type Selector: Kelimeler vs Kalıp & Cümleler (Tümü kaldırıldı) */}
      <View style={styles.typeFilterRow}>
        <TouchableOpacity
          style={[
            styles.typeChip,
            { backgroundColor: colors.card, borderColor: colors.border },
            typeFilter === 'words' && styles.activeTypeChip
          ]}
          onPress={() => setTypeFilter('words')}
        >
          <Text style={[styles.typeChipText, { color: colors.subtext }, typeFilter === 'words' && styles.activeTypeChipText]}>
            📖 Kelimeler
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.typeChip,
            { backgroundColor: colors.card, borderColor: colors.border },
            typeFilter === 'phrases' && styles.activeTypeChip
          ]}
          onPress={() => setTypeFilter('phrases')}
        >
          <Text style={[styles.typeChipText, { color: colors.subtext }, typeFilter === 'phrases' && styles.activeTypeChipText]}>
            💬 Kalıp & Cümleler
          </Text>
        </TouchableOpacity>
      </View>

      {/* Level Filter Chips (Only levels with words > 0; Tümü kaldırıldı) */}
      {availableLevels.length > 0 ? (
        <View style={styles.levelFilterContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={availableLevels}
            keyExtractor={(lvl) => lvl}
            contentContainerStyle={styles.levelFilterScroll}
            renderItem={({ item: lvl }) => {
              const countForLevel = levelCounts[lvl] || 0;
              const isSelected = levelFilter === lvl;

              return (
                <TouchableOpacity
                  style={[
                    styles.levelChip,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    isSelected && styles.activeLevelChip
                  ]}
                  onPress={() => setLevelFilter(lvl)}
                >
                  <Text style={[styles.levelChipText, { color: colors.text }, isSelected && styles.activeLevelChipText]}>
                    {`${lvl} (${countForLevel})`}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      ) : null}

      {/* High Performance Paginated FlatList */}
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Kelimeler Getiriliyor...</Text>
        </View>
      ) : (
        <FlatList
          data={displayedWords}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderWordItem}
          contentContainerStyle={styles.wordsList}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          initialNumToRender={20}
          maxToRenderPerBatch={20}
          windowSize={7}
          removeClippedSubviews={true}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.loadingMoreWrap}>
                <ActivityIndicator size="small" color="#2563eb" />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="cube-outline" size={48} color="#94a3b8" />
              <Text style={styles.emptyText}>Bu filtreye uygun kelime bulunamadı.</Text>
            </View>
          }
        />
      )}

      {/* Add Word Modal */}
      <Modal visible={isAddModalOpen} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Yeni Kelime Ekle</Text>
            <TouchableOpacity onPress={() => setIsAddModalOpen(false)}>
              <Ionicons name="close" size={24} color="#0f172a" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <View style={styles.autoDetectNotice}>
              <Ionicons name="sparkles" size={16} color="#2563eb" />
              <Text style={styles.autoDetectNoticeText}>
                İngilizce kelimeyi yazdığınızda seviyesi (A1-C2) otomatik olarak algılanır.
              </Text>
            </View>

            <Text style={styles.inputLabel}>İngilizce Kelime *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Örn: resilient"
              placeholderTextColor="#94a3b8"
              value={newEn}
              onChangeText={setNewEn}
              onBlur={handleEnWordBlur}
            />

            {detecting && (
              <View style={styles.detectingRow}>
                <ActivityIndicator size="small" color="#2563eb" />
                <Text style={styles.detectingText}>Seviye analiz ediliyor...</Text>
              </View>
            )}

            <Text style={styles.inputLabel}>Otomatik Seviye:</Text>
            <View style={styles.modalLevelRow}>
              {(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as CEFRLevel[]).map(lvl => (
                <TouchableOpacity
                  key={lvl}
                  style={[styles.modalLevelChip, newLevel === lvl && styles.activeModalLevelChip]}
                  onPress={() => setNewLevel(lvl)}
                >
                  <Text style={[styles.modalLevelText, newLevel === lvl && styles.activeModalLevelText]}>
                    {lvl}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Türkçe Karşılığı *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Örn: dirençli, çabuk toparlanan"
              placeholderTextColor="#94a3b8"
              value={newTr}
              onChangeText={setNewTr}
            />

            <Text style={styles.inputLabel}>İngilizce Örnek Cümle</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Örn: Humans are surprisingly resilient."
              placeholderTextColor="#94a3b8"
              value={newExEn}
              onChangeText={setNewExEn}
            />

            <TouchableOpacity style={styles.saveWordBtn} onPress={handleSaveWord}>
              <Text style={styles.saveWordBtnText}>Kelimeyi Kaydet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Word Modal */}
      <Modal visible={Boolean(editingWord)} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.editModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Kelimeyi Düzenle ✏️</Text>
              <TouchableOpacity onPress={() => setEditingWord(null)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.editModalScroll}>
              <Text style={styles.inputLabel}>İngilizce Kelime:</Text>
              <TextInput
                style={styles.modalInput}
                value={editEn}
                onChangeText={setEditEn}
              />

              <Text style={styles.inputLabel}>Türkçe Karşılığı:</Text>
              <TextInput
                style={styles.modalInput}
                value={editTr}
                onChangeText={setEditTr}
              />

              <Text style={styles.inputLabel}>Seviye (CEFR):</Text>
              <View style={styles.modalLevelRow}>
                {(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as CEFRLevel[]).map(l => (
                  <TouchableOpacity
                    key={l}
                    style={[styles.modalLevelChip, editLevel === l && styles.activeModalLevelChip]}
                    onPress={() => setEditLevel(l)}
                  >
                    <Text style={[styles.modalLevelText, editLevel === l && styles.activeModalLevelText]}>
                      {l}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Örnek Cümle (İngilizce):</Text>
              <TextInput
                style={[styles.modalInput, styles.multilineInput]}
                value={editExEn}
                onChangeText={setEditExEn}
                multiline
              />

              <Text style={styles.inputLabel}>Örnek Cümle (Türkçe):</Text>
              <TextInput
                style={[styles.modalInput, styles.multilineInput]}
                value={editExTr}
                onChangeText={setEditExTr}
                multiline
              />
            </ScrollView>

            <View style={styles.editModalFooter}>
              <TouchableOpacity
                style={styles.deleteEditBtn}
                onPress={() => {
                  if (editingWord) {
                    const toDel = editingWord;
                    setEditingWord(null);
                    handleDeleteWord(toDel);
                  }
                }}
              >
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
                <Text style={styles.deleteEditBtnText}>Sil</Text>
              </TouchableOpacity>
              <View style={styles.editModalFooterRight}>
                <TouchableOpacity style={styles.cancelEditBtn} onPress={() => setEditingWord(null)}>
                  <Text style={styles.cancelEditBtnText}>Vazgeç</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveEditBtn} onPress={handleSaveEditWord}>
                  <Text style={styles.saveEditBtnText}>Kaydet</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'android' ? 24 : 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  addBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#2563eb',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  activeTabBtn: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  activeTabBtnText: {
    color: '#2563eb',
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 10,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0f172a',
  },
  typeFilterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 10,
    gap: 8,
  },
  typeChip: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTypeChip: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  activeTypeChipText: {
    color: '#2563eb',
  },
  levelFilterContainer: {
    maxHeight: 48,
    marginBottom: 10,
  },
  levelFilterScroll: {
    paddingHorizontal: 20,
    gap: 8,
    alignItems: 'center',
  },
  levelChip: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activeLevelChip: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  levelChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  activeLevelChipText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  wordsList: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    color: '#64748b',
    fontSize: 14,
  },
  loadingMoreWrap: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  wordCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  wordMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  wordTextWrap: {
    flex: 1,
    gap: 4,
  },
  wordTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  wordEnglish: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  levelBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  levelBadgeText: {
    color: '#2563eb',
    fontSize: 11,
    fontWeight: '700',
  },
  wordTurkish: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  speakerBtn: {
    backgroundColor: '#eff6ff',
    padding: 8,
    borderRadius: 14,
  },
  wordExample: {
    fontSize: 13,
    color: '#64748b',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: '#f1f5f9',
  },
  srsStatus: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  categoryLabel: {
    fontSize: 11,
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  modalBody: {
    padding: 20,
    gap: 16,
  },
  autoDetectNotice: {
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  autoDetectNoticeText: {
    fontSize: 12,
    color: '#1d4ed8',
    flex: 1,
    lineHeight: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  modalInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#0f172a',
  },
  detectingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detectingText: {
    fontSize: 12,
    color: '#2563eb',
    fontStyle: 'italic',
  },
  modalLevelRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modalLevelChip: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  activeModalLevelChip: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  modalLevelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  activeModalLevelText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  saveWordBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  saveWordBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  actionBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemEditBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  itemDeleteBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  promoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  promoteBtnText: {
    fontSize: 11,
    color: '#b45309',
    fontWeight: '700',
  },
  kademeBar: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
    marginVertical: 6,
  },
  kademeStepsRow: {
    flexDirection: 'row',
    gap: 5,
    width: '100%',
  },
  kademeStep: {
    flex: 1,
    height: 5,
    borderRadius: 3,
  },
  kademeStepActive: {
    backgroundColor: '#2563eb',
  },
  kademeStepMastered: {
    backgroundColor: '#f59e0b',
  },
  kademeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kademeTitle: {
    fontSize: 11,
    fontWeight: '800',
  },
  kademeNextReview: {
    fontSize: 11,
    fontWeight: '600',
  },
  demoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  demoteBtnText: {
    fontSize: 11,
    color: '#2563eb',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  editModalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    maxHeight: '85%',
  },
  editModalScroll: {
    maxHeight: 380,
    paddingVertical: 10,
  },
  multilineInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  editModalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 16,
  },
  deleteEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fee2e2',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  deleteEditBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ef4444',
  },
  editModalFooterRight: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  cancelEditBtn: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelEditBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
  },
  saveEditBtn: {
    flex: 1.4,
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveEditBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
