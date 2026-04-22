import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, Animated, Alert
} from 'react-native';

const SHAPES = [
  { id: 'circle', emoji: '🔴', label: 'Círculo Vermelho' },
  { id: 'square', emoji: '🟦', label: 'Quadrado Azul' },
  { id: 'triangle', emoji: '🟡', label: 'Triângulo Amarelo' },
  { id: 'diamond', emoji: '🟢', label: 'Losango Verde' },
  { id: 'star', emoji: '🟠', label: 'Estrela Laranja' },
  { id: 'heart', emoji: '🟣', label: 'Coração Roxo' },
];

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function buildCards() {
  const pairs = SHAPES.map((s, i) => [
    { ...s, uid: `${s.id}_a`, pairId: i },
    { ...s, uid: `${s.id}_b`, pairId: i },
  ]).flat();
  return shuffle(pairs).map((c, idx) => ({ ...c, idx, flipped: false, matched: false }));
}

export default function CardPairsGame({ onBack }) {
  const [cards, setCards] = useState(buildCards());
  const [selected, setSelected] = useState([]);
  const [moves, setMoves] = useState(0);
  const [stars, setStars] = useState(0);
  const [finished, setFinished] = useState(false);
  const [locked, setLocked] = useState(false);
  const flipAnims = useRef(cards.map(() => new Animated.Value(0))).current;

  function flipCard(idx) {
    if (locked) return;
    const card = cards[idx];
    if (card.flipped || card.matched) return;
    if (selected.length >= 2) return;

    Animated.spring(flipAnims[idx], {
      toValue: 1,
      useNativeDriver: true,
    }).start();

    const newCards = cards.map((c, i) =>
      i === idx ? { ...c, flipped: true } : c
    );
    setCards(newCards);

    const newSelected = [...selected, idx];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = newSelected;
      setLocked(true);
      setTimeout(() => {
        if (newCards[a].pairId === newCards[b].pairId) {
          const matched = newCards.map((c, i) =>
            i === a || i === b ? { ...c, matched: true } : c
          );
          setCards(matched);
          const allDone = matched.every(c => c.matched);
          if (allDone) {
            const m = moves + 1;
            const s = m <= 10 ? 3 : m <= 16 ? 2 : 1;
            setStars(s);
            setFinished(true);
          }
        } else {
          Animated.timing(flipAnims[a], { toValue: 0, duration: 300, useNativeDriver: true }).start();
          Animated.timing(flipAnims[b], { toValue: 0, duration: 300, useNativeDriver: true }).start();
          setCards(newCards.map((c, i) =>
            i === a || i === b ? { ...c, flipped: false } : c
          ));
        }
        setSelected([]);
        setLocked(false);
      }, 800);
    }
  }

  function restart() {
    const newCards = buildCards();
    setCards(newCards);
    flipAnims.forEach(a => a.setValue(0));
    setSelected([]);
    setMoves(0);
    setStars(0);
    setFinished(false);
    setLocked(false);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🃏 Par de Cartas</Text>
        <Text style={styles.moves}>Jogadas: {moves}</Text>
      </View>

      {finished ? (
        <View style={styles.winBox}>
          <Text style={styles.winEmoji}>🎉</Text>
          <Text style={styles.winTitle}>Parabéns!</Text>
          <Text style={styles.winStars}>{'⭐'.repeat(stars)}</Text>
          <Text style={styles.winMsg}>Você usou {moves} jogadas!</Text>
          <TouchableOpacity style={styles.restartBtn} onPress={restart}>
            <Text style={styles.restartText}>Jogar de novo 🔄</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.homeBtn} onPress={onBack}>
            <Text style={styles.homeText}>Menu Principal 🏠</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.grid}>
          {cards.map((card, idx) => {
            const rotateY = flipAnims[idx].interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '180deg'],
            });
            return (
              <TouchableOpacity
                key={card.uid}
                onPress={() => flipCard(idx)}
                activeOpacity={0.9}
                style={styles.cardWrapper}
              >
                <Animated.View
                  style={[
                    styles.card,
                    card.matched && styles.cardMatched,
                    { transform: [{ rotateY }] },
                  ]}
                >
                  {card.flipped || card.matched ? (
                    <Text style={styles.cardEmoji}>{card.emoji}</Text>
                  ) : (
                    <Text style={styles.cardBack}>❓</Text>
                  )}
                </Animated.View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF0F0' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backBtn: { padding: 8 },
  backText: { fontSize: 16, color: '#FF6B6B', fontWeight: '700' },
  title: { fontSize: 20, fontWeight: '900', color: '#2D2D2D' },
  moves: { fontSize: 15, color: '#888', fontWeight: '600' },
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingTop: 12,
    justifyContent: 'center',
    gap: 10,
  },
  cardWrapper: { width: '28%', aspectRatio: 1 },
  card: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 2.5,
    borderColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B6B',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
  },
  cardMatched: { backgroundColor: '#FFE8E8', borderColor: '#FF6B6B', opacity: 0.7 },
  cardEmoji: { fontSize: 36 },
  cardBack: { fontSize: 36 },
  winBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  winEmoji: { fontSize: 72 },
  winTitle: { fontSize: 42, fontWeight: '900', color: '#FF6B6B' },
  winStars: { fontSize: 40 },
  winMsg: { fontSize: 18, color: '#666', fontWeight: '600' },
  restartBtn: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 50,
    marginTop: 8,
  },
  restartText: { color: '#fff', fontWeight: '800', fontSize: 17 },
  homeBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  homeText: { color: '#FF6B6B', fontWeight: '800', fontSize: 17 },
});