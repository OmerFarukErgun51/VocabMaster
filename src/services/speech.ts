import * as Speech from 'expo-speech';

export type SpeechAccent = 'en-US' | 'en-GB';

let currentAccent: SpeechAccent = 'en-US';

export const setSpeechAccent = (accent: SpeechAccent) => {
  currentAccent = accent;
};

export const getSpeechAccent = (): SpeechAccent => {
  return currentAccent;
};

export const speakWord = (text: string, rate = 0.9) => {
  if (!text) return;
  Speech.stop();
  Speech.speak(text, {
    language: currentAccent,
    pitch: 1.0,
    rate: rate,
  });
};

export const stopSpeech = () => {
  Speech.stop();
};
