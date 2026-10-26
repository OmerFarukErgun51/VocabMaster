import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAppStats, getDueReviewWords, getLevelCountsByStatus, getWordsByLevel } from '../services/database';
import { Word, CEFRLevel } from '../types';
import { speakWord } from '../services/speech';
import { useTheme } from '../context/ThemeContext';

interface HomeScreenProps {
  onStartStudy: (level?: CEFRLevel, onlyDue?: boolean) => void;
  onOpenAICoach: () => void;
  onNavigateTab: (tab: 'study' | 'library' | 'vocab', level?: CEFRLevel, isMastered?: boolean) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartStudy,
  onOpenAICoach,
  onNavigateTab,
}) => {
  const { colors, mode } = useTheme();
  const [stats, setStats] = useState({
    totalWords: 0,
    masteredWords: 0,
    learningWords: 0,
    totalReviews: 0,
    accuracy: 100,
  });
  const [dueCount, setDueCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState<'learning' | 'mastered'>('learning');
  const [learningCounts, setLearningCounts] = useState<Record<string, number>>({});
  const [masteredCounts, setMasteredCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const s = getAppStats();
    setStats(s);
    const due = getDueReviewWords();
    setDueCount(due.length);

    try {
      const lMap = getLevelCountsByStatus(false);
      const mMap = getLevelCountsByStatus(true);
      setLearningCounts(lMap);
      setMasteredCounts(mMap);
    } catch {}
  };

  const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* Top Header & Streak */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.text }]}>Günlük Öğrenme Alanın 👋</Text>
          <Text style={[styles.subGreeting, { color: colors.subtext }]}>Bugün zihnini tazelemeye hazır mısın?</Text>
        </View>
        <View style={[styles.streakBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakCount}>4 Gün</Text>
        </View>
      </View>

      {/* SRS Due Review Card */}
      <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <View style={styles.reviewBadge}>
            <Ionicons name="time-outline" size={16} color="#ffffff" />
            <Text style={styles.reviewBadgeText}>Akıllı Tekrar (SRS)</Text>
          </View>
          <Text style={styles.dueWordCount}>{dueCount} Kelime Hazır</Text>
        </View>

        <Text style={styles.reviewTitle}>Unutma Eğrisi Hatırlatıcısı</Text>
        <Text style={styles.reviewDesc}>
          Zihninizin unutmak üzere olduğu kelimeleri aralıklı tekrar yöntemiyle kalıcı hafızaya aktarın.
        </Text>

        <TouchableOpacity
          style={styles.reviewBtn}
          onPress={() => onStartStudy(undefined, true)}
        >
          <Text style={styles.reviewBtnText}>Günün Tekrarına Başla</Text>
          <Ionicons name="arrow-forward" size={18} color="#2563eb" />
        </TouchableOpacity>
      </View>

      {/* Nova AI Companion Banner */}
      <TouchableOpacity
        style={[styles.aiCoachBanner, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={onOpenAICoach}
        activeOpacity={0.85}
      >
        <View style={[styles.aiIconWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={styles.aiIconEmoji}>🤖</Text>
        </View>
        <View style={styles.aiTextContainer}>
          <View style={styles.aiTagRow}>
            <Text style={[styles.aiTitle, { color: colors.text }]}>Nova • Akıllı İngilizce Asistanın</Text>
            <View style={styles.onlineDot} />
          </View>
          <Text style={[styles.aiSubtitle, { color: colors.subtext }]}>Boşluk doldurma sınavı, sohbet pratiği ve gelişim koçu</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.primary} />
      </TouchableOpacity>

      {/* Quick Stats Grid with Interactive Toggle */}
      <View style={styles.statsGrid}>
        {/* Öğrenilecek Box */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.statBox,
            { backgroundColor: colors.card, borderColor: colors.border },
            statusFilter === 'learning' && styles.activeLearningStatBox
          ]}
          onPress={() => setStatusFilter('learning')}
        >
          <Text style={[styles.statNumber, { color: colors.text }]}>{stats.learningWords}</Text>
          <Text style={[styles.statLabel, { color: colors.subtext }, statusFilter === 'learning' && styles.activeStatLabel]}>
            Öğrenilecek {statusFilter === 'learning' ? '✓' : ''}
          </Text>
        </TouchableOpacity>

        {/* Öğrenilen Box */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.statBox,
            { backgroundColor: colors.card, borderColor: colors.border },
            statusFilter === 'mastered' && styles.activeMasteredStatBox
          ]}
          onPress={() => setStatusFilter('mastered')}
        >
          <Text style={[styles.statNumber, { color: '#16a34a' }]}>{stats.masteredWords}</Text>
          <Text style={[styles.statLabel, { color: colors.subtext }, statusFilter === 'mastered' && styles.activeMasteredStatLabel]}>
            Öğrenilen {statusFilter === 'mastered' ? '✓' : ''}
          </Text>
        </TouchableOpacity>

        {/* Doğruluk Box */}
        <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statNumber, { color: '#8b5cf6' }]}>%{stats.accuracy}</Text>
          <Text style={[styles.statLabel, { color: colors.subtext }]}>Doğruluk</Text>
        </View>
      </View>

      {/* Level Selector - Dynamically updates based on Öğrenilecek vs Öğrenilen */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {statusFilter === 'mastered' ? 'Öğrenilen Kelimeler (Kutu 5)' : 'Çalışılacak Kelimeler (Kutu 1 - 4)'}
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.subtext }]}>
              {statusFilter === 'mastered'
                ? 'Tam hafızanıza kazınmış kelime sayıları'
                : 'Seviyelere göre çalışmayı bekleyen kelime sayıları'}
            </Text>
          </View>
          <TouchableOpacity onPress={() => onNavigateTab('vocab', undefined, statusFilter === 'mastered')}>
            <Text style={styles.sectionLink}>Tümünü Gör</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.levelGrid}>
          {levels.map((lvl) => {
            const count = statusFilter === 'mastered' ? (masteredCounts[lvl] || 0) : (learningCounts[lvl] || 0);
            const badgeLabel = statusFilter === 'mastered' ? `${count} Öğrenildi` : `${count} Çalışılacak`;
            return (
              <TouchableOpacity
                key={lvl}
                activeOpacity={0.8}
                style={[
                  styles.levelCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  statusFilter === 'mastered' && styles.masteredLevelCard
                ]}
                onPress={() => onNavigateTab('vocab', lvl, statusFilter === 'mastered')}
              >
                <Text style={[styles.levelCardTitle, { color: colors.text }]}>{lvl}</Text>
                <Text style={[styles.levelCardSubtitle, { color: colors.subtext }, statusFilter === 'mastered' && styles.masteredLevelSubtitle]}>
                  {badgeLabel}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Explore Library Quick Link */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.libraryBanner, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => onNavigateTab('library')}
        >
          <View style={styles.libTextWrap}>
            <Text style={[styles.libTitle, { color: colors.text }]}>🎬 Film Replikleri & Kitaplar</Text>
            <Text style={[styles.libDesc, { color: colors.subtext }]}>
              Interstellar, Inception, Küçük Prens ve bilim makalelerini interaktif oku.
            </Text>
          </View>
          <Ionicons name="book-outline" size={32} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 20,
    paddingTop: 12,
    gap: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
  },
  subGreeting: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 4,
  },
  streakEmoji: {
    fontSize: 16,
  },
  streakCount: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ea580c',
  },
  reviewCard: {
    backgroundColor: '#2563eb',
    borderRadius: 24,
    padding: 22,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  reviewBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  dueWordCount: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  reviewTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 6,
  },
  reviewDesc: {
    color: '#bfdbfe',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 18,
  },
  reviewBtn: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  reviewBtnText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '800',
  },
  aiCoachBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f7ff',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
    gap: 12,
  },
  aiIconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  aiIconEmoji: {
    fontSize: 24,
  },
  aiTextContainer: {
    flex: 1,
    gap: 2,
  },
  aiTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#16a34a',
  },
  aiTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  aiSubtitle: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  activeLearningStatBox: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  activeMasteredStatBox: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 2,
  },
  activeStatLabel: {
    color: '#2563eb',
    fontWeight: '800',
  },
  activeMasteredStatLabel: {
    color: '#16a34a',
    fontWeight: '800',
  },
  section: {
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  sectionLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563eb',
  },
  levelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  levelCard: {
    width: '31%',
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  masteredLevelCard: {
    borderColor: '#bbf7d0',
    backgroundColor: '#f0fdf4',
  },
  levelCardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 2,
  },
  levelCardSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563eb',
    textAlign: 'center',
  },
  masteredLevelSubtitle: {
    color: '#16a34a',
  },
  libraryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  libTextWrap: {
    flex: 1,
  },
  libTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  libDesc: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
  },
});
