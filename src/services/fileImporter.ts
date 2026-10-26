import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { addCustomReading } from './database';
import { CEFRLevel, ReadingCategory } from '../types';

export const pickAndImportTextFile = async (): Promise<{ title: string; content: string } | null> => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['text/plain', 'text/*', 'application/pdf'],
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const file = result.assets[0];
    const fileName = file.name || 'Özel Belge';

    // Read content
    let content = '';
    if (file.mimeType?.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      content = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
    } else {
      // For binary/PDF files in Expo Go, if raw text extraction isn't supported without heavy native binary,
      // we provide a clean, user-friendly fallback and text paste prompt.
      content = `[${fileName} yüklendi]\n\nBu belge cihazınızdan başarıyla içe aktarıldı. Metni okumak ve kelimelerin üzerine tıklayarak çalışmak için içeriğinizi buraya kopyalayabilirsiniz.`;
    }

    return {
      title: fileName.replace(/\.[^/.]+$/, ''),
      content: content.trim(),
    };
  } catch (error) {
    console.error('File pick error:', error);
    return null;
  }
};
