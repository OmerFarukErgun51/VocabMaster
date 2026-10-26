import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Word } from '../types';
import { speakWord } from '../services/speech';
import { useTheme } from '../context/ThemeContext';

interface MatchingGameProps {
  words: Word[];
  onRoundComplete: (score: number) => void;
}

export const MatchingGame: React.FC<MatchingGameProps> = ({ words, onRoundComplete }) => {
  const { colors, mode } = useTheme();
  // Take 5 words per round
  const roundWords = React.useMemo(() => words.slice(0, 5), [words]);

  const [englishList, setEnglishList] = useState<{ id: number; text: string }[]>([]);
  const [turkishList, setTurkishList] = useState<{ id: number; text: string }[]>([]);

  const [selectedEnId, setSelectedEnId] = useState<number | null>(null);
  const [selectedTrId, setSelectedTrId] = useState<number | null>(null);
  const [matchedIds, setMatchedIds] = useState<number[]>([]);
  const [wrongPair, setWrongPair] = useState<{ enId: number; trId: number } | null>(null);

  useEffect(() => {
    const ens = roundWords.map(w => ({ id: w.id, text: w.english })).sort(() => 0.5 - Math.random());
    const trs = roundWords.map(w => ({ id: w.id, text: w.turkish })).sort(() => 0.5 - Math.random());
    setEnglishList(ens);
    setTurkishList(trs);
    setMatchedIds([]);
    setSelectedEnId(null);
    setSelectedTrId(null);
    setWrongPair(null);
  }, [roundWords]);

  const handleSelectEn = (id: number) => {
    if (matchedIds.includes(id)) return;
    speakWord(englishList.find(e => e.id === id)?.text || '');
    setSelectedEnId(id);

    if (selectedTrId !== null) {
      checkMatch(id, selectedTrId);
    }
  };

  const handleSelectTr = (id: number) => {
    if (matchedIds.includes(id)) return;
    setSelectedTrId(id);

    if (selectedEnId !== null) {
      checkMatch(selectedEnId, id);
    }
  };

  const checkMatch = (enId: number, trId: number) => {
    if (enId === trId) {
      // Correct Match!
      const newMatched = [...matchedIds, enId];
      setMatchedIds(newMatched);
      setSelectedEnId(null);
      setSelectedTrId(null);

      if (newMatched.length === roundWords.length) {
        setTimeout(() => {
          onRoundComplete(newMatched.length);
        }, 800);
      }
    } else {
      // Wrong Match
      setWrongPair({ enId, trId });
      setTimeout(() => {
        setSelectedEnId(null);
        setSelectedTrId(null);
        setWrongPair(null);
      }, 700);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.instructions, { color: colors.subtext }]}>
        İngilizce kelimeleri doğru Türkçe karşılıklarıyla eşleştirin ({matchedIds.length}/{roundWords.length}):
      </Text>

      <View style={styles.columnsContainer}>
        {/* English Column */}
        <View style={styles.column}>
          {englishList.map(item => {
            const isMatched = matchedIds.includes(item.id);
            const isSelected = selectedEnId === item.id;
            const isWrong = wrongPair?.enId === item.id;

            return (
              <TouchableOpacity
                key={`en-${item.id}`}
                activeOpacity={0.8}
                style={[
                  styles.card,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  isSelected && styles.selectedCard,
                  isMatched && styles.matchedCard,
                  isWrong && styles.wrongCard,
                ]}
                onPress={() => handleSelectEn(item.id)}
                disabled={isMatched}
              >
                <Text
                  style={[
                    styles.cardText,
                    styles.enCardText,
                    { color: colors.text },
                    item.text.length > 25
                      ? { fontSize: 13, lineHeight: 18 }
                      : item.text.length > 15
                      ? { fontSize: 14, lineHeight: 20 }
                      : undefined,
                    isSelected && styles.selectedText,
                    isMatched && styles.matchedText,
                  ]}
                  numberOfLines={3}
                >
                  {item.text}
                </Text>
                {isMatched && (
                  <View style={styles.matchedCheck}>
                    <Ionicons name="checkmark-circle" size={18} color="#16a34a" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Turkish Column */}
        <View style={styles.column}>
          {turkishList.map(item => {
            const isMatched = matchedIds.includes(item.id);
            const isSelected = selectedTrId === item.id;
            const isWrong = wrongPair?.trId === item.id;

            return (
              <TouchableOpacity
                key={`tr-${item.id}`}
                activeOpacity={0.8}
                style={[
                  styles.card,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  isSelected && styles.selectedCard,
                  isMatched && styles.matchedCard,
                  isWrong && styles.wrongCard,
                ]}
                onPress={() => handleSelectTr(item.id)}
                disabled={isMatched}
              >
                <Text
                  style={[
                    styles.cardText,
                    styles.trCardText,
                    { color: colors.text },
                    item.text.length > 30
                      ? { fontSize: 12, lineHeight: 16 }
                      : item.text.length > 18
                      ? { fontSize: 13, lineHeight: 18 }
                      : undefined,
                    isSelected && styles.selectedText,
                    isMatched && styles.matchedText,
                  ]}
                  numberOfLines={4}
                >
                  {item.text}
                </Text>
                {isMatched && (
                  <View style={styles.matchedCheck}>
                    <Ionicons name="checkmark-circle" size={18} color="#16a34a" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 12,
  },
  instructions: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
  columnsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  column: {
    flex: 1,
    gap: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 78,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardText: {
    textAlign: 'center',
  },
  enCardText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: 0.3,
  },
  trCardText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    lineHeight: 20,
  },
  selectedCard: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
    transform: [{ scale: 1.02 }],
  },
  selectedText: {
    color: '#2563eb',
    fontWeight: '800',
  },
  matchedCard: {
    borderColor: '#86efac',
    backgroundColor: '#f0fdf4',
    opacity: 0.65,
  },
  matchedText: {
    color: '#16a34a',
    fontWeight: '700',
  },
  matchedCheck: {
    marginTop: 4,
  },
  wrongCard: {
    borderColor: '#fca5a5',
    backgroundColor: '#fef2f2',
  },
});
