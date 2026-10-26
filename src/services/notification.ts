import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const REMINDER_KEY = '@vocabmaster_daily_reminder_enabled';

export const requestNotificationPermissions = async (): Promise<boolean> => {
  return true;
};

// Send an immediate progress / test notification alert
export const sendInstantNotification = (title: string, body: string) => {
  Alert.alert(`🔔 ${title}`, body);
};

// Schedule daily reminder setting
export const scheduleDailyStudyReminder = async (hour = 20, minute = 0) => {
  await AsyncStorage.setItem(REMINDER_KEY, JSON.stringify({ enabled: true, hour, minute }));
};

// Send progress analysis notification
export const sendProgressNotification = (learningCount: number, masteredCount: number, accuracy: number) => {
  const title = 'Haftalık Gelişim Durum Analizin';
  const body = `Şu an ${learningCount} kelime üzerinde çalışıyorsun, ${masteredCount} kelimeyi tam hafızana aldın!\n\nGenel doğruluk oranın: %${accuracy}. Harika gidiyorsun! 🔥`;
  sendInstantNotification(title, body);
};
