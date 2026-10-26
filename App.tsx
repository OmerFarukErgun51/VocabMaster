import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { initDatabase } from './src/services/database';
import { CEFRLevel, ReadingMaterial } from './src/types';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

// Screens
import { HomeScreen } from './src/screens/HomeScreen';
import { StudyScreen } from './src/screens/StudyScreen';
import { LibraryScreen } from './src/screens/LibraryScreen';
import { PagedReaderScreen } from './src/features/reader/presentation/PagedReaderScreen';
import { MovieDialogueScreen } from './src/features/reader/presentation/MovieDialogueScreen';
import { VocabularyScreen } from './src/screens/VocabularyScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { AICoachModal } from './src/components/AICoachModal';

type NavTab = 'home' | 'study' | 'library' | 'vocab' | 'settings';

function MainAppContent() {
  const { colors, mode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<NavTab>('home');

  // Study screen parameters
  const [studyLevel, setStudyLevel] = useState<CEFRLevel | undefined>(undefined);
  const [studyOnlyDue, setStudyOnlyDue] = useState(false);
  const [vocabLevel, setVocabLevel] = useState<CEFRLevel | 'all'>('all');
  const [vocabMasteredFilter, setVocabMasteredFilter] = useState<boolean>(false);

  // Reader screen parameter
  const [activeReading, setActiveReading] = useState<ReadingMaterial | null>(null);

  // AI Coach modal
  const [isAICoachVisible, setIsAICoachVisible] = useState(false);

  const handleStartStudy = (level?: CEFRLevel, onlyDue = false) => {
    setStudyLevel(level);
    setStudyOnlyDue(onlyDue);
    setActiveTab('study');
  };

  const handleSelectReading = (reading: ReadingMaterial) => {
    setActiveReading(reading);
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />

      {/* Top App Header with Theme Switcher */}
      {!activeReading && (
        <View style={[styles.topAppHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View style={styles.brandRow}>
            <Ionicons name="sparkles" size={18} color={colors.primary} />
            <Text style={[styles.brandTitle, { color: colors.text }]}>
              Vocab<Text style={{ color: colors.primary }}>Master</Text>
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.themeToggleBtn,
              {
                backgroundColor: mode === 'dark' ? '#334155' : '#f1f5f9',
                borderColor: colors.border,
              },
            ]}
            onPress={toggleTheme}
            activeOpacity={0.7}
            accessibilityLabel="Karanlık / Aydınlık Tema Değiştir"
          >
            <Ionicons
              name={mode === 'dark' ? 'sunny' : 'moon'}
              size={18}
              color={mode === 'dark' ? '#fbbf24' : '#6366f1'}
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Screen Router */}
      <View style={[styles.screenContainer, { backgroundColor: colors.background }]}>
        {activeReading ? (
          activeReading.category === 'movies' || activeReading.category === 'daily_dialogues' ? (
            <MovieDialogueScreen
              reading={activeReading}
              onBack={() => setActiveReading(null)}
            />
          ) : (
            <PagedReaderScreen
              reading={activeReading}
              onBack={() => setActiveReading(null)}
            />
          )
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeScreen
                onStartStudy={handleStartStudy}
                onOpenAICoach={() => setIsAICoachVisible(true)}
                onNavigateTab={(tab, lvl, isMastered) => {
                  if (lvl) setVocabLevel(lvl);
                  if (isMastered !== undefined) setVocabMasteredFilter(isMastered);
                  setActiveTab(tab);
                }}
              />
            )}

            {activeTab === 'study' && (
              <StudyScreen
                initialLevel={studyLevel}
                onlyDue={studyOnlyDue}
                onBack={() => setActiveTab('home')}
              />
            )}

            {activeTab === 'library' && (
              <LibraryScreen onSelectReading={handleSelectReading} />
            )}

            {activeTab === 'vocab' && (
              <VocabularyScreen initialLevel={vocabLevel} initialMastered={vocabMasteredFilter} />
            )}

            {activeTab === 'settings' && <SettingsScreen />}
          </>
        )}
      </View>

      {/* Bottom Navigation Bar */}
      {!activeReading && (
        <View style={[styles.bottomNav, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setActiveTab('home')}
          >
            <Ionicons
              name={activeTab === 'home' ? 'home' : 'home-outline'}
              size={22}
              color={activeTab === 'home' ? colors.primary : colors.subtext}
            />
            <Text style={[styles.navText, { color: colors.subtext }, activeTab === 'home' && { color: colors.primary, fontWeight: '700' }]}>
              Ana Sayfa
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => {
              setStudyLevel(undefined);
              setStudyOnlyDue(false);
              setActiveTab('study');
            }}
          >
            <Ionicons
              name={activeTab === 'study' ? 'school' : 'school-outline'}
              size={22}
              color={activeTab === 'study' ? colors.primary : colors.subtext}
            />
            <Text style={[styles.navText, { color: colors.subtext }, activeTab === 'study' && { color: colors.primary, fontWeight: '700' }]}>
              Çalışma
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setActiveTab('library')}
          >
            <Ionicons
              name={activeTab === 'library' ? 'book' : 'book-outline'}
              size={22}
              color={activeTab === 'library' ? colors.primary : colors.subtext}
            />
            <Text style={[styles.navText, { color: colors.subtext }, activeTab === 'library' && { color: colors.primary, fontWeight: '700' }]}>
              Kütüphane
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => {
              setVocabLevel('all');
              setActiveTab('vocab');
            }}
          >
            <Ionicons
              name={activeTab === 'vocab' ? 'list' : 'list-outline'}
              size={22}
              color={activeTab === 'vocab' ? colors.primary : colors.subtext}
            />
            <Text style={[styles.navText, { color: colors.subtext }, activeTab === 'vocab' && { color: colors.primary, fontWeight: '700' }]}>
              Kelimelerim
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setActiveTab('settings')}
          >
            <Ionicons
              name={activeTab === 'settings' ? 'settings' : 'settings-outline'}
              size={22}
              color={activeTab === 'settings' ? colors.primary : colors.subtext}
            />
            <Text style={[styles.navText, { color: colors.subtext }, activeTab === 'settings' && { color: colors.primary, fontWeight: '700' }]}>
              Ayarlar
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Floating AI Coach Modal */}
      <AICoachModal
        visible={isAICoachVisible}
        onClose={() => setIsAICoachVisible(false)}
      />
    </SafeAreaView>
  );
}

export default function App() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    async function setup() {
      try {
        await initDatabase();
        setDbReady(true);
      } catch (e) {
        console.error('Database setup error:', e);
        setDbReady(true);
      }
    }
    setup();
  }, []);

  if (!dbReady) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingTitle}>VocabMaster Yükleniyor...</Text>
        <Text style={styles.loadingSubtitle}>Kelimeler ve kütüphane hazırlanıyor</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <MainAppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  topAppHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  themeToggleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    gap: 12,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  loadingSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  screenContainer: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  navText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
});
