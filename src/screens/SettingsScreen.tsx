import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Switch, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { saveGeminiApiKey, getGeminiApiKey, callGemini } from '../services/gemini';
import { setSpeechAccent, getSpeechAccent, SpeechAccent } from '../services/speech';
import { scheduleDailyStudyReminder, sendProgressNotification, requestNotificationPermissions } from '../services/notification';
import { getAppStats, getDB } from '../services/database';
import { useTheme } from '../context/ThemeContext';

export const SettingsScreen: React.FC = () => {
  const { mode, colors } = useTheme();
  const [apiKey, setApiKey] = useState('');
  const [accent, setAccent] = useState<SpeechAccent>('en-US');
  const [testing, setTesting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState(true);
  const [reminderHour, setReminderHour] = useState<number>(20);
  const [reminderMinute, setReminderMinute] = useState<number>(0);
  const [isGeminiConnected, setIsGeminiConnected] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const key = await getGeminiApiKey();
    if (key) {
      setApiKey(key);
      setIsGeminiConnected(true);
    }
    setAccent(getSpeechAccent());

    // Load saved reminder hour from sqlite if available
    try {
      const db = getDB();
      const row = db.getFirstSync<{ value: string }>('SELECT value FROM user_settings WHERE key = ?', ['reminder_hour']);
      if (row && row.value) {
        setReminderHour(parseInt(row.value, 10));
      }
    } catch {}
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Bilgi', 'API anahtarı temizlendi.');
      await saveGeminiApiKey('');
      setIsGeminiConnected(false);
      return;
    }
    await saveGeminiApiKey(apiKey.trim());
    setIsGeminiConnected(true);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleOpenGoogleAIStudio = () => {
    Linking.openURL('https://aistudio.google.com/app/apikey');
  };

  const handleTestApiKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Hata', 'Lütfen test etmeden önce bir API anahtarı giriniz.');
      return;
    }

    setTesting(true);
    try {
      await saveGeminiApiKey(apiKey.trim());
      const res = await callGemini('Say "Google Gemini API bağlantısı başarılı ve çalışıyor!" in one sentence.');
      setIsGeminiConnected(true);
      Alert.alert('Bağlantı Başarılı! 🎉', res);
    } catch (err: any) {
      setIsGeminiConnected(false);
      Alert.alert('Bağlantı Başarısız', err.message || 'API anahtarı doğrulanamadı. Lütfen anahtarınızı kontrol ediniz.');
    } finally {
      setTesting(false);
    }
  };

  const handleSelectAccent = (acc: SpeechAccent) => {
    setAccent(acc);
    setSpeechAccent(acc);
  };

  const handleSelectReminderHour = async (hour: number) => {
    setReminderHour(hour);
    try {
      const db = getDB();
      db.runSync('INSERT OR REPLACE INTO user_settings (key, value) VALUES (?, ?)', ['reminder_hour', hour.toString()]);
    } catch {}

    if (dailyReminderEnabled) {
      await scheduleDailyStudyReminder(hour, reminderMinute);
      Alert.alert(
        'Hatırlatıcı Güncellendi ⏰',
        `Günlük çalışma hatırlatıcınız her gün saat ${hour.toString().padStart(2, '0')}:00 olarak ayarlandı.`
      );
    }
  };

  const handleToggleReminder = async (val: boolean) => {
    setDailyReminderEnabled(val);
    if (val) {
      const granted = await requestNotificationPermissions();
      if (granted) {
        await scheduleDailyStudyReminder(reminderHour, reminderMinute);
        Alert.alert(
          'Bildirim Ayarlandı 🔔',
          `Her gün saat ${reminderHour.toString().padStart(2, '0')}:00'de günlük çalışma hatırlatıcınız gönderilecektir.`
        );
      } else {
        Alert.alert('İzin Gerekli', 'Bildirim gönderebilmek için lütfen telefon ayarlarından bildirim iznini açınız.');
        setDailyReminderEnabled(false);
      }
    }
  };

  const handleTestProgressNotification = () => {
    const stats = getAppStats();
    sendProgressNotification(stats.learningWords, stats.masteredWords, stats.accuracy);
  };

  const reminderPresets = [
    { hour: 8, label: '08:00 (Sabah)' },
    { hour: 12, label: '12:00 (Öğle)' },
    { hour: 18, label: '18:00 (Akşam)' },
    { hour: 20, label: '20:00 (Günün Sonu)' },
    { hour: 21, label: '21:00 (Gece Tekrarı)' },
    { hour: 22, label: '22:00 (Yatmadan Önce)' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.headerTitle, { color: colors.text }]}>Ayarlar & Kişiselleştirme</Text>
      <Text style={[styles.headerSubtitle, { color: colors.subtext }]}>Google Gemini, hatırlatıcı saatleri ve telaffuz seçenekleri</Text>

      {/* 1. GOOGLE GEMINI ACCOUNT CONNECTION */}
      <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.titleWithIcon}>
            <Ionicons name="sparkles" size={22} color={colors.primary} />
            <Text style={[styles.sectionCardTitle, { color: colors.text }]}>Google Gemini Hesap Bağlantısı</Text>
          </View>
          <View style={[styles.statusBadge, isGeminiConnected ? styles.statusBadgeConnected : styles.statusBadgeDisconnected]}>
            <View style={[styles.statusDot, isGeminiConnected ? styles.statusDotConnected : styles.statusDotDisconnected]} />
            <Text style={[styles.statusBadgeText, isGeminiConnected ? styles.statusTextConnected : styles.statusTextDisconnected]}>
              {isGeminiConnected ? 'Bağlı' : 'Bağlı Değil'}
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionCardDesc, { color: colors.subtext }]}>
          Yapay zeka koçu, zayıf kelimelerle hikaye üretimi, cümle analizi ve otomatik CEFR seviye tespiti için Gemini API anahtarınızı bağlayın.
        </Text>

        <TouchableOpacity style={[styles.getFreeKeyBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={handleOpenGoogleAIStudio}>
          <Ionicons name="key-outline" size={18} color={colors.primary} />
          <Text style={[styles.getFreeKeyText, { color: colors.primary }]}>Google AI Studio'dan Ücretsiz Anahtar Al ↗</Text>
        </TouchableOpacity>

        <TextInput
          style={[styles.keyInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          placeholder="API Anahtarınızı buraya yapıştırın (AIzaSy...)"
          placeholderTextColor={colors.subtext}
          secureTextEntry
          value={apiKey}
          onChangeText={setApiKey}
        />

        <View style={styles.keyBtnRow}>
          <TouchableOpacity style={styles.saveKeyBtn} onPress={handleSaveApiKey}>
            <Ionicons name={savedSuccess ? 'checkmark-circle' : 'save-outline'} size={18} color="#ffffff" />
            <Text style={styles.saveKeyBtnText}>{savedSuccess ? 'Kaydedildi' : 'Kaydet'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.testKeyBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={handleTestApiKey} disabled={testing}>
            {testing ? (
              <ActivityIndicator size="small" color="#2563eb" />
            ) : (
              <>
                <Ionicons name="flash-outline" size={18} color="#2563eb" />
                <Text style={styles.testKeyBtnText}>Bağlantıyı Doğrula</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. CUSTOMIZABLE DAILY REMINDER TIME */}
      <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.titleWithIcon}>
            <Ionicons name="alarm-outline" size={22} color={colors.primary} />
            <Text style={[styles.sectionCardTitle, { color: colors.text }]}>Günlük Hatırlatıcı Saati</Text>
          </View>
          <Switch
            value={dailyReminderEnabled}
            onValueChange={handleToggleReminder}
            trackColor={{ false: '#cbd5e1', true: '#93c5fd' }}
            thumbColor={dailyReminderEnabled ? colors.primary : '#f4f3f4'}
          />
        </View>

        <Text style={[styles.sectionCardDesc, { color: colors.subtext }]}>
          Unutma eğrisine giren kelimeleri tazelemek için bildirim almak istediğiniz saati kendiniz seçin:
        </Text>

        {/* Selected Hour Highlight */}
        <View style={[styles.activeHourBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="time" size={16} color={colors.primary} />
          <Text style={[styles.activeHourText, { color: colors.text }]}>
            Aktif Hatırlatıcı: Her gün saat <Text style={[styles.boldText, { color: colors.primary }]}>{reminderHour.toString().padStart(2, '0')}:00</Text>
          </Text>
        </View>

        {/* Hour Presets */}
        <View style={styles.presetsGrid}>
          {reminderPresets.map(preset => (
            <TouchableOpacity
              key={preset.hour}
              style={[
                styles.presetChip,
                { backgroundColor: colors.surface, borderColor: colors.border },
                reminderHour === preset.hour && styles.activePresetChip
              ]}
              onPress={() => handleSelectReminderHour(preset.hour)}
            >
              <Text
                style={[
                  styles.presetChipText,
                  { color: colors.text },
                  reminderHour === preset.hour && styles.activePresetChipText
                ]}
              >
                {preset.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[styles.testNotificationBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={handleTestProgressNotification}>
          <Ionicons name="paper-plane-outline" size={16} color={colors.primary} />
          <Text style={[styles.testNotificationText, { color: colors.primary }]}>Şimdi Test Bildirimi Gönder</Text>
        </TouchableOpacity>
      </View>

      {/* 3. PRONUNCIATION ACCENT SELECTION */}
      <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.titleWithIcon}>
            <Ionicons name="mic-outline" size={22} color={colors.primary} />
            <Text style={[styles.sectionCardTitle, { color: colors.text }]}>Sesli Telaffuz Aksanı</Text>
          </View>
        </View>

        <View style={styles.accentRow}>
          <TouchableOpacity
            style={[
              styles.accentBtn,
              { backgroundColor: colors.surface, borderColor: colors.border },
              accent === 'en-US' && styles.activeAccentBtn
            ]}
            onPress={() => handleSelectAccent('en-US')}
          >
            <Text style={styles.accentFlag}>🇺🇸</Text>
            <Text style={[styles.accentText, { color: colors.text }, accent === 'en-US' && styles.activeAccentText]}>
              Amerikan İngilizcesi
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.accentBtn,
              { backgroundColor: colors.surface, borderColor: colors.border },
              accent === 'en-GB' && styles.activeAccentBtn
            ]}
            onPress={() => handleSelectAccent('en-GB')}
          >
            <Text style={styles.accentFlag}>🇬🇧</Text>
            <Text style={[styles.accentText, { color: colors.text }, accent === 'en-GB' && styles.activeAccentText]}>
              İngiliz İngilizcesi
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 4. SRS INFO BOX */}
      <View style={[styles.infoBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.infoTitle, { color: colors.text }]}>🧠 Akıllı Tekrar (SRS) Nasıl Çalışır?</Text>
        <Text style={[styles.infoDesc, { color: colors.subtext }]}>
          • Bir kelimeyi doğru bildikçe kutu seviyesi 1'den 5'e yükselir.{'\n'}
          • Tekrar süreleri sırasıyla 1, 3, 7, 16 ve 35 güne uzar.{'\n'}
          • 5. Kutuya ulaşan kelimeler "Tam Hafızada" olarak işaretlenir ve günlük testlerde önünüze gelip vakit kaybettirmez.{'\n'}
          • Yanlış bildiğiniz kelime derhal 1. Kutuya düşerek sık tekrar havuzuna alınır.
        </Text>
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
    gap: 18,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
    marginBottom: 6,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  sectionCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 5,
  },
  statusBadgeConnected: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  statusBadgeDisconnected: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusDotConnected: {
    backgroundColor: '#10b981',
  },
  statusDotDisconnected: {
    backgroundColor: '#ef4444',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextConnected: {
    color: '#047857',
  },
  statusTextDisconnected: {
    color: '#b91c1c',
  },
  sectionCardDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
  getFreeKeyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  getFreeKeyText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563eb',
  },
  keyInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 14,
    padding: 12,
    fontSize: 13,
    color: '#0f172a',
  },
  keyBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  saveKeyBtn: {
    flex: 1,
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  saveKeyBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  testKeyBtn: {
    flex: 1,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  testKeyBtnText: {
    color: '#2563eb',
    fontSize: 13,
    fontWeight: '700',
  },
  activeHourBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    padding: 10,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  activeHourText: {
    fontSize: 13,
    color: '#1e40af',
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetChip: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activePresetChip: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  activePresetChipText: {
    color: '#ffffff',
  },
  testNotificationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    marginTop: 4,
  },
  testNotificationText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563eb',
  },
  accentRow: {
    flexDirection: 'row',
    gap: 10,
  },
  accentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  activeAccentBtn: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  accentFlag: {
    fontSize: 18,
  },
  accentText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  activeAccentText: {
    color: '#2563eb',
    fontWeight: '800',
  },
  infoBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 20,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
    gap: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1e40af',
  },
  infoDesc: {
    fontSize: 12,
    color: '#1e3a8a',
    lineHeight: 18,
  },
  boldText: {
    fontWeight: '800',
    color: '#0f172a',
  },
});
